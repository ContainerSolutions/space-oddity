var jQuery = require('jquery');
var d3 = require("d3");
var nvd3 = require("nvd3");

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

var AltChart = React.createClass({

    getInitialState: function() {
        return {
            data: [],
            lat: 45.4665891
        };
    },

    toggleTemp: function(e) {
        console.log('toggle temp');
        console.log(e);
        droneSocket.send("{\"DataType\": \"tmp\", \"Altitude\": 110, \"DateTime\": \"19_12\", \"MinLat\": " + minLat + ", \"MaxLat\": " + maxLat + ", \"MinLon\": " + minLon + ", \"MaxLon\": " + maxLon + "}");
    },

    render: function() {
        var style = {
            width: '500px',
            height: '300px',
            margin: '0 auto'
        };
        return (
            <div id='AltChartDiv' className='altDiv' style={style}>
                <BarChart data={this.state.data} selection={this.state.lat} />
            </div>
        );
    }
});

function drawLineChart(elementParent, data) {

    var svgWidth = 500,
        svgHeight = 300,
        margin = { top: 10, right: 10, bottom: 10, left: 10},
        chartWidth = svgWidth - margin.left - margin.right,
        chartHeight = svgHeight - margin.top - margin.bottom;

    var x = d3.scale.linear().range([0, chartWidth])
            .domain(d3.extent(data, function (d) { return d.lon; })),
        y = d3.scale.linear().range([chartHeight, 0])
            .domain([0, d3.max(data, function(d) { return d.alt; })]);

    var xAxis = d3.svg.axis().scale(x).orient('bottom')
                    .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
        yAxis = d3.svg.axis().scale(y).orient('left')
                    .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

    var svg = d3.select('body').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    drawPaths(svg, data, x, y);
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
