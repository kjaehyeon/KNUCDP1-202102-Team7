$(function () {
    var authedEmails = ['', $('#email').val()];
    var authCode = null;
    var authFlag = true;

    var swalError = (text, callback) => Swal.fire({
        icon: 'error',
        title: 'Fail',
        text: text
    }).then(callback);

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
        if ($("#authCode").val() === authCode) {
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
    });

    //send sign up data to server
    $("#save").off("click").on("click", function () {
        var email = $("#email").val();
        var zipcode = $("#zipcode").val();
        var address = $("#address").val();
        var national = $("#national").val();
        var contactNumber = $("#contactNumber").val();
        var textReg = /^[a-zA-Z0-9\s$@$!%*#?&\-,]*$/;
        var phoneReg = /^0(1([0-1]|[6-9])|2|[3-6]\d)-(\d{3,4})-\d{4}$/;

        if (!email)
            swalError('You have to insert your email');
        else if (!authFlag)
            swalError('You have to authenticate your email.');
        else if (!zipcode)
            swalError('You have to insert your zipcode');
        else if (!address)
            swalError('You have to insert your address');
        else if (!national)
            swalError('You have to insert your country');
        else if (!textReg.test(address))
            swalError('Only english, numbers, blank, special character(@$!%*#?&-,) can be entered in address field');
        else if (!textReg.test(national))
            swalError('Only english, numbers, blank, special character(@$!%*#?&-,) can be entered in nation field');
        else if (!phoneReg.test(contactNumber))
            swalError('Please enter the telephone number in the correct format.');
        //finish all test
        else {
            reAlert('', () => {
                $.ajax({
                    url: '/User/Edit',
                    type: 'POST',
                    data: {
                        email: email,
                        zipcode: zipcode,
                        address: address,
                        national: national,
                        contactNumber: contactNumber
                    },
                    success: function (data) {
                        console.log(data);
                        if (data === 'success') {
                            Swal.fire({
                                title: 'Saved',
                                icon: 'success'
                            }).then(() => history.back());
                        }
                        else errorAlert();
                    },
                    error: function (request, status, error) {
                        Swal.fire({
                            title: 'Error',
                            html: `code: ${request.status}<br>message: ${request.responseText}<br>error: ${error}`,
                            icon: 'error'
                        });
                    }
                })
            });
        }
    })
});
