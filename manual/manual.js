var progressColor = '#ed1b2e',
    remainingColor = '#d7d7d8';

d3.select(window).on("resize", throttle);
var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw();
    }, 200);
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
  .append('g')
    .attr("class", "group")
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

var centerText = svg.append('text')
    .attr("text-anchor", "middle")
    .attr("class", "percent-complete-txt")
    // y should be about half of font size set in css
    .attr("y", "20");

var path = svg.selectAll("path");



function update(){
  var progress = $('input[name="progress-input"]')[0].value;
  var goal = $('input[name="goal-input"]')[0].value;
  var remaining = goal - progress;
  var data = [
    { segment: "progress", value: progress },
    { segment: "remaining", value: remaining }
  ]

  var percentageText = d3.round((progress / goal) * 100).toString() + "%";
  centerText.text(percentageText);

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
