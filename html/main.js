//script to show graphs
var URL_JSON = 'http://133.18.232.25/homeawaymonitor/InHomeData.json'

const ctx = document.getElementById('HomeAway').getContext('2d');
const HomeAwayChart = new Chart(ctx, {type: 'line'});

$.getJSON(URL_JSON + '?timestamp=${new Date().getTime()}', (jasondata) => {
    // JSONデータを受信した後に実行する処理
    // Array for data
    var  DatetimeArray = [];
    var  InHomeArray = [];

    //JSONファイルを変換
    for(var i=0; i<jasondata.length; i++){
        DatetimeArray[i] = moment(jasondata[i].DateTime).subtract(9,'h');
        InHomeArray[i] = jasondata[i].InHome;
    }

    HomeAwayChart.data = {
        labels: DatetimeArray,
        datasets: [
            {
                label: 'InHome',
                data: InHomeArray,
                borderColor: "rgba(240,128,128,1)",
                backgroundColor: "rgba(240,128,128,0.5)",
                yAxisID: "yAxis_Tmp",
                fill: 'start'
            },
        ],
    };
    HomeAwayChart.options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            yAxis_Tmp: {
                type: 'category',
                labels: ['Home','Away'],
                position: "left",
                title: {
                    display: true,
                    text: 'In Home',
                }
            },
            x: {
                type: 'time',
                title: {
                    display: true,
                    text: "Time",
                },
                min: moment(DatetimeArray[jasondata.length]).subtract(7,'d'),
                time: {
                    unit: 'day',
                    displayFormats: {
                        day: 'Do ddd',
                        hour: 'HH:00',
                        week: 'MMM Do'
                    },
                },
            }
        }
    };
    HomeAwayChart.update();
});

function time_range_change(){
    if(document.getElementById('time_range')){
        selected_time_range = document.getElementById('time_range').value;
        if(selected_time_range == 'week'){
            time_range_day = 7;
            HomeAwayChart.options.scales.x.time.unit = 'day'
        }else if(selected_time_range == 'day'){
            time_range_day = 1;
            HomeAwayChart.options.scales.x.time.unit = 'hour'
        }else if(selected_time_range == 'one_month'){
            time_range_day = 31;
            HomeAwayChart.options.scales.x.time.unit = 'week'
        }else if(selected_time_range == 'three_month'){
            time_range_day = 93;
            HomeAwayChart.options.scales.x.time.unit = 'week'
        }
    }
    HomeAwayChart.options.scales.x.min = moment().subtract(time_range_day,'d');
    HomeAwayChart.update();
}

