// express 模块
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var File = require('../models/File');
var Tree = require('../tools/tree');


router.use(function(req, res, next) {

    res.responseData = {
        code: 0,
        message: ''
    }

    res.sendJSON = function() {
        this.json(this.responseData);
    }

    next();
});

/*
* 用户名验证
* method: GET
* params:
*   <string>username : 用户要注册的用户名
* */
router.get('/user/checkUserName', function(req, res) {
    var username = req.query.username || '';

    //用户名验证
    if ( username.length < 3 || username.length > 16 ) {
        res.responseData.code = 1;
        res.responseData.message = '用户名长度必须在3-16个字符之间';
        res.sendJSON();
        return;
    }

    //验证用户名是否已经被注册
    User.findOne({
        username: username
    }).then(function(result) {
        if (result) {
            res.responseData.code = 2;
            res.responseData.message = '用户名已经被注册';
        } else {
            res.responseData.message = '用户名可以注册';
        }
        res.sendJSON();
    })

})

/*
* 用户注册
* method: POST
* params:
*   <string>username : 用户要注册的用户名
*   <string>password : 用户要注册的密码
*   <string>repassword : 重复密码
* */
router.post('/user/register', function(req, res) {

    var username = req.body.username || '';
    var password = req.body.password || '';
    var repassword = req.body.repassword || '';
    //console.log(req.body.username);

    //用户名验证
    if ( username.length < 3 || username.length > 16 ) {
        res.responseData.code = 1;
        res.responseData.message = '用户名长度必须在3-16个字符之间';
        res.sendJSON();
        return;
    }
    //密码验证
    if (password.length == '') {
        res.responseData.code = 2;
        res.responseData.message = '密码不能为空';
        res.sendJSON();
        return;
    }
    if ( password != repassword ) {
        res.responseData.code = 3;
        res.responseData.message = '两次输入密码不一致';
        res.sendJSON();
        return;
    }

    //验证用户名是否已经被注册
    User.findOne({
        username: username
    }).then(function(result) {
        if (result) {
            res.responseData.code = 4;
            res.responseData.message = '用户名已经被注册';
            res.sendJSON();
            return;
        }
        var user = new User({
            username: username,
            password: password
        });
        return user.save();
    }).then(function(newUser) {
        if (newUser) {
            res.responseData.message = '注册成功,将在2秒后返回登陆页';
            res.sendJSON();
        }
    }).catch(function() {
        res.responseData.code = 5;
        res.responseData.message = '注册失败';
        res.sendJSON();
    });

});

/*
 * 用户登录
 * method: POST
 * params:
 *   <string>username : 用户要登录的用户名
 *   <string>password : 用户要登录的密码
 * */
router.post('/user/login', function(req, res) {

    var username = req.body.username || '';
    var password = req.body.password || '';

    //用户名和密码的验证
    if ( username == '' || password == '' ) {
        res.responseData.code = 1;
        res.responseData.message = '用户名和密码不能为空';
        res.sendJSON();
        return;
    }

    //验证用户名和密码是否是匹配的
    User.findOne({
        username: username
    }).then(function(userInfo) {
        if (!userInfo) {
            res.responseData.code = 2;
            res.responseData.message = '用户名不存在';
            res.sendJSON();
            return;
        }
        if (userInfo.password != password) {
            res.responseData.code = 3;
            res.responseData.message = '密码错误';
            res.sendJSON();
            return;
        }

        //把登录用户的信息记录到cookie中，发送给客户端
        var cookieUserInfo = {
            _id: userInfo._id.toString(),
            username: userInfo.username
        }

        req.cookies.set('userInfo', JSON.stringify(cookieUserInfo));

        res.responseData.message = '登录成功,即将跳转';
        res.sendJSON();
        return;
    })

});


//网盘业务操作API

/*
* 新建文件夹
* method: POST
* params:
*   <string>name : 文件夹的名称
*   <number>pid : 父级ID
* */
router.post('/createFolder', function(req, res) {

    var name = req.body.name || '';
    var pid = req.body.pid || null;

    if ( name == '' ) {
        res.responseData.code = 1;
        res.responseData.message = '文件夹名称不能为空';
        res.sendJSON();
        return;
    }

    File.findOne({
        pid: pid,
        name: name,
        uid: req.userInfo._id,
        type: true
    }).then(function(result) {
        if (result) {
            res.responseData.code = 2;
            res.responseData.message = '名字重复了';
            res.sendJSON();
            return;
        }
        //保存文件夹
        var folder = new File({
            pid: pid,
            name: name
        });
        return folder.save()
    }).then(function(newFolder) {
        res.responseData.message = '文件夹创建成功';
        res.sendJSON();
    });

});

/*
 * 获取指定pid下的一级子文件/文件夹
 * method: GET
 * params:
 *   <number>pid : 父级ID
 * */
router.get('/getList', checkAuth, function(req, res) {
    var pid = req.query.pid || null;
    res.responseData.data = req.files.getList(pid);
    res.sendJSON();
});

/*
 * 获取回收站中的数据
 * method: GET
 * params:
 *   <number>pid : 父级ID
 * */
router.get('/getRecycleBinList', checkAuth, function(req, res) {
    res.responseData.data = req.files.getRecycleBinList();
    res.sendJSON();

});

/*
* 面包屑
* */
router.get('/crumbs', checkAuth, function(req, res) {
    var id = req.query.id || null;
    var parents = req.files.getParents(id);
    if (id) {
        parents.push( req.files.get(id) );
    }
    res.responseData.data = parents;
    res.sendJSON();

})

/*
* 文件夹重命名
* */
router.get('/rename', checkAuth, function(req, res) {
    var id = req.query.id || null;
    var name = req.query.name || null;

    var file = req.files.rename(id, name);
    if (!file) {
        res.responseData.code = 1;
        res.responseData.message = '重命名失败';
        res.sendJSON();
        return;
    }

    file.save().then(function(newFile) {
        res.responseData.message = '重命名成功';
        res.sendJSON();
        return;
    })

});

/*
* 移动
* */
router.post('/move', function(req, res) {
    var targetId = req.body.targetId || '';
    var checkedId = req.body.checkedId || '';
    checkedId = checkedId.split(',');

    if (!targetId || !checkedId.length) {
        res.responseData.code = 1;
        res.responseData.message = '源id和目标id不存在';
        res.sendJSON();
        return;
    }

    File.update({
        _id: {$in: checkedId}
    }, {
        pid: targetId
    }, {
        multi: true
    }).then(function(result) {
        res.responseData.message = '移动成功';
        res.sendJSON();
    });

});

/*
* 删除
* */
router.get('/remove', function(req, res) {
    var id = req.query.id || '';
    id = id.split(',');

    if (!id.length) {
        res.responseData.code = 1;
        res.responseData.message = '缺少文件id';
        res.sendJSON();
        return;
    }

    File.remove({
        _id: {$in: id}
    }).then(function() {
        res.responseData.message = '删除成功';
        res.sendJSON();
    });
});

/*
* 移动到回收站
* */
router.get('/moveToRecycleBin', function(req, res) {
    var id = req.query.id || '';
    id = id.split(',');

    if (!id.length) {
        res.responseData.code = 1;
        res.responseData.message = '缺少文件id';
        res.sendJSON();
        return;
    }

    File.update({
        _id: {$in: id}
    }, {
        isRecycleBin: true
    }, {
        multi: true
    }).then(function() {
        res.responseData.message = '移动成功';
        res.sendJSON();
    });
});

/*
 * 从回收站还原
 * */
router.get('/recovery', function(req, res) {
    var id = req.query.id || '';
    id = id.split(',');

    if (!id.length) {
        res.responseData.code = 1;
        res.responseData.message = '缺少文件id';
        res.sendJSON();
        return;
    }

    File.update({
        _id: {$in: id}
    }, {
        isRecycleBin: false
    }, {
        multi: true
    }).then(function() {
        res.responseData.message = '还原成功';
        res.sendJSON();
    });
});


function checkAuth(req, res, next) {
    if (!req.userInfo._id) {
        res.responseData.code = -1;
        res.responseData.message = '你没有访问该接口的权限';
        res.sendJSON();
    } else {

        req.files = [];

        //数据初始化
        File.find({
            uid: req.userInfo._id
        }).then(function(result) {
            req.files = new Tree(result);
            next();
        });

    }
}

module.exports = router;