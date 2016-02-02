var DataOverlay = require('./dataOverlay.js');
var ReactDOM = require('react-dom');

var map = null;
var droneSocket = null;

var MapHeader = React.createClass({

    // toggleTemp: function(e) {
    //     console.log('toggle temp');
    //     console.log(e);
    //     droneSocket.send("{\"DataType\": \"tmp\", \"Altitude\": 110, \"DateTime\": \"19_12\", \"MinLat\": " + minLat + ", \"MaxLat\": " + maxLat + ", \"MinLon\": " + minLon + ", \"MaxLon\": " + maxLon + "}");
    // },

    // toggleHumid: function(e) {
    //     console.log('toggle humidity');
    //     console.log(e);
    //     droneSocket.send("{\"DataType\": \"hmd\", \"Altitude\": 110, \"DateTime\": \"19_12\", \"MinLat\": " + minLat + ", \"MaxLat\": " + maxLat + ", \"MinLon\": " + minLon + ", \"MaxLon\": " + maxLon + "}");
    // },

    render: function() {
        return (
            <div className='row text-center'>
                <div className='col-md-4'>
                    <h3>Drone Data</h3>
                </div>
                <div className='col-md-4'>
                    <button id="tempBtn" type="button" onClick={this.props.toggleTemp}>Temperature</button>
                </div>
                <div className='col-md-4'>
                    <button id="hmdBtn" type="button" onClick={this.props.toggleHumid}>Humidity</button>
                </div>
            </div>
        );
    }
});

var MapDiv = React.createClass({

    getInitialState: function() {
        return {
            tmp: true,
            rh: false
        };
    },

    sendSocketData: function(dataType) {
        if (dataType == "rh") {
            this.state.rh = !this.state.rh;
        }
        if (dataType == "tmp") {
            this.state.tmp = !this.state.tmp;
        }
        var dataTypeString = (this.state.tmp ? "tmp" : "") + (this.state.rh ? "rh" : "");
        console.log(dataTypeString);
        droneSocket.send(JSON.stringify({"DataType": dataTypeString}));
    },

    render: function() {
        return (
            <div id='map'>
                <MapHeader toggleHumid={this.sendSocketData.bind(this, 'rh')} toggleTemp={this.sendSocketData.bind(this, 'tmp')}/>
                <div className='row'>
                    <WeatherMap />
                </div>
            </div>
        );
    }
});

var WeatherMap = React.createClass({

    getInitialState: function() {
        return {
            map: null,
            message: 'no map yet'
        };
    },
    
    getDefaultProps: function () {
        return {
            initialZoom: 11,
            mapCenterLat: 47.37796,
            mapCenterLng: 8.5562592
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
        droneSocket.send("{\"DataType\": \"tmp\", \"Altitude\": 110, \"DateTime\": \"19_12\", \"MinLat\": " + minLat + ", \"MaxLat\": " + maxLat + ", \"MinLon\": " + minLon + ", \"MaxLon\": " + maxLon + "}");
    },

    componentDidMount: function () {
        const mapContainer = ReactDOM.findDOMNode(this);
        var mapOptions = {
            center: this.mapCenterLatLng(),
            mapTypeId: google.maps.MapTypeId.HYBRID,
            tilt: 45,
            zoom: this.props.initialZoom,
            scrollwheel: false,
            disableDefaultUI: true
        },
        map = new google.maps.Map(mapContainer, mapOptions);
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
        this.setState({map: map, message: "i am a map"});
        google.maps.event.addListenerOnce(map, 'bounds_changed', this.sendMapData);
        map.addListener('dragend', this.sendMapData);

        // this.map.addListener('bounds_changed', function() {
        //     console.log('bounds_changed');
        // });
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
            width: '500px',
            height: '500px',
            margin: '0 auto'
        };
        return (
            <div id='mapDiv' className='map' style={style}>
                <WeatherOverlay map={this.state.map} message={this.state.message}/>
            </div>
        );
    }
});

var WeatherOverlay = React.createClass({
    
    componentDidMount: function () {

        var el = ReactDOM.findDOMNode(this);
        var point = new google.maps.LatLng(45.4665891,8.0826194);
        // Map not ready yet...
        var map = this.props.map;
        // console.log(map);

        droneSocket = new WebSocket("ws://localhost:8081/socket");
        droneSocket.onopen = function (event) {
            console.log('sending data...');

            // droneSocket.send("initiate web socket...");

            // var bounds = this.map.getBounds();
            var maxLat = 0.0; //bounds.getNorthEast().lat();
            var maxLon = 0.0; //bounds.getNorthEast().lng();
            var minLat = 0.0; //bounds.getSouthWest().lat();
            var minLon = 0.0; //bounds.getSouthWest().lng();
            droneSocket.send("{DataType: \"tmp\", Altitude: 110, DateTime: \"19_12\", MinLat: " + minLat + ", MaxLat: " + maxLat + ", MinLon: " + minLon + ", MaxLon: " + maxLon + "}");
        }
        droneSocket.onmessage = function(event) {
            // console.log(JSON.parse(event.data)[0]);
            if (JSON.parse(event.data)[0].type === "tmp") {
                // console.log('set data tmp');
                tmpOverlay.setData(event.data);
            } else {
                // console.log('set data rh');
                rhOverlay.setData(event.data);
            }
        }   

        tmpOverlay = new DataOverlay([], el, [-5, 0, 5, 10, 15, 20, 25], ["#55075A", "#F7DBCA"]);
        rhOverlay = new DataOverlay([], el, [0, 25, 50, 75, 100], ["#f2f0f7", "#54278f"]);
        if (map) {
            tmpOverlay.setMap(map);
            rhOverlay.setMap(map);
        }
    },

    componentDidUpdate: function () {
        console.log('update map');
        console.log(tmpOverlay.getMap());
        if (tmpOverlay.getMap() == null) {
            tmpOverlay.setMap(this.props.map);
        }
        if (rhOverlay.getMap() == null) {
            rhOverlay.setMap(this.props.map);
        }
        if (this.props.map) {
            // var bounds = this.props.map.getBounds();
            // var maxLat = bounds.getNorthEast().lat();
            // var maxLon = bounds.getNorthEast().lng();
            // var minLat = bounds.getSouthWest().lat();
            // var minLon = bounds.getSouthWest().lng();
            // droneSocket.send("{DataType: \"tmp\", Altitude: 110, DateTime: \"19_12\", MinLat: " + minLat + ", MaxLat: " + maxLat + ", MinLon: " + minLon + ", MaxLon: " + maxLon + "}");
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
            <div>
                <div id="tmpOverlay" className="overlay" style={overlayStyle}>
                </div>
                <div id="rhOverlay" className="overlay" style={overlayStyle}>
                </div>
            </div>
        );
    }
});

// function updateMapData() {
//     console.log('updateMapData');
//     var bounds = map.getBounds();
//     var maxLat = bounds.getNothEast().lat();
//     var maxLon = bounds.getNothEast().lng();
//     var minLat = bounds.getSouthWest().lat();
//     var minLon = bounds.getSouthWest().lng();
//     droneSocket.send("{DataType: \"tmp\", Altitude: 110, DateTime: \"19_12\", MinLat: " + minLat + ", MaxLat: " + maxLat + ", MinLon: " + minLon + ", MaxLon: " + maxLon + "}");
// }

ReactDOM.render(
    <MapDiv />,
    document.getElementById('react-hook')
);