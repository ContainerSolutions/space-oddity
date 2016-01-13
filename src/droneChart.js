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
							<span id='data-text'>Temp by Altitude</span> <span className='caret'></span>
						</button>
						<ul onClick={this.props.handleSelect} className='dropdown-menu' aria-labelledby='data-select-button'>
							<li><a href='javascript:void(0)' className='select current-selection' id='temp_506f'>Temp by Altitude</a></li>
							<li><a href='javascript:void(0)' className='select' id='relhum_1'>Humidity By Altitude</a></li>
							<li><a href='javascript:void(0)' className='select' id='wind_speed'>Wind Speed By Altitude</a></li>
							<li><a href='javascript:void(0)' className='select' id='wind_dir'>Wind Direction By Altitude</a></li>
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
		updateLineChart('line-chart', formatData(this.props.selection, this.props.data));
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
			selection: 'temp_506f'
		};
	},
	loadData: function() {
		d3.csv('data/dronesFixed.csv',function(csv){
			this.setState({
				data: csv
			});
		}.bind(this));
	},
	componentDidMount: function() {
		this.loadData();
	},
	handleDataSelect: function(e) {
		var selection = e.target.id;
	    $('#select-text').text(e.target.innerHTML);
	    $('.select').removeClass('current-selection');
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

  	nv.addGraph(function() {
    lineChart = nv.models.lineChart()
      // .margin({left: 100, right: 100})
      .margin({left: 25, right: 25})
      .x(function(d) {return d.x})
      .y(function(d) {return d.y})
      .useInteractiveGuideline(true)
      .showYAxis(true)
      .showXAxis(true)
      .showLegend(true);
    lineChart.xAxis
      .tickFormat(d3.format('.1f'))
      .axisLabel('Altitude (m)')
      .staggerLabels(false);
    lineChart.yAxis
      .axisLabel('Temp (c)')
      .tickFormat(d3.format('.1f'));
    d3.select('#' + elementParent + ' svg')
      .datum(data)
      .call(lineChart);
    nv.utils.windowResize(function() { lineChart.update() });
    return lineChart;
  });

}

function updateLineChart(elementParent, data) {
	console.log('update line chart');
	 d3.select('#' + elementParent + ' svg')
    .datum(data)
    .call(lineChart);
}

function formatData(selection, data) {
	var colors = ['#ff7f00','#984ea3','#4daf4a','#377eb8','#e41a1c'];
	var dataArr = [];
	var dataElement = [];
	for (var j = 0; j <= 100; j++) {
      dataElement.push({
	    'x': data[j]['gps_alt'],
	    'y': data[j][selection]
      });
    }	

	dataArr.push({
		key: 'Drone 1',
		color: colors[0],
		values: dataElement
	});


	return dataArr;
}
