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
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: daegu,
        mapTypeContorl: false,
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
    const card = document.getElementById("pac-card");
    const input = document.getElementById("pac-input");
    console.log(input.value);
    const biasInputElement = document.getElementById("use-location-bias");
    const strictBoundsInputElement = document.getElementById("use-strict-bounds");
    const options = {
        fields: ["formatted_address", "geometry", "name"],
        strictBounds: false,
        types: ["establishment"],
    };
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);
    const autocomplete = new google.maps.places.Autocomplete(input, options);
    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo("bounds", map);

    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");

    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0, -29),
    });

    autocomplete.addListener("place_changed", () => {
        infowindow.close();
        marker.setVisible(false);

        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        infowindowContent.children["place-name"].textContent = place.name;
        infowindowContent.children["place-address"].textContent = place.formatted_address;
        infowindow.open(map, marker);
    });
    function setupClickListener(id, types) {
        const radioButton = document.getElementById(id);
    
        radioButton.addEventListener("click", () => {
            autocomplete.setTypes(types);
            input.value = "";
        });
    }

    setupClickListener("changetype-all", []);
    setupClickListener("changetype-address", ["address"]);
    setupClickListener("changetype-geocode", ["geocode"]);
    setupClickListener("changetype-cities", ["(cities)"]);
    setupClickListener("changetype-regions", ["(regions)"]);
    biasInputElement.addEventListener("change", () => {
        if (biasInputElement.checked) {
            autocomplete.bindTo("bounds", map);
        } else {
            // User wants to turn off location bias, so three things need to happen:
            // 1. Unbind from map
            // 2. Reset the bounds to whole world
            // 3. Uncheck the strict bounds checkbox UI (which also disables strict bounds)
            autocomplete.unbind("bounds");
            autocomplete.setBounds({ east: 180, west: -180, north: 90, south: -90 });
            strictBoundsInputElement.checked = biasInputElement.checked;
        }
        input.value = "";
    });
    strictBoundsInputElement.addEventListener("change", () => {
        autocomplete.setOptions({
            strictBounds: strictBoundsInputElement.checked,
        });
        if (strictBoundsInputElement.checked) {
            biasInputElement.checked = strictBoundsInputElement.checked;
            autocomplete.bindTo("bounds", map);
        }
        input.value = "";
    });
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
