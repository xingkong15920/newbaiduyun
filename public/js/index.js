window.onload = function(){
	//注册跳转
	$('#login_submit').on('click',function(){
		console.log($('#index_message'));
		$.ajax({
            type: 'POST',
            url: '/api/user/login',
            data: {
                username: $('#login_user_text')[0].value,
                password: $('#login_user_pass')[0].value,
            },
            dataType: 'json',
            success: function(result) {

                $('#index_tips').html( result.message );

                if (result.code) {
                    $('#index_tips').css('color', 'red');
                } else {
                    $('#index_tips').css('color', 'green');

                    setTimeout(function() {
                        window.location.reload();
                    },2000);
                }
            }
        });

        return false;
    })
}
