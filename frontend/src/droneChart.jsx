var ReactDOM = require('react-dom');
var jQuery = require('jquery');
var WeatherMap = require('./weatherMap.jsx');
var d3 = require("d3");
var nvd3 = require("nvd3");

var lineChart

var ChartHeader = React.createClass({
	render: function() {
		return (
			<div className='row text-center'>
				<div className='col-md-12'>
					<h3>MeteoDrone Data</h3>
				</div>
			</div>
		);
	}
});

var DataSelect = React.createClass({
	render: function() {
		return (
			<div className='row text-center'>
				<div className='col-md-12'>
					<div id='data-select-dropdown' className='dropdown'>
						<button className='btn btn-default dropdown-toggle' type='button' id='data-select-button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'>
							<span id='data-text'>Temp(°C) by Altitude</span> <span className='caret'></span>
						</button>
						<ul onClick={this.props.handleSelect} className='dropdown-menu' aria-labelledby='data-select-button'>
							<li><a href='javascript:void(0)' className='select current-selection' id='temp_506f-gps_alt'>Temp(°C) by Altitude</a></li>
							<li><a href='javascript:void(0)' className='select' id='relhum_1-gps_alt'>Humidity(%) By Altitude</a></li>
							<li><a href='javascript:void(0)' className='select' id='wind_speed-gps_alt'>Wind Speed(m/s) By Altitude</a></li>
							<li><a href='javascript:void(0)' className='select' id='wind_dir-gps_alt'>Wind Direction(°) By Altitude</a></li>
							<li><a href='javascript:void(0)' className='select' id='temp_506f-time'>Temp(°C) By Time(s)</a></li>
						</ul>
					</div>
				</div>
			</div>
		);
	}
});

var BarChart = React.createClass({
	componentDidMount: function() {
		drawLineChart('line-chart', formatData(this.props.selection, this.props.data, this.props.data2));
	},
	componentDidUpdate: function() {
		updateLineChart('line-chart', formatData(this.props.selection, this.props.data, this.props.data2));
	},
	render: function() {
		return (
			<div id='line-chart'>
				<svg></svg>
			</div>
		);
	}
});

var Viz = React.createClass({
	getInitialState: function() {
		return {
			data: [],
			data2: [],
			selection: 'temp_506f-gps_alt'
		};
	},
	loadData: function() {
		var dataUrl = 'http://localhost:8081/?index=drones*';
		// Mantl URL
		// var dataUrl = 'http://drone-data.drone.container-solutions.com/?index=drones*';

		jQuery.getJSON(dataUrl).then(function(data) {
			var droneData = [];
			for (var i = 0; i < data.length; i++) {
				droneData[i] = data[i];
				var date_time = data[i].date_time.split(" ");
				droneData[i]['time'] = date_time[1];
			}
			// pull out relevant data....
			this.setState({
				data: droneData
			});
		}.bind(this));

	},
	componentDidMount: function() {
		this.loadData();
	},
	handleDataSelect: function(e) {
		var selection = e.target.id;
	    $('#data-text').text(e.target.innerHTML);
	    $('.select').removeClass('current-selection');
	    // TODO FIX
	    $('#' + selection).addClass('current-selection');

	    this.setState({
	      selection: selection
	    });
	},
	render: function() {
		return (
			<div id='viz'>
				<ChartHeader />
				<DataSelect selection={this.state.selection} handleSelect={this.handleDataSelect} />
				{ this.state.data.length != 0 ? <BarChart data={this.state.data} data2={this.state.data2} selection={this.state.selection} /> : null }
			</div>
		);
	}
});

function drawLineChart(elementParent, data) {

  	nv.addGraph(function() {
    lineChart = nv.models.lineChart()
      .margin({left: 40, right: 25})
      .x(function(d) {return d.x})
      .y(function(d) {return d.y})
      .useInteractiveGuideline(true)
      .showYAxis(true)
      .showXAxis(true)
      .showLegend(true);
    lineChart.xAxis
      .tickFormat(d3.format('.1f'))
      .staggerLabels(false);
    lineChart.yAxis
      .tickFormat(d3.format('.1f'));
    d3.select('#' + elementParent + ' svg')
      .datum(data)
      .call(lineChart);
    nv.utils.windowResize(function() { lineChart.update() });
    return lineChart;
  });
}

function updateLineChart(elementParent, data) {
	 d3.select('#' + elementParent + ' svg')
    .datum(data)
    .call(lineChart);
}

function formatData(selection, args) {

	var colors = ['#ff7f00','#984ea3','#4daf4a','#377eb8','#e41a1c'];
	var dataArr = [];
	var initial_time;
	var pieces = selection.split("-");

	for (var k = 1; k < arguments.length; k++) {
		var dataElement = [];
		var data = arguments[k];
		if (!data) {
			console.log("not defined, arg: "+k);
			continue;
		}

		// Group by Time
		var keyTime = d3.nest()
	    	.key(function(d){return d.time; });
	  	var keyedData = keyTime.entries(
	    	data.map(function(d) {
	      		return d;
	    	})
	  	);

		for (var i = 0; i < keyedData.length; i++) {
			var values = keyedData[i]['values']
			var xVal = 0.0;
			var yVal = 0.0;
			for (var j = 0; j < values.length; j++) {
				xVal += Number(values[j][pieces[1]]);
				yVal += Number(values[j][pieces[0]]);
			}
			if (pieces[1] === "time") {
				if (!values[0].time) {
					// TODO Figure out what's going on here
					continue;
				}
				var split = values[0].time.split(":");
				var xValue = Number(split[0])*3600 + Number(split[1])*60 + Number(split[2])
				if (i == 0) {
					initial_time = xValue;
					xValue = 0;
				} else {
					xValue = Number(xValue) - Number(initial_time);
				}
			} else {
				var xValue = xVal / values.length;
			}
			// Check if xValue is decreasing
			// Otherwise results in ugly graphs wrt altitude
			if (i == 0 || xValue >= dataElement[dataElement.length-1]['x']) {
	      		dataElement.push({
	 	    		'x': xValue,
		    		'y': yVal / values.length
	      		});
	      	}
	    }	
		dataArr.push({
			key: 'Drone '+k,
			color: colors[k],
			values: dataElement
		});
	}

	return dataArr;
}
