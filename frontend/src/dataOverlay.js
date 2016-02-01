var google = global.google;
var d3 = require("d3");


var layer = null;
// var thresholds = [7, 8, 9, 10, 11, 12, 13, 14, 15];
// var thresholds = [12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9];
// var thresholds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
// var thresholds = [-5, 0, 5, 10, 15, 20, 25];

// var interpolateColor = d3.interpolateHcl("#58ACFA", "#FF0000");
// var interpolateColor = d3.interpolateHcl("#55075A", "#F7DBCA");

// var threshold = d3.scale.threshold()
//     .domain(thresholds)
//     .range(d3.range(thresholds.length + 1));

// var color = d3.scale.threshold()
//     .domain(thresholds)
//     .range(d3.range(thresholds.length + 1).map(function(d, i) { return interpolateColor(i / thresholds.length); }));

function positionOverlayByDimensions(projectedLatLng) {

    var offsetHeight = this.el.offsetHeight,
        offsetWidth = this.el.offsetWidth;
    this.el.style.top = projectedLatLng.y - offsetHeight + 'px';
    this.el.style.left = projectedLatLng.x - Math.floor(offsetWidth / 2) + 'px';
}

function draw() {
    // var projection = this.getProjection(),
    //     projectedLatLng = projection.fromLatLngToDivPixel(this.point);
    // positionOverlayByDimensions.call(this, projectedLatLng);
    var projection = this.getProjection(),
      padding = 10;

    var colorFunc = this.color;

    var marker = layer.selectAll("svg")
      .data(d3.entries(this.data))
      .each(transform) // update existing markers
    .enter().append("svg:svg")
      .each(transform)
      .attr("class", "marker");

    // Add a circle.
    // marker.append("svg:circle")
    //   .attr("r", 4.5)
    //   .attr("cx", padding)
    //   .attr("cy", padding);

    // Add rectangle
    marker.append("svg:rect")
        .attr("width", 15)
        .attr("height", 25);
        // .attr("x", padding)
        // .attr("y", padding);
    function transform(d) {
        d = new google.maps.LatLng(d.value.lat, d.value.lon);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px")
            .style("opacity", 0.8)
            .style("fill", function(d) {
                return colorFunc(d.value.value);
            });
    }
}

function onAdd() {
    var panes = this.getPanes();
    layer = d3.select(panes.overlayLayer).append("div")
        .attr("class", "weather-points");
    // buildKey();
    // this.map.addListener('zoom_changed', updateMapData);
    // this.map.addListener('dragend', updateMapData);
}

// function updateMapData() {
//     console.log('updateMapData');
//     var bounds = this.map.getBounds();
//     bounds.getNothEast().lat();
//     bounds.getNothEast().lng();
//     bounds.getSouthWest().lat();
//     bounds.getSouthWest().lng();

// }

function setData(data) {
    console.log('set data');
    this.data = JSON.parse(data);
    this.draw();
}

function DataOverlay(data, node, thresholds) {
    console.log('created overlay');
    console.log(thresholds);
    this.el = node;
    this.data = data;
    thresholds = thresholds;

    var interpolateColor = d3.interpolateHcl("#55075A", "#F7DBCA");
    
    var threshold = d3.scale.threshold()
    .domain(thresholds)
    .range(d3.range(thresholds.length + 1));

    this.color = d3.scale.threshold()
        .domain(thresholds)
        .range(d3.range(thresholds.length + 1).map(function(d, i) { return interpolateColor(i / thresholds.length); }));

    // this.el.style.position = 'absolute';
}

DataOverlay.prototype = Object.create(google.maps.OverlayView.prototype);
DataOverlay.prototype.constructor = DataOverlay;

DataOverlay.prototype.onAdd = onAdd;
DataOverlay.prototype.draw = draw;
DataOverlay.prototype.setData = setData;

module.exports = DataOverlay;