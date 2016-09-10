
function Tree(data) {
    this.data = data;
}

Tree.prototype.get = function(id) {
    var info = null;
    for (var i=0; i<this.data.length; i++) {
        if (this.data[i]._id.toString() == id) {
            info = this.data[i];
            break;
        }
    }
    return info;
}

Tree.prototype.getParent = function(id) {
    var info = this.get(id);
    var parent = null;
    if (info && info.pid) {
        parent = this.get(info.pid);
    }
    return parent;
}

Tree.prototype.getParents = function(id) {
    var parents = [];
    var parent = this.getParent(id);

    if (parent) {
        parents.unshift(parent);
        parents = this.getParents(parent._id).concat( parents );
    }

    return parents;
}

Tree.prototype.getList = function(pid) {
    var data = [];
    for (var i=0; i<this.data.length; i++) {
        if ( this.data[i].pid == pid && this.data[i].isRecycleBin == false ) {
            data.push(this.data[i]);
        }
    }
    return data;
}

Tree.prototype.getRecycleBinList = function() {
    var data = [];
    for (var i=0; i<this.data.length; i++) {
        if ( this.data[i].isRecycleBin == true ) {
            data.push(this.data[i]);
        }
    }
    return data;
}

Tree.prototype.rename = function(id, newname) {
    var file = this.get(id);
    if (!file) {
        return false;
    }
    var children = this.getList(file.pid.toString());

    for (var i=0; i<children.length; i++) {
        if ( children[i].id != id && children[i].type == file.type && children[i].name == newname ) {
            return false;
        }
    }

    file.name = newname;

    return file;

}


module.exports = Tree;