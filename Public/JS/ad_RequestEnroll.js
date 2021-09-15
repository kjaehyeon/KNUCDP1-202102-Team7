function adClick(i, flag) {
    switch (flag) {
        case 0: // flag == 0 -> Reject
            inputAlert('Input the reason for rejection to submit.', (reason) => {
                $.ajax({
                    url: '/Admin/RequestEnroll',
                    dataType: 'json',
                    type: 'POST',
                    data: {
                        answer: "Reject",
                        reqID: parseInt(document.getElementById('reqID' + i).innerText),
                        warehouseID: parseInt(document.getElementById('whID' + i).innerText),
                        reason: reason
                    },
                    success: function (success) {
                        if (success) resultAlert('Rejected');
                        else errorAlert();
                    }
                });
            });
            break;
        case 1: // flag == 1 -> Approve
            reAlert('Approve enroll request?', () => {
                $.ajax({
                    url: '/Admin/RequestEnroll',
                    dataType: 'json',
                    type: 'POST',
                    data: {
                        answer: "Approve",
                        providerID: document.getElementById('providerID' + i).innerText,
                        reqType: "ReqEnrollPV",
                        warehouseID: parseInt(document.getElementById('whID' + i).innerText),
                        reqID: parseInt(document.getElementById("reqID" + i).innerText)
                    },
                    success: function (success) {
                        if (success) resultAlert('Approved');
                        else errorAlert();
                    }
                });
            });
            break;
        case 2: // flag == 1 -> Confirm
            var rejectCmt = $(`#rejectCmt${i}`).text();
            rejectedAlert('Canceled By Provider', rejectCmt, () => {
                reAlert('Delete from table?', () => {
                    $.ajax({
                        url: '/Admin/RequestEnroll',
                        dataType: 'json',
                        type: 'POST',
                        data: {
                            answer: "Confirm",
                            providerID: document.getElementById('providerID' + i).innerText,
                            reqType: "ReqEnrollPV",
                            warehouseID: parseInt(document.getElementById('whID' + i).innerText),
                            reqID: parseInt(document.getElementById("reqID" + i).innerText)
                        },
                        success: function (success) {
                            if (success) resultAlert('Deleted');
                            else errorAlert();
                        }
                    });
                });
            });
            break;
    }
}
