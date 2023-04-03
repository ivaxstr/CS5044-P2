

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 120, left: 60},
width = 700 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_barchart")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// append legend svg object to the right div
var legend = d3.select("#colourScaleLegend")
.append("svg")
.attr("width", 280)
.attr("height", 60)
.append("g");

// array of attributes to choose from to colour the bars
var colourAttributes = ["Duration", "Loudness", "Tempo"];
var colours = ["green", "orange", "#db0000"];
var selectedColourAttribute = "green";
var selectedColour = 0; 

var selection = "Duration";
var colourDuration2 = d3.scaleLinear().domain([0, 300]).range(["white", selectedColourAttribute]);


// array of attributes to choose from to sort the bars
var sortAttributes = ["Streams", "Acousticness", "Danceability", "Energy", "Instrumentalness", "Liveness", "Speechiness", "Valence"];

// get dropdown menu divs
const dropDownMenuColours = d3.select("#dropDownMenuColours");
const dropDownMenuSort = d3.select("#dropDownMenuSort");

// add dropdown menus
dropDownMenuColours.append("select")
.attr("id", "dropdown")
.selectAll("option")
.data(colourAttributes)
.enter()
.append("option")
.attr("value", d => d)
.text(d => d)

dropDownMenuSort.append("select")
.attr("id", "dropdown")
.selectAll("option")
.data(sortAttributes)
.enter()
.append("option")
.attr("value", d => d)
.text(d => d)


/////////////////////


//filepath where the data is stored
const datapath = "Song Features & Streams.csv";

//read in the data using d3
const data = d3.csv(datapath);
data.then(initialiseVis, error); // now in initialiseVis we know we will have the data
function error(error) {
    console.log(error);
}

// function to initialise the visualisation
function initialiseVis(data) {
    console.log(data);

    // find the max values for each attribute
    var maxStreams = d3.max(data, function(d) { return d.Streams; });
    var maxDuration = d3.max(data, function(d) { return d.Duration; });
    var maxLoudness = d3.max(data, function(d) { return d.Loudness; });
    var maxTempo = d3.max(data, function(d) { return d.Tempo; });
    var minTempo = d3.min(data, function(d) { return d.Tempo; });
    console.log(minTempo);
    

    // define onchange functions for dropdown menus
    dropDownMenuColours.on('change', function (e, d) {
        
        const menuItem = d3.select(this) // "this" only has correct context if you use oldschool function declaration.
            .select("select")
            .property("value");


        // updating legends & bar colours

        legend.selectAll("#legendMaxLabel").remove();

        selection = menuItem;

        if (menuItem == "Duration") {
            selectedColourAttribute = colours[0];
            selectedColour = 0;
            colorDuration = d3.scaleLinear().domain([0, maxDuration]).range(["white", selectedColourAttribute]);
            svg.selectAll("rect")
            .transition()
            .duration(400)
            .style("fill", function(d) { return colorDuration(d.Duration); });
            legend.append("text").attr("id", "legendMaxLabel").attr("x", 180).attr("y", 45).text(maxDuration + " minutes");
        } else if (menuItem == "Loudness") {
            selectedColourAttribute = colours[1];
            selectedColour = 1;
            colorDuration = d3.scaleLinear().domain([0, maxLoudness]).range(["white", selectedColourAttribute]);
            svg.selectAll("rect")
            .transition()
            .duration(400)
            .style("fill", function(d) { return colorDuration(d.Loudness); });
            legend.append("text").attr("id", "legendMaxLabel").attr("x", 180).attr("y", 45).text(maxLoudness + " dB");
        } else if (menuItem == "Tempo") {
            selectedColourAttribute = colours[2];
            selectedColour = 2;
            colorDuration = d3.scaleLinear().domain([0, 180]).range(["white", selectedColourAttribute]);
            svg.selectAll("rect")
            .transition()
            .duration(400)
            .style("fill", function(d) { return colorDuration(d.Tempo); });
            legend.append("text").attr("id", "legendMaxLabel").attr("x", 180).attr("y", 45).text("180 BPM");
        }
        colourDuration2 = colorDuration; // update colourDuration2 to be used in the update data function

        gradient.selectAll("#gradientStop").remove();
        gradient.append("stop")
            .attr("id", "gradientStop")
            .attr("offset", "100%")
            .attr("stop-color", selectedColourAttribute);

    });

    dropDownMenuSort.on('change', function (e, d) {
        console.log("the change is being detected");
        const menuItem = d3.select(this) // "this" only has correct context if you use oldschool function declaration.
            .select("select")
            .property("value");

        console.log(menuItem);

        const sortedData = sortData(data, menuItem);
        updateData(sortedData);

    });

    // define colour scale & draw its legend
    var colorDuration = d3.scaleLinear()
        .domain([0, maxDuration])
        .range(["white", selectedColourAttribute]);
    colourDuration2 = colorDuration; // update colourDuration2 to be used in the update data function
    

    legend.append("defs");
    var gradient = legend.select("defs")
        .append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "white");
    gradient.append("stop")
        .attr("id", "gradientStop")
        .attr("offset", "100%")
        .attr("stop-color", selectedColourAttribute);
    
    legend.append("rect")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 180)
        .attr("height", 20)
        .style("stroke", "black")
        .style("fill", "url(#linear-gradient)");

    // label each end of the legend rectangle
    legend.append("text")
        .attr("x", 10)
        .attr("y", 45)
        .text("0");
    legend.append("text")
        .attr("id", "legendMaxLabel")
        .attr("x", 180)
        .attr("y", 45)
        .text(maxDuration + " minutes"); // also change according to attribute

    // define x and y scales 
    // X axis: scale and draw:
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.Name; }))
        .padding(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues(x.domain().filter(function(d,i){ return !(i%10)})))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, maxStreams]) 
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // axes labels 
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 40)
        .text("Song Title");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top)
        .text("Streams (in billions)");

    // Horizontal slider
    // d3.select("#sliders").append("text").text("sliders here:");
    // d3.select("#sliders").call(d3.slider().axis(true));


    
    


    // Bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", function(d) { return x(d.Name); })
            .attr("y", function(d) { return y(d.Streams); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.Streams); })
            .style("fill", function(d) { return colorDuration(d[selection]); })
            .on("mouseenter", function (event, d) {	// if the mouse enters a rectangle - event returns before data
                d3.select(this)					// select the element it entered
                    //.style("fill", "#3b665c")	// change its fill colour
                    .style("fill", "#363636");
                d3.select("svg")
                    .append("rect")
                    .attr("class", "tooltip")
                    .style("fill", "#fafafa")
                    .attr("x",  function() {
                        if (event.x > width - 200) {
                            return width - 200;
                        }
                        else {return event.x;}
                    })
                    .attr("y", event.y - 50)
                    .attr("width", 200)
                    .attr("height", 90);
                d3.select("svg")
                    .append("text")
                    .attr("class", "tooltip")
                    .attr("x", function() {
                        if (event.x > width - 200) {
                            return width - 200 + 10;
                        }
                        else {return event.x + 10;}
                    })
                    .attr("y", event.y - 30)
                    .text("Song: " + d.Name);
                d3.select("svg")
                    .append("text")
                    .attr("class", "tooltip")
                    .attr("x", function() {
                        if (event.x > width - 200) {
                            return width - 200 + 10;
                        }
                        else {return event.x + 10;}
                    })
                    .attr("y", event.y - 10)
                    .text("Artist: " + d.Artist);
                d3.select("svg")
                    .append("text")
                    .attr("class", "tooltip")
                    .attr("x", function() {
                        if (event.x > width - 200) {
                            return width - 200 + 10;
                        }
                        else {return event.x + 10;}
                    })
                    .attr("y", event.y + 10)
                    .text("Streams: " + d.Streams);
                d3.select("svg")
                    .append("text")
                    .attr("class", "tooltip")
                    .attr("x", function() {
                        if (event.x > width - 200) {
                            return width - 200 + 10;
                        }
                        else {return event.x + 10;}
                    })
                    .attr("y", event.y + 30)
                    .text("Duration: " + d.Duration);
            
            })
            .on("mouseout", function (event, d) {	// if the mouse exits a rectangle
                d3.select(this)					// select the element it exited
                    .style("fill", function(d) { return colorDuration(d[selection]); })		// reset the fill colour
                d3.selectAll(".tooltip")		// select all elements of our class "tooltip"
                    .remove();					// removes all elements
                
            });

}

function sortData(data, menuItem) {
    console.log("sort data is being called");
    console.log(data);
    console.log(menuItem);
    let filteredData = JSON.parse(JSON.stringify(data));

    var sortedData = [];

    if (menuItem == "Streams") {
        sortedData = filteredData.sort((a, b) => d3.descending(a.Streams, b.Streams));
    }
    else if (menuItem == "Acousticness") {
        sortedData = filteredData.sort((a, b) => d3.ascending(a.Acousticness, b.Acousticness));
    }
    else if (menuItem == "Danceability") {
        sortedData = filteredData.sort((a, b) => d3.ascending(a.Danceability, b.Danceability));
    } 
    else if (menuItem == "Energy") {
        sortedData = filteredData.sort((a, b) => d3.ascending(a.Energy, b.Energy));
    }
    else if (menuItem == "Instrumentalness") {
        sortedData = filteredData.sort((a, b) => d3.ascending(a.Instrumentalness, b.Instrumentalness));
    }
    else if (menuItem == "Liveness") {
        sortedData = filteredData.sort((a, b) => d3.ascending(a.Liveness, b.Liveness));
    }
    else if (menuItem == "Speechiness") {
        sortedData = filteredData.sort((a, b) => d3.ascending(a.Speechiness, b.Speechiness));
    }
    else if (menuItem == "Valence") {
        sortedData = filteredData.sort((a, b) => d3.ascending(a.Valence, b.Valence));
    }

    if (sortedData != undefined) {
        console.log(sortedData);
        return sortedData;
    }
}

function updateData(data) {

    // find the max values for each attribute
    var maxStreams = d3.max(data, function(d) { return d.Streams; });

    // Remove old bars
    svg.selectAll("rect").remove();
    svg.selectAll("g").remove();



    // X axis: scale and draw:
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.Name; }))
        .padding(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues(x.domain().filter(function(d,i){ return !(i%10)})))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, maxStreams]) 
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", function(d) { return x(d.Name); })
            .attr("y", function(d) { return y(d.Streams); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.Streams); })
            .style("fill", function(d) { return colourDuration2(d[selection]); })
            .on("mouseenter", function (event, d) {	// if the mouse enters a rectangle - event returns before data
                d3.select(this)					// select the element it entered
                    .style("fill", "#363636");
                d3.select("svg")
                    .append("rect")
                    .attr("class", "tooltip")
                    .style("fill", "#fafafa")
                    .attr("x",  function() {
                        if (event.x > width - 200) {
                            return width - 200;
                        }
                        else {return event.x;}
                    })
                    .attr("y", event.y - 50)
                    .attr("width", 200)
                    .attr("height", 90);
                d3.select("svg")
                    .append("text")
                    .attr("class", "tooltip")
                    .attr("x", function() {
                        if (event.x > width - 200) {
                            return width - 200 + 10;
                        }
                        else {return event.x + 10;}
                    })
                    .attr("y", event.y - 30)
                    .text("Song: " + d.Name);
                d3.select("svg")
                    .append("text")
                    .attr("class", "tooltip")
                    .attr("x", function() {
                        if (event.x > width - 200) {
                            return width - 200 + 10;
                        }
                        else {return event.x + 10;}
                    })
                    .attr("y", event.y - 10)
                    .text("Artist: " + d.Artist);
                d3.select("svg")
                    .append("text")
                    .attr("class", "tooltip")
                    .attr("x", function() {
                        if (event.x > width - 200) {
                            return width - 200 + 10;
                        }
                        else {return event.x + 10;}
                    })
                    .attr("y", event.y + 10)
                    .text("Streams: " + d.Streams);
                d3.select("svg")
                    .append("text")
                    .attr("class", "tooltip")
                    .attr("x", function() {
                        if (event.x > width - 200) {
                            return width - 200 + 10;
                        }
                        else {return event.x + 10;}
                    })
                    .attr("y", event.y + 30)
                    .text("Duration: " + d.Duration);
            
            })
            .on("mouseout", function (event, d) {	// if the mouse exits a rectangle
                d3.select(this)					// select the element it exited
                    .style("fill", function(d) { return colourDuration2(d[selection]); })		// reset the fill colour
                d3.selectAll(".tooltip")		// select all elements of our class "tooltip"
                    .remove();					// removes all elements

            });


}