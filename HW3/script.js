var doCatSvg = d3.select("svg"),
        margin = {top: 50, right: 40, bottom: 40, left: 40},
        width = +doCatSvg.attr('width') - margin.left - margin.right,
        height = +doCatSvg.attr('height') - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

var g = doCatSvg.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function parse(row) {
    return row;
}

function dataLoaded(data) {

    //set x domain to be total number of students in the array
    x.domain(data.map(function(d) {return d['Student ID number'];}));

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
}

d3.csv('Attendance.csv', parse, dataLoaded);