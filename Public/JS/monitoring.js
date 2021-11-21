const initMonitoringDashboard = (api_key, warehouse_info) => {
    $('.wd-screen').click(() => {
        window.open(warehouse_info.cctvServer);
    });
    const latitude = warehouse_info.latitude;
    const longitude = warehouse_info.longitude;
    const icon_name = {
        '01d': 'wi-day-sunny',
        '01n': 'wi-night-clear',
        '02d': 'wi-day-cloudy',
        '02n': 'wi-night-cloudy',
        '03d': 'wi-cloud',
        '03n': 'wi-cloud',
        '04d': 'wi-cloudy',
        '04n': 'wi-cloudy',
        '09d': 'wi-day-showers',
        '09n': 'wi-night-showers',
        '10d': 'wi-day-rain',
        '10n': 'wi-night-rain',
        '11d': 'wi-day-thunderstorm',
        '11n': 'wi-night-thunderstorm',
        '13d': 'wi-snowflake-cold',
        '13n': 'wi-snowflake-cold',
        '50d': 'wi-fog',
        '50n': 'wi-fog'
    };
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${api_key}&units=metric`,
        type: 'GET',
        accepts: 'application/json',
        dataType: 'json',
        success: function(data) {
            const {
                weather,
                name,
                main: { temp, humidity },
                wind: { speed },
                clouds: { all: cloud },
                sys: { country }
            } = data;
            const description = weather[0].description;
            const icon = weather[0].icon;

            const element = `<div class='top'>
                                <div class='icon-wrapper'>
                                    <i class='wi ${icon_name[icon]}'></i>
                                </div>
                                <div class='info'>
                                    <div>${Math.round(temp)}&#8451;</div>
                                    <div>${description}</div>
                                    <div>${name}, ${country}</div>
                                </div>
                            </div>
                            <div class='bottom'>
                                <div class='info'>
                                    <i class='wi wi-strong-wind'></i>
                                    <div>${speed}m/s</div>
                                </div>
                                <div class='info'>
                                    <i class='wi wi-humidity'></i>
                                    <div>${humidity}%</div>
                                </div>
                                <div class='info'>
                                    <i class='wi wi-cloud'></i>
                                    <div>${cloud}%</div>
                                </div>
                            </div>`
            $('.weather').append(element);
        },
        error: function(request, status, error) {
            Swal.fire({
                title: 'Error',
                html: `code: ${request.status}<br>message: ${request.responseText}<br>error: ${error}`,
                icon: 'error'
            })
        },
        JSON: true
    })

    let graph = 'temperature';
    const temperature_array = new Array(10).fill(0);
    const humidity_array = new Array(10).fill(0);
    const co_array = new Array(10).fill(0);
    const propane_array = new Array(10).fill(0);

    const ctx1 = $('#chart1')
    const chart1 = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', '', '', '', ''],
            datasets: [{
                data: temperature_array,
                backgroundColor: '#36a2eb',
                borderColor: '#36a2eb',
                borderWidth: 1,
            }],

        },
        options: {
            scales: {
                y: {
                    min: 0,
                    max: 40
                }
            },
            plugins: {
                legend: {
                    display: false
                },
            },
        }
    });


    $('.temperature').click(() => {
        chart1.data.datasets[0].data = temperature_array;
        chart1.data.datasets[0].backgroundColor = '#36a2eb';
        chart1.data.datasets[0].borderColor = '#36a2eb';
        graph = 'temperature';
        $('.realtime .title span').html('&nbsp;Realtime Temperature');
        chart1.update();
    })
    $('.humidity').click(() => {
        chart1.data.datasets[0].data = humidity_array;
        chart1.data.datasets[0].backgroundColor = '#8fbe96';
        chart1.data.datasets[0].borderColor = '#8fbe96';
        graph = 'humidity';
        $('.realtime .title span').html('&nbsp;Realtime Humidity');
        chart1.update();
    })
    $('.co').click(() => {
        chart1.data.datasets[0].data = co_array;
        chart1.data.datasets[0].backgroundColor = '#e04006';
        chart1.data.datasets[0].borderColor = '#e04006';
        graph = 'co';
        $('.realtime .title span').html('&nbsp;Realtime Co');
        chart1.update();
    })
    $('.propane').click(() => {
        chart1.data.datasets[0].data = propane_array;
        chart1.data.datasets[0].backgroundColor = '#f29d00';
        chart1.data.datasets[0].borderColor = '#f29d00';
        $('.realtime .title span').html('&nbsp;Realtime Propane');
        graph = 'propane';
        chart1.update();
    })
    const socket = io(warehouse_info.iotServer);

    socket.on('connect', () => {
        if (socket.connected) {
            $('.left').click(() => {
                socket.emit('my_broadcast_event', { data: 'left' });
            });
            $('.right').click(() => {
                socket.emit('my_broadcast_event', { data: 'right' });
            });
            socket.on('response', (sensor) => {
                let data = chart1.data.datasets[0].data;
                const sensor_val = JSON.parse(sensor.data);
                const temperature = sensor_val.temperature.toFixed(1);
                const humidity = sensor_val.humidity.toFixed(1);
                const co = Math.round(sensor_val.co);
                const propane = Math.round(sensor_val.propane);

                temperature_array.unshift(temperature);
                temperature_array.pop();
                humidity_array.unshift(humidity);
                humidity_array.pop();
                co_array.unshift(co);
                co_array.pop();
                propane_array.unshift(propane);
                propane_array.pop();

                switch (graph) {
                    case 'temperature':
                        data = temperature_array;
                        break;
                    case 'humidity':
                        data = humidity_array;
                        break;
                    case 'co':
                        data = co_array;
                        break;
                    case 'propane':
                        data = propane_array;
                        break;
                }
                chart1.update();

                $('.value')[0].innerHTML = `${temperature}&#8451;`;
                $('.value')[1].innerHTML = `${humidity}%`;
                $('.value')[2].innerHTML = `${co}ppm`;
                $('.value')[3].innerHTML = `${propane}ppm`;
                $('.value-wrapper')[4].classList.remove('fine', 'bad');
                if (sensor_val.flame == 1) {
                    $('.value-wrapper')[4].classList.add('fine');
                    $('.value')[4].innerHTML = 'FINE';
                } else {
                    $('.value-wrapper')[4].classList.add('bad');
                    $('.value')[4].innerHTML = 'BAD';
                }
                $('.value-wrapper')[5].classList.remove('fine', 'bad');
                if (sensor_val.vibration == 1) {
                    $('.value-wrapper')[5].classList.add('fine');
                    $('.value')[5].innerHTML = 'FINE';
                } else {
                    $('.value-wrapper')[5].classList.add('bad');
                    $('.value')[5].innerHTML = 'BAD';
                }
            })
            $(window).on('beforeunload', () => {
                $('.left, .right').off();
                socket.disconnect();
            })
        }
    })
    const useableArea = warehouse_info.useableArea;
    const usedArea = warehouse_info.usedArea;

    const counter = {
        id: 'counter',
        beforeDraw(chart, args, options) {
            const { ctx, chartArea: { top, right, bottom, left, width, height } } = chart;
            ctx.save();

            ctx.font = '600 24px sans-serif';
            ctx.fontWeight = '600';
            ctx.fillStyle = '#2ED47A';
            ctx.textAlign = 'center';
            ctx.fillText(`${((useableArea - usedArea)/useableArea)*100}%`, width / 2, top + (height / 2));
        }
    };
    const ctx2 = $('#chart2');
    const chart2 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Useable', 'Used'],
            datasets: [{
                data: [useableArea, usedArea],
                backgroundColor: [
                    '#2ED47A',
                    '#F7685B',
                ],
                cutout: '70%',
            }],
        },
        options: {
            plugins: {
                legend: {
                    position: 'right'
                },
            },
            aspectRatio: 2,
            yAxes: [{
                gridLines: {
                    display: false,
                    drawBorder: false,
                },
            }],
        },
        plugins: [counter],
    });
};