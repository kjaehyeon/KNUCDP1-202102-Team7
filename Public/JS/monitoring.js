let chart1 = null;
let graph = 'temperature';
const temperature_array = new Array(10).fill(0);
const temperature_yaxis = [0, 40];
const humidity_array = new Array(10).fill(0);
const humidity_yaxis = [0, 100];
const co_array = new Array(10).fill(0);
const co_yaxis = [0, 10];
const lpg_array = new Array(10).fill(0);
const lpg_yaxis = [0, 1];

const setWeatherInfo = (api_key, latitude, longitude) => {
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

}

const generateRealtimeGraph = () => {
    const ctx1 = $('#chart1')
    chart1 = new Chart(ctx1, {
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
}

const addClickListener = (warehouse_info, status_text) => {
    $('.wd-screen').click(() => {
        window.open(warehouse_info.cctvServer);
    });
    $('.temperature').click(() => {
        chart1.data.datasets[0].data = temperature_array;
        chart1.data.datasets[0].backgroundColor = '#36a2eb';
        chart1.data.datasets[0].borderColor = '#36a2eb';
        chart1.options.scales.y.min = temperature_yaxis[0];
        chart1.options.scales.y.max = temperature_yaxis[1];
        graph = 'temperature';
        if (status_text['locale'] == 'ko') {
            $('.realtime .title span').html('&nbsp;실시간 온도');
        } else{
            $('.realtime .title span').html('&nbsp;Realtime Temperature');
        }
        
        chart1.update();
    })
    $('.humidity').click(() => {
        chart1.data.datasets[0].data = humidity_array;
        chart1.data.datasets[0].backgroundColor = '#8fbe96';
        chart1.data.datasets[0].borderColor = '#8fbe96';
        chart1.options.scales.y.min = humidity_yaxis[0];
        chart1.options.scales.y.max = humidity_yaxis[1];
        graph = 'humidity';
        if (status_text['locale'] == 'ko') {
            $('.realtime .title span').html('&nbsp;실시간 습도');
        } else{
            $('.realtime .title span').html('&nbsp;Realtime Humidity');
        }
        chart1.update();
    })
    $('.co').click(() => {
        chart1.data.datasets[0].data = co_array;
        chart1.data.datasets[0].backgroundColor = '#e04006';
        chart1.data.datasets[0].borderColor = '#e04006';
        chart1.options.scales.y.min = co_yaxis[0];
        chart1.options.scales.y.max = co_yaxis[1];
        graph = 'co';
        if (status_text['locale'] == 'ko') {
            $('.realtime .title span').html('&nbsp;실시간 일산화탄소');
        } else{
            $('.realtime .title span').html('&nbsp;Realtime Co');
        }
        
        chart1.update();
    })
    $('.lpg').click(() => {
        chart1.data.datasets[0].data = lpg_array;
        chart1.data.datasets[0].backgroundColor = '#f29d00';
        chart1.data.datasets[0].borderColor = '#f29d00';
        chart1.options.scales.y.min = lpg_yaxis[0];
        chart1.options.scales.y.max = lpg_yaxis[1];
        if (status_text['locale'] == 'ko') {
            $('.realtime .title span').html('&nbsp;실시간 LPG');
        } else{
            $('.realtime .title span').html('&nbsp;Realtime LPG');
        }
        graph = 'lpg';
        chart1.update();
    })
}

const setSocketConnection = (warehouse_info, status_text) => {
    const socket = io(warehouse_info.iotServer);

    socket.on('connect', () => {
        if (socket.connected) {
            $('.left').click(() => {
                socket.emit('camera_move', { data: 'l' });
            });
            $('.right').click(() => {
                socket.emit('camera_move', { data: 'r' });
            });
            socket.on('response', (sensor) => {
                const sensor_val = JSON.parse(sensor.data);
                const temperature = sensor_val.temperature.toFixed(1);
                const humidity = sensor_val.humidity.toFixed(1);
                const co = sensor_val.co.toFixed(2);
                const lpg = sensor_val.lpg.toFixed(2);

                temperature_array.unshift(temperature);
                temperature_array.pop();
                humidity_array.unshift(humidity);
                humidity_array.pop();
                co_array.unshift(co);
                co_array.pop();
                lpg_array.unshift(lpg);
                lpg_array.pop();

                if (Math.min(...temperature_array) < temperature_yaxis[0]) {
                    temperature_yaxis[0] = Math.min(...temperature_array) - 10;
                }
                if (Math.max(...temperature_array) > temperature_yaxis[1]) {
                    temperature_yaxis[1] = Math.max(...temperature_array) + 10;
                }
                if (Math.min(...humidity_array) < humidity_yaxis[0]) {
                    humididty_yaxis[0] = Math.min(...humidity_array) - 10;
                }
                if (Math.max(...humidity_array) > humidity_yaxis[1]) {
                    humididty_yaxis[1] = Math.max(...humidity_array) + 10;
                }
                if (Math.min(...co_array) < co_yaxis[0]) {
                    co_yaxis[0] = Math.min(...co_array) - 10;
                }
                if (Math.max(...co_array) > co_yaxis[1]) {
                    co_yaxis[1] = Math.max(...co_array) + 10;
                }
                if (Math.min(...lpg_array) < lpg_yaxis[0]) {
                    lpg_yaxis[0] = Math.min(...lpg_array) - 10;
                }
                if (Math.max(...lpg_array) > lpg_yaxis[1]) {
                    lpg_yaxis[1] = Math.max(...lpg_array) + 10;
                }

                switch (graph) {
                    case 'temperature':
                        data = temperature_array;
                        chart1.options.scales.y.min = temperature_yaxis[0];
                        chart1.options.scales.y.max = temperature_yaxis[1];
                        break;
                    case 'humidity':
                        data = humidity_array;
                        chart1.options.scales.y.min = humidity_yaxis[0];
                        chart1.options.scales.y.max = humidity_yaxis[1];
                        break;
                    case 'co':
                        data = co_array;
                        chart1.options.scales.y.min = co_yaxis[0];
                        chart1.options.scales.y.max = co_yaxis[1];
                        break;
                    case 'lpg':
                        data = lpg_array;
                        chart1.options.scales.y.min = lpg_yaxis[0];
                        chart1.options.scales.y.max = lpg_yaxis[1];
                        break;
                }
                chart1.update();

                $('.value')[0].innerHTML = `${temperature}&#8451;`;
                $('.value')[1].innerHTML = `${humidity}%`;
                $('.value')[2].innerHTML = `${co}ppm`;
                $('.value')[3].innerHTML = `${lpg}ppm`;
                $('.value-wrapper')[4].classList.remove('fine', 'bad');
                if (sensor_val.flame == 1) {
                    $('.value-wrapper')[4].classList.add('fine');
                    $('.value')[4].innerHTML = status_text['fine'];
                } else {
                    $('.value-wrapper')[4].classList.add('bad');
                    $('.value')[4].innerHTML = status_text['bad'];
                }
                $('.value-wrapper')[5].classList.remove('fine', 'bad');
                if (sensor_val.vibration === 1) {
                    $('.value-wrapper')[5].classList.add('fine');
                    $('.value')[5].innerHTML = status_text['fine'];
                } else {
                    $('.value-wrapper')[5].classList.add('bad');
                    $('.value')[5].innerHTML = status_text['bad'];
                }
            })
            $(window).on('beforeunload', () => {
                $('.left, .right').off();
                socket.disconnect();
            })
        }
    })
}


const generateWarehouseCapabilityChart = (warehouse_info) => {
    const useableArea = warehouse_info.useableArea;
    const usedArea = warehouse_info.usedArea;

    const counter = {
        id: 'counter',
        beforeDraw(chart, args, options) {
            const { ctx, chartArea: { top, width, height } } = chart;
            ctx.save();

            ctx.font = '600 24px sans-serif';
            ctx.fontWeight = '600';
            ctx.fillStyle = '#2ED47A';
            ctx.textAlign = 'center';
            ctx.fillText(`${((useableArea - usedArea)/useableArea)*100}%`, width / 2, top + (height / 2));
        }
    };
    const ctx2 = $('#chart2');
    new Chart(ctx2, {
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
            responsive: false,
            plugins: {
                legend: {
                    position: 'right',
                    padding: 10
                },
            },  
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
const initMonitoringDashboard = (api_key, warehouse_info, status_text) => {
    setWeatherInfo(api_key, warehouse_info.latitude, warehouse_info.longitude);
    generateRealtimeGraph();
    addClickListener(warehouse_info, status_text);
    setSocketConnection(warehouse_info , status_text);
    generateWarehouseCapabilityChart(warehouse_info);
};