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

// d3.csv("bar-otherItems.csv", function(error, otherItems) {
var data =[
{'book': 'A Game Of Thrones', 'deathcount': 0},
{'book':  'A Clash Of Kings', 'deathcount': 0},
{'book':  'A Storm Of Swords', 'deathcount': 0},
{'book':  'A Feast For Crows', 'deathcount': 0},
{'book':  'A Dance With Dragons', 'deathcount': 0}
];
    inputdata.forEach(function(d) {
        for (var i=0; i < data.length; i++) {
            if (data[i].book === d['Book of Death']) {
                var datum = data[i];
                break;
            }
    }
        datum.deathcount += 1;
    });
    
  x.domain(['A Game Of Thrones', 'A Clash Of Kings', 'A Storm Of Swords', 'A Feast For Crows', 'A Dance With Dragons']);
  y.domain([0, 100]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

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
      .data(data)
    .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", function(d) { return x(d.book); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.deathcount); })
      .attr("height", function(d) {return height - y(d.deathcount);});
      // .attr('class', function(d) {return d.selected ? 'selected'});

// });
}