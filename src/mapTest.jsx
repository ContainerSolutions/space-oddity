var WeatherOverlay = require('./weatherOverlay.js');
var ReactDOM = require('react-dom');


var MapHeader = React.createClass({
    render: function() {
        return (
            <div className='row text-center'>
                <div className='col-md-12'>
                    <h3>Weather Map</h3>
                </div>
            </div>
        );
    }
});

var MapDiv = React.createClass({
    render: function() {
        return (
            <div id='map'>
                <MapHeader />
                <MapTest />
            </div>
        );
    }
});

var MapTest = React.createClass({

    getInitialState: function() {
        return {
            map: null,
            message: 'no map yet'
        };
    },
    
    getDefaultProps: function () {
        return {
            initialZoom: 7,
            mapCenterLat: 46.8765891,
            mapCenterLng: 8.0826194
        };
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

        this.setState({map: map, message: "i am a map"});
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
                <OverlayTest map={this.state.map} message={this.state.message}/>
            </div>
        );
    }
});


var OverlayTest = React.createClass({
    
    componentDidMount: function () {

        var el = ReactDOM.findDOMNode(this);
        var point = new google.maps.LatLng(45.4665891,8.0826194);
        var map = this.props.map;
        overlay = new WeatherOverlay(point, el, map);
        if (map) {
            overlay.setMap(map);
        }
    },

    componentDidUpdate: function () {
        overlay.setMap(this.props.map);
    },

    render: function () {

        var overlayStyle = {
            backgroundColor: '#FFF',
            border: '1px solid #000',
            position: 'absolute',
            opacity: 0.6
        };

        var imageStyle = {
            height: '300',
            width: '300'
        };

        return (
            <div id="overlay" className="overlay" style={overlayStyle}>
                <img src="../tempMap.png" style={imageStyle}></img>
            </div>
        );
    }
})

ReactDOM.render(
    <MapDiv />,
    document.getElementById('react-hook')
);


