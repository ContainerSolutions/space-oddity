var google = global.google;

function positionOverlayByDimensions(projectedLatLng) {

    var offsetHeight = this.el.offsetHeight,
        offsetWidth = this.el.offsetWidth;
    this.el.style.top = projectedLatLng.y - offsetHeight + 'px';
    this.el.style.left = projectedLatLng.x - Math.floor(offsetWidth / 2) + 'px';
}

function draw() {
    var projection = this.getProjection(),
        projectedLatLng = projection.fromLatLngToDivPixel(this.point);
    positionOverlayByDimensions.call(this, projectedLatLng);
}

function onAdd() {
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(this.el);   
}

function WeatherOverlay(point, node, map) {    

    this.el = node;
    this.point = point;

    this.el.style.position = 'absolute';
}

WeatherOverlay.prototype = Object.create(google.maps.OverlayView.prototype);
WeatherOverlay.prototype.constructor = WeatherOverlay;

WeatherOverlay.prototype.onAdd = onAdd;
WeatherOverlay.prototype.draw = draw;

module.exports = WeatherOverlay;