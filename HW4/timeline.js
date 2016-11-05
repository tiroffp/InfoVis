//credit http://bl.ocks.org/rengel-de/5603464

function timeline(domElement) {

    //--------------------------------------------------------------------------
    //
    // chart
    //

    // chart geometry
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    outerWidth = 960,
    outerHeight = 1500,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

    // global timeline variables
    var timeline = {},   // The timeline
        data = {},       // Container for the data
        components = [], // All the components of the timeline for redrawing
        bandGap = 25,    // Arbitray gap between to consecutive bands
        bands = {},      // Registry for all the bands in the timeline
        bandY = 0,       // Y-Position of the next band
        bandNum = 0;     // Count of bands for ids
        trackCount = 0; // get the number of tracks on the main chart

    // Create svg element
    var svg = d3.select(domElement).append("svg")
    .attr("class", "svg")
    .attr("id", "svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top +  ")");

    var chart = svg.append("g")
    .attr("class", "chart")
    .attr("clip-path", "url(#chart-area)" );

    var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("visibility", "visible");

    timeline.getdata = function() {return data};

    //--------------------------------------------------------------------------
    //
    // data
    //

    timeline.data = function(items) {

        var today = new Date(),
        tracks = [];
        data.items = items;

        function compareDescending(item1, item2) {
            // Every item must have two fields: 'start' and 'end'.
            var result = item1.start - item2.start;
            // later first
            if (result < 0) { return 1; }
            if (result > 0) { return -1; }
            // shorter first
            result = item2.end - item1.end;
            if (result < 0) { return 1; }
            if (result > 0) { return -1; }
            return 0;
        }

        function calculateTracks(items) {
            var i, track;
            function sortBackward() {
                // older items end deeper
                items.forEach(function (item) {
                    for (i = 0, track = 0; i < tracks.length; i++, track++) {
                        if (item.end < tracks[i]) { break; }
                    }
                    item.track = track;
                    tracks[track] = item.start;
                });
                return tracks.length;
            }
            data.items.sort(compareDescending);
            trackCount = sortBackward();
        }


        calculateTracks(data.items);
        data.nTracks = tracks.length;
        data.minDate = d3.min(data.items, function (d) { return d.start; });
        data.maxDate = d3.max(data.items, function (d) { return d.end; });

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // band
    //

    timeline.band = function (bandName, sizeFactor) {

        var band = {};
        band.id = "band" + bandNum;
        band.x = 0;
        band.y = bandY;
        band.w = width;
        band.h = height;
        band.trackOffset = 4;
        // Prevent tracks from getting too high
        band.trackHeight = Math.min((band.h - band.trackOffset) / data.nTracks, 20);
        band.itemHeight = band.trackHeight * 0.8,
        band.parts = [],

        band.xScale = d3.scale.linear()
        .domain([data.minDate, 350])
        .range([0, band.w]);

        var tracks = [];

        for (var i = 1; i <= trackCount; i++) {
            tracks.push(i);
        }
        band.yScale = d3.scale.ordinal().domain(tracks).rangeBands([0, band.h]);
        band.yScaleinvert = function(pixel) {
            for(j=0; pixel > 0 + band.yScale.rangeBand() * j; j++) {}
                return band.yScale.domain()[j];
        }

        band.g = chart.append("g")
        .attr("id", band.id)
        .attr("transform", "translate(0," + band.y +  ")");

        band.g.append("rect")
        .attr("class", "band")
        .attr("width", band.w)
        .attr("height", band.h);

        // Items
        var items = band.g.selectAll("g")
        .data(data.items)
        .enter().append("svg")
        .attr("y", function (d) { return band.yScale(d.track); })
        .attr("height", band.itemHeight)
        .attr("pointer-events", "all")
        .attr("class", function(d,i){return d.selected ? "selected interval" : "interval";});

        var intervals = d3.select("#band" + bandNum).selectAll(".interval");
        intervals.append("rect")
        .attr("class", function(d) {return d.Name.replace(/\s+/g, '').replace(/'/g, 'A')})
        .attr("width", "100%")
        .attr("height", "100%");
        intervals.append("text")
        .attr("class", "intervalLabel")
        .attr("x", 1)
        .attr("y", 10)
        .text(function (d) { return d.label; });

        band.addActions = function(actions) {
            // actions - array: [[trigger, function], ...]
            actions.forEach(function (action) {
                items.on(action[0], action[1]);
            })
        };

        band.redraw = function () {
            items
            .attr("x", function (d) { return band.xScale(d.start);})
            .attr("width", function (d) {
                return band.xScale(d.end) - band.xScale(d.start); })
            .attr("class", function(d,i){return d.selected ? "selected interval" : "interval";});;
            band.parts.forEach(function(part) { part.redraw(); });
        };

        bands[bandName] = band;
        components.push(band);
        // Adjust values for next band
        bandY += band.h + bandGap;
        bandNum += 1;

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // tooltips
    //

    timeline.tooltips = function (bandName) {

        var band = bands[bandName];
        band.addActions([
            // trigger, function
            ["mouseover", showTooltip],
            ["mouseout", hideTooltip]
            ]);

        function getHtml(element, d) {
            var html;
            if (element.attr("class") == "interval") {
                html = d.label;
                html = html +"<br>" + 'Introduced In Chapter ' + d['Intro Chapter']  + ' in ' + d['Book of Introduction'];
                html = html +" <br>" + 'Died In Chapter ' + d['Death Chapter'] + ' in ' + d['Book of Death'];
                html = html +'<br>' + 'Total Lifespan: '  + d['lifespan'] + ' chapters ,or about '+ (Math.trunc(d['lifespan']*100/343)) + '% of the series';
            }
            return html;
        }

        function showTooltip (d,event) {
            var x = d3.event.layerX < band.x + band.w / 2
            ? d3.event.layerX + 10
            : d3.event.layerX - 10,
            y = d3.event.layerY < band.y + band.h / 2
            ? d3.event.layerY + 30
            : d3.event.layerY - 30;

            tooltip
            .html(getHtml(d3.select(this), d))
            .style("top", y + "px")
            .style("left", x + "px")
            .style("visibility", "visible");

        }

        function hideTooltip (d) {
            tooltip.style("visibility", "hidden");
        }

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // xAxis
    //

    timeline.xAxis = function (bandName, orientation) {

        var band = bands[bandName];

        var axis = d3.svg.axis()
        .scale(band.xScale)
        .orient(orientation || "bottom")
        .tickSize(6, 0)

        var xAxis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (band.y + band.h)  + ")");

        xAxis.redraw = function () {
            xAxis.call(axis);
        };

        band.parts.push(xAxis); // for brush.redraw
        components.push(xAxis); // for timeline.redraw

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // brush
    //

    timeline.brush = function (bandName, targetNames) {

        var band = bands[bandName], domainX, domainY;

        var brush = d3.svg.brush()
        .x(band.xScale.range([0, band.w]))
        .y(band.yScale)
        .on("brush", function() {
            var lines = d3.selectAll('.interval'),
            domainX = [brush.extent()[0][0],brush.extent()[1][0]],
            domainY = [brush.extent()[0][1],brush.extent()[1][1]];
            data.items.forEach(function(d, i){
                d3.selectAll("." + d.NameForClass).classed('selected', function(d) {
                    var crossLeftBound = d['start'] < domainX[0] & d['end'] > domainX[0];
                    var crossRightBound = d['start'] < domainX[1] & d['end'] > domainX[1];
                    var contained = d['start'] > domainX[0] & d['end'] < domainX[1];
                    var vertBound = band.yScale(d['track']) >= domainY[0] & band.yScale(d['track']) <= domainY[1]
                    return (crossLeftBound || contained || crossRightBound) & vertBound
                });
            });
        });

        var brushRect = band.g.append("svg")
        .attr("class", "brush")
        .call(brush);

        return timeline;
    };
    //----------------------------------------------------------------------
    //
    // redraw
    //

    timeline.redraw = function () {
        components.forEach(function (component) {
            component.redraw();
        })
    };

    //--------------------------------------------------------------------------
    //
    // Utility functions
    //

    function parseDate(dateString) {
        // 'dateString' must either conform to the ISO date format YYYY-MM-DD
        // or be a full year without month and day.
        // AD years may not contain letters, only digits '0'-'9'!
        // Invalid AD years: '10 AD', '1234 AD', '500 CE', '300 n.Chr.'
        // Valid AD years: '1', '99', '2013'
        // BC years must contain letters or negative numbers!
        // Valid BC years: '1 BC', '-1', '12 BCE', '10 v.Chr.', '-384'
        // A dateString of '0' will be converted to '1 BC'.
        // Because JavaScript can't define AD years between 0..99,
        // these years require a special treatment.

        var format = d3.time.format("%Y"),
        date,
        year;

        date = format.parse(dateString);
        if (date !== null) return date;

        // BC yearStrings are not numbers!
        if (isNaN(dateString)) { // Handle BC year
            // Remove non-digits, convert to negative number
            year = -(dateString.replace(/[^0-9]/g, ""));
        } else { // Handle AD year
            // Convert to positive number
            year = +dateString;
        }
        if (year < 0 || year > 99) { // 'Normal' dates
            date = new Date(year, 6, 1);
        } else if (year == 0) { // Year 0 is '1 BC'
        date = new Date (-1, 6, 1);
        } else { // Create arbitrary year and then set the correct year
            // For full years, I chose to set the date to mid year (1st of July).
            date = new Date(year, 6, 1);
            date.setUTCFullYear(("0000" + year).slice(-4));
        }
        // Finally create the date
        return date;
    }

    function toYear(date, bcString) {
        // bcString is the prefix or postfix for BC dates.
        // If bcString starts with '-' (minus),
        // if will be placed in front of the year.
        bcString = bcString || " BC" // With blank!
        var year = date.getUTCFullYear();
        if (year > 0) return year.toString();
        if (bcString[0] == '-') return bcString + (-year);
        return (-year) + bcString;
    }

    return timeline;
}

// create historgram
