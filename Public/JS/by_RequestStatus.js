function byClick(i, flag) {
    switch (flag) {
        case 0: // Cancel
            inputAlert('Input the reason for cancellation to submit.', (reason) => {
                $.ajax({
                    url: '/Buyer/RequestStatus/Buy/Ans',
                    dataType: 'json',
                    type: 'POST',
                    data: {
                        answer: "Cancel",
                        reqID: document.getElementById('reqID' + i).innerText,
                        whID: document.getElementById('whID' + i).innerText,
                        reqType: document.getElementById('reqType' + i).innerText,
                        buyerID: document.getElementById('buyerID' + i).innerText,
                        area: parseInt(document.getElementById('area' + i).innerText),
                        reason: reason
                        //other things will be here
                    },
                    success: function (success) {
                        if (success) resultAlert('Canceled');
                        else errorAlert();
                    }
                });
            });
            break;
        case 1: // Pay
            $.ajax({
                url: '/Buyer/RequestStatus/Buy/Ans',
                dataType: 'json',
                type: 'POST',
                data: {
                    answer: "Accept",
                    reqID: document.getElementById('reqID' + i).innerText,
                    whID: document.getElementById('whID' + i).innerText,
                    reqType: document.getElementById('reqType' + i).innerText,
                    buyerID: document.getElementById('buyerID' + i).innerText,
                    area: parseInt(document.getElementById('area' + i).innerText),
                    startDate: document.getElementById('startDate' + i).innerText,
                    endDate: document.getElementById('endDate' + i).innerText,
                    amount: parseFloat(document.getElementById('amount' + i).innerText)
                    //other things will be here
                },
                success: function (success) {
                    if (success) resultAlert('Success');
                    else errorAlert();
                }
            });
            break;
        case 2:
            var rejectCmt = $(`#rejectCmt${i}`).val();
            var rejBy = $(`#reqType${i}`).text();
            var text = rejBy.includes('Pv') ? 'Rejected By Provider' : 'Rejected By Admin';
            rejectedAlert(text, rejectCmt, () => {
                reAlert('Delete from table?', () => {
                    $.ajax({
                        url: '/Buyer/RequestStatus/Buy/Ans',
                        dataType: 'json',
                        type: 'POST',
                        data: {
                            answer: "Confirm",
                            reqID: document.getElementById('reqID' + i).innerText,
                            whID: document.getElementById('whID' + i).innerText,
                            reqType: document.getElementById('reqType' + i).innerText,
                            buyerID: document.getElementById('buyerID' + i).innerText,
                            area: parseInt(document.getElementById('area' + i).innerText)
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

if (document.getElementById("payFlag").innerText == 'T') {
    paypal.Buttons({
        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        currency: "USD",
                        value: document.getElementById('totalMoney').innerText
                    },
                }]
            });
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                var index = makeIndex();

                for (var i = 0; i < index.length; i++) {
                    byClick(Number(index[i]), 1);
                }
            });
        }
    }).render('#paypal-button-container');
}

function countNumofElement() {
    var count = 0;
    var i = 0;
    result = 1;
    while (result != null) {
        result = document.getElementById('reqType' + i);
        if (result == null) {
            break;
        } else {
            count++;
        }
        i++;
    }
    return count;
}

function makeIndex() {
    var result = 1;
    var index = [];
    var limit = countNumofElement();
    for (var i = 0; i < limit; i++) {
        result = document.getElementById('count' + i);
        if (result == null) {} else {
            index.push(result.innerText);
        }
    }
    return index;
}

function getCheckboxValue(event) {
    let result = 0;
    if (event.target.checked) {
        result = event.target.value;
        result *= 1; // 형변환
        makeIndex(); //
    } else {
        result -= event.target.value;
    }
    var a = document.getElementById('totalMoney').innerText;
    a *= 1;
    document.getElementById('totalMoney').innerText = (result + a);
}
