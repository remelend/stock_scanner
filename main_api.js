//Update main_api
const API_KEY  = "L8RUF6TZTHWE2W11";
let symbol = "";
let time = "";
let grade = "";
let user_input = document.querySelector('#user-input');
let time_input = document.querySelector('#time');
let symbol_input = document.querySelector('#symbol');
let graph_input = document.querySelector('#graph');
let ul = document.querySelector('#items');
let time_series = {"1 day":1, "5 days":5, "1 month":30, "3 months":90};
const url1 = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=';
const url2 = '&outputsize=compact&apikey='+API_KEY;
let final_url = "";

let date_labels = [];
let closed_pts = [];
let stock_name = "";
let today_open = "";
let today_high = "";
let today_low = "";
let today_closed = "";
let yesterday_closed = "";
let color = "";
var data1 = [];
var data2 =[];


window.onload = function(){

    document.getElementById("error-msg").innerHTML = "";
    symbol = "NIO";
    final_url = url1+symbol+url2;
    graph = "line";

    chartIt(final_url, 30);
    time_input.value = "";
    symbol_input.value = "";
    graph_input.value = ""; 
}

/*I did this with a 'submit' listener because
  I eventually want to send info to a server as opposed to 
  running it on a users browsers*/
user_input.addEventListener('submit', onSubmit);

function onSubmit(e){
    e.preventDefault();
    document.getElementById("error-msg").innerHTML = "";
    symbol = symbol_input.value;
    final_url = url1+symbol+url2;
    time = time_series[time_input.value];
    graph = graph_input.value;

    chartIt(final_url, time);
    console.log(graph);
    time_input.value = "";
    symbol_input.value = "";
    graph_input.value = "";
    
    
}



async function getAPI(url, time){
    let iter = 0;
    const response = await fetch(url);
    const data = await response.json();
    data1 = [];
    data2 =[];
    date_labels = [];
    closed_pts =[];
    try{
    stock_name = data["Meta Data"]["2. Symbol"];
    } catch(err){
        document.getElementById("error-msg").innerHTML = "Please insert a valid stock.";
    }
    const dates = data["Time Series (Daily)"];
    for(const day in dates){
        date_labels.unshift(day);
        closed_pts.unshift(dates[day]["4. close"]);
        data1.push({x: new Date(day), y: [Number(dates[day]["1. open"]), Number(dates[day]["2. high"]), Number(dates[day]["3. low"]), Number(dates[day]["4. close"])], color:Number(dates[day]["1. open"]) < Number(dates[day]["4. close"]) ? "green":"red"});
        data2.push({x: new Date(day), y: Number(dates[day]["4. close"])});
        if(iter == 0){

            ul.children[0].textContent = "Name: $" + stock_name;
            ul.children[1].textContent = "Open: $" + dates[day]["1. open"];
            ul.children[2].textContent = "High: $" + dates[day]["2. high"];
            ul.children[3].textContent = "Low: $" + dates[day]["3. low"];
            ul.children[4].textContent = "Closed: $" + dates[day]["4. close"];
        
            today_closed = dates[day]["4. close"];
            }
        if(iter == 1){
            yesterday_closed = dates[day]["4. close"];
            color = today_closed >= yesterday_closed ? "green":"red";
        }
        iter = iter + 1;
        if(iter > time){
            break;
        }
    }  
}


//chartIt();

async function chartIt(url, time){
await getAPI(url, time); 

let div_holder = document.getElementById('holder');
if(graph == "line"){
if(document.getElementById("chartContainer")){
    document.getElementById("chartContainer").remove();
}
let newCanvas ="";
let div = "";
if(document.getElementById('chart_canvas')){
    newCanvas = document.getElementById('chart_canvas');
    newCanvas.remove();
}
if(document.getElementById('container-1')){
    div = document.getElementById('container-1');
    div.remove();
}
div = document.createElement('div');
div.setAttribute("id","container-1");
if(color == 'green'){
    div.classList.add('canvasColorG');
}else{
    div.classList.add('canvasColorR');
}
div_holder.appendChild(div);
newCanvas = document.createElement('CANVAS');
newCanvas.setAttribute("id", "chart_canvas");
div.appendChild(newCanvas);
var ctx = newCanvas.getContext('2d');

var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: date_labels,
        datasets: [{
            label: stock_name,
            lineTension: 0,
            data: closed_pts,
            borderColor: [color],
            borderWidth: 3
        }]
    },
    options: {
  
        response:true,
        maintainAspectRatio:false,
        scales: {
            yAxes: [
            {
            scaleLabel:{
                display:'true',
                labelString:'Price',
                fontColor:'white'
            },
            gridLines: {
                display: true ,
                color: "rgb(88,88,88)"
              },
                ticks: {
                    beginAtZero: false,
                    fontColor: 'rgb(255,255,240)'
                }
            }],
            xAxes: [{
                ticks: {
                    beginAtZero: false,
                    fontColor: 'rgb(255,255,240)'
                }
            }]
        }
    }
});
}
if(graph == 'candlestick'){

    let chartCont = "";
    if(!document.getElementById("chartContainer")){
        chartCont = document.createElement('div');
        chartCont.setAttribute("id","chartContainer");
        div_holder.appendChild(chartCont);
    }

    if(document.getElementById('chart_canvas')){
        newCanvas = document.getElementById('chart_canvas');
        newCanvas.remove();
    }
    if(document.getElementById('container-1')){
        div = document.getElementById('container-1');
        div.remove();
    }

var stockChart = new CanvasJS.StockChart(
    "chartContainer",{
        theme: "dark1",
        title:{
            fontSize:20,
            text:stock_name,
            fontFamily:'Ariel'
          },
          
          
          rangeSelector: {
            enabled: false
        }, 

        exportEnabled: true,
       
        subtitles: [{
        }],
        charts: [{
          axisX: {
            crosshair: {
              enabled: true,
              snapToDataPoint: true,
              labelFormatter: function(e) {
                return ""
              }
            }, 
            lineThickness: 5,
            tickLength: 0,
            labelFormatter: function(e) {
              return "";
            },
          },
          
          axisY: {
            prefix: "$"
          },
          data: [{
            type: "candlestick",
            yValueFormatString: "$#,###.##",
            dataPoints : data1,
            axisYType: "secondary",
            risingColor: "green",
            fallingColor: "red"
          }]
        }],
        navigator: {
          data: [{
            dataPoints: data2
          }],
          slider: {
            minimum: new Date(2018, 04, 01),
            maximum: new Date(2018, 06, 01)
          }
        }
      }
);
    stockChart.render();
}
}