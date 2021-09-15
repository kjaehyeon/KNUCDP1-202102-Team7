function reqClick(i, WID, flag) {
    var reqID = $(`#IoTReqID${i}`).text();
    switch (flag) {
    case 0:
        inputAlert('Input the reason for cancellation to submit.', (reason) => {
            $.ajax({
                url: '/Provider/MyWarehouse/IoT/Ans',
                dataType: 'json',
                type: 'POST',
                data: {
                    answer: "Cancel",
                    warehouseID: parseInt(WID),
                    reqID: reqID,
                    reason: reason
                    //other things will be here
                },
                success: function (success) {
                    if (success) resultAlert('Canceled');
                    else errorAlert();
                },
            });
        });
        break;
    case 1:
        var rejectCmt = $(`#IoTRejectCmt${i}`).text();
        rejectedAlert('Rejected By Admin', rejectCmt, () => {
            reAlert('Delete from table?', () => {
                $.ajax({
                    url: '/Provider/MyWarehouse/IoT/Ans',
                    dataType: 'json',
                    type: 'POST',
                    data: {
                        answer: "Confirm",
                        warehouseID: parseInt(WID),
                        reqID: reqID,
                        //other things will be here
                    },
                    success: function (success) {
                        if (success) resultAlert('Deleted');
                        else errorAlert();
                    }
                });
            })
        });
        break;
    case 3:
        reAlert('Request IoT Server?', () => {
            $.ajax({
                url: '/Provider/MyWarehouse/IoT/Ans',
                dataType: 'json',
                type: 'POST',
                data: {
                    answer: "Request",
                    warehouseID: parseInt(WID)
                },
                success: function (success) {
                    if (success) resultAlert('Submitted');
                    else errorAlert();
                }
            });
        });
        break;
    }
}

function pvClick(where, i, flag) {
    var text = 'Input the reason for cancellation to submit.';
    var URL = '/Provider/MyWarehouse/Enroll/Ans';
    var resTitle = 'Canceled';
    var rejTitle = 'Rejected by Admin';
    var rejectCmt = $(`#enrollRejectCmt${i}`).val();
    var Area = null;
    if (where) {
        text = 'Input the reason for rejection to submit.';
        URL = '/Provider/MyWarehouse/Buy/Ans';
        resTitle = 'Rejected';
        rejTitle = 'Canceled By Buyer';
        rejectCmt = $(`#buyRejectCmt${i}`).text();
        Area = document.getElementById('area' + where + i).innerText;
    }
    switch (flag) {
    case 0: // Cancel
        inputAlert(text, (reason) => {
            $.ajax({
                url: URL,
                dataType: 'json',
                type: 'POST',
                data: {
                    answer: "Cancel",
                    reqID: document.getElementById('reqID' + where + i).innerText,
                    whID: document.getElementById('whID' + where + i).innerText,
                    reqType: document.getElementById('reqType' + where + i).innerText,
                    memberID: document.getElementById('memberID' + where + i).innerText,
                    area: Area,
                    reason: reason
                    //other things will be here
                },
                success: function (success) {
                    if (success) resultAlert(resTitle);
                    else errorAlert();
                }
            });
        });
        break;
    case 1: // Approve
        reAlert('Approve buy request?', () => {
            $.ajax({
                url: URL,
                dataType: 'json',
                type: 'POST',
                data: {
                    answer: "Approve",
                    reqID: document.getElementById('reqID' + where + i).innerText,
                    whID: document.getElementById('whID' + where + i).innerText,
                    reqType: document.getElementById('reqType' + where + i).innerText,
                    memberID: document.getElementById('memberID' + where + i).innerText,
                    area: Area
                    //other things will be here
                },
                success: function (success) {
                    if (success) resultAlert('Approved');
                    else errorAlert();
                }
            });
        });
        break;
    case 2:  // Confirm
        rejectedAlert(rejTitle, rejectCmt, () => {
            reAlert('Delete from table?', () => {
                $.ajax({
                    url: URL,
                    dataType: 'json',
                    type: 'POST',
                    data: {
                        answer: "Confirm",
                        reqID: document.getElementById('reqID' + where + i).innerText,
                        whID: document.getElementById('whID' + where + i).innerText,
                        reqType: document.getElementById('reqType' + where + i).innerText,
                        memberID: document.getElementById('memberID' + where + i).innerText,
                        area: Area
                        //other things will be here
                    },
                    success: function (success) {
                        if (success) resultAlert('Deleted');
                        else errorAlert();
                    }
                });
            })
        });
        break;
    }
}
