var DataOverlay = require('./dataOverlay.js');
var FogOverlay = require('./fogOverlay.js');
var TmpOverlay = require('./tmpOverlay.js');
var ReactDOM = require('react-dom');
var textures = require("textures");

var thickRh = textures.circles().radius(2).fill("transparent").strokeWidth(1).stroke("#FF9510").size(5);
var normRh = textures.circles().radius(2).fill("transparent").strokeWidth(1).stroke("#FF9510").size(8);
var thinRh = textures.circles().radius(2).fill("transparent").strokeWidth(1).stroke("#FF9510").size(11);

var thickTmp = textures.lines().orientation("3/8", "7/8").strokeWidth(1).stroke("#FF0031").size(8);
var normTmp = textures.lines().orientation("3/8", "7/8").strokeWidth(1).stroke("#FF0031").size(15);
var thinTmp = textures.lines().orientation("3/8", "7/8").strokeWidth(1).stroke("#FF0031").size(20);

var thickFog = textures.lines().strokeWidth(1).size(5).stroke("#8948E5");
var normFog = textures.lines().strokeWidth(1).size(10).stroke("#8948E5");
var thinFog = textures.lines().strokeWidth(1).size(15).stroke("#8948E5");

var droneSocket = null;

var MapHeader = React.createClass({

    render: function() {
        return (
            <div className='row text-center mapHeader'>
                <div className='span2 text-left' id="droneTitle">
                    <h4>DRONE DATA</h4>
                </div>
                <div className='span2 text-right' id="tmpTitle">
                    <label id="tempBtnLbl" htmlFor="tempBtn">TEMPERATURE</label>
                    <button id="tempBtn" type="button" onClick={this.props.toggleTemp}>
                        <span className="fa fa-plus" aria-hidden="true"></span>
                    </button>
                </div>
                <div className='span2 text-right' id="hmdTitle">
                    <label id="hmdBtnLbl" htmlFor="hmdBtn">HUMIDITY</label>
                    <button id="hmdBtn" type="button" onClick={this.props.toggleHumid}>
                        <span className="fa fa-circle-o" aria-hidden="true"></span>
                    </button>
                </div>
            </div>
        );
    }
});

var MapDiv = React.createClass({

    getInitialState: function() {
        var textureArrayRh = {};
        textureArrayRh[80] = thickRh;
        textureArrayRh[60] = normRh;
        textureArrayRh[40] = thinRh;

        var thickTmpHack = textures.circles().radius(2).fill("transparent").strokeWidth(1).stroke("#FF0031").size(5);
        var normTmpHack = textures.circles().radius(2).fill("transparent").strokeWidth(1).stroke("#FF0031").size(8);
        var thinTmpHack = textures.circles().radius(2).fill("transparent").strokeWidth(1).stroke("#FF0031").size(11);
        var textureArrayTmp = {};
        textureArrayTmp[15] = thickTmpHack;
        textureArrayTmp[10] = normTmpHack;
        textureArrayTmp[5] = thinTmpHack;

        var thickFogHack = textures.circles().radius(2).fill("transparent").strokeWidth(1).stroke("#8948E5").size(5);
        var normFogHack = textures.circles().radius(2).fill("transparent").strokeWidth(1).stroke("#8948E5").size(8);
        var thinFogHack = textures.circles().radius(2).fill("transparent").strokeWidth(1).stroke("#8948E5").size(11);
        var fogPatterns = {};
        fogPatterns[80] = thickFogHack;
        fogPatterns[60] = normFogHack;
        fogPatterns[40] = thinFogHack;

        return {
            tmp: false,
            rh: true,
            tmpThreshold:[0, 10, 20],
            rhThreshold: [0, 25, 50, 75, 100],
            fogThreshold: [50, 75, 100],

            fogPatterns: fogPatterns,
            tmpPatterns: textureArrayTmp,
            rhPatterns: textureArrayRh,

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
            stop = !this.state.tmp;
        }
        var dataTypeString = (this.state.tmp ? "tmp" : "") + (this.state.rh ? "rh" : "");
        droneSocket.send(JSON.stringify({"dataType": [dataType], "stop": stop}));
        if (stop) {
            var that = this;
            if (dataType == "tmp") {
                setTimeout(function(){that.setState({tmpData: []})}, 1000);
            } else if (dataType == "rh") {
                setTimeout(function(){that.setState({rhData: []})}, 1000);
            }
        }
    },

    componentDidMount: function() {

        this.startSocket();

        // Build Legends
        var svg = d3.select('#tmpLegend svg');
        var tmpX = d3.scale.linear()
          .domain([0, 20])
          .range([0, 280]);
        this.buildLegend(this.state.tmpPatterns, svg, tmpX);

        var svg2 = d3.select('#rhLegend svg');
        var rhX = d3.scale.linear()
          .domain([0, 100])
          .range([0, 280]);
        this.buildLegend(this.state.rhPatterns, svg2, rhX);

        var svg3 = d3.select('#fogLegend svg');
        var fogX = d3.scale.linear()
          .domain([0, 100])
          .range([0, 280]);
        this.buildLegend(this.state.fogPatterns, svg3, fogX);
    },

    startSocket: function() {

        // Open WebSocket to Data Service
        droneSocket = new WebSocket("ws://192.168.99.102:8081/socket");
        // droneSocket = new WebSocket("ws://localhost:8081/socket");
        // droneSocket = new WebSocket("ws://drone.container-solutions.com/socket");

        droneSocket.onopen = function (event) {

            // var bounds = this.map.getBounds();
            var maxLat = 47.482475; //bounds.getNorthEast().lat();
            var maxLon = 8.710754; //bounds.getNorthEast().lng();
            var minLat = 47.27324; //bounds.getSouthWest().lat();
            var minLon = 8.401764; //bounds.getSouthWest().lng();
            droneSocket.send(JSON.stringify({"dataType": ["rh"], "altitude": 1700, "dateTime":  "19_12", "minLat": minLat, "maxLat": maxLat, "minLon": minLon, "maxLon": maxLon }));
        }

        droneSocket.onmessage = function(event) {
            if (JSON.parse(event.data) === null) {
                console.log('Empty message received: ' + event.data);
                return;
            }
            if (JSON.parse(event.data)[0].type === "tmp") {                
                this.setState({tmpData: event.data});
            } else if (JSON.parse(event.data)[0].type === "rh") {
                this.setState({rhData: event.data});
            } else if (JSON.parse(event.data)[0].type === "fog") {
                this.setState({fogData: event.data});
            } else {
                console.log("Unknown data: " + JSON.parse(event.data));
            }
        }.bind(this);

        droneSocket.onclose = function() {
            var recurse = this.startSocket
            setTimeout(recurse, 5000);
        }.bind(this);
    },


    buildLegend: function(patterns, el, x) {
        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickSize(13)
          .tickFormat(d3.format(".0f"));

        var svg = el;
        var key = svg.append("g")
          .attr("class", "key");

        key.append("rect")
          .attr("x", -10)
          .attr("y", -10)
          .attr("width", 100)
          .attr("height", 40)
          .style("fill-opacity", 0.0);

        for (var k in patterns) {
            key.call(patterns[k]);
        }

        var count = 0;
        key.selectAll(".band")
          .data(d3.pairs(x.ticks(4)))
        .enter().append("rect")
          .attr("class", "band")
          .attr("height", 13)
          .attr("x", function(d) {
            return x(d[0]); })
          .attr("width", function(d) {
            return x(d[1]) - x(d[0]); })
          .style("fill", function(d) {
            var p = patterns[d[0]];
            if (!p) {
                return "none";
            } else {
                return p.url();
            }
        });

        key.call(xAxis);
    },

    sliderChange: function(e) {
        this.setState({time: e.target.value});
        // TODO convert slider val to Date Time
        var hour = parseInt(e.target.value) + 11;
        var dateTime = "19_" + hour;
        droneSocket.send(JSON.stringify({"dataType": ["fog"], "altitude": 1700, "dateTime":  dateTime }));
    },

    render: function() {
        return (
            <div id='map' className="row">
                <div className="span6" id="leftDiv">
                    <div className="row">
                        <MapHeader toggleHumid={this.sendSocketData.bind(this, 'rh')} toggleTemp={this.sendSocketData.bind(this, 'tmp')}/>
                    </div>
                    <div className='row'>
                        <WeatherMap tmpData={this.state.tmpData} rhData={this.state.rhData}/>
                    </div>
                    <div className="row" id="tmpLegendRow">
                        <div className="span6 legend" id='tmpLegend'>
                            <label id="tmpLabel" htmlFor="tmpSvg">TEMPERATURE</label>
                            <svg id="tmpSvg"></svg>
                        </div>
                    </div>
                    <div className="row">
                        <div className="span6 legend" id='rhLegend'>
                            <label id="rhLabel" htmlFor="rhSvg">HUMIDITY</label>
                            <svg id="rhSvg"></svg>
                        </div>
                    </div>
                </div>
                <div className="span6" id="rightDiv">
                    <div className='row text-right'>
                        <div className='span4 text-left'>
                            <h4>WEATHER PREDICTION - FOG</h4>
                        </div>
                        <div className='span2' id="fogTitle">
                            <label id="fogBtnLbl" htmlFor="fogBtn">FOG</label>
                            <button id="fogBtn" type="button" onClick={this.props.toggleTemp}>
                                <span aria-hidden="true">/</span>
                            </button>
                        </div>
                    </div>
                    <div className='row'>
                        <PredictionMap fogData={this.state.fogData} time={this.state.time}/>
                    </div>
                    <PredMapSlider onChange={this.sliderChange} val={this.state.time}/>
                    <div id='fogLegend' className="legend">
                       <label id="fogLabel" htmlFor="fogSvg">FOG</label>
                       <svg id="fogSvg"></svg>
                    </div>
                    <WeatherInfo />
                </div>
            </div>
        );
    }
});

var PredMapSlider = React.createClass({

    getDefaultProps: function () {
        return {
            minVal: '1',
            maxVal: '12',
            val: '1',
            sliderLabel: "12:00 - 15:00 - 18:00 - 21:00 - 00:00"
        };
    },

    componentDidMount: function() {

    },

    render: function() {
        return (
            <div id="sliderDiv" className="span6 sliderDiv">
                <label className="form-label" htmlFor="sliderTime">12:00</label>
                <label className="form-label" htmlFor="sliderTime">13:00</label>
                <label className="form-label" htmlFor="sliderTime">14:00</label>
                <label className="form-label" htmlFor="sliderTime">15:00</label>
                <label className="form-label" htmlFor="sliderTime">16:00</label>
                <input type="range" className="sliderTime" id="sliderTime" min={this.props.minVal} max={this.props.maxVal} step="1" onChange={this.props.onChange} value={this.props.val} list="timeList"/>
                <datalist id="timeList">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                    <option>7</option>
                    <option>8</option>
                    <option>9</option>
                    <option>10</option>
                    <option>11</option>
                    <option>12</option>
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
        };
    },

    sendMapData: function() {
        if (this.state.map === null) {
            return;
        }
        var bounds = this.state.map.getBounds();
        var maxLat = bounds.getNorthEast().lat();
        var maxLon = bounds.getNorthEast().lng();
        var minLat = bounds.getSouthWest().lat();
        var minLon = bounds.getSouthWest().lng();
        droneSocket.send(JSON.stringify({"minLat": minLat, "maxLat": maxLat, "minLon": minLon, "maxLon": maxLon }));
    },

    componentDidMount: function () {
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

        this.setState({map: map});
        google.maps.event.addListenerOnce(map, 'bounds_changed', this.sendMapData);
        map.addListener('dragend', this.sendMapData);
    },

    mapCenterLatLng: function () {
        var props = this.props;
        return new google.maps.LatLng(props.mapCenterLat, props.mapCenterLng);
    },

    componentDidUpdate: function () {
        var map = this.state.map;
        map.panTo(this.mapCenterLatLng());
    },

    render: function () {
        var style = {
            width: '450px',
            height: '450px',
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
            tmpThreshold:[0, 10, 20],
            rhThreshold: [0, 25, 50, 75, 100],
            tmpColors: ["#FFE5EA", "#FF0031"],
            rhColors: ["#FFF4E7", "#FF9510"],
        };
    },

    componentDidMount: function () {

        var el = ReactDOM.findDOMNode(this);
        var map = this.props.map;
        
        var textureArrayRh = {};
        textureArrayRh[70] = thickRh;
        textureArrayRh[60] = normRh;
        textureArrayRh[55] = thinRh;

        var textureArrayTmp = {};
        textureArrayTmp[11] = thickTmp;
        textureArrayTmp[10] = normTmp;
        textureArrayTmp[8] = thinTmp;

        tmpOverlay = new TmpOverlay([], el, textureArrayTmp);
        rhOverlay = new DataOverlay([], el, textureArrayRh); 
        if (map) {
            tmpOverlay.setMap(map);
        }
    },

    componentDidUpdate: function () {

        if (tmpOverlay.getMap() == null) {
            tmpOverlay.setMap(this.props.map);
        }
        if (rhOverlay.getMap() == null) {
            rhOverlay.setMap(this.props.map);
        }

        tmpOverlay.setData(this.props.tmpData);
        rhOverlay.setData(this.props.rhData);

    },

    componentWillReceiveProps: function (nextProps) {
        if (tmpOverlay.getMap() == null) {
            tmpOverlay.setMap(nextProps.map);
        }
        if (rhOverlay.getMap() == null) {
            rhOverlay.setMap(nextProps.map);
        }
    },

    render: function () {
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
        };
    },

    sendMapData: function() {
        if (this.state.map === null) {
            return;
        }
        var bounds = this.state.predMap.getBounds();
        var maxLat = bounds.getNorthEast().lat();
        var maxLon = bounds.getNorthEast().lng();
        var minLat = bounds.getSouthWest().lat();
        var minLon = bounds.getSouthWest().lng();
        droneSocket.send(JSON.stringify({"dataType": ["fog"], "altitude": 1700, "dateTime":  "19_12", "minLat": minLat, "maxLat": maxLat, "minLon": minLon, "maxLon": maxLon }));
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

        // Adding route
        var startLabel = new MapLabel({
          text: 'START',
          position: new google.maps.LatLng(this.props.startLat, this.props.startLng),
          map: predMap,
          fontSize: 12,
          align: 'center',
          strokeWeight: 15,
          strokeColor: '#06FFBC'
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
          fontSize: 12,
          align: 'center',
          strokeWeight: 15,
          strokeColor: '#06FFBC'
        });
        endLabel.set('position', new google.maps.LatLng(this.props.endLat, this.props.endLng));
        var endMarker = new google.maps.Marker();
        endMarker.bindTo('map', endLabel);
        endMarker.bindTo('position', endLabel);
        endMarker.setDraggable(false);

        // Move
        var ballIcon = {
            path: 'M 0, 0 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
            fillColor: '#34eaff',
            fillOpacity: 1.0,
            scale: 1,
            strokeColor: 'black',
            strokeWeight: 2
        };

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(this.props.startLat, this.props.startLng),
            icon: ballIcon,
            map: predMap
        });

        this.setState({marker: marker});

        // Destination Service
        var directtionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer({
            polylineOptions: {
                strokeColor: "#34eaff"
            }
        });
        directionsDisplay.setMap(predMap);
        var request = {
            origin: new google.maps.LatLng(this.props.startLat, this.props.startLng),
            destination: new google.maps.LatLng(this.props.endLat, this.props.endLng),
            travelMode: google.maps.TravelMode.DRIVING
        };
        directtionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(result);
                var positions = []
                var steps = result.routes[0].legs[0].steps
                for (i = 0; i < steps.length; i++) {
                    positions[i] = steps[i].start_location;
                }
                this.setState({steps: positions});
            } else {
                console.log('Error with directions: ' + status);
            }
        }.bind(this));

    },

    mapCenterLatLng: function () {
        var props = this.props;
        return new google.maps.LatLng(props.mapCenterLat, props.mapCenterLng);
    },

    componentDidUpdate: function () {
        var map = this.state.predMap;
        map.panTo(this.mapCenterLatLng());

        // TODO - hack - fix this
        var stepIx = 0;
        switch(this.props.time) {
            case "1":
                stepIx = 1;
                break;
            case "2":
                stepIx = 4;
                break;
            case "3":
                stepIx = 6;
                break;
            case "4":
                stepIx = 8;
                break;
            case "5":
                stepIx = 8;
                break;
            case "6":
                stepIx = 9;
                break;
            case "7":
                stepIx = 10;
                break;
            case "8":
                stepIx = 11;
                break;
            case "9":
                stepIx = 12;
                break;
            case "10":
                stepIx = 14;
                break;
            case "11":
                stepIx = 18;
                break;
            case "12":
                stepIx = 21;
                break;
            default:
                stepIx = 0;
        }
        if (this.state.steps && this.state.steps.length > 0 && this.props.time) {
            this.state.marker.setPosition(this.state.steps[stepIx]);
        }

    },

    render: function () {
        var style = {
            width: '450px',
            height: '450px',
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
        var fogPatterns = [];
        fogPatterns[60] = thickFog;
        fogPatterns[55] = normFog;
        fogPatterns[52] = thinFog;
        return {
            fogPatterns: fogPatterns
        };
    },

    componentDidMount: function () {

        var el = ReactDOM.findDOMNode(this);
        var map = this.props.predMap;

        fogOverlay = new FogOverlay([], el, this.state.fogPatterns);

    },

    componentDidUpdate: function () {
        if (this.props.fogData.length > 0) {
            fogOverlay.setData(this.props.fogData);
        }
    },

    componentWillReceiveProps: function (nextProps) {
        if (fogOverlay.getMap() == null) {
            fogOverlay.setMap(nextProps.predMap);
        }
        fogOverlay.draw();
    },

    render: function () {
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
            temp: '9°C',
            humidity: '64%',
            wind: '17.0 KM/H',
            rainfall: '5.2 MM',
            sunshune: '10 mins',
            pressure: '986 HPA'
        };
    },

    render: function () {

        return (
            <div id="weatherInfo" className="panel panel-default weatherInfoDiv">
                <div id="warningDiv" className="row text-center panel-heading">
                    <h5>{this.props.alert}</h5>
                </div>
                <div className="row panel-body">
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
