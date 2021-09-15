var map;
var i = 0;
var markers = [];
var today = new Date();
today.setHours(0, 0, 0, 0);

function createImage(objImageInfo) {
    var strDOM = "";
    for (image in objImageInfo) {
        strDOM += `<div class  = "image_panel">`;
        strDOM += `<img src="${objImageInfo[image]["url"]}">`;
        strDOM += `</div>`
    }
    document.getElementById("image_container").innerHTML = strDOM;
}

async function initMap() {
    var daegu = {lat: 35.87222, lng: 128.60250};
    map = new google.maps.Map(
        document.getElementById('map'), {
            zoom: 12,
            center: daegu
        });
    var items;
    await $.post('searchWH', data => items = JSON.parse(data));
    for (key in items) {
        markers[i] = new google.maps.Marker({
            position: {lat: items[key].latitude, lng: items[key].longitude},
            map: map,
        });
        markers[i].addListener('click', function () {
            var k = 'item' + markers.indexOf(this);
            $.ajax({
                url: '/Buyer/FindWH/FindImage',
                type: 'POST',
                data: {'warehouseID': items[k].warehouseID},
                dataType: 'json',
                success: function (data) {
                    createImage(data)
                }
            })
            map.setCenter(this.getPosition());
            $("#whID").html(items[k]['warehouseID']);
            $("#whName").html(items[k]['warehouseName']);
            $("#whAddress").html(items[k]['address']);
            $("#whAddressDetail").html(items[k]['addressDetail']);
            $("#whLandArea").html(items[k]['landArea'] + " m<sup>2</sup>");
            $("#whFloorArea").html(items[k]['floorArea'] + " m<sup>2</sup>");
            $("#whUseableArea").html(items[k]['useableArea'] + " m<sup>2</sup>");
            $("#whEmail").html(items[k]['warehouseEmail']);
            $("#whPhone").html(items[k]['warehouseTel']);
            $("#whPrice").html(items[k]['price'] + " $");
            $("#whInfoComment").html(items[k]['infoComment']);
            $("#whEtcComment").html(items[k]['etcComment']);

            if (items[k]['iotStat'] === 'Y') {
                $("#whIoT").html("In Use");
            } else if (items[k]['iotStat'] === 'W') {
                $("#whIoT").html("Pending Approval");
            } else if (items[k]['iotStat'] === 'N') {
                $("#whIoT").html("Not Currently Used");
            } else {
                $("#whIoT").html("Error");
            }

            var hideArr = [$("#whFloorArea"), $("#whUseableArea"), $("#whEmail"), $("#whPhone"), $("#whPrice"), $("#whIoT"), $("#whInfoComment"), $("#whEtcComment")];
            hideArr.forEach(tr => items[k]['isPublic'] ? tr.parent().hide() : tr.parent().show());

            if (items[k]['isPublic']) {
                $("#whAddressDetail").hide();
                $("#btnInquire").hide();
                $("#btnContact").show();
                if (!$("#btnInquire").hasClass('collapsed')) {
                    $("#btnInquire").click();
                }

            } else {
                $("#whAddressDetail").show();
                $("#btnInquire").show();
                $("#btnContact").hide();
            }
        });
        i++;
    }
}

$(function () {

    $('#area').val('');
    $('#sDate').val('');
    $('#eDate').val('');

    var swalError = (text) => Swal.fire({
        icon: 'error',
        title: 'Fail',
        text: text
    });

    $('#btn').click(function () {
        let warehouseID = $('#whID').text();
        let price = parseFloat($('#whPrice').text());
        let useableArea = parseInt($('#whUseableArea').text());
        let wantArea = parseInt($('#area').val());
        let startDate = $('#startDate').text();
        let endDate = $('#endDate').text();

        //창고 사용 기간 계산
        var startDateType = new Date(startDate);
        var endDateType = new Date(endDate);
        var periodSec = endDateType.getTime() - startDateType.getTime();
        var periodDay = periodSec / (1000*60*60*24) + 1;

        if (!useableArea)
            swalError('Please select the warehouse.');
        else if (!wantArea)
            swalError('Please enter the area.');
        else if (useableArea < wantArea)
            swalError('Please enter the area smaller than usable area.');
        else if (!startDate)
            swalError('Please enter the start date.');
        else if (!endDate)
            swalError('Please enter the end date.');
        else {
            $.ajax({
                url: '/Buyer/FindWH/Inquire',
                dataType: 'json',
                type: 'POST',
                data: {
                    warehouseID: warehouseID,
                    area: wantArea,
                    startDate: startDate,
                    endDate: endDate,
                    amount: periodDay * wantArea * price
                },
                success: function (data) {
                    if (data === true) {
                        Swal.fire({
                            title: 'Submitted',
                            icon: 'success'
                        }).then(() => location.href = "/Buyer/RequestStatus");
                    } else {
                        swalError()
                        Swal.fire({
                            title: 'Error',
                            text: 'An error has occurred.',
                            icon: 'error'
                        });
                    }
                }
            });
        }
    });
    $("#btnInquire").hide();
    $("#btnContact").hide();

    let dp1 = $("#datetimepicker1");
    let dp2 = $("#datetimepicker2");

    dp1.datetimepicker({
        date: '',
        minDate: today,
        format: 'L'
    });
    dp2.datetimepicker({
        date: '',
        format: 'L',
        useCurrent: false
    });
    dp1.on("change.datetimepicker", function (e) {
        dp2.datetimepicker('minDate', e.date);
        var sdate = $('#sDate').val();
        var newdate = sdate.substring(6, 10) + '-' + sdate.substring(0, 2) + '-' + sdate.substring(3, 5);
        $('#startDate').text(newdate);
    });
    dp2.on("change.datetimepicker", function (e) {
        dp1.datetimepicker('maxDate', e.date);
        var edate = $('#eDate').val();
        var newdate = edate.substring(6, 10) + '-' + edate.substring(0, 2) + '-' + edate.substring(3, 5);
        $('#endDate').text(newdate);
    });
});
