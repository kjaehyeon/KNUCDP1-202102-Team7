(function ($) {
    "use strict"; // Start of use strict
    $(document).ready(function () {
        var overlapId = false;
        var EffectivenessPw = false;
        var authedEmails = [''];
        var authCode = null;
        var authFlag = false;

        var swalError = (text, callback) => Swal.fire({
            icon: 'error',
            title: 'Fail',
            text: text
        }).then(callback);

        //length>8 //num + upper case + lower case + Special Characters //no blank //no id //no korean
        $("#passwordCheckButton").off("click").on("click", function () {
            var pw = $("#password").val();
            var id = $("#memberID").val();
            var c_p = $("#passwordConfirmation").val();

            var check_attr = {
                pw: pw,
                id: id,
                c_p: c_p,
            }

            $.ajax({
                url: "/User/Register/checkPW",
                type: "post",
                data: check_attr,
                success: function (data) {
                    if (data == "errortype7")
                        swalError('ID must be filled first', () => EffectivenessPw = false);
                    if (data === "errortype1")
                        swalError('Password must be at least 8 characters long and must contain at least one number, upper or lower case and special characters(@$!%*#?&-).', () => EffectivenessPw = false);
                    else if (data === "errortype2")
                        swalError('You can not use same letter 4 times', () => EffectivenessPw = false);
                    else if (data === "errortype3")
                        swalError('You can not use id in to password', () => EffectivenessPw = false);
                    else if (data === "errortype4")
                        swalError('You can not use blank in to password', () => EffectivenessPw = false);
                    else if (data === "errortype5")
                        swalError('You can not use korean in to password', () => EffectivenessPw = false);
                    else if (data === "errortype6")
                        swalError('You have to insert same password', () => EffectivenessPw = false);
                    else if (data === "errortype0") {
                        Swal.fire({
                            icon: 'success',
                            title: 'Effectiveness Check',
                            text: "You can use this password!!",
                        }).then(function () {
                            EffectivenessPw = true;
                        });
                    }
                }
            })
        })
        //check overlap user ID
        $("#idCheckButton").off("click").on("click", function () {
            var memberID = $("#memberID").val();
            if (memberID != "") {
                $.ajax({
                    url: '/User/Register/MemberID',
                    type: 'post',
                    data: {
                        'memberID': memberID
                    },
                    success: function (data) {
                        if (data == true) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Overlap Check',
                                text: "You can use this Id!!",
                            }).then(function () {
                                overlapId = true;
                            })
                        } else swalError('You can not use this Id!!', () => overlapId = false);
                    }
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Fail',
                    text: 'Please insert your Id',
                })
            }
        });

        $('#email').on('input', () => {
            if (!authedEmails.includes(($('#email').val()))) {
                authCode = null;
                authFlag = false;
                $('#div_auth').show();
                $('#sendAuthCode').attr('disabled', false);
            } else {
                authFlag = true;
                $('#div_auth').hide();
                $('#sendAuthCode').attr('disabled', true);
            }
        });

        $('#sendAuthCode').click(function () {
            var email = $('#email').val();
            if (email != '') {
                $.ajax({
                    url: '/User/Register/EmailIDF',
                    type: 'POST',
                    data: {
                        'email': email
                    },
                    success: function (rcvData) {
                        if (rcvData.result == false)
                            swalError('Please try again.');
                        else {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: "Mail was sended",
                            }).then(function () {
                                authCode = rcvData.authCode;
                                authedEmails.push($('#email').val());
                            })
                        }
                    }
                });
            }
        });
        $('#codeCheck').off("click").on("click", function () {
            var vCode = $("#authCode").val();
            if (email != '') {
                if (vCode == authCode) {
                    authFlag = true;
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'valid AuthCode!!'
                    }).then(() => {
                        $('#div_auth').hide();
                        $('#authCode').val('');
                        $('#sendAuthCode').attr('disabled', true);
                    });
                } else swalError('invalid AuthCode!!');
            }
        });
        //send sign up data to server
        $("#regFormBtn").off("click").on("click", function () {
            var id = $("#memberID").val();
            var pw = $("#password").val();
            var name = $("#name").val();
            var email = $("#email").val();
            var zipcode = $("#zipcode").val();
            var address = $("#address").val();
            var national = $("#national").val();
            var textReg = /^[a-zA-Z0-9\s$@$!%*#?&\-,]*$/;

            if (!id)
                swalError('You have to insert your Id');
            else if (overlapId == false)
                swalError('You have to check Id');
            else if (!name)
                swalError('You have to insert your name');
            else if (!pw)
                swalError('You have to insert your Password');
            else if (EffectivenessPw == false)
                swalError('You have to check Password Effectiveness');
            else if (!email)
                swalError('You have to insert your email');
            else if (!authFlag)
                swalError('You have to authenticate your email.');
            else if (!zipcode)
                swalError('You have to insert your zipcode');
            else if (!address)
                swalError('You have to insert your address');
            else if (!national)
                swalError('You have to insert your country');
            else if (false === textReg.test(name))
                swalError('Only english, numbers, blank, special character(@$!%*#?&-,) can be entered in name field');
            else if (false === textReg.test(address))
                swalError('Only english, numbers, blank, special character(@$!%*#?&-,) can be entered in address field');
            else if (false === textReg.test(national))
                swalError('Only english, numbers, blank, special character(@$!%*#?&-,) can be entered in nation field');
            //finish all test
            else {
                var formData = $("#regForm").serialize();

                $.ajax({
                    url: '/User/Register',
                    type: 'POST',
                    data: formData,
                    success: function (data) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Sign up',
                            text: 'Sign up success',
                        }).then(() => {
                            location.href = "/";
                        })
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
