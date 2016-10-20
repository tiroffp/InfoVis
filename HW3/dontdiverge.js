(function () {
    var dontCatSvg = d3.select("#dont-diverging"),
    margin = {top: 50, right: 80, bottom: 40, left: 40},
    width = +dontCatSvg.attr('width') - margin.left - margin.right,
    height = +dontCatSvg.attr('height') - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]),
    colorDontDiverge = d3.scaleLinear().range(['red','orange', 'yellow','green','blue','indigo','violet']).domain([0,2,4,6,8,10,12]);

    var g = dontCatSvg.append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Variables for legend sizing/spacing
var legendRectSize = 18;
var legendSpaceing = 4;

function parse(row) {
    //change TOTAL column to be total attended, not total missed
    row['TOTAL'] = 11 - row['TOTAL']
    return row;
}

function dataLoaded(data) {

    //set x domain to be total number of students in the array
    x.domain(data.map(function(d) {return d['Student ID number'];}));
    y.domain([0,11])

    g.append("text")
    .attr('x', 0)
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'beginning')
    .style('fill', 'grey')
    .style('font-size', '24px')
    .style('font-family', 'Sans-Serif')
    .text('Attendance Count of Members by Senority');
    // x axis group
    g.append("g")
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr("transform", function() {return "translate(-12,6)rotate(-65)";})
    .style('font-size', '8px')
    .style('text-anchor','end');

    g.append('text')
    .style('fill', 'grey')
    .style('font-size', '12px')
    .style('font-family', 'Sans-Serif')
    .attr('x', width/2)
    .attr('y', 0 +  height + (margin.bottom/2 + 12 ))
    .attr('text-anchor', 'middle')
    .text('Student (ID number)');


    // y axis group
    g.append("g")
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(y).ticks(11))
    .append('text')
    .style('fill', 'grey')
    .style('font-size', '12px')
    .style('font-family', 'Sans-Serif')
    .attr('transform', 'rotate(-90)')
    .attr('x', -215)
    .attr('y', -30)
    .attr('text-anchor', 'middle')
    .text('Events Attended');

// data bar
g.selectAll('.bar')
.data(data)
.enter()
.append('rect')
.attr('class', 'bar')
.attr('x', function(d) { return x(d['Student ID number']); })
.attr('y', function(d) {return y(d['TOTAL']); })
.attr('width', x.bandwidth())
.attr('height', function(d) {return height - y(d['TOTAL'])})
.style('fill', function(d) { return colorDontDiverge(d['TOTAL'])})
.style('stroke', 'black');

    // legend
    g.selectAll('.legend')
    .data(colorDontDiverge.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .append('rect')
    .attr('x',width)
    .attr('y','0')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', colorDontDiverge)
    .attr('transform', function(d,i) { return 'translate(0,' + (i * (legendRectSize + legendSpaceing)) + ')'})
    .style('stroke', 'black');

var w = 140, h = 400;

            var key = d3.select("dont-diverging").append("svg:svg").attr("width", w).attr("height", h);

            // var legend = key.append("defs").append("svg:linearGradient").attr("id", "gradient").attr("x1", "100%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%").attr("spreadMethod", "pad");

            // legend.append("stop").attr("offset", "0%").attr("stop-color", "#B30000").attr("stop-opacity", 1);

            // legend.append("stop").attr("offset", "100%").attr("stop-color", "#FEE8c8").attr("stop-opacity", 1);

            // key.append("rect").attr("width", w - 100).attr("height", h - 100).style("fill", "url(#gradient)").attr("transform", "translate(0,10)");

            // var ly = d3.scaleLinear().range([300, 0]).domain([1, 100]);

            // var yAxis = d3.axisRight(ly);

            // key.append("g").attr("class", "y axis").attr("transform", "translate(41,10)").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 30).attr("dy", ".71em").style("text-anchor", "end").text("axis title");

    // legend text
    g.selectAll('.legend')
    .append('text')
    .attr('x',width)
    .attr('y','0')
    .attr('transform', function(d,i) { return 'translate('+ (2 + legendRectSize )+',' + (i * (legendRectSize + legendSpaceing) + 15) + ')'})
    .text(function(d){return d });

    g.select('.legend')
    .append('text')
    .attr('x',width)
    .attr('y','-20')
    .text('Events')
    g.select('.legend')
    .append('text')
    .attr('x',width)
    .attr('y','-5')
    .text('Attended')
}
d3.csv('Attendance.csv', parse, dataLoaded);
})();