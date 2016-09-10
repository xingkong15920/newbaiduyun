window.onload = function(){
	//已注册，点击到登陆页面
	$('#login_go').on('click',function(){
		window.location.href = '/';
	})
	//注册账号失去焦点时发送ajax验证
	 $('#reg_user').on('blur', function() {
            $.ajax({
                url: '/api/user/checkUserName',
                data: {
                    username: this.value
                },
                dataType: 'json',
                success: function(result) {
                    $('#text_message').html( result.message );

                    if (result.code) {
                        $('#text_message').css('color', 'red');
                    } else {
                        $('#text_message').css('color', 'green');
                    }
                }
            })
        }) 
        
        $('#reg_sub').on('click', function() {
			//console.log($('#reg_pass')[0].value);
            $.ajax({
                type: 'POST',
                url: '/api/user/register',
                data: {
                    username: $('#reg_user')[0].value,
                    password: $('#reg_pass')[0].value,
                    repassword:$('#reg_repass')[0].value,
                },
                dataType: 'json',
                success: function(result) {

                    $('#pass_message').html( result.message );

                    if (result.code) {
                        $('#pass_message').css('color', 'red');
                    } else {
                        $('#pass_message').css('color', 'green');
                        setTimeout(function(){
                        	window.location.href = '/';
                        },2000)
                    }
                }
            });

            return false;
        })
}
