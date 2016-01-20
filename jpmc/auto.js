// UPDATE THESE VARIABLES
// way[building](11.458490752653873, -73.10302734375, 12.506302633324777, -71.070556640625);out meta;>;out meta qt;
var latMin = 11.458490752653873,
    lngMin = -73.10302734375,
    latMax = 12.506302633324777,
    lngMax = -71.070556640625;
var goal = 20000;
var baseline = 21509;
////////
var traced = 0;
var overpassCount = 0;

var progressColor = '#ed1b2e',
    remainingColor = '#d7d7d8';

var formatCommas = d3.format(",");

d3.select(window).on("resize", throttle);
var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw();
    }, 200);
}

function redraw(){
  height = (window.innerHeight - $('#header').height()) * 0.9;
  width = height;
  radius = Math.min(height) / 2;
  arc.outerRadius(radius - 10).innerRadius(radius - 90);
  d3.select('#graph').select('svg').attr('width', width).attr('height', height);
  d3.select('#graph').selectAll('.group').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
  update();
}

var height = (window.innerHeight - $('#header').height()) * 0.9,
    width = height,
    radius = Math.min(height) / 2;

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 90);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.value });

var svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height)
var chartGroup = svg.append('g')
    .attr("class", "group")
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
var textGroup = svg.append('g')
    .attr("class", "group")
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

var path = chartGroup.selectAll("path");

var centerNumber = textGroup.append('text')
    .attr("text-anchor", "middle")
    .attr("class", "percent-complete-number")
    .attr("y", "-6");
var centerLabel = textGroup.append('text')
    .attr("text-anchor", "middle")
    .attr("class", "percent-complete-label")
    .attr("y", "22")

$(function () {
    // run update every minute
    setInterval(overpass, 60000);
});

var running = false;
function overpass(){
  if(running === false){
    running = true;
    console.log("checking for new data...");
    $.ajax({
        url:
            'https://www.overpass-api.de/api/interpreter?' +
            'data=[out:json][timeout:600];' +
            'way[building](' + latMin + ',' + lngMin + ',' + latMax + ',' + lngMax + ');' +
            'out ids;',
        dataType: 'json',
        type: 'GET',
        async: true,
        crossDomain: true
    }).done(function(data) {
        if(data.elements.length != 0 && data.elements.length > overpassCount){
          overpassCount = data.elements.length;
        }
        console.log("returned current count: " + overpassCount);
        update();
    }).fail(function(error) {
        console.log(error);
        console.log( "error" );
    }).always(function() {
        running = false;
        console.log("done overpass query")
    });
  } else { console.log("It looks like a previous overpass query is still running!"); }
}

function update(){
  $('#loading').hide();
  traced = overpassCount - baseline;
  remaining = (traced <= goal) ? goal - traced : 0;
  var data = [
    { segment: "progress", value: traced },
    { segment: "remaining", value: remaining }
  ]

  // var percentageText = d3.round((traced / goal) * 100).toString() + "%";
  centerNumber.text(formatCommas(traced));
  centerLabel.text('of ' + formatCommas(goal) + ' buildings goal')

  var data0 = path.data(),
      data1 = pie(data);

  path = path.data(data1, key);

  path.enter().append("path")
      .each(function(d, i) { this._current = findNeighborArc(i, data0, data1, key) || d; })
      .attr("fill", function(d) {
        return (d.data.segment === "progress") ? progressColor : remainingColor;
      });

  path.exit()
      .datum(function(d, i) { return findNeighborArc(i, data1, data0, key) || d; })
    .transition()
      .duration(750)
      .attrTween("d", arcTween)
      .remove();

  path.transition()
      .duration(750)
      .attrTween("d", arcTween);

  // HELPERS
  // #######
  function key(d) {
    return d.data.segment;
  }

  function findNeighborArc(i, data0, data1, key) {
    var d;
    return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
        : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
        : null;
  }

  // Find the element in data0 that joins the highest preceding element in data1.
  function findPreceding(i, data0, data1, key) {
    var m = data0.length;
    while (--i >= 0) {
      var k = key(data1[i]);
      for (var j = 0; j < m; ++j) {
        if (key(data0[j]) === k) return data0[j];
      }
    }
  }

  // Find the element in data0 that joins the lowest following element in data1.
  function findFollowing(i, data0, data1, key) {
    var n = data1.length, m = data0.length;
    while (++i < n) {
      var k = key(data1[i]);
      for (var j = 0; j < m; ++j) {
        if (key(data0[j]) === k) return data0[j];
      }
    }
  }

  function arcTween(d) {
    var i = d3.interpolate(this._current, d);
    this._current = i(0);
    return function(t) { return arc(i(t)); };
  }

}

overpass();
