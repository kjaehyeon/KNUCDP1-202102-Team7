function adClick(i, flag) {
    switch (flag) {
    case 0:  // Reject
        inputAlert('Input the reason for rejection to submit.', (reason) => {
            $.ajax({
                url: '/Admin/RequestBuy/Ans',
                dataType: 'json',
                type: 'POST',
                data: {
                    answer: "Reject",
                    buyerID: document.getElementById('buyerID' + i).innerText,
                    reqType: document.getElementById('reqType' + i).innerText,
                    warehouseID: parseInt(document.getElementById('whID' + i).innerText),
                    reqID: parseInt(document.getElementById("reqID" + i).innerText),
                    area: parseInt(document.getElementById("area" + i).innerText),
                    reason: reason
                },
                success: function (success) {
                    if (success) resultAlert('Rejected');
                    else errorAlert();
                }
            });
        });
        break;
    case 1:  // Approve
        reAlert('Approve buy request?', () => {
            $.ajax({
                url: '/Admin/RequestBuy/Ans',
                dataType: 'json',
                type: 'POST',
                data: {
                    answer: "Approve",
                    buyerID: document.getElementById('buyerID' + i).innerText,
                    reqType: document.getElementById('reqType' + i).innerText,
                    warehouseID: parseInt(document.getElementById('whID' + i).innerText),
                    reqID: parseInt(document.getElementById("reqID" + i).innerText),
                    area: parseInt(document.getElementById("area" + i).innerText)
                },
                success: function (success) {
                    if (success) resultAlert('Approved');
                    else errorAlert();
                }
            });
        });
        break;
    case 2:  // Confirm
        var rejectCmt = $(`#rejectCmt${i}`).text();
        var rejBy = $(`#reqType${i}`).text();
        var text = (rejBy.includes('Rej') ? 'Rejected' : 'Canceled') + ' By ' + (rejBy.includes('Pv') ? 'Provider' : 'Buyer');
        rejectedAlert(text, rejectCmt, () => {
            reAlert('Delete from table?', () => {
                $.ajax({
                    url: '/Admin/RequestBuy/Ans',
                    dataType: 'json',
                    type: 'POST',
                    data: {
                        answer: "Confirm",
                        reqID: document.getElementById('reqID' + i).innerText,
                        whID: document.getElementById('whID' + i).innerText,
                        reqType: document.getElementById('reqType' + i).innerText,
                        buyerID: document.getElementById('buyerID' + i).innerText,
                        area: document.getElementById('area' + i).innerText
                        //other things will be here
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
