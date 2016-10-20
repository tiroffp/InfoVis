(function() {
    var doCatSvg = d3.selectAll(".do-categorical"),
margin = {top: 100, right: 80, bottom: 40, left: 40},
width = +doCatSvg.attr('width') - margin.left - margin.right,
height = +doCatSvg.attr('height') - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]),
y = d3.scaleLinear().rangeRound([height, 0]);
        //Color scale for Do graphic
        colorDo = d3.scaleOrdinal(d3.schemeCategory10).domain(['Executive Board Member','Chairman','General Member']);

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

    //nest the data by category for the legend filtering
    var dataNest = d3.nest()
    .key(function(d) {return d['Position'];})
    .entries(data);

    legendSpace = (width + margin.left)/dataNest.length;

    //set x domain to be total number of students in the array
    x.domain(data.map(function(d) {
        return d['Student ID number'];}));
    y.domain([0,12])

    dataNest.forEach(function(d,i) {
        g.selectAll('.bar')
        .data(dataNest[i].values)
        .enter()
        .append("rect")
        .attr("class", "rectangle")
            .style("fill", function() {// Add the colours dynamically
                return d.color = colorDo(d.key); })
            .style("stroke", "#000")
            .attr("class", 'tag'+d.key.replace(/\s+/g, '')) // assign ID
            .attr('x', function(o) {return x(o['Student ID number']); })
            .attr('y', function(o) {return y(o['TOTAL']); })
            .attr('width', x.bandwidth())
            .attr('height', function(o) {return height - y(o['TOTAL'])});

            g.append("text")
            .attr('x',0  + margin.left + i*legendSpace)
            .attr('y',0 - 15)
            .attr("class", "legend")    // style the legend
            .style("fill", function() { // Add the colours dynamically
                return d.color = colorDo(d.key); })
            .on("click", function(){
                // Determine if current line is visible
                var active   = d.active ? false : true,
                newOpacity = active ? 0 : 1;
                // Hide or show the elements based on the ID
                d3.selectAll(".tag"+d.key.replace(/\s+/g, ''))
                .transition().duration(1000)
                .style("opacity", newOpacity);
                // Update whether or not the elements are active
                d.active = active;
            })
            .text(d.key).
            attr('text-anchor', 'middle');
        });

    g.append("text")
    .attr('x', 0 - margin.left)
    .attr('y', 0 - margin.top + 24)
    .attr('text-anchor', 'beginning')
    .style('fill', 'grey')
    .style('font-size', '24px')
    .style('font-family', 'Sans-Serif')
    .text('Attendance Count of Members by Level');

    g.append("text")
    .attr('x', 0 - margin.left)
    .attr('y', 0 - margin.top + 50)
    .attr('text-anchor', 'beginning')
    .style('fill', 'grey')
    .style('font-size', '12px')
    .style('font-family', 'Sans-Serif')
    .text('Select  a position level to add/remove members at that level from the chart');
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
    .attr('class', 'label')
    .style('fill', 'grey')
    .style('font-size', '12px')
    .style('font-family', 'Sans-Serif')
    .attr('x', width/2)
    .attr('y', 0 + height + (margin.bottom/2) + 12 )
    .style('text-anchor', 'middle')
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
    .text('Number of Events Attended');
}
d3.csv('Attendance.csv', parse, dataLoaded);
})();
