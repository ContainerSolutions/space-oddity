var google = global.google;
var d3 = require("d3");
// var textures = require("textures");


var layer = null;

function positionOverlayByDimensions(projectedLatLng) {

    var offsetHeight = this.el.offsetHeight,
        offsetWidth = this.el.offsetWidth;
    this.el.style.top = projectedLatLng.y - offsetHeight + 'px';
    this.el.style.left = projectedLatLng.x - Math.floor(offsetWidth / 2) + 'px';
}

function draw() {
    // console.log("~~~~~~~~~~~DRAW: " + this);
    var projection = this.getProjection(),
      padding = 10;

    // Textures testing:
    // var t1 = textures.circles()
    //     .radius(4)
    //     .fill("transparent")
    //     .strokeWidth("2")
    //     .stroke("firebrick")
    //     .complement()
    //     .thinner();

    // var t2 = textures.circles()
    //     .radius(4)
    //     .fill("transparent")
    //     .strokeWidth("2")
    //     .stroke("firebrick")
    //     .complement();

    // var t3 = textures.circles()
    //     .radius(4)
    //     .fill("transparent")
    //     .strokeWidth("2")
    //     .stroke("firebrick")
    //     .complement()
    //     .thicker();

    var colorFunc = this.color;

    // var width = 960,
        // height = 500;

    // var svg = d3.select(this.getPanes().overlayLayer).append("svg")
    //             .attr("width", width)
    //             .attr("height", height);

    var marker = layer.selectAll("svg")
      .data(d3.entries(this.data))
      .each(transform) // update existing markers
    .enter().append("svg:svg")
      .each(transform)
      .attr("class", "marker");

    // console.log('Data: ' + this.data);

    // Add rectangle
    marker.append("svg:rect")
        .attr("width", 15)
        .attr("height", 25);
        // .attr("x", padding)
        // .attr("y", padding);

    // var x = d3.scale.linear()
    //     .domain([0, 4500])
    //     .range([0, 280]);

    // var xAxis = d3.svg.axis()
    //   .scale(x)
    //   .orient("bottom")
    //   .tickSize(13)
    //   .tickFormat(d3.format(".0f"));

    // var key = svg.append("g")
    //     .attr("class", "key")
    //     .attr("transform", "translate(" + (width - 300) + "," + (height - 30) + ")");

    // key.append("rect")
    //     .attr("x", -10)
    //     .attr("y", -10)
    //     .attr("width", 310)
    //     .attr("height", 40)
    //     .style("fill", "white")
    //     .style("fill-opacity", 0.5)

    // key.selectAll(".band")
    //   .data(d3.pairs(x.ticks(10)))
    // .enter().append("rect")
    //   .attr("class", "band")
    //   .attr("height", 8)
    //   .attr("x", function(d) { return x(d[0]); })
    //   .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    //   .style("fill", function(d) { return colorFunc(d[0]); });

    // key.call(xAxis);

    function transform(d) {
        d = new google.maps.LatLng(d.value.lat, d.value.lon);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px")
            .style("opacity", 0.6)
            .style("fill", function(d) {
                // if (d.value.value > 15) {
                //     return t1.url();
                // } else if (d.value.value > 10) {
                //     return t2.url();
                // } else {
                //     return t3.url();
                // }
                return colorFunc(d.value.value);
            });
    }
}

function onAdd() {
    console.log('onAdd');
    var panes = this.getPanes();
    // console.log(panes);
    // console.log(this.getMap());
    layer = d3.select(panes.overlayLayer).append("div")
        .attr("class", "weather-points");
    // buildKey();
    // this.map.addListener('zoom_changed', updateMapData);
    // this.map.addListener('dragend', updateMapData);
}

function setData(data) {
    // console.log('set data: ' + data);
    this.data = JSON.parse(data);
    this.draw();
}

function DataOverlay(data, node, thresholds, colors) {
    // console.log('created overlay');
    // console.log(thresholds);
    this.el = node;
    // console.log("Overlay, Node: " + node.innerHTML + " Colors: " + colors);
    this.data = data;
    thresholds = thresholds;

    // var interpolateColor = d3.interpolateHcl("#55075A", "#F7DBCA");
    var interpolateColor = d3.interpolateHcl(colors[0], colors[1]);
    
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