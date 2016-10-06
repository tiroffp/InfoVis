//Set SVG proportions
var svg = d3.select('.plot'),
margin = {top: 40, right: 20, bottom: 50, left:40},
width = +svg.attr("width") - margin.left - margin.right
height = +svg.attr("height") - margin.top - margin.bottom;
var g = svg.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Set scaling type for x & y axes
var x = d3.scaleLinear().rangeRound([0, width]),
y = d3.scaleLinear().domain([0,30]).rangeRound([height, 0]),
colorscale = d3.scaleLinear().range(['red','white', 'black']);

//Set up date parser based on expected format of date in data
var parseDate = d3.timeParse('%Y%m%d');

//load data
function parse(row) {
  return row;
}

function dataLoaded(data) {
    //d3's max function does not properly translate string numbers to ints, so this function manually creates an int array to play nicely with that function
    function toIntArray(arr) {
      for (var i = 0; i < arr.length; i++) {
        arr[i] = +arr[i];
    }
    return arr;
    }

    //Get nonsense values out
    function filterData(d) {
        return d['MPG'] != 0 && d['Trip Distance'] != 0
    }
    //get the nonsense values out
    data = data.filter(function (d) { return d['MPG'] != 0 && d['Trip Distance'] != 0; });
    // Build data int arrays
    var distanceIntArray = toIntArray(data.map( function(d) { return d['Trip Distance'] }));
    var mpgIntArray = toIntArray(data.map( function(d) { return d['MPG'] }));

    //setup domains involving distance
    x.domain([0, d3.max(distanceIntArray)]);

    //setup domains involving mpg
    var mpgMax = d3.max(mpgIntArray);
    y.domain([0, mpgMax]);
    colorscale.domain([d3.min(mpgIntArray), d3.mean(mpgIntArray), mpgMax]);

    //Build visual
    // title
    g.append("text")
        .attr('x', 0)
        .attr('y', 0 - (margin.top / 2))
        .attr('text-anchor', 'beginning')
        .style('fill', 'grey')
        .style('font-size', '24px')
        .style('font-family', 'Sans-Serif')
        .text('Miles Per Gallon (MPG) Shows Small Correlation with Trip Distance')
    // x axis group
    g.append("g")
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))
        .append('text')
        .style('fill', 'grey')
        .style('font-size', '12px')
        .style('font-family', 'Sans-Serif')
        .attr('x', 480)
        .attr('y', 35)
        .attr('text-anchor', 'middle')
        .text('Distance Traveled (Miles)');

    // y axis group
    g.append("g")
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y).ticks(30))
        .append('text')
        .style('fill', 'grey')
        .style('font-size', '12px')
        .style('font-family', 'Sans-Serif')
        .attr('transform', 'rotate(-90)')
        .attr('x', -215)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .text('Miles Per Gallon');

    //datapoints
    g.selectAll('.dots')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dots')
        .attr('cx', function(d) { return x(d['Trip Distance']); })
        .attr('cy', function(d) {return y(d['MPG']); })
        .attr('r', 5)
        .style('fill', function(d) { console.log(colorscale(d['MPG'])); return colorscale(d['MPG'])})
        .style('stroke', 'black');

    //Hardcoded trend line (copying statistical regression from tableau rather than recalculating it here)
    g.append('line')
        .style('stroke', 'black')
        .attr('x1', x(0))
        .attr('y1', y(12.23))
        .attr('x2', x(285))
        .attr('y2', y(19.45));

    //line to annotation
    g.append('line')
        .style('stroke', 'grey')
        .attr('x1', x(60))
        .attr('y1', y(13.75))
        .attr('x2', x(60) + 75)
        .attr('y2', y(13.75) + 50);
    //Annotation describing statistcal relationship
    g.append('foreignObject')
        .attr('class', 'annotation')
        .attr('x', x(60) - 50)
        .attr('y', y(13.75) + 50)
        .attr('width', 250)
        .append('xhtml:body')
        .html('<div style="width: 250px;"> The linear trend of the data has a small p value (meaning there likely is a correlation), but a low R value (meaning the relationship is weak)</div>')
}

//run it
d3.csv('BMW128i_HW2.csv', parse, dataLoaded);