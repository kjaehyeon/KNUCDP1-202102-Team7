$(function () {

    // canvas
    var ctx1 = $('#chart1');
    var ctx2 = $('#chart2');
    var ctx3 = $('#chart3');
    var ctx4 = $('#chart4');

    // 차트 데이터
    var config1 = {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', ''],
            datasets: [{
                label: 'Temperature',
                data: [0, 0, 0, 0, 0, 0, 0],
                fill: false,
                borderColor: 'orange',
                tension: 0.1
            }]
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
                title: {
                    display: true,
                    text: 'Temperature',
                    font: {
                        size: 25
                    }
                },
            },
        }
    };

    var config2 = {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', ''],
            datasets: [{
                label: 'Humidity',
                data: [0, 0, 0, 0, 0, 0, 0],
                fill: false,
                borderColor: 'blue',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Humidity',
                    font: {
                        size: 25
                    }
                },
            },
        }
    };

    var config3 = {
        type: 'pie',
        data: {
            labels: ['fire', 'nofire'],
            datasets: [{
                data: [0, 1],
                backgroundColor: [
                    'rgb(233, 34, 8)',
                    'rgb(36, 155, 30)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Fire',
                    font: {
                        size: 25
                    }
                },
            },
        }
    };

    var config4 = {
        type: 'pie',
        data: {
            labels: ['gas', 'nogas'],
            datasets: [{
                data: [0, 1],
                backgroundColor: [
                    'rgb(233, 34, 8)',
                    'rgb(36, 155, 30)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Gas',
                    font: {
                        size: 25
                    }
                },
            },
        }
    };

    // 차트 생성
    var chart1 = new Chart(ctx1, config1);
    var chart2 = new Chart(ctx2, config2);
    var chart3 = new Chart(ctx3, config3);
    var chart4 = new Chart(ctx4, config4);

    // GraphQL 웹소켓 통신
    var ws = $('#ws').val();
    ws = ws[-1] === '/' ? ws.substring(0, -1) : ws;

    var connection = new WebSocket(`${ws}/graphql`, 'graphql-ws');
    connection.onopen = () => {
        var init = JSON.stringify({type: 'connection_init', payload: {}});
        var listen = JSON.stringify({"id": "1", "type": "start", "payload": {"variables": {}, "extensions": {}, "operationName": null, "query": "subscription {value}"}});
        connection.send(init);
        connection.send(listen);
    }
    connection.onmessage = e => {
        var res = JSON.parse(e.data);
        if (res.type === 'data') { // [temp, humid, fire, gas]
            var newValue = res.payload.data.value;
            var valueArr = newValue.split('#');
            var tempArr = config1.data.datasets[0].data;
            var humidArr = config2.data.datasets[0].data;
            var fireArr = config3.data.datasets[0].data;
            var gasArr = config4.data.datasets[0].data;
            for (var i = 0; i < tempArr.length - 1; i++) {
                tempArr[i] = tempArr[i + 1];
                humidArr[i] = humidArr[i + 1];
            }
            tempArr[tempArr.length - 1] = parseInt(valueArr[0]);
            humidArr[humidArr.length - 1] = parseInt(valueArr[1]);
            var newfire = parseInt(valueArr[2]);
            var newgas = parseInt(valueArr[3]);
            if (newfire == 1) {
                fireArr[0] = 1;
                fireArr[1] = 0;
            } else {
                fireArr[0] = 0;
                fireArr[1] = 1;
            }
            if (newgas == 1) {
                gasArr[0] = 1;
                gasArr[1] = 0;
            } else {
                gasArr[0] = 0;
                gasArr[1] = 1;
            }
            chart1.update();
            chart2.update();
            chart3.update();
            chart4.update();
        }
    }
    connection.onerror = e => {
        console.log(e);
    }

    (function wait() {
        setTimeout(wait, 1000000);
    })();
});
