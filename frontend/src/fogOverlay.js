var google = global.google;
var d3 = require("d3");

var layer = null;

function positionOverlayByDimensions(projectedLatLng) {

    var offsetHeight = this.el.offsetHeight,
        offsetWidth = this.el.offsetWidth;
    this.el.style.top = projectedLatLng.y - offsetHeight + 'px';
    this.el.style.left = projectedLatLng.x - Math.floor(offsetWidth / 2) + 'px';
}

function draw() {
    var projection = this.getProjection(),
      padding = 10;

    var textures = this.textures;

    if (!layer) {
        return;
    }

    if (this.data.length < 1) {
        layer.selectAll("svg").remove();
        return;
    }

    var marker = layer.selectAll("svg")
      .data(d3.entries(this.data))
      .each(transform) // update existing markers
    .enter().append("svg:svg")
      .each(transform)
      .attr("class", "marker");

    for (var k in textures) {
        marker.call(textures[k]);
    }
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
                var t = null;
                for (var k in textures) {
                    if (d.value.value > k) {
                        t = textures[k];
                    }
                }
                if (t == null) {
                    return "none";
                }
                return t.url();
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

function FogOverlay(data, node, textures) {
    this.el = node;
    this.data = data;
    this.textures = textures;
}

FogOverlay.prototype = Object.create(google.maps.OverlayView.prototype);
FogOverlay.prototype.constructor = FogOverlay;

FogOverlay.prototype.onAdd = onAdd;
FogOverlay.prototype.draw = draw;
FogOverlay.prototype.setData = setData;

module.exports = FogOverlay;