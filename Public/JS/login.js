(function ($) {
    "use strict"; // Start of use strict
    $(document).ready(function () {
        var engishDigit = /^[a-zA-Z0-9]+$/;    //영어 대소문자 및 숫자 받는 정규식
        var pwCheck = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/; // 비밀번호 정규식 (최소8자리 영문 대소문자 및 숫자, 특수문자 허용)
        //send sign up data to server
        $("#loginFormBtn").off("click").on("click", function () {
            var id = $("#memberID").val();
            var pw = $("#password").val();

            var swalError = (text) => Swal.fire({
                icon: 'error',
                title: 'Fail',
                text: text
            });

            if (!id)
                swalError('You have to insert your Id');
            else if (!pw)
                swalError('You have to check PW');
            else if (((engishDigit.test(id)) || (pwCheck.test(pw))) == false)
                swalError('You have to check ID, PW');
            else {
                var formData = $("#form1").serialize();
                $.ajax({
                    url: '/User/Login',
                    type: 'POST',
                    data: formData,
                    success: function (data) {
                        if (data == "loginError01")
                            swalError('The ID does not exist.');
                        else if (data == "loginError02")
                            swalError('Wrong password');
                        else if (data == "loginSuccess")
                            window.location.href="/";
                        else
                            swalError('Undefined Error');
                    },
                    error: function (request, status, error) {
                        Swal.fire({
                            title: 'Error',
                            html: `code: ${request.status}<br>message: ${request.responseText}<br>error: ${error}`,
                            icon: 'error'
                        });
                    }
                })
            }
        })
    })
})(jQuery);
