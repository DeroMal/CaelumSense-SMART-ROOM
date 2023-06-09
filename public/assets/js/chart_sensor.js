// Define chart objects 
var chartTemp, chartHumidity, chartLight;

// Define latest data timestamp 
var latestDataTimeTemp = null;
var latestDataTimeHumidity = null;
var latestDataTimeLight = null;

// Define status elements 
var statusElementTemp = document.getElementById("status");
var statusElementHumidity = document.getElementById("statusH");
var statusElementLight = document.getElementById("statusL");

// Function to update chart data 
function fetchChartData() {
    fetch('/chart-api')
        .then(response => response.json())
        .then(data => {
            //Pick the lates sensor readings
            document.getElementById('tval').textContent = data.temperatureData.temperature[data.temperatureData.temperature.length - 1] + '\u00B0C';
            document.getElementById('hval').textContent = data.humidityData.humidity[data.humidityData.humidity.length - 1] + '%';
            document.getElementById('lval').textContent = data.lightData.light[data.lightData.light.length - 1] + ' LUX';
            document.getElementById('maxVal').textContent = data.MaxData.max_data[data.MaxData.max_data.length - 1] + '     ';

            // Update temperature status and chart data 
            var latestDataTime = moment(data.temperatureData.dateTime[data.temperatureData.dateTime.length - 1], 'MM Do, h:mm a').valueOf();
            if (!latestDataTimeTemp || latestDataTime > latestDataTimeTemp) {
                latestDataTimeTemp = latestDataTime;
                var timeDiff = moment.duration(moment().diff(moment(latestDataTime)));
                var timeDiffString = getTimeDiffString(timeDiff);
                statusElementTemp.textContent = "updated " + timeDiffString;
                updateChartTemp(data.temperatureData);
            }

            // Update humidity status and chart data
            latestDataTime = moment(data.humidityData.dateTime[data.humidityData.dateTime.length - 1], 'MM Do, h:mm a').valueOf();
            if (!latestDataTimeHumidity || latestDataTime > latestDataTimeHumidity) {
                latestDataTimeHumidity = latestDataTime;
                var timeDiff = moment.duration(moment().diff(moment(latestDataTime)));
                var timeDiffString = getTimeDiffString(timeDiff);
                statusElementHumidity.textContent = "updated " + timeDiffString;
                updateChartHumidity(data.humidityData);
            }

            // Update light status and chart data
            latestDataTime = moment(data.lightData.dateTime[data.lightData.dateTime.length - 1], 'MM Do, h:mm a').valueOf();
            if (!latestDataTimeLight || latestDataTime > latestDataTimeLight) {
                latestDataTimeLight = latestDataTime;
                var timeDiff = moment.duration(moment().diff(moment(latestDataTime)));
                var timeDiffString = getTimeDiffString(timeDiff);
                statusElementLight.textContent = "updated " + timeDiffString;
                updateChartLight(data.lightData);
            }
        });
}

// Function to update temperature chart 
function updateChartTemp(data) {
    chartTemp.data.labels = data.dateTime;
    chartTemp.data.datasets[0].data = data.temperature;
    chartTemp.update();
}

// Function to update humidity chart 
function updateChartHumidity(data) {
    chartHumidity.data.labels = data.dateTime;
    chartHumidity.data.datasets[0].data = data.humidity;
    chartHumidity.update();
}

// Function to update light chart 
function updateChartLight(data) {
    chartLight.data.labels = data.dateTime;
    chartLight.data.datasets[0].data = data.light;
    chartLight.update();
}

// Function to get time difference string 
function getTimeDiffString(diff) {
    var timeDiffString = "";
    var days = diff.days();
    var hours = diff.hours();
    var minutes = diff.minutes();
    var seconds = diff.seconds();
    if (days > 0) {
        timeDiffString += days + " day" + (days > 1 ? "s " : " ");
    }
    if (hours > 0) {
        timeDiffString += hours + " hour" + (hours > 1 ? "s " : " " + "");

    }
    if (minutes > 0) {
        timeDiffString += minutes + " minute" + (minutes > 1 ? "s " : " ");
    }
    if (seconds > 0) {
        timeDiffString += seconds + " second" + (seconds > 1 ? "s " : " ");
    }
    if (timeDiffString === "") {
        timeDiffString = "just now";
    } else {
        timeDiffString += "ago";
    }
    return timeDiffString;
}

// Fetch chart data every 3 seconds 

setInterval(fetchChartData, 3000);

// Initialize charts on page load 
//Defining the temperature chart
chartTemp = new Chart(
    document.getElementById("tempChart").getContext("2d"), {
        type: "line",
        data: {
            labels: [], // Empty initially
            datasets: [{
                label: "Temperature",
                data: [], // Empty initially
                backgroundColor: "rgba(255, 255, 255, .8)",
                maxBarThickness: 6
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                y: {
                    grid: {
                        drawBorder: false,
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: false,
                        borderDash: [5, 5],
                        color: 'rgba(255, 255, 255, .2)'
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 500,
                        beginAtZero: true,
                        padding: 10,
                        font: {
                            size: 14,
                            weight: 300,
                            family: "Roboto",
                            style: 'normal',
                            lineHeight: 2
                        },
                        color: "#fff"
                    },
                },
                x: {
                    grid: {
                        drawBorder: false,
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: false,
                        borderDash: [5, 5],
                        color: 'rgba(255, 255, 255, .2)'
                    },
                    ticks: {
                        display: true,
                        color: '#f8f9fa',
                        padding: 10,
                        font: {
                            size: 14,
                            weight: 300,
                            family: "Roboto",
                            style: 'normal',
                            lineHeight: 2
                        },
                    }
                },
            },
        },
    }
);

//Defining the Humidity chart
chartHumidity = new Chart(
    document.getElementById("humidChart").getContext("2d"), {
        type: "line",
        data: {
            labels: [], // Empty initially
            datasets: [{
                label: "Humidity",
                data: [], // Empty initially
                backgroundColor: "rgba(255, 255, 255, .8)",
                maxBarThickness: 6
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                y: {
                    grid: {
                        drawBorder: false,
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: false,
                        borderDash: [5, 5],
                        color: 'rgba(255, 255, 255, .2)'
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 500,
                        beginAtZero: true,
                        padding: 10,
                        font: {
                            size: 14,
                            weight: 300,
                            family: "Roboto",
                            style: 'normal',
                            lineHeight: 2
                        },
                        color: "#fff"
                    },
                },
                x: {
                    grid: {
                        drawBorder: false,
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: false,
                        borderDash: [5, 5],
                        color: 'rgba(255, 255, 255, .2)'
                    },
                    ticks: {
                        display: true,
                        color: '#f8f9fa',
                        padding: 10,
                        font: {
                            size: 14,
                            weight: 300,
                            family: "Roboto",
                            style: 'normal',
                            lineHeight: 2
                        },
                    }
                },
            },
        },
    }
);

//Defining the ligthLevel chart
chartLight = new Chart(
    document.getElementById("lightChart").getContext("2d"), {
        type: "line",
        data: {
            labels: [], // Empty initially
            datasets: [{
                label: "Light Intensity",
                data: [], // Empty initially
                backgroundColor: "rgba(255, 255, 255, .8)",
                maxBarThickness: 6
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                y: {
                    grid: {
                        drawBorder: false,
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: false,
                        borderDash: [5, 5],
                        color: 'rgba(255, 255, 255, .2)'
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 500,
                        beginAtZero: true,
                        padding: 10,
                        font: {
                            size: 14,
                            weight: 300,
                            family: "Roboto",
                            style: 'normal',
                            lineHeight: 2
                        },
                        color: "#fff"
                    },
                },
                x: {
                    grid: {
                        drawBorder: false,
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: false,
                        borderDash: [5, 5],
                        color: 'rgba(255, 255, 255, .2)'
                    },
                    ticks: {
                        display: true,
                        color: '#f8f9fa',
                        padding: 10,
                        font: {
                            size: 14,
                            weight: 300,
                            family: "Roboto",
                            style: 'normal',
                            lineHeight: 2
                        },
                    }
                },
            },
        },
    }
);