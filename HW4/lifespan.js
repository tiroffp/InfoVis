function lifespan(domElement, data){
// A formatter for counts.
var formatCount = d3.format(",.0f");
var margin = {top: 10, right: 30, bottom: 50, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var x = d3.scale.linear()
    .domain([0, 350])
    .range([0, width]);
// Generate a histogram using twenty uniformly-spaced bins.
var lifespans = {}
data.forEach(function (d){
    var lifespan = Math.floor(d['lifespan']/20) * 20
    d.lifespan  = lifespan
})

var y = d3.scale.linear()
    .domain([0,140])
    .range([height, 0]);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
var svg = d3.select(domElement).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var bar = svg.selectAll(".bar")
    .data(data)
  .enter()
  .append("rect")
    .attr("x", function (d) {return x(d.lifespan)})
    .attr("y",function(d) {
        var total;
        if (isNaN(lifespans[d.lifespan])){
            total = 1;
        } else {
            total = lifespans[d.lifespan] + 1;
        }
        lifespans[d.lifespan] = total;
        return y(total)
    })
    .attr("width", 45)
    .attr("height", function(d) { return height - y(1); })
    .attr('class', function(d){return d.NameForClass});

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append('text')
    .attr("y", margin.bottom/2)
      .attr("dy", ".71em")
      .attr('x', width/2)
      .style('font-size', '24px')
      .style("text-anchor", "middle")
      .text("Number of Chapters Survived");

      svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("dy", "1em")
      .attr('x', -height/2)
      .style("text-anchor", "middle")
      .style('font-size', '16px')
      .text("Number of Characters");

}