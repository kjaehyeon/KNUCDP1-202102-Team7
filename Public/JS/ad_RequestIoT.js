function adClick(val, i) {
    var iotServer = $('#iotServer').val();
    var wid = $('#wid').val();
    if (val === 'Test') {
        $.redirect('/iot', {'iotServer': iotServer, 'wid': wid});
    }
    else if (val === 'Approve') {
        reAlert(`<b>IoT Server:</b><br>${iotServer}`, () => {
            $.ajax({
                url: '/Admin/RequestIoT',
                dataType: 'json',
                type: 'POST',
                data: {
                    answer: "Approve",
                    iotServer: iotServer
                },
                success: function (success) {
                    if (success) {
                        Swal.fire({
                            title: 'Approved',
                            icon: 'success'
                        }).then(() => location.href = '/Admin/RequestIoT');
                    }
                    else errorAlert();
                }
            });
        });
    } else if (val === 'Reject') {
        inputAlert('Input the reason for rejection to submit.', (reason) => {
            $.ajax({
                url: '/Admin/RequestIoT',
                dataType: 'json',
                type: 'POST',
                data: {
                    warehouseID: wid,
                    answer: "Reject",
                    reason: reason
                },
                success: function (success) {
                    if (success) {
                        Swal.fire({
                            title: 'Rejected',
                            icon: 'success'
                        }).then(() => location.href = '/Admin/RequestIoT');
                    }
                    else errorAlert();
                }
            });
        });
    } else if (val === 'Confirm') {
        var rejectCmt = $(`#rejectCmt${i}`).text();
        rejectedAlert('Canceled By Provider', rejectCmt, () => {
            reAlert('Delete from table?', () => {
                $.ajax({
                    url: '/Admin/RequestIoT',
                    dataType: 'json',
                    type: 'POST',
                    data: {
                        answer: "Confirm",
                        reqID: parseInt(document.getElementById("reqID" + i).innerText)
                    },
                    success: function (success) {
                        if (success) {
                            Swal.fire({
                                title: 'Deleted',
                                icon: 'success'
                            }).then(() => location.href = '/Admin/RequestIoT');
                        }
                        else errorAlert();
                    }
                });
            });
        });
    }
}
