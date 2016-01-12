var lineChart

var ChartHeader = React.createClass({
	render: function() {
		return (
			<div className='row text-center'>
				<div className='col-md-12'>
					<h3>Temp By Altitude</h3>
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
							<span id='data-text'>Avg Temp by Altitude</span> <span className='caret'></span>
						</button>
						<ul onClick={this.props.handleSelect} className='dropdown-menu' aria-labelledby='data-select-button'>
							<li><a href='javascript:void(0)' className='select current-selection' id='gps_alt'>Altitude By Time</a></li>
							 
						</ul>
					</div>
				</div>
			</div>
		);
	}
});

var BarChart = React.createClass({
	componentDidMount: function() {
		drawLineChart('line-chart', formatData(this.props.selection, this.props.data));
	},
	componentDidUpdate: function() {
		updateLineChart();
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
			selection: 'gps_alt'
		};
	},
	loadData: function() {
		d3.csv('data/drones.csv',function(csv){
			this.setState({
				data: csv
			});
		}.bind(this));
	},
	componentDidMount: function() {
		this.loadData();
	},
	handleDataSelect: function() {

	},
	render: function() {
		return (
			<div id='viz'>
				<ChartHeader />
				<DataSelect selection={this.state.selection} handleSelect={this.handleDataSelect} />
				{ this.state.data.length != 0 ? <BarChart data={this.state.data} selection={this.state.selection} /> : null }
			</div>
		);
	}
});

ReactDOM.render(
	<Viz />,
	document.getElementById('react-hook')
);

function drawLineChart(elementParent, data) {
	console.log('draw line chart');

  	nv.addGraph(function() {
    lineChart = nv.models.lineChart()
      .margin({left: 25, right: 25})
      .x(function(d) {return d.x})
      .y(function(d) {return d.y})
      .useInteractiveGuideline(true)
      .showYAxis(true)
      .showXAxis(true);
    lineChart.xAxis
      .tickFormat(function (d) { return data.time[d - 1]; })
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

function updateLineChart() {
	console.log('update line chart');

}

function formatData(selection, data) {
	// Key Values
	var keyTime = d3.nest()
	    .key(function(d){return d.time; });
	var keyedData = keyTime.entries(
	    data.map(function(d) {
	      return d;
	    })
	);

	var dataArr = [];
	for (var i = 0; i <= keyedData.length-1; i++) {
		var dataElement = [];
		var currentValues = keyedData[i].values.sort(function(a,b){ return +a.key - +b.key; });
		for (var j = 0; j <= currentValues.length-1; j++) {
	      dataElement.push({
	        'x': +currentValues[j].key,
	        'y': +currentValues[j].values[0][selection]
	      });
	    }	

		dataArr.push({
			key: +keyedData[i].key,
			values: dataElement
		});
	}

	return dataArr;
}
