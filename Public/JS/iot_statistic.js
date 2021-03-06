async function getSensorData(type, IpAdd) {
    String.prototype.format = function() {
        var formatted = this;
        for (var arg in arguments) {
            formatted = formatted.replace("{" + arg + "}", arguments[arg]);
        }
        return formatted;
    };
    let getDate = document.querySelector("#currentDate").value;
    //"http://192.168.22.47:9000"; //μμ μ£Όμ
    let options = undefined;
    if (type == 1) {
        options = {
            uri: IpAdd + "/api/stat/day",
            qs: {
                datetime: getDate,
            }
        };
    } else if (type == 2) {
        options = {
            uri: IpAdd + "/api/stat/month",
            qs: {
                datetime: getDate,
            }
        };
    } else if (type == 3) {
        console.log($(".datepicker").val());
        options = {
            uri: IpAdd + "/api/stat/year",
            qs: {
                datetime: $(".datepicker").val(),
            }
        };
    }
    let returnValue = undefined;
    await $.ajax({
        url: options.uri,
        type: 'GET',
        data: {
            datetime: options.qs.datetime,
        },
        dataType: "json",
        headers: {
            'Content-Type': 'application/json',
        },
    }).done(function(response) {
        returnValue = response;
    }).fail(function(error) {
        console.log(error)
    })
    var ctx1 = $('#chart_temp');
    var ctx2 = $('#chart_humi');
    var ctx3 = $('#chart_co');
    var ctx4 = $('#chart_lpg');
    //const body = '{"value":[{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15},{"temperature" : 32,"humidity" : 31,"co" : 12,"lpg" : 15}]}';
    //let returnValue = JSON.parse(body);
    let step = 0;
    let temp = new Array();
    let humi = new Array();
    let co = new Array();
    let lpg = new Array();
    let labels = new Array();
    let date = undefined;
    if (returnValue.length != 0) {
        // canvas

        for (step = 0; step < returnValue.length; step++) {
            //console.log(returnValue[step]['temperature'], returnValue[step]['humidity'], returnValue[step]['co'], returnValue[step]['lpg']);
            temp.push(returnValue[step]['temperature']);
            humi.push(returnValue[step]['humidity']);
            co.push(returnValue[step]['co']);
            lpg.push(returnValue[step]['lpg']);
            if (type === 1) {
                date = new Date(returnValue[step]['datetime'])
                let hours = ('0' + date.getHours()).slice(-2);
                let minutes = ('0' + date.getMinutes()).slice(-2);
                let timeString = hours + ':' + minutes;
                labels.push("{0}".format(timeString));

            } else if (type === 2) {
                date = new Date(returnValue[step]['datetime'])
                labels.push("{0}".format(date.getDate()));
            } else if (type === 3) {
                date = new Date(returnValue[step]['datetime'])
                labels.push("{0}".format(date.getMonth() + 1));
            }
        }

        const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
        //temp μ΅λ, μ΅μ, νκ· 
        maxTemp = Math.max(...temp).toFixed(2);
        minTemp = Math.min(...temp).toFixed(2);
        document.getElementById("maxTemp").innerHTML = maxTemp + "Β°C";
        document.getElementById("minTemp").innerHTML = minTemp + "Β°C";
        document.getElementById("avgTemp").innerHTML = average(temp).toFixed(2) + "Β°C";
        chartMaxTemp = Math.max(...temp) + 5;
        if (Math.min(...temp) <= 0) {
            chartMinTemp = Math.min(...temp) - 5;
        } else {
            chartMinTemp = 0
        }
        //humi μ΅λ, μ΅μ, νκ· 
        maxHumi = Math.max(...humi).toFixed(2);
        minHumi = Math.min(...humi).toFixed(2);
        document.getElementById("maxHumi").innerHTML = maxHumi + "%";
        document.getElementById("minHumi").innerHTML = minHumi + "%";
        document.getElementById("avgHumi").innerHTML = average(humi).toFixed(2) + "%";
        chartMaxHumi = Math.max(...humi) + 5;
        if (Math.min(...temp) <= 0) {
            chartMinHumi = Math.min(...humi) - 5;
        } else {
            chartMinHumi = 0
        }
        //Co μ΅λ, μ΅μ, νκ· 
        maxCo = Math.round(Math.max(...co));
        minCo = Math.round(Math.min(...co));
        document.getElementById("maxCo").innerHTML = maxCo + "ppm";
        document.getElementById("minCo").innerHTML = minCo + "ppm";
        document.getElementById("avgCo").innerHTML = Math.round(average(co)) + "ppm";
        chartMaxCo = Math.max(...co) + 20;
        if (Math.min(...temp) <= 0) {
            chartMinCo = Math.min(...co) - 20;
        } else {
            chartMinCo = 0
        }
        //lpg μ΅λ, μ΅μ, νκ· 
        maxlpg = Math.round(Math.max(...lpg));
        minlpg = Math.round(Math.min(...lpg));
        document.getElementById("maxlpg").innerHTML = maxlpg + "ppm";
        document.getElementById("minlpg").innerHTML = minlpg + "ppm";
        document.getElementById("avglpg").innerHTML = Math.round(average(lpg)) + "ppm";
        chartMaxlpg = Math.max(...lpg) + 20;
        if (Math.min(...temp) <= 0) {
            chartMinlpg = Math.min(...lpg) - 20;
        } else {
            chartMinlpg = 0
        }
    } else {
        Swal.fire({
            title: 'Not Exists',
            html: `ν΄λΉ λ μ§μλ λ°μ΄ν°κ° μμ΅λλ€<br>`,
            icon: 'error'
        })
        chartMaxTemp = 100;
        chartMinTemp = -50;
        chartMaxHumi = 100;
        chartMinHumi = 0;
        chartMaxCo = 1000;
        chartMinCo = -500;
        chartMaxlpg = 1000;
        chartMinlpg = -500;
    }
    // μ°¨νΈ λ°μ΄ν°
    var config1 = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature',
                data: temp,
                fill: false,
                borderColor: '#36a2eb',
                tension: 0.1,
                //backgroundColor: '#36a2eb',
            }]
        },
        options: {
            scales: {
                y: {
                    min: chartMinTemp,
                    max: chartMaxTemp
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
                borderColor: '#8fbe96',
                tension: 0.1,
                //borderWidth: 1,
                //backgroundColor: '#8fbe96'
            }]
        },
        options: {
            scales: {
                y: {
                    min: chartMinHumi,
                    max: chartMaxHumi
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
                borderColor: '#e04006',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    min: chartMinCo,
                    max: chartMaxCo
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
                label: 'LPG',
                data: lpg,
                fill: false,
                borderColor: '#f29d00',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    min: chartMinlpg,
                    max: chartMaxlpg
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'lpg',
                    font: {
                        size: 25
                    }
                },
            },
        }
    };

    // μ°¨νΈ μμ±
    var chart1 = new Chart(ctx1, config1);
    var chart2 = new Chart(ctx2, config2);
    var chart3 = new Chart(ctx3, config3);
    var chart4 = new Chart(ctx4, config4);

    // (function wait() {
    //     setTimeout(wait, 1000000);
    // })();
    return { charts: [chart1, chart2, chart3, chart4] };

};