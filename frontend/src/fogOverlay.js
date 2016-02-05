var google = global.google;
var d3 = require("d3");
var textures = require("textures");


var layer = null;
var thick = textures.lines().thicker().stroke("#8948E5");
var norm = textures.lines().stroke("#8948E5");
var thin = textures.lines().thinner().stroke("#8948E5");

function positionOverlayByDimensions(projectedLatLng) {

    var offsetHeight = this.el.offsetHeight,
        offsetWidth = this.el.offsetWidth;
    this.el.style.top = projectedLatLng.y - offsetHeight + 'px';
    this.el.style.left = projectedLatLng.x - Math.floor(offsetWidth / 2) + 'px';
}

function draw() {
    var projection = this.getProjection(),
      padding = 10;

    var colorFunc = this.color;

    // var thick = textures.lines().thicker();
    // var norm = textures.lines();
    // var thin = textures.lines().thinner();

    var marker = layer.selectAll("svg")
      .data(d3.entries(this.data))
      .each(transform) // update existing markers
    .enter().append("svg:svg")
      .each(transform)
      .attr("class", "marker");

    // Texture Test
    marker.call(thick);
    marker.call(norm);
    marker.call(thin);

    // Add rectangle
    marker.append("svg:rect")
        .attr("width", 15)
        .attr("height", 25);


    function transform(d) {
        d = new google.maps.LatLng(d.value.lat, d.value.lon);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px")
            .style("opacity", 0.6)
            .style("fill", function(d) {
                // console.log("Fill: " + d.value.value);
                // return colorFunc(d.value.value);
                if (d.value.value > 90) {
                    return thick.url();
                } else if (d.value.value > 70) {
                    return norm.url();
                } else if (d.value.value > 50) {
                    return thin.url();
                }
                return "none";
            });
    }
}

function onAdd() {
    console.log('onAdd');
    var panes = this.getPanes();
    layer = d3.select(panes.overlayLayer).append("div")
        .attr("class", "weather-points");
}

function setData(data) {
    this.data = JSON.parse(data);
    this.draw();
}

function FogOverlay(data, node, thresholds, colors) {
    this.el = node;
    this.data = data;
    thresholds = thresholds;

    var interpolateColor = d3.interpolateHcl(colors[0], colors[1]);
    
    var threshold = d3.scale.threshold()
    .domain(thresholds)
    .range(d3.range(thresholds.length + 1));

    this.color = d3.scale.threshold()
        .domain(thresholds)
        .range(d3.range(thresholds.length + 1).map(function(d, i) { return interpolateColor(i / thresholds.length); }));

}

FogOverlay.prototype = Object.create(google.maps.OverlayView.prototype);
FogOverlay.prototype.constructor = FogOverlay;

FogOverlay.prototype.onAdd = onAdd;
FogOverlay.prototype.draw = draw;
FogOverlay.prototype.setData = setData;

module.exports = FogOverlay;