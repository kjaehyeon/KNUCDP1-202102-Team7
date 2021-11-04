$(function () {
    String.prototype.format = function() {
        var formatted = this;
        for( var arg in arguments ) {
            formatted = formatted.replace("{" + arg + "}", arguments[arg]);
        }
        return formatted;
    };
    // chart type => 'Year', 'Month', 'Day' of one
    var type = $('#type');
    var value = $('');
    let defaultDate = new Date();
    

    // canvas
    var ctx1 = $('#chart_temp');
    var ctx2 = $('#chart_humi');
    var ctx3 = $('#chart_co');
    var ctx4 = $('#chart_pro');
    // To-Do : 라즈베리파이에서 초기에 설정 시 
    // IpAdd = "디비에서 가져오기"
    // // request Data
    // const options = {
    //     uri: IpAdd + "/api/stat",
    //     qs:{
    //         type : type,
    //         value1 : value,
    //     }
    // };
    // request(options,function(err,response,body){
    //     //callback
    //     if(!error&&response.statusCode==200)
    //         console.log(body);
    // })
    const body = '{"value":[{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"propane" : 15}]}';
    let returnValue = JSON.parse(body);
    console.log(returnValue);
    let step = 0;
    let temp = new Array();
    let humi = new Array();
    let co = new Array();
    let propane = new Array();
    let labels = new Array();
    for (step = 0; step < returnValue['value'].length; step++) {
        console.log(returnValue['value'][step]['temperature'], returnValue['value'][step]['humidity'], returnValue['value'][step]['co'],returnValue['value'][step]['propane']);
        temp.push(returnValue['value'][step]['temperature']);
        humi.push(returnValue['value'][step]['humidity']);
        co.push(returnValue['value'][step]['co']);
        propane.push(returnValue['value'][step]['propane']);
        labels.push("{0}".format(step+1));
    }
    // 차트 데이터
    var config1 = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature',
                data: temp,
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
            labels: labels,
            datasets: [{
                label: 'Humidity',
                data: humi,
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
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'CO',
                data: co,
                fill: false,
                borderColor: 'green',
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
                    text: 'CO',
                    font: {
                        size: 25
                    }
                },
            },
        }
    };

    var config4 = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Propane',
                data: propane,
                fill: false,
                borderColor: 'purple',
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
                    text: 'Propane',
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
    
    // (function wait() {
    //     setTimeout(wait, 1000000);
    // })();
});
