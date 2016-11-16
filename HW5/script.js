//sourced from http://bl.ocks.org/d3noob/5155181

// get the data
d3.csv("game_log.csv",parseData,loadData)

function parseData(row) {
  row['source'] = row['start_node']
  row['target'] = row['end_node']
  row['value'] = row['edge_index']
  return row
}

function loadData(error, data) {

 var currStep = 0;
 var maxStep = 0;
 var nodes = {};
 var links = []
 var edges = []

// Compute the distinct nodes from the links.
data.forEach(function(d) {
  if (d['id'] == 0) {
    d.source = nodes[d.source] ||
    (nodes[d.source] = {name: d.source});
    d.target = nodes[d.target] ||
    (nodes[d.target] = {name: d.target});
    d.value = +d.value;
    edges.push(d)
  }  else {
    d.source = nodes[d.source] ||
    (nodes[d.source] = {name: d.source});
    d.target = nodes[d.target] ||
    (nodes[d.target] = {name: d.target});
    d.value = +d.value;
    links.push(d)
  }
  maxStep = Math.max(d['id'],maxStep)
});
console.log(edges)
console.log(links)
console.log(nodes)

var width = 960,
height = 500;

var force = d3.layout.force()
.nodes(d3.values(nodes))
.links(edges)
.size([width, height])
.linkDistance(150)
.charge(-300)
.on("tick", tick)
.start();

// Set the range
var  v = d3.scale.linear().range([0, 100]);

// Scale the range of the data
v.domain([0, d3.max(links, function(d) { return d.value; })]);

d3.select('body').on("keydown", keydown)

var svg = d3.select("div#chartId")
.append("div")
   .classed("svg-container", true) //container class to make it responsive
   .append("svg")
   //responsive SVG needs these 2 attributes and no width and height attr
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 " + width + " "  + height)
   //class to make it responsive
   .classed("svg-content-responsive", true);

//text of current move
svg.append('text')
// .append('text')
.attr("x", 12)
.attr('y', 50 )
.attr("dy", ".35em").text('Use the arrows to navigate through the player moves').attr('class','moveText')
// build the arrow.
svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
  .enter().append("svg:marker")    // This section adds in the arrows
  .attr("id", String)
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 15)
  .attr("refY", -1.5)
  .attr("markerWidth", 6)
  .attr("markerHeight", 6)
  .attr("orient", "auto")
  .append("svg:path")
  .attr("d", "M0,-5L10,0L0,5");

// add the links and the arrows
var path = svg.append("svg:g").selectAll("path")
.data(links)
.enter().append("svg:path")
.attr("class", "link")
.attr("marker-end", "url(#end)");

var edge = svg.append("svg:g").selectAll("edge")
.data(edges)
.enter().append("svg:path");

// define the nodes
var node = svg.selectAll(".node")
.data(force.nodes())
.enter().append("g")
.attr("class", "node")
.on("click", click)
.on("dblclick", dblclick)
.call(force.drag);

// add the nodes
node.append("circle")
.attr("r", 5);

// add the text
node.append("text")
.attr("x", 12)
.attr("dy", ".35em")
.text(function(d) { return d.name; });

// add the curvy lines
function tick() {
  path.attr("d", function(d) {
    if (currStep >= d['id'] && d['action_type'] == 'move') {
      var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
      return "M" +
      d.source.x + "," +
      d.source.y + "A" +
      dr + "," + dr + " 0 0,1 " +
      d.target.x + "," +
      d.target.y;
    } else {
      return "";
    }
  })
  .attr("style", function(d){
    if(currStep >= d['id'] && d['action_type'] == 'move') {
      return "opacity: " + Math.round((d['id']/currStep) * 100) + ";"
    }
  });

  edge.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
    dy = d.target.y - d.source.y,
    dr = 0;
    return "M" +
    d.source.x + "," +
    d.source.y + "A" +
    dr + "," + dr + " 0 0,1 " +
    d.target.x + "," +
    d.target.y;
  })
  .each(function(d) {
    if(currStep >= d['id'] && d['action_type'] == 'markedge') {
      console.log(d['id'])
      d3.select(this).attr('class', 'edge marked');
    } else if(currStep >= d['id'] && d['action_type'] == 'unmarkedge') {
      d3.select(this).attr('class', 'edge unmarked');
    }});
  node
  .attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")"; });
}

// follow player moves with data with arrow keys
function keydown() {
  if (d3.event.keyCode == 37) {
    currStep = Math.max(1, currStep - 1)
  } else if (d3.event.keyCode == 39) {
    currStep = Math.min(currStep + 1, maxStep)
  }
  currStepData = data[currStep + 8]
  path.attr("d", function(d) {
    if (currStep >= d['id'] && d['action_type'] == 'move') {
      var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
      return "M" +
      d.source.x + "," +
      d.source.y + "A" +
      dr + "," + dr + " 0 0,1 " +
      d.target.x + "," +
      d.target.y;
    } else {
      return "";
    }
  })
  .attr("style", function(d){
    if(currStep >= d['id'] && d['action_type'] == 'move') {
      return "opacity: " + Math.round((d['id']/currStep) * 100)/100 + ";"
    }
  });
  edge.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
    dy = d.target.y - d.source.y,
    dr = 0;
    return "M" +
    d.source.x + "," +
    d.source.y + "A" +
    dr + "," + dr + " 0 0,1 " +
    d.target.x + "," +
    d.target.y;
  }).attr("class", function(d) {
    if(currStep >= d['id'] && d['action_type'] == 'markedge') {
      console.log(d['id'])
      return "edge marked"
    } else if(currStep >= d['id'] && d['action_type'] == 'unmarkedge') {
      return "edge unmarked"
    } else {
      return "edge unmarked"
    }})
  var currStepData = data[currStep + 7]
  svg.selectAll('.moveText')
  .attr("x", 12)
  .attr('y', 50 )
  .attr("dy", ".35em")
  .text('Move ' + currStep + ': ' + currStepData['action_type'] + ' edge ' + currStepData['start_node'] + currStepData['end_node']);
};

// action to take on mouse click
function click() {
  d3.select(this).select("text").transition()
  .duration(750)
  .attr("x", 22)
  .style("fill", "steelblue")
  .style("stroke", "lightsteelblue")
  .style("stroke-width", ".5px")
  .style("font", "20px sans-serif");
  d3.select(this).select("circle").transition()
  .duration(750)
  .attr("r", 16)
  .style("fill", "lightsteelblue");
}

// action to take on mouse double click
function dblclick() {
  d3.select(this).select("circle").transition()
  .duration(750)
  .attr("r", 6)
  .style("fill", "#ccc");
  d3.select(this).select("text").transition()
  .duration(750)
  .attr("x", 12)
  .style("stroke", "none")
  .style("fill", "black")
  .style("stroke", "none")
  .style("font", "10px sans-serif");
}

};
