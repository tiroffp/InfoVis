function bookshistogram(domElement, inputdata){
var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = 960 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

var svg = d3.select(domElement).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var totals ={
'A Game Of Thrones': 0,
'A Clash Of Kings': 0,
'A Storm Of Swords': 0,
'A Feast For Crows': 0,
'A Dance With Dragons': 0
};

  x.domain(['A Game Of Thrones', 'A Clash Of Kings', 'A Storm Of Swords', 'A Feast For Crows', 'A Dance With Dragons']);
  y.domain([0, 100]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("y", margin.bottom/2)
      .attr("dy", ".71em")
      .attr('x', width/2)
      .style('font-size', '24px')
      .style("text-anchor", "middle")
      .text("Name of Book");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of Deaths");

  svg.selectAll("bar")
      .data(inputdata)
    .enter().append("rect")
      .attr("x", function(d) { return x(d['Book of Death']); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) {
        var count = totals[d['Book of Death']] + 1
        totals[d['Book of Death']] = count;
        return height -   count  - 2;})
      .attr("height", function(d) {return height - y(1);})
      .attr('class', function(d) {return d.NameForClass});

// });
}