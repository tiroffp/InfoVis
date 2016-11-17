//sourced from http://bl.ocks.org/d3noob/5155181 as well as https://bl.ocks.org/mbostock/3750558

// get the data
d3.csv("game_log.csv",parseData,loadData)

function parseData(row) {
  row['source'] = row['start_node']
  row['target'] = row['end_node']
  row['value'] = row['edge_index']
  return row
}

function loadData(error, data) {
 var currStep = 1;
 var maxStep = 0;
 var nodes = {};
 var moves = []
 var edges = []
 var actions = []
 var currStepData;
 var markedEdges = {}
 var unmarkedEdges = {}
 var action_offset = 0 //since edge setup and player actions are in same file, add this number to action id to directly access it from data array
 // might be able to refactor data parsing get rid of this and infer edges from actions
 var currNode = {}
 var treeWeight = 0;

// Compute the distinct nodes and edges , seperate moves out from game log.
data.forEach(function(d) {
  d.source = nodes[d.source] ||
  (nodes[d.source] = {name: d.source});
  d.target = nodes[d.target] ||
  (nodes[d.target] = {name: d.target});
  d.value = +d.value;

  if (d['id'] == 0) {
    edges.push(d)
    action_offset = action_offset + 1
  }  else if(d['action_type'] == 'move') {
    moves.push(d)
  } else {
    actions.push(d)
  }
  maxStep = Math.max(d['id'],maxStep)
});
action_offset = action_offset - 1;
currStepData = data[currStep + action_offset]

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

var drag = force.drag()
.on("dragstart", dragstart);

// Set the range
var  v = d3.scale.linear().range([0, 100]);

// Scale the range of the data
v.domain([0, d3.max(moves, function(d) { return d.value; })]);

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
svg
.append('text')
.attr("x", 12)
.attr('y', 50 )
.attr("dy", ".35em").text('Use the arrows to navigate through the player moves').attr('class','moveText')

// build the arrow.
svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
  .enter().append("svg:marker")    // This section adds in the arrows
  .attr("id", String)
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 27)
  .attr("refY", -1.5)
  .attr("markerWidth", 6)
  .attr("markerHeight", 6)
  .attr("orient", "auto")
  .append("svg:path")
  .attr("d", "M0,-5L10,0L0,5");

// add the moves and the arrows
var path = svg.append("svg:g").selectAll("path")
.data(moves)
.enter().append("svg:path")
.attr("class", "link")
.attr("marker-end", "url(#end)");

var edge = svg.append("svg:g").selectAll("edge")
.data(edges)
.enter().append("svg:path")
.attr('class', 'edge unmarked')
.attr("id", function(d){return d['edge_index']});

svg.selectAll('.edgeWeight')
.data(edges)
.enter()
.append('text')
.attr("x", 12)
.attr('y', 50 )
.attr("dy", "1em")
// .attr('dx', '2em')
.attr('text-anchor', 'middle')
.append("textPath")
.attr("xlink:href", function (d) { return '#' + d.edge_index; })
.attr("startOffset","50%")
.text(function (d) { return d.edge_weight; });

// define the nodes
var node = svg.selectAll(".node")
.data(force.nodes())
.enter().append("g")
.attr("class", "node")
.on("dblclick", dblclick)
.call(force.drag);

// add the nodes
node.append("circle")
.attr("r", 15);

// add the text
node.append("text")
.attr("x", -4)
.attr("dy", ".35em")
.text(function(d) { return d.name; });

node.on({
  "mouseover": function(d) {
    d3.select(this).style("cursor", "pointer")
  },
  "mouseout": function(d) {
    d3.select(this).style("cursor", "default")
  }
});

// add the curvy lines
function tick() {
  updateGraphHelper();

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

  currStepData = data[currStep + action_offset]

  updateGraphHelper();

  svg.selectAll('.moveText')
  .attr("x", 12)
  .attr('y', 50 )
  .attr("dy", ".35em")
  .text('Move ' + currStep + ': ' + currStepData['action_type'] + ' on edge ' + currStepData['start_node'] + currStepData['end_node'])
  .append("text")
  .text('testlin');
};

function updateGraphHelper() {
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
    if(currStep == d['id'] && d['action_type'] == 'move') {
      return "opacity: 1;"
    } else if(currStep > d['id'] && d['action_type'] == 'move') {
      return "opacity: .03;"
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
  }).each(function(d) {
    if(currStepData['edge_index'] == d['edge_index'] && currStepData['action_type'] == 'markedge') {
      markedEdges[d.edge_index] = [d3.select(this),currStep]
      if (unmarkedEdges[d.edge_index]) {
        delete unmarkedEdges[d.edge_index];
      }
    } else if(currStepData['edge_index'] == d['edge_index'] && currStepData['action_type'] == 'unmarkedge') {
      unmarkedEdges[d.edge_index] = [d3.select(this),currStep]
      if (markedEdges[d.edge_index]) {
        delete markedEdges[d.edge_index];
      }
    }
  });

  for (var markedEdge in markedEdges) {
    line = markedEdges[markedEdge]
    if(line[1] > currStep) {
      delete markedEdges[markedEdge]
      line[0].attr('class', 'edge unmarked');
    } else if(line[1] == currStep) {
      line[0].attr('class', 'edge justmarked')
    } else {
      line[0].attr('class', 'edge marked');
    }
  }
  for (var unmarkedEdge in unmarkedEdges) {
    d = unmarkedEdges[unmarkedEdge][0]
    d.attr('class', 'edge unmarked');
  }

  node.each(function(d){
    if (currStepData['action_type'] == 'move' && d['name'] == currStepData['end_node']) {
      currNode = this
    } else {
    d3.select(this).attr('style','stroke: #fff')
  }
  })
    d3.select(currNode).attr('style','stroke: #FAA')
}

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}

function dblclick(d) {
  d3.select(this).classed("fixed", d.fixed = false);
}

};
