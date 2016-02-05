var DataOverlay = require('./dataOverlay.js');
var FogOverlay = require('./fogOverlay.js');
var ReactDOM = require('react-dom');
// var Slider = require('react-rangeslider');
// var Volume = require('./test.jsx');

// var map = null;
var droneSocket = null;

var MapHeader = React.createClass({

    render: function() {
        return (
            <div className='row text-center'>
                <div className='span2 text-left'>
                    <h4>DRONE DATA</h4>
                </div>
                <div className='span2'>
                    <button id="tempBtn" type="button" onClick={this.props.toggleTemp}>TEMPERATURE</button>
                </div>
                <div className='span2'>
                    <button id="hmdBtn" type="button" onClick={this.props.toggleHumid}>HUMIDITY</button>
                </div>
            </div>
        );
    }
});

var MapDiv = React.createClass({

    getInitialState: function() {
        return {
            tmp: true,
            rh: false,
            // tmpThreshold: [-5, 0, 5, 10, 15, 20, 25],
            tmpThreshold:[0, 10, 20],
            rhThreshold: [0, 25, 50, 75, 100],
            fogThreshold: [50, 75, 100],
            // fogColors: ["#D3F9CB", "#2ca02c"],
            // fogColors: ["#FFFFFF", "#2ca02c"],
            fogColors: ["#F3ECFC", "#8948E5"],
            // tmpColors: ["#F7DBCA", "#55075A"],
            tmpColors: ["#FFE5EA", "#FF0031"],
            // rhColors: ["#f2f0f7", "#54278f"],
            rhColors: ["#FFF4E7", "#FF9510"],
            tmpData: [],
            rhData: [],
            fogData: []
        };
    },

    sendSocketData: function(dataType) {
        var stop = false;
        if (dataType == "rh") {
            this.state.rh = !this.state.rh;
            stop = !this.state.rh;
        }
        if (dataType == "tmp") {
            this.state.tmp = !this.state.tmp;
            stop = !this.state.rh;
        }
        var dataTypeString = (this.state.tmp ? "tmp" : "") + (this.state.rh ? "rh" : "");
        console.log(dataTypeString);
        droneSocket.send(JSON.stringify({"dataType": [dataType], "stop": stop}));
    },

    componentDidMount: function() {

        // Open WebSocket to Data Service
        droneSocket = new WebSocket("ws://localhost:8081/socket");
        droneSocket.onopen = function (event) {
            console.log('sending data...');

            // droneSocket.send("initiate web socket...");

            // var bounds = this.map.getBounds();
            var maxLat = 0.0; //bounds.getNorthEast().lat();
            var maxLon = 0.0; //bounds.getNorthEast().lng();
            var minLat = 0.0; //bounds.getSouthWest().lat();
            var minLon = 0.0; //bounds.getSouthWest().lng();
            droneSocket.send("{DataType: [\"tmp\"], Altitude: 110, DateTime: \"19_12\", MinLat: " + minLat + ", MaxLat: " + maxLat + ", MinLon: " + minLon + ", MaxLon: " + maxLon + "}");
        }

        droneSocket.onmessage = function(event) {
            // console.log(JSON.parse(event.data)[0]);
            // console.log("received data: " + event.data.length);
            if (JSON.parse(event.data)[0].type === "tmp") {
                // console.log(event.data);
                // tmpOverlay.setData(event.data);
                // this.state.tmpData = event.data;
                // this.props.tmpData = event.data;
                // this.setProps({tmpData: event.data});
                // console.log('this.props.tmpData ' + this.props.tmpData);
                
                this.setState({tmpData: event.data});

                // this.refs.wMap.props.tmpData = event.data;
            } else if (JSON.parse(event.data)[0].type === "rh") {
                // rhOverlay.setData(event.data);
                // this.state.rhData = event.data;
                this.setState({rhData: event.data});
                // this.props.rhData = event.data;
                // this.refs.wMap.props.rhData = event.data;
            } else if (JSON.parse(event.data)[0].type === "fog") {
                this.setState({fogData: event.data});
            } else {
                console.log("Unknown data: " + JSON.parse(event.data));
            }
        }.bind(this);

        // Build Legends
        var svg = d3.select('#tmpLegend svg');
        var tmpX = d3.scale.linear()
          .domain([0, 20])
          .range([0, 280]);
        this.buildLegend(this.state.tmpThreshold, this.state.tmpColors, svg, tmpX);

        var svg2 = d3.select('#rhLegend svg');
        var rhX = d3.scale.linear()
          .domain([0, 100])
          .range([0, 280]);
        this.buildLegend(this.state.rhThreshold, this.state.rhColors, svg2, rhX);

        var svg3 = d3.select('#fogLegend svg');
        var fogX = d3.scale.linear()
          .domain([0, 100])
          .range([0, 280]);
        this.buildLegend(this.state.fogThreshold, this.state.fogColors, svg3, fogX);
    },

    // componentWillReceiveProps: function (nextProps) {
    //     console.log('MapDiv - componentWillReceiveProps');
    // },

    buildLegend: function(thresholds, colors, el, x) {
        var interpolateColor = d3.interpolateHcl(colors[0], colors[1]);

        var color = d3.scale.threshold()
          .domain(thresholds)
          .range(d3.range(thresholds.length + 1).map(function(d, i) { return interpolateColor(i / thresholds.length); }));

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickSize(13)
          .tickFormat(d3.format(".0f"));

        var svg = el; //d3.select('#map svg');
        var key = svg.append("g")
          .attr("class", "key");
          // .attr("transform", "translate(" + (width - 300) + "," + (height - 30) + ")");

        key.append("rect")
          .attr("x", -10)
          .attr("y", -10)
          .attr("width", 310)
          .attr("height", 40)
          // .style("fill", "white")
          .style("fill-opacity", 0.0);

        key.selectAll(".band")
          .data(d3.pairs(x.ticks(10)))
        .enter().append("rect")
          .attr("class", "band")
          .attr("height", 13)
          .attr("x", function(d) { return x(d[0]); })
          .attr("width", function(d) { return x(d[1]) - x(d[0]); })
          .style("fill", function(d) { return color(d[0]); });

        key.call(xAxis);
    },

    render: function() {
        return (
            <div id='map' className="row">
                <div className="span6">
                    <div className="row">
                        <MapHeader toggleHumid={this.sendSocketData.bind(this, 'rh')} toggleTemp={this.sendSocketData.bind(this, 'tmp')}/>
                    </div>
                    <div className='row'>
                        <WeatherMap tmpData={this.state.tmpData} rhData={this.state.rhData}/>
                    </div>
                    <div className="row">
                        <div className="span6 legend" id='tmpLegend'>
                            <label htmlFor="tmpSvg">TEMPERATURE</label>
                            <svg id="tmpSvg"></svg>
                        </div>
                    </div>
                    <div className="row">
                        <div className="span6 legend" id='rhLegend'>
                            <label htmlFor="rhSvg">HUMIDITY</label>
                            <svg id="rhSvg"></svg>
                        </div>
                    </div>
                </div>
                <div className="span6">
                    <div className='row text-right'>
                        <div className='span4 text-left'>
                            <h4>WEATHER PREDICTION - FOG</h4>
                        </div>
                        <div className='span2'>
                            <button id="tempBtn" type="button">FOG</button>
                        </div>
                    </div>
                    <div className='row'>
                        <PredictionMap fogData={this.state.fogData}/>
                    </div>
                    <PredMapSlider />
                    <div id='fogLegend' className="legend">
                        <svg></svg>
                    </div>
                    <WeatherInfo />
                </div>
            </div>
        );
    }
});

var PredMapSlider = React.createClass({

    sliderChange: function(data) {
        console.log('Slide changed: ' + data);
    },

    getDefaultProps: function () {
        return {
            minVal: '12',
            maxVal: '23',
            val: '12',
            sliderLabel: "12:00 - 15:00 - 18:00 - 21:00 - 00:00"
        };
    },

    render: function() {
        return (
            <div id="sliderDiv" className="span6 sliderDiv">
                <label className="form-label" htmlFor="sliderTime">{this.props.sliderLabel}</label>
                <input type="range" className="sliderTime" id="sliderTime" min={this.props.minVal} max={this.props.maxVal} step="1" onChange={this.sliderChange} list="timeList"/>
                <datalist id="timeList">
                    <option>12</option>
                    <option>13</option>
                    <option>14</option>
                    <option>15</option>
                    <option>16</option>
                    <option>17</option>
                    <option>18</option>
                    <option>19</option>
                    <option>20</option>
                    <option>21</option>
                    <option>22</option>
                    <option>23</option>
                </datalist>
            </div>
        );
    }
});

var WeatherMap = React.createClass({

    getInitialState: function() {
        return {
            map: null,
            rhData: [],
            tmpData: []
        };
    },
    
    getDefaultProps: function () {
        return {
            initialZoom: 11,
            mapCenterLat: 47.37796,
            mapCenterLng: 8.5562592,
            // mapCenterLat: 46.8765891,
            // mapCenterLng: 8.0826194
        };
    },

    sendMapData: function() {
        console.log('sendMapData');
        if (this.state.map === null) {
            console.log('map is null');
            return;
        }
        var bounds = this.state.map.getBounds();
        var maxLat = bounds.getNorthEast().lat();
        var maxLon = bounds.getNorthEast().lng();
        var minLat = bounds.getSouthWest().lat();
        var minLon = bounds.getSouthWest().lng();
        droneSocket.send("{\"Altitude\": 110, \"DateTime\": \"19_12\", \"MinLat\": " + minLat + ", \"MaxLat\": " + maxLat + ", \"MinLon\": " + minLon + ", \"MaxLon\": " + maxLon + "}");
    },

    componentDidMount: function () {
        // console.log('WeatherMap Mounted: ' + JSON.stringify(this.props) + " State: " + JSON.stringify(this.state));
        var styles = [
          {
            "stylers": [
              { "saturation": -100 },
              { "invert_lightness": true }
            ]
          }
        ];
        const mapContainer = ReactDOM.findDOMNode(this);
        var mapOptions = {
            center: this.mapCenterLatLng(),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            tilt: 45,
            zoom: this.props.initialZoom,
            scrollwheel: false,
            disableDefaultUI: true,
            styles: styles
        },
        map = new google.maps.Map(mapContainer, mapOptions);
        console.log('Map created: ' + map);
        // map.addListener('zoom_changed', updateMapData);
        // map.addListener('dragend', updateMapData);
        // console.log(map);
        // console.log(map.getBounds());
        // var update = this.sendMapData;


        // google.maps.event.addListenerOnce(map, 'bounds_changed', function(update) {
        //     console.log('once');
        //     console.log(update);
        //     update();
        // });
        // map.addListener('dragend', function() {
        //     console.log('updateMapData');
        //     // sendMapData();
        //     // update();
        // });
        this.setState({map: map});
        google.maps.event.addListenerOnce(map, 'bounds_changed', this.sendMapData);
        map.addListener('dragend', this.sendMapData);

        // this.map.addListener('bounds_changed', function() {
        //     console.log('bounds_changed');
        // });
    },

    // componentWillReceiveProps: function (nextProps) {
    //     console.log('componentWillReceiveProps: ' + nextProps);
    //     // this.setState(rhData: )
    // },

    mapCenterLatLng: function () {
        var props = this.props;
        return new google.maps.LatLng(props.mapCenterLat, props.mapCenterLng);
    },

    componentDidUpdate: function () {
        var map = this.state.map;
        map.panTo(this.mapCenterLatLng());
    },

    render: function () {
        // console.log('WeatherMap Tmp Data: ' + this.props.tmpData);
        var style = {
            width: '500px',
            height: '500px',
            margin: '0 auto'
        };
        return (
            <div id='mapDiv' className='map' style={style}>
                <WeatherOverlay {...this.props} map={this.state.map} rhData={this.props.rhData} tmpData={this.props.tmpData}/>
            </div>
        );
    }
});

var WeatherOverlay = React.createClass({
    
    getInitialState: function () {
        return {
            // tmpThreshold: [-5, 0, 5, 10, 15, 20, 25],
            tmpThreshold:[0, 10, 20],
            rhThreshold: [0, 25, 50, 75, 100],
            // tmpColors: ["#F7DBCA", "#55075A"],
            tmpColors: ["#FFE5EA", "#FF0031"],
            // rhColors: ["#f2f0f7", "#54278f"]
            rhColors: ["#FFF4E7", "#FF9510"],
            // rhData: [],
            // tmpData: []
            // map: null
        };
    },

    componentDidMount: function () {
        // console.log('WeatherOverlay Mounted: ' + JSON.stringify(this.props) + " State: " + JSON.stringify(this.state));

        var el = ReactDOM.findDOMNode(this);
        // var point = new google.maps.LatLng(45.4665891,8.0826194);
        // Map not ready yet...
        var map = this.props.map;
        // console.log(map);

        // droneSocket = new WebSocket("ws://localhost:8081/socket");
        // droneSocket.onopen = function (event) {
        //     console.log('sending data...');

        //     // droneSocket.send("initiate web socket...");

        //     // var bounds = this.map.getBounds();
        //     var maxLat = 0.0; //bounds.getNorthEast().lat();
        //     var maxLon = 0.0; //bounds.getNorthEast().lng();
        //     var minLat = 0.0; //bounds.getSouthWest().lat();
        //     var minLon = 0.0; //bounds.getSouthWest().lng();
        //     droneSocket.send("{DataType: \"tmp\", Altitude: 110, DateTime: \"19_12\", MinLat: " + minLat + ", MaxLat: " + maxLat + ", MinLon: " + minLon + ", MaxLon: " + maxLon + "}");
        // }
        // droneSocket.onmessage = function(event) {
        //     // console.log(JSON.parse(event.data)[0]);
        //     if (JSON.parse(event.data)[0].type === "tmp") {
        //         // console.log('set data tmp');
        //         tmpOverlay.setData(event.data);
        //     } else {
        //         // console.log('set data rh');
        //         rhOverlay.setData(event.data);
        //     }
        // }   

        tmpOverlay = new DataOverlay([], el, this.state.tmpThreshold, this.state.tmpColors);
        rhOverlay = new DataOverlay([], el, this.state.rhThreshold, this.state.rhColors);

        if (map) {
            console.log("setting map for tmp and rh");
            tmpOverlay.setMap(map);
            rhOverlay.setMap(map);
        }
    },

    componentDidUpdate: function () {
        // console.log('update map');

        // console.log(tmpOverlay.getMap());
        if (tmpOverlay.getMap() == null) {
            console.log("setting map for tmp");
            tmpOverlay.setMap(this.props.map);
        }
        if (rhOverlay.getMap() == null) {
            console.log("setting map for rh");
            rhOverlay.setMap(this.props.map);
        }

        if (this.props.tmpData && this.props.tmpData.length > 0) {
            tmpOverlay.setData(this.props.tmpData);
        }
        if (this.props.rhData && this.props.rhData.length > 0) {
            console.log("setting RH data");
            rhOverlay.setData(this.props.rhData);
        }

        // console.log(this.props.tmpData);

        if (this.props.map) {
            // var bounds = this.props.map.getBounds();
            // var maxLat = bounds.getNorthEast().lat();
            // var maxLon = bounds.getNorthEast().lng();
            // var minLat = bounds.getSouthWest().lat();
            // var minLon = bounds.getSouthWest().lng();
            // droneSocket.send("{DataType: \"tmp\", Altitude: 110, DateTime: \"19_12\", MinLat: " + minLat + ", MaxLat: " + maxLat + ", MinLon: " + minLon + ", MaxLon: " + maxLon + "}");
        }
    },

    componentWillReceiveProps: function (nextProps) {
        // console.log('OVERLAY - componentWillReceiveProps');
        // console.log(nextProps);
        if (tmpOverlay.getMap() == null) {
                        console.log("setting map for tmp: " + nextProps.map);
            tmpOverlay.setMap(nextProps.map);
        }
        if (rhOverlay.getMap() == null) {
                        console.log("setting map for rh");

            rhOverlay.setMap(nextProps.map);
        }

        // tmpOverlay.setData(nextProps.tmpData);
        // rhOverlay.setData(nextProps.rhData);
        // rhOverlay.draw();
        // tmpOverlay.draw();
    },

    render: function () {
        // console.log('Overlay state: ' + this.state);
        var overlayStyle = {
            backgroundColor: '#FFF',
            border: '1px solid #000',
            position: 'absolute',
            opacity: 0.1
        };

        return (
            <div id="overlay">
                <div id="tmpOverlay" data={this.state.tmpData} className="overlay" style={overlayStyle}>
                </div>
                <div id="rhOverlay" className="overlay" style={overlayStyle}>
                </div>
            </div>
        );
    }
});


// TODO - Merge / Generesize with WeatherMap
var PredictionMap = React.createClass({

    getInitialState: function() {
        return {
            predMap: null,
            fogData: []
        };
    },
    
    getDefaultProps: function () {
        return {
            initialZoom: 11,
            mapCenterLat: 47.37796,
            mapCenterLng: 8.5562592,
            startLat: 47.29,
            startLng: 8.47,
            endLat: 47.45,
            endLng: 8.65
            // mapCenterLat: 46.8765891,
            // mapCenterLng: 8.0826194
        };
    },

    sendMapData: function() {
        if (this.state.map === null) {
            console.log('map is null');
            return;
        }
        var bounds = this.state.predMap.getBounds();
        var maxLat = bounds.getNorthEast().lat();
        var maxLon = bounds.getNorthEast().lng();
        var minLat = bounds.getSouthWest().lat();
        var minLon = bounds.getSouthWest().lng();
        droneSocket.send("{\"DataType\": [\"fog\"],\"Altitude\": 110, \"DateTime\": \"19_12\", \"MinLat\": " + minLat + ", \"MaxLat\": " + maxLat + ", \"MinLon\": " + minLon + ", \"MaxLon\": " + maxLon + "}");
    },

    componentDidMount: function () {

        const predMapContainer = ReactDOM.findDOMNode(this);
        var styles = [
          {
            "stylers": [
              { "saturation": -100 }
            ]
          }
        ];
        console.log("predMapContainer" + predMapContainer);
        var mapOptions = {
            center: this.mapCenterLatLng(),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            tilt: 45,
            zoom: this.props.initialZoom,
            scrollwheel: false,
            disableDefaultUI: true,
            styles: styles
        },
        predMap = new google.maps.Map(predMapContainer, mapOptions);

        this.setState({predMap: predMap});
        google.maps.event.addListenerOnce(predMap, 'bounds_changed', this.sendMapData);
        predMap.addListener('dragend', this.sendMapData);


        // var marker = new google.maps.Marker({
        //     position: new google.maps.LatLng(this.props.startLat, this.props.startLng),
        //     map: predMap,
        //     label: 'START',
        //     title: 'start'
        // });
        // var marker = new google.maps.Marker({
        //     position: new google.maps.LatLng(this.props.endLat, this.props.endLng),
        //     map: predMap,
        //     label: 'END',
        //     title: 'destination'
        // });

        // Adding route
        var startLabel = new MapLabel({
          text: 'START',
          position: new google.maps.LatLng(this.props.startLat, this.props.startLng),
          map: predMap,
          fontSize: 15,
          align: 'center',
          strokeWeight: 15,
          strokeColor: '#FF0000'
        });
        startLabel.set('position', new google.maps.LatLng(this.props.startLat, this.props.startLng));
        var startMarker = new google.maps.Marker();
        startMarker.bindTo('map', startLabel);
        startMarker.bindTo('position', startLabel);
        startMarker.setDraggable(false);


        var endLabel = new MapLabel({
          text: 'DESTINATION',
          position: new google.maps.LatLng(this.props.endLat, this.props.endLng),
          map: predMap,
          fontSize: 15,
          align: 'center',
          strokeWeight: 15,
          strokeColor: '#FF0000'
        });
        endLabel.set('position', new google.maps.LatLng(this.props.endLat, this.props.endLng));
        var endMarker = new google.maps.Marker();
        endMarker.bindTo('map', endLabel);
        endMarker.bindTo('position', endLabel);
        endMarker.setDraggable(false);

        // Destination Service
        var directtionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(predMap);
        var request = {
            origin: new google.maps.LatLng(this.props.startLat, this.props.startLng),
            destination: new google.maps.LatLng(this.props.endLat, this.props.endLng),
            travelMode: google.maps.TravelMode.DRIVING
        };
        directtionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(result);
                console.log(result);
            } else {
                console.log('Error with directions: ' + status);
            }
        });
        

        /**
            Pull steps from result
                result.routes[0].legs[0].steps

            Make slider based on number of steps

            As slider moves, jump Marker to step
        */
    },

    // componentWillReceiveProps: function (nextProps) {
    //     console.log('componentWillReceiveProps: ' + nextProps);
    //     // this.setState(rhData: )
    // },

    mapCenterLatLng: function () {
        var props = this.props;
        return new google.maps.LatLng(props.mapCenterLat, props.mapCenterLng);
    },

    componentDidUpdate: function () {
        var map = this.state.predMap;
        map.panTo(this.mapCenterLatLng());
    },

    render: function () {
        // console.log('WeatherMap Tmp Data: ' + this.props.tmpData);
        var style = {
            width: '500px',
            height: '500px',
            margin: '0 auto'
        };
        return (
            <div id='predMapDiv' className='predMap' style={style}>
                <PreditionOverlay predMap={this.state.predMap} fogData={this.props.fogData}/>
                <div id='pred-slider'></div>
            </div>
        );
    }
});

// TODO - Merge / Generisize with WeatherOverlay
var PreditionOverlay = React.createClass({
    
    getInitialState: function () {
        return {
            fogThreshold: [50, 75, 100],
            // fogColors: ["#FFFFFF", "#2ca02c"]
            fogColors: ["#F3ECFC", "#8948E5"]
            // fogColors: ["#f2f0f7", "#54278f"]
        };
    },

    componentDidMount: function () {

        var el = ReactDOM.findDOMNode(this);
        var map = this.props.predMap; 
        fogOverlay = new FogOverlay([], el, this.state.fogThreshold, this.state.fogColors);
        // if (map) {
                        // console.log("setting map for fog");

            // fogOverlay.setMap(map);
        // }
    },

    componentDidUpdate: function () {
        // if (fogOverlay.getMap() == null) {
            // console.log('Pred Map: ' + this.props.predMap);
            // fogOverlay.setMap(this.props.predMap);
                        // console.log("setting map for fog");

        // }
        if (this.props.fogData.length > 0) {
            // console.log('SETTING FOG DATA');
            fogOverlay.setData(this.props.fogData);
        }
    },

    componentWillReceiveProps: function (nextProps) {
        if (fogOverlay.getMap() == null) {
            console.log("setting map for fog: " + nextProps.predMap);
            fogOverlay.setMap(nextProps.predMap);
        }
        fogOverlay.draw();
    },

    render: function () {
        // console.log('Overlay state: ' + this.state);
        var overlayStyle = {
            backgroundColor: '#FFF',
            border: '1px solid #000',
            position: 'absolute',
            opacity: 0.1
        };

        return (
            <div id="predictionOverlay">
                <div id="fogOverlay" className="overlay" style={overlayStyle}>
                </div>
            </div>
        );
    }
});

var WeatherInfo = React.createClass({

    getDefaultProps: function() {
        return {
            alert: 'WARNING: HEAVY FOG',
            temp: 11,
            humidity: 47.37796,
            wind: 8.5562592,
            rainfall: 11,
            sunshune: 2,
            pressure: 10
        };
    },

    render: function () {

        return (
            <div id="weatherInfo" className="weatherInfoDiv">
                <div className="row text-center">
                    <h5>{this.props.alert}</h5>
                </div>
                <div className="row">
                    <div className="span3">
                        <ul>
                            <li>TEMPERATURE: {this.props.temp}</li>
                            <li>HUMIDITY: {this.props.humidity}</li>
                            <li>WIND: {this.props.wind}</li>
                        </ul>
                    </div>
                    <div className="span3">
                        <ul>
                            <li>RAINFALL: {this.props.rainfall}</li>
                            <li>SUNSHINE: {this.props.sunshune}</li>
                            <li>PRESSURE: {this.props.pressure}</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <MapDiv />,
    document.getElementById('react-hook')
);
