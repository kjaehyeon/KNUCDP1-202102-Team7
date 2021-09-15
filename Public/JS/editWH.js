(function ($) {
    "use strict"; // Start of use strict
    $(document).ready(function () {

        //send sign up data to server
        $("#enrollForm").submit(function (evt) {
            evt.preventDefault();

            var whEmail = $("#warehouseEmail").val();
            var whTel = $("#warehouseTel").val();
            var landArea = $("#landArea").val();
            var floorArea = $("#floorArea").val();
            var useableArea = $("#useableArea").val();
            var price = $("#price").val();

            var swalError = (text) => Swal.fire({
                icon: 'error',
                title: 'Fail',
                text: text
            });

            if (!whEmail)
                swalError('You have to insert your warehouse contact email.');
            else if (!whTel)
                swalError('You have to insert your warehouse contact telephone number.');
            else if (!landArea)
                swalError('You have to insert your warehouse land area.');
            else if (!floorArea)
                swalError('You have to insert your warehouse floor area.');
            else if (!useableArea)
                swalError('You have to insert your warehouse usable area.');
            else if (!price)
                swalError('You have to insert your warehouse price.');
            else {
                var formData = new FormData(document.getElementById('enrollForm'));
                $.ajax({
                    url: $(this).attr('action'),
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        if (data == "errortype2")
                            swalError('Please enter only numbers in the Land Area field.');
                        else if (data == "errortype3")
                            swalError('Please enter only numbers in the Floor Area field.');
                        else if (data == "errortype4")
                            swalError('Please enter only numbers in the price field.');
                        else if (data == "errortype9")
                            swalError('Please enter the email in the correct format.');
                        else if (data == "errortype10")
                            swalError('Please enter the telephone number in the correct format.');
                        else if (data == "errortype11")
                            swalError('Please enter only numbers in the Useable Area field.');
                        else if (data == "success") {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success'
                            }).then(() => {
                                location.href = "/Provider/MyWarehouse";
                            })
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'An error was occurred.'
                            })
                        }
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
