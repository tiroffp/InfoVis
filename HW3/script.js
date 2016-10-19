var doCatSvg = d3.selectAll(".do-categorical"),
        margin = {top: 50, right: 80, bottom: 40, left: 40},
        width = +doCatSvg.attr('width') - margin.left - margin.right,
        height = +doCatSvg.attr('height') - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);
        color = d3.scaleOrdinal(d3.schemeCategory10).domain([' 3 years', ' 2 years', ' 1 year', ' < 1 year']);//.range(['#000', '#888','#0FF','#FFF']);

var g = doCatSvg.append('g')
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
        .call(d3.axisBottom(x).tickFormat(""))
        .append('text')
        .style('fill', 'grey')
        .style('font-size', '12px')
        .style('font-family', 'Sans-Serif')
        .attr('x', width/2)
        .attr('y', 0 + (margin.bottom/2))
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
        .style('fill', function(d) { return color(d['Years in Club'])})
        .style('stroke', 'black');

    // legend
    g.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .append('rect')
        .attr('x',width)
        .attr('y','0')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .attr('transform', function(d,i) { return 'translate(0,' + (i * (legendRectSize + legendSpaceing)) + ')'})
        .style('stroke', 'black');

    // legend text
    g.selectAll('.legend')
        .append('text')
        .attr('x',width)
        .attr('y','0')
        .attr('transform', function(d,i) { return 'translate('+ (2 + legendRectSize )+',' + (i * (legendRectSize + legendSpaceing) + 15) + ')'})
        .text(function(d){return d});
}
d3.csv('Attendance.csv', parse, dataLoaded);