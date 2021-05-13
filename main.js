
// Global functions called when select elements changed
function onXScaleChanged() {
    var select = d3.select('#xScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.x = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
}

function onYScaleChanged() {
    var select = d3.select('#yScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.y = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
}
var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(d) {
        return "<h5>"+d['name']+"</h5>";
    });
// select the svg area
var svg_legend = d3.select(".legend")
var director_legend = d3.select("#legend-director")
var director_legend_zoomed = d3.select("#legend-director-zoomed")
// create a list of keys
var keys = ["2010", "2011", "2012", "2013", "2014","2015","2016"]
//***********bar chart legend */
// Usually you have a color scale in your chart already
var color = d3.scaleOrdinal()
  .domain(keys)
  .range(d3.schemeTableau10);


var svg1 = d3.select('#svg1');
svg1.call(toolTip);
// Map for referencing min/max per each attribute
var extentByAttribute = {};
// Object for keeping state of which cell is currently being brushed
var brushCell;
// Get layout parameters
var svgWidth = +svg1.attr('width');
var svgHeight = +svg1.attr('height');

var padding = {t: 40, r: 40, b: 40, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;
// my scatter brush
var scatter_brush = d3.brush()
    .extent([[0, 0], [svgWidth - padding.l - padding.r, svgHeight - padding.t - padding.b]])
    .on("start", scatter_brushstart)
    .on("brush", scatter_brushmove)
    .on("end", scatter_brushend)

function scatter_brushstart() {
    if(brushCell !== this) {
        scatter_brush.move(d3.select(brushCell), null);
        xScale.domain(domainMap[chartScales.x]);
        yScale.domain(domainMap[chartScales.y]);
        brushCell = this;
    }
}
function scatter_brushmove(){  
    var e = d3.event.selection  
    if(e) {
        // console.log(e)
        // Select all .dot circles, and add the "hidden" class if the data for that circle
        // lies outside of the brush-filter applied for this SplomCells x and y attributes
        svg2.selectAll(".rect").each(function(){
            var rect = d3.select(this)
            rect.classed("hidden", false)
        })
        svg1.selectAll(".dot").each(function(){
            var self = d3.select(this)
            var circle = d3.select(this).select("circle")
            var x = self.attr("cx")
            var y = self.attr("cy")
            circle.classed("hidden", function(d){
                return e[0][0] > x|| x > e[1][0]
                    || e[0][1] > y ||y > e[1][1];
            })
        })
        svg2.selectAll(".rect").each(function(){
            var rect = d3.select(this)
            rect.classed("hidden", true)
        })
        svg1.selectAll(".dot").each(function(){
            var circle = d3.select(this).select("circle")
            if (circle.attr("class") != "hidden"){
                var self = d3.select(this)
                var c = self.attr("c")
                // console.log("regular c" + c)
                svg2.selectAll(".rect").each(function(){
                    var self = d3.select(this)
                    var current_c = self.attr("c")
                    // console.log("bar c" + current_c)
                    if (c == current_c){
                        self.classed("hidden", false)
                    }
                })
            }

        })


    } 
}
function scatter_brushend(){
    // If there is no longer an extent or bounding box then the brush has been removed
    // selection.call(scatter_brush.scatter_brushmove, null);
    if(!d3.event.selection) {
        // Bring back all hidden .dot elements
        svg1.selectAll("cirlce").classed('visible', true);
        // Return the state of the active brushCell to be undefined
        brushCell = undefined;
    }
}
// my bar brush
var bar_brush = d3.brushX()
    .extent([[0, 0], [svgWidth - padding.l - padding.r, svgHeight - padding.t - padding.b]])
    .on("start", bar_brushstart)
    .on("brush", bar_brushmove)
    .on("end", bar_brushend);

function bar_brushstart() {
    if(brushCell !== this) {
        bar_brush.move(d3.select(brushCell), null);
        xScale.domain(domainMap[chartScales.x]);
        yScale.domain(domainMap[chartScales.y]);
        brushCell = this;
    }
}
function bar_brushmove(){    
    var e = d3.event.selection
    if(e) {
        svg1.selectAll(".dot").each(function(){
            var circle = d3.select(this).select("circle")
            circle.classed("hidden", false)
        })
        svg2.selectAll(".rect").each(function(){
            var rect = d3.select(this)
            var x1 = parseInt(rect.attr("x"))
            var x2 = parseInt(x1) + parseInt(rect.attr("width"))
            var y1 = 0
            var y2 = parseInt(rect.attr("height"))
            rect.classed("hidden", function(d){
                return e[0] >= x1 || x2 >= e[1]
            })
        })
        svg1.selectAll(".dot").each(function(){
            var circle = d3.select(this).select("circle")
            circle.classed("hidden", true)
        })

        svg2.selectAll(".rect").each(function(){
            var rect = d3.select(this)
            if (rect.attr("class") != "rect hidden"){
                var c = rect.attr("c")
                svg1.selectAll(".dot").each(function(){
                    var self = d3.select(this)
                    var circle = d3.select(this).select("circle")
                    var current_c = self.attr("c")
                    if (c == current_c){
                        circle.classed("hidden", false)
                    }
                })
            }

        })

    }
}
function bar_brushend(){
    // If there is no longer an extent or bounding box then the brush has been removed
    if(!d3.event.selection) {
        // Bring back all hidden .dot elements
        svg1.selectAll('.hidden').classed('hidden', false);
        // Return the state of the active brushCell to be undefined
        brushCell = undefined;
    }
}

// Create a group element for appending scatter chart elements
var chartG = svg1.append('g')
    .attr('transform', 'translate('+[40+padding.l, padding.t]+')');

// Create groups for the x- and y-axes
var xAxisG = chartG.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate('+[0, chartHeight]+')');



var yAxisG = chartG.append('g')
    .attr('class', 'y-axis')
    .attr('transform', 'translate('+[0, 0]+')');
// For bar chart
var svg2 = d3.select('#svg2');
// Create a group element for appending bar chart elements
var chartB = svg2.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');
var xAxisB = chartB.append('g')
    .attr('class', 'x-axis-bar')
    .attr('transform', 'translate('+[0, chartHeight]+')');
var yAxisB = chartB.append('g')
    .attr('class', 'y axis');
chartB.selectAll('.bar').data();
var barBand = chartHeight/6;
// console.log(barBand)
var barHeight = barBand*0.7;
// 

var movies;
d3.csv('movies.csv', function(row) {
        return {
            'name': row['name'],
            'DirectorFacebookLikes': +row['DirectorFacebookLikes'],
            'Num Voted Users': +row['Num Voted Users'],
            'Num Critic For Reviews': +row['Num Critic For Reviews'],
            'Num User for Reviews': +row['Num User for Reviews'],
            'MovieFacebookLikes': +row['MovieFacebookLikes'],
            'Cast Total Facebook Likes': +row['Cast Total Facebook Likes'],
            'IMDB Score': +row['IMDB Score'],
            'TitleYear': row['TitleYear']

        };
    },
    function(dataset) {
        // **** Your JavaScript code goes here ****
        movies = dataset;
        movies = movies.filter(function(d) { 
            return d['Cast Total Facebook Likes']!== ''
            &&d['MovieFacebookLikes']!== ''
            &&d['IMDB Score']!== ''
            &&d['Num User for Reviews']!== ''
            &&d['Num Voted Users']!== ''
            &&d['Num Critic For Reviews']!== ''
            &&d['DirectorFacebookLikes']!== '';

        });
        // console.log(movies)
        xScale = d3.scaleLinear()
    	.range([0, chartWidth-50]);

		yScale = d3.scaleLinear()
    	.range([chartHeight, 0]);

        yScaleBar = d3.scaleLinear()
        xScaleBar = d3.scaleLinear()
        .range([0, chartWidth-60]);

        // filtering out the null values
        var filtered = dataset.filter(function(d) { return d.TitleYear!== ''; });
        //group cars by language
        nested = d3.nest()
            .key(function(d) {
                // console.log(d.language)
                return d.TitleYear
            })
            .entries(filtered);

        // console.log(nested)
        // ****************************** bar chart ******************************
        yScaleBar.domain([0, d3.max(nested, function(d){
            // console.log(d.values.length)
            return d.values.length;
        })]).nice()
        .range([chartHeight, 0]);

        var sorted = nested.sort(function(x, y){
            return d3.ascending(x.key, y.key)
        });

        xScaleBar.domain([2009.5,2016.5])

        xAxisB.call(d3.axisBottom(xScaleBar).ticks(7))

        d3.selectAll(".x-axis-bar")
        .style("stroke","gray");
        
        var bar = chartB.selectAll('.bar')
        .data(sorted)
        .enter()
        .append("g")

        bar.append("rect")
        .attr("class", "rect")
        .attr("y", function(d, i){
            return yScaleBar(d.values.length);
        })
        .attr("x", function(d, i){
            return xScaleBar(d.key) - 18
        })
        .attr("c", function(d, i){
            return d.key
        })
        .attr("height", function(d){
            return  chartHeight - yScaleBar(d.values.length)
        })
        .attr("width", function(d){
            return chartWidth/12
        })
        .attr("fill", function(d){
            // console.log(d.key)
            return color(d.key)
        })

        var yLeftAxis = d3.axisLeft(yScaleBar)
        .ticks(13)

        chartB.append("g")
        .style("font", "10px times")
        .attr("transform", "translate(-1.5, 0)")
        .attr("class", "left-y-axis")
        .call(yLeftAxis);
        domainMap = {};

        d3.selectAll(".left-y-axis")
        .style("stroke","gray");

        dataset.columns.forEach(function(column) {
            domainMap[column] = d3.extent(dataset, function(data_element){
                return data_element[column];
            });
        });
        chartScales = {x: 'IMDB Score', y: 'MovieFacebookLikes'};
        chartG.append("g")
        .attr("class", "scatter_brush")
        .call(scatter_brush)
        chartB.append("g")
        .attr("class", "bar_brush")
        .call(bar_brush)



        updateChart();

    });


function updateChart() {
    // **** Draw and Update your chart here ****
    // scatter_brushend();

    // Update the scale domain on updateChart
    svg1.selectAll(".scatter_brush").remove();
    svg2.selectAll(".bar_brush").remove();

    yScale.domain(domainMap[chartScales.y]).nice();
	xScale.domain(domainMap[chartScales.x]).nice();

    xAxisG.call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(45 -10 10)");

    d3.selectAll(".x-axis")
    .style("stroke","gray");


	yAxisG.call(d3.axisLeft(yScale));
    // Enter + Update to create the circles
    var dots = chartG.selectAll('.dot')
    .data(movies);
    // console.log(cars[0].cylinders)

    d3.selectAll(".y-axis")
    .style("stroke","gray");

    var dotsEnter = dots.enter()
    .append('g')
    .attr('class', 'dot')
    .attr('transform', function(d) {
        var tx = xScale(d[chartScales.x]);
        var ty = yScale(d[chartScales.y]);
        return 'translate('+[tx, ty]+')';

    }).attr("cx",function(d) {
        return xScale(d[chartScales.x]);
    })
    .attr("cy",function(d) {
        return yScale(d[chartScales.y]);
    })
    .attr("c", function(d, i){
        return d["TitleYear"];
    });


    dotsEnter.append('circle')
        .attr('r', 3);


    dots.attr('transform', function(d) {
        var tx = xScale(d[chartScales.x]);
        var ty = yScale(d[chartScales.y]);
        return 'translate('+[tx, ty]+')';
    })


    dots.merge(dotsEnter)
    .attr('transform', function(d) {
        var tx = xScale(d[chartScales.x]);
        var ty = yScale(d[chartScales.y]);
        return 'translate('+[tx, ty]+')';
    });

    dotsEnter.append('text')
    .attr('y', -10)
    .text(function(d) {
        return d.name;
    });


    dots.merge(dotsEnter)
    .transition()
    .duration(750)
    .attr('transform', function(d) {
        var tx = xScale(d[chartScales.x]);
        var ty = yScale(d[chartScales.y]);
        return 'translate('+[tx, ty]+')';
    });

    dots.attr("cx",function(d) {
        return xScale(d[chartScales.x]);
    })
    .attr("cy",function(d) {
        return yScale(d[chartScales.y]);
    })
    .attr("c", function(d, i){
        return d["TitleYear"];
    })
    // draw();
    // d3.interval(draw, 3000);

    xAxisG.transition()
    .duration(20)
    .call(d3.axisBottom(xScale));
	yAxisG.transition()
    .duration(2000)
    .call(d3.axisLeft(yScale));

    chartG.append("g")
    .attr("class", "scatter_brush")
    .call(scatter_brush)

    chartB.append("g")
    .attr("class", "bar_brush")
    .call(bar_brush)

    svg1.selectAll(".dot").each(function(){
        var circle = d3.select(this).select("circle")
        circle.classed("hidden", false)
    })
    svg2.selectAll(".rect").each(function(){
        var rect = d3.select(this)
        rect.classed("hidden", false)
    })


}
// Remember code outside of the data callback function will run before the data loads




// Add one dot in the legend for each name.
svg_legend.selectAll("mydots")
  .data(keys)
  .enter()
  .append("circle")
    .attr("class", "legend-solid")
    .attr("cx", 10)
    .attr("cy", function(d,i){ return 15 + i*20}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 5)
    .style("fill", function(d){ return color(d)})

// Add one dot in the legend for each name.
svg_legend.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
    .attr("x", 20)
    .attr("y", function(d,i){ return 15 + i*20}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("font", "11px times")
    .style("alignment-baseline", "middle")


var names = ["Chrsitopher Nolan","Others"];
var name_colors = d3.scaleOrdinal()
.domain(keys)
.range(["steelblue", "red"]);
// Add one dot in the legend for each name.
director_legend.selectAll("mydots")
.data(names)
.enter()
.append("circle")
  .attr("cx", 10)
  .attr("cy", function(d,i){ return 15 + i*20}) // 100 is where the first dot appears. 25 is the distance between dots
  .attr("r", 5)
  .style("fill", function(d){ return name_colors(d)})

// Add one dot in the legend for each name.


director_legend.selectAll("mylabels")
.data(names)
.enter()
.append("text")
  .attr("x", 20)
  .attr("y", function(d,i){ return 15 + i*20}) // 100 is where the first dot appears. 25 is the distance between dots
  .style("fill", function(d){ return name_colors(d)})
  .text(function(d){ return d})
  .attr("text-anchor", "left")
  .style("font", "11px times")
  .style("alignment-baseline", "middle")

  // Add one dot in the legend for each name.

// Add one dot in the legend for each name.
var names = ["Likes > 50", "Likes < 50"];
var name_colors = d3.scaleOrdinal()
.domain(names)
.range(["steelblue", "red"]);

director_legend_zoomed.selectAll("mydots")
.data(names)
.enter()
.append("circle")
  .attr("cx", 10)
  .attr("cy", function(d,i){ return 15 + i*20}) // 100 is where the first dot appears. 25 is the distance between dots
  .attr("r", 5)
  .style("fill", function(d){ return name_colors(d)})

// Add one dot in the legend for each name.
director_legend_zoomed.selectAll("mylabels")
.data(names)
.enter()
.append("text")
  .attr("x", 20)
  .attr("y", function(d,i){ return 15 + i*20}) // 100 is where the first dot appears. 25 is the distance between dots
  .style("fill", function(d){ return name_colors(d)})
  .text(function(d){ return d})
  .attr("text-anchor", "left")
  .style("font", "11px times")
  .style("alignment-baseline", "middle")

//**********************director scatter plot *******************/
//x : movie facebooklike
//y: director facebook like
// hover: director name

// **** Code for creating scales, axes and labels ****
var movieLikeScale;
var directorLikeScale;
d3.csv('movies.csv', function(row) {
    return {
        'name': row['name'],
        'DirectorFacebookLikes': +row['DirectorFacebookLikes'],
        'MovieFacebookLikes': +row['MovieFacebookLikes'],
        "DirectorName":row["DirectorName"],
        'TitleYear': row['TitleYear']

    };
},
    function(dataset){

        var new_data = dataset.filter(function(d) { return d.DirectorName!== ''; });
        new_data  = new_data .filter(function(d) { return d.MovieFacebookLikes!== ''; });
        new_data  = new_data .filter(function(d) { return d.DirectorFacebookLikes!== ''; });
        new_data  = new_data .filter(function(d) { return d.TitleYear!== ''; });

        // console.log(new_data)

        var movieLikeScale = d3.scaleLinear()
        .domain([0,350000]).range([60,600]);

        var directorLikeScale = d3.scaleLinear()
        .domain([0, 25000]).range([340,20]);

        var group  = d3.select('#directors')
            .selectAll("g")
            .data(new_data)
            .enter()
            .append('g')
            .attr("transform", function(d, i){
                return "translate(" + movieLikeScale(d.MovieFacebookLikes)+ "," 
                + directorLikeScale(d.DirectorFacebookLikes) +")";
            });

        group.append("text")
        .attr("class", "director-label")
        .text(function(d){
            return d.DirectorName
        })
        .attr("transform", "translate(0, -10)")
        // .style("color", "#000")

        group.append("circle")
        .attr('r', "5px")    
        .attr("class", "director-circle-solid")
        .attr("fill", function(d, i){
            if (d.DirectorName == "Christopher Nolan"){
                return "red";
            }
            else{
                return "#AEC7E8";
            }
            // ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]
        })
        var svg_dir = d3.select('#directors');

        // axis and stuff
        svg_dir.append('g').attr('class', 'x-axis-director')
            .attr('transform', 'translate(0,340)')
            .call(d3.axisBottom(movieLikeScale).ticks(7));

        svg_dir.append('text')
            .attr('class', 'director-axis')
            .attr('transform','translate(300,380)')
            .text('Movie Facebook Likes');

        svg_dir.append('g').attr('class', 'y-axis-director')
            .attr('transform', 'translate(60,0)')
            .call(d3.axisLeft(directorLikeScale));

        d3.selectAll(".x-axis-director")
            .style("stroke","gray");
        
        d3.selectAll(".y-axis-director")
            .style("stroke","gray");

        svg_dir.append('text')
             .attr('class', 'director-axis')
            .attr('transform','translate(9,250) rotate(-90)')
            .text('Director Facebook Likes');

        svg_dir.append('text')
            .attr('class', 'titles')
            .attr('transform','translate(120,15)')
            .attr("color", "steelblue")
            .text('Director Facebook Likes vs. Movie Facebook Likes');



})


d3.csv('movies.csv', function(row) {
    return {
        'name': row['name'],
        'DirectorFacebookLikes': +row['DirectorFacebookLikes'],
        'MovieFacebookLikes': +row['MovieFacebookLikes'],
        "DirectorName":row["DirectorName"],
        'TitleYear': row['TitleYear']

    };
},
    function(dataset){

        var new_data = dataset.filter(function(d) { return d.DirectorName!== ''; });
        new_data  = new_data .filter(function(d) { return d.MovieFacebookLikes!== ''; });
        new_data  = new_data .filter(function(d) { return d.DirectorFacebookLikes!== ''; });
        new_data  = new_data .filter(function(d) { return d.TitleYear!== ''; });

        new_data = new_data.filter(function(d, i){
            return d.DirectorFacebookLikes <= 1200 && d.MovieFacebookLikes <= 20000;
        })

        // console.log(new_data)

        var movieLikeScale = d3.scaleLinear()
        .domain([0,20000]).range([60,600]);

        var directorLikeScale = d3.scaleLinear()
        .domain([0, 1200]).range([340,20]);

        var group  = d3.select('#directors-zoomed')
            .selectAll("g")
            .data(new_data)
            .enter()
            .append('g')
            .attr("transform", function(d, i){
                return "translate(" + movieLikeScale(d.MovieFacebookLikes)+ "," 
                + directorLikeScale(d.DirectorFacebookLikes) +")";
            });

        group.append("text")
        .attr("class", "director-label")
        .text(function(d){
            return d.DirectorName
        })
        .attr("transform", "translate(0, -10)")
        // .style("color", "#000")

        group.append("circle")
        .attr('r', "5px")    
        .attr("class", "director-circle")
        .attr("fill", function(d, i){
            if (d.DirectorFacebookLikes <= 50){
                return "red";
            }
            // else if (d.TitleYear == "2011"){
            //     return "#f28e2c";
            // }
            // else if (d.TitleYear == "2012"){
            //     return "#e15759";
            // }
            // else if (d.TitleYear == "2013"){
            //     return "#76b7b2";
            // }
            // else if (d.TitleYear == "2014"){
            //     return "#59a14f";
            // }
            // else if (d.TitleYear == "2015"){
            //     return "#edc949";
            // }
            else{
                return "#AEC7E8";
            }
            // ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]
        })
        var svg_dir = d3.select('#directors-zoomed');

        // axis and stuff
        svg_dir.append('g').attr('class', 'x-axis-director')
            .attr('transform', 'translate(0,340)')
            .call(d3.axisBottom(movieLikeScale).ticks(7));

        svg_dir.append('text')
            .attr('class', 'director-axis')
            .attr('transform','translate(300,380)')
            .text('Movie Facebook Likes');

        svg_dir.append('g').attr('class', 'y-axis-director')
            .attr('transform', 'translate(60,0)')
            .call(d3.axisLeft(directorLikeScale));

        d3.selectAll(".x-axis-director")
            .style("stroke","gray");
        
        d3.selectAll(".y-axis-director")
            .style("stroke","gray");

        svg_dir.append('text')
             .attr('class', 'director-axis')
            .attr('transform','translate(9,250) rotate(-90)')
            .text('Director Facebook Likes');

        svg_dir.append('text')
            .attr('class', 'titles')
            .attr('transform','translate(120,15)')
            .attr("color", "steelblue")
            .text('Director Facebook Likes vs. Movie Facebook Likes (Zoomed)');

})



//*****packed bubbles *************************/
// first packed bubbles
d3.csv('movies.csv', function(row) {
    return {
        'name': row['name'],
        'Actor1Name': row['Actor1Name'],
        'MovieFacebookLikes': +row['MovieFacebookLikes']

    };

    },
    function(dataset){
        var filtered = dataset.filter(function(d) { return d.MovieFacebookLikes!== ''; });
        //group cars by language
        nested = d3.nest()
            .key(function(d) {
                // console.log(d.language)
                return d.Actor1Name
            })
            .entries(filtered);
        // values = nested[1].values
        var data = []; 
        var sum;
        var element; 
        nested.forEach((element, i, array) => {
            curr = array[i].values;
            sum = 0;
            curr.forEach ((e, j, value)=> { 
                sum += value[j].MovieFacebookLikes
                actor = value[j].Actor1Name
            })

            //now we have our sum and actor name
            // console.log(actor, sum)
            element = {"Name": actor, "Count": sum};
            data.push(element)

        });

        bubble_dataset={"children":data}
        var diameter = 600;
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var bubble = d3.pack(bubble_dataset)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select("#bubbles")
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var nodes = d3.hierarchy(bubble_dataset)
            .sum(function(d) { return d.Count; });

        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("title")
            .text(function(d) {
                return d.Name + ": " + d.Count + "likes";
            });

        node.append("circle")
            .attr("class", "bubble")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return color(i);
            });

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Name.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Count;
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        d3.select(self.frameElement)
            .style("height", diameter + "px");

})


// second packed bubbles
d3.csv('movies.csv', function(row) {
    return {
        'name': row['name'],
        'Actor1Name': row['Actor1Name'],
        'MovieFacebookLikes': +row['MovieFacebookLikes']

    };

    },
    function(dataset){
        var filtered = dataset.filter(function(d) { return d.MovieFacebookLikes!== ''; });
        //group cars by language
        nested = d3.nest()
            .key(function(d) {
                // console.log(d.language)
                return d.Actor1Name
            })
            .entries(filtered);
        // values = nested[1].values
        var data = []; 
        var sum;
        var element; 
        nested.forEach((element, i, array) => {
            curr = array[i].values;
            sum = 0;
            curr.forEach ((e, j, value)=> { 
                sum += value[j].MovieFacebookLikes
                actor = value[j].Actor1Name
            })

            //now we have our sum and actor name
            // console.log(actor, sum)
            element = {"Name": actor, "Count": sum};
            data.push(element)

        });

        data = data.filter(function(d) { return d["Count"]>= 200000; });

        bubble_dataset={"children":data}
        var diameter = 600;
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var bubble = d3.pack(bubble_dataset)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select("#bubbles-zoomed")
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var nodes = d3.hierarchy(bubble_dataset)
            .sum(function(d) { return d.Count; });

        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("title")
            .text(function(d) {
                return d.Name + ": " + d.Count + "likes";
            });

        node.append("circle")
            .attr("class", "bubble")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return color(i);
            });

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Name.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Count;
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        d3.select(self.frameElement)
            .style("height", diameter + "px");

})

// second round of bubbles
// 1st bubbles
d3.csv('movies.csv', function(row) {
    return {
        'name': row['name'],
        'Actor1Name': row['Actor1Name'],
        'Gross': +row['Gross']

    };

    },
    function(dataset){
        var filtered = dataset.filter(function(d) { return d.Gross!== ''; });
        //group cars by language
        nested = d3.nest()
            .key(function(d) {
                // console.log(d.language)
                return d.Actor1Name
            })
            .entries(filtered);
        // values = nested[1].values
        var data = []; 
        var sum;
        var element; 
        nested.forEach((element, i, array) => {
            curr = array[i].values;
            sum = 0;
            curr.forEach ((e, j, value)=> { 
                sum += value[j].Gross
                actor = value[j].Actor1Name
            })

            //now we have our sum and actor name
            // console.log(actor, sum)
            element = {"Name": actor, "Count": sum};
            data.push(element)

        });

        // data = data.filter(function(d) { return d["Count"]>= 200000; });

        bubble_dataset={"children":data}
        var diameter = 600;
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var bubble = d3.pack(bubble_dataset)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select("#bubbles2")
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var nodes = d3.hierarchy(bubble_dataset)
            .sum(function(d) { return d.Count; });

        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("title")
            .text(function(d) {
                return d.Name + ": " + d.Count + "likes";
            });

        node.append("circle")
            .attr("class", "bubble")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return color(i);
            });

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Name.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Count;
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        d3.select(self.frameElement)
            .style("height", diameter + "px");

})

// 2nd bubbles
d3.csv('movies.csv', function(row) {
    return {
        'name': row['name'],
        'Actor1Name': row['Actor1Name'],
        'Gross': +row['Gross']

    };

    },
    function(dataset){
        var filtered = dataset.filter(function(d) { return d.Gross!== ''; });
        //group cars by language
        nested = d3.nest()
            .key(function(d) {
                // console.log(d.language)
                return d.Actor1Name
            })
            .entries(filtered);
        // values = nested[1].values
        var data = []; 
        var sum;
        var element; 
        nested.forEach((element, i, array) => {
            curr = array[i].values;
            sum = 0;
            curr.forEach ((e, j, value)=> { 
                sum += value[j].Gross
                actor = value[j].Actor1Name
            })

            //now we have our sum and actor name
            // console.log(actor, sum)
            element = {"Name": actor, "Count": sum};
            data.push(element)

        });

        data = data.filter(function(d) { return d["Count"]>= 500000000; });

        bubble_dataset={"children":data}
        var diameter = 600;
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var bubble = d3.pack(bubble_dataset)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select("#bubbles2-zoomed")
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var nodes = d3.hierarchy(bubble_dataset)
            .sum(function(d) { return d.Count; });

        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("title")
            .text(function(d) {
                return d.Name + ": " + d.Count + "likes";
            });

        node.append("circle")
            .attr("class", "bubble")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return color(i);
            });

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Name.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Count;
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        d3.select(self.frameElement)
            .style("height", diameter + "px");

})


// 3rd bubbles
d3.csv('movies.csv', function(row) {
    return {
        'name': row['name'],
        'Actor1Name': row['Actor1Name'],
        'IMDB Score': +row['IMDB Score']

    };

    },
    function(dataset){
        var filtered = dataset.filter(function(d) { return d['IMDB Score']!== ''; });
        //group cars by language
        nested = d3.nest()
            .key(function(d) {
                // console.log(d.language)
                return d.Actor1Name
            })
            .entries(filtered);
        // values = nested[1].values
        var data = []; 
        var sum;
        var element; 
        nested.forEach((element, i, array) => {
            curr = array[i].values;
            sum = 0;
            curr.forEach ((e, j, value)=> { 
                sum += value[j]['IMDB Score']
                actor = value[j].Actor1Name
            })

            //now we have our sum and actor name
            // console.log(actor, sum)
            element = {"Name": actor, "Count": sum};
            data.push(element)

        });

        data = data.filter(function(d) { return d["Count"]>= 40; });

        bubble_dataset={"children":data}
        var diameter = 450;
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var bubble = d3.pack(bubble_dataset)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select("#bubbles3")
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var nodes = d3.hierarchy(bubble_dataset)
            .sum(function(d) { return d.Count; });

        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("title")
            .text(function(d) {
                return d.Name + ": " + d.Count + "likes";
            });

        node.append("circle")
            .attr("class", "bubble")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return color(i);
            });

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Name.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Count;
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        d3.select(self.frameElement)
            .style("height", diameter + "px");

})
// 4th bubbles
d3.csv('movies.csv', function(row) {
    return {
        'name': row['name'],
        'Actor1Name': row['Actor1Name'],
        'Num User for Reviews': +row['Num User for Reviews']

    };

    },
    function(dataset){
        var filtered = dataset.filter(function(d) { return d['Num User for Reviews']!== ''; });
        //group cars by language
        nested = d3.nest()
            .key(function(d) {
                // console.log(d.language)
                return d.Actor1Name
            })
            .entries(filtered);
        // values = nested[1].values
        var data = []; 
        var sum;
        var element; 
        nested.forEach((element, i, array) => {
            curr = array[i].values;
            sum = 0;
            curr.forEach ((e, j, value)=> { 
                sum += value[j]['Num User for Reviews']
                actor = value[j].Actor1Name
            })

            //now we have our sum and actor name
            // console.log(actor, sum)
            element = {"Name": actor, "Count": sum};
            data.push(element)

        });

        data = data.filter(function(d) { return d["Count"]>= 2000; });

        bubble_dataset={"children":data}
        var diameter = 450;
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var bubble = d3.pack(bubble_dataset)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select("#bubbles4")
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var nodes = d3.hierarchy(bubble_dataset)
            .sum(function(d) { return d.Count; });

        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("title")
            .text(function(d) {
                return d.Name + ": " + d.Count + "likes";
            });

        node.append("circle")
            .attr("class", "bubble")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return color(i);
            });

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Name.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Count;
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        d3.select(self.frameElement)
            .style("height", diameter + "px");

})

// 5th bubbles
d3.csv('movies.csv', function(row) {
    return {
        'name': row['name'],
        'Actor1Name': row['Actor1Name'],
        'Budget': +row['Budget']

    };

    },
    function(dataset){
        var filtered = dataset.filter(function(d) { return d['Budget']!== ''; });
        //group cars by language
        nested = d3.nest()
            .key(function(d) {
                // console.log(d.language)
                return d.Actor1Name
            })
            .entries(filtered);
        // values = nested[1].values
        var data = []; 
        var sum;
        var element; 
        nested.forEach((element, i, array) => {
            curr = array[i].values;
            sum = 0;
            curr.forEach ((e, j, value)=> { 
                sum += value[j]['Budget']
                actor = value[j].Actor1Name
            })

            //now we have our sum and actor name
            // console.log(actor, sum)
            element = {"Name": actor, "Count": sum};
            data.push(element)

        });

        data = data.filter(function(d) { return d["Count"]>= 300000000; });

        bubble_dataset={"children":data}
        var diameter = 450;
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var bubble = d3.pack(bubble_dataset)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select("#bubbles5")
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var nodes = d3.hierarchy(bubble_dataset)
            .sum(function(d) { return d.Count; });

        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("title")
            .text(function(d) {
                return d.Name + ": " + d.Count + "likes";
            });

        node.append("circle")
            .attr("class", "bubble")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return color(i);
            });

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Name.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Count;
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "black");

        d3.select(self.frameElement)
            .style("height", diameter + "px");

})


var ratings = d3.select("#ratings"),
margin = 200,
width = ratings.attr("width") - margin,
height = ratings.attr("height") - margin


var ratings_x = d3.scaleBand().range([0, width]).padding(0.4),
ratings_y = d3.scaleLinear().range([height, 0]);

var g = ratings.append("g")
.attr("transform", "translate(" + 100 + "," + 100 + ")");

d3.csv("movies.csv", function(row) {
    return {
    'name': row['name'],
    'Content Rating': row['Content Rating'],
    'MovieFacebookLikes': +row['MovieFacebookLikes']

    };

},
    function(dataset){
    // filtering out the null values
    var filtered = dataset.filter(function(d) { return d["Content Rating"]!== '' && d["Content Rating"]!== 'Unrated' && d["Content Rating"]!== 'Not Rated'; });
    filtered = filtered.filter(function(d) { return d["MovieFacebookLikes"]!== ''});

    nested = d3.nest()
        .key(function(d) {
            return d['Content Rating']
        })
        .entries(filtered);

    var data = []
    var sum;
    var rating;
    nested.forEach((element, i, array) => {
        sum = array[i].values.length;
        // console.log(sum)
        rating = array[i].key
        element = {key: rating, value: sum};
        data.push(element)
    });
    // Get layout parameters
    var svgWidth = +ratings.attr('width');
    var svgHeight = +ratings.attr('height');
    var padding = {t: 60, r: 40, b: 30, l: 40};
    // Compute chart dimensions
    var chartWidth = svgWidth - padding.l - padding.r;
    var chartHeight = svgHeight - padding.t - padding.b;

    // Compute the spacing for bar bands based on all 26 letters
    // barBand can be used to space out your bars evenly.
    var barBand = chartHeight / 26;
    var barHeight = barBand * 2;
    var chartG = ratings.append('g')
        .attr('transform', 'translate('+[padding.l, padding.t]+')');

        // Add your bars to this group with chartG.selectAll('.bar').data()
    chartG.selectAll('.bar').data();
        valueScale =  d3.scaleLinear()
        .domain([0, d3.max(data, function(d){
            return d.value;
        })])
        .range([0, chartWidth]);

    y = d3.scaleBand()
        .domain(d3.range(dataset.length))
        .padding(0.1)

    ratings_x = d3.scaleLinear()
        .domain([0, 600])
        .range([0, chartWidth]);

    var xBottomAxis = d3.axisBottom(valueScale)
        .ticks(6)
        // .tickFormat(formatPercent);

    var xTopAxis = d3.axisTop(ratings_x)
        .ticks(6)
        // .tickFormat(formatPercent);

    chartG.append("g")
        .style("font", "10px times")
        .attr("transform", "translate(0,-5)")
        .attr("class", "top-x-axis")
        .call(xTopAxis);

    chartG.append("g")
        .style("font", "10px times")
        .attr("transform", "translate(0," + chartHeight + ")")
        .attr("class", "bottom-x-axis")
        .call(xBottomAxis);

    // chartG.append("text")
    // .attr('x', (chartWidth / 2))
    // .attr("y", chartHeight + 25)
    // .attr("text-anchor", "middle")  
    // .style("font", "8px times")  
    // .attr("color", "steelblue")
    // .text("Movie Facebook Likes");

    chartG.append("text")
        .attr("x", (chartWidth / 2))             
        .attr("y", -35)
        .attr("text-anchor", "middle")  
        .style("font", "16px arial")  
        .attr("color", "steelblue")
        .text("Content Rating vs. Movie Facebook Likes");

    var bar = chartG.selectAll('.bar')
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d, i) {
            return "translate(0," + i * barBand*2.3 + ")";
        });



    var legend = d3.select("#legend-bar")
    var keys = ["PG-13", "R", "TV-14", "PG","TV-PG","G","TV-G","TV-Y","TV-MA","NC-17","TV-Y7"]

    // var color = d3.scaleOrdinal()
    //     .domain(keys)
    //     .range(d3.schemeCategory20);
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#AEC7E8", "#1F77B4", "#AEC7E8", "#AEC7E8", "#AEC7E8", "#AEC7E8", "#AEC7E8", "#AEC7E8", "#AEC7E8", "#AEC7E8", "#AEC7E8"]);


    bar.append("rect")
        .attr("width", function(d){
            return valueScale(d.value)
        })
        .attr("y", function(d, i){
            return y(d.key);
        })
        .attr("height", barHeight)
        .attr("fill", function(d){
            // console.log(d.key)
            return color(d.key)
        })


    bar.append("text")
        .attr("x", -40)
        .style("font", "12px times")
        .attr("y", barHeight/2)
        .attr("dy", "0.35em")
        .text(function(d){
            return d.key;
    })

    d3.selectAll(".top-x-axis")
        .style("stroke","gray");

    d3.selectAll(".bottom-x-axis")
        .style("stroke","gray");

    // Add one dot in the legend for each name.

    var legend_keys = ["Others", "R"]
    legend.selectAll("mylabels")
        .data(legend_keys)
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", function(d,i){ return 15 + i*20}) // 100 is where the first dot appears. 25 is the distance between dots
        // .style("opacity", function(d,i){
        //     if (d == "R"){
        //         return 1.0;
        //     }
        //     else {
        //         return 0.5;
        //     }
        // })
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("font", "11px times")
        .style("alignment-baseline", "middle")


    // Add one dot in the legend for each name.
    legend.selectAll("mydots")
        .data(legend_keys)
        .enter()
        .append("circle")
        .attr("class", "bar-legend")
        .attr("cx", 10)
        .attr("cy", function(d,i){ return 15 + i*20}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 5)
        // .style("opacity", function(d,i){
        //     if (d == "R"){
        //         return 1.0;
        //     }
        //     else {
        //         return 0.5;
        //     }
        // })
        .style("fill", function(d){ return color(d)})

}
);

// cast total facebook likes
//duration
// budget

//************pie char stuff */


/*	Function: renderPieChart
*	Variables:
*		*	dataset: contains the input data for plotting the pie chart,
*					input should be in the form of array of objects where each object should be like {label: , value: }
*		*	dom_element_to_append_to : class name of the div element where the graph have to be appended
*	Contains transitions and hover effects, load the css file 'css/pieChart.css' at the top of html page where the pie chart has to be loaded
*/
function renderPieChart1 (dataset,dom_element_to_append_to, colorScheme){

    var margin = {top:50,bottom:50,left:50,right:50};
    var width = 600 - margin.left - margin.right,
    height = width,
    radius = Math.min(width, height) / 2;
    var donutWidth =100;
    var legendRectSize = 18;
    var legendSpacing = 4;

    dataset.forEach(function(item){
        item.enabled = true;
    });

    var color = d3.scaleOrdinal()
    .range(colorScheme);

    var svg = d3.select(dom_element_to_append_to)
    .append("svg")
    .attr("width", width + 300)
    .attr("height", height + 800)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 1.5 + ")");

    var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - donutWidth);

    var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.value; });


    var path = svg.selectAll('path')
    .data(pie(dataset))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d, i) {
        return color(d.data.label);
    })
    .each(function(d) { this._current = d; });


    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([0, 0])
    .html(function(d) {
        var total = d3.sum(dataset.map(function(d) {
            return (d.enabled) ? d.value : 0;
        }));
        var percent = Math.round(1000 * d.data.value / total) / 10;

        return d.data.label + " " + percent + "%";
    });

    svg.call(toolTip)

    path.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);
    
    


    var legend = svg.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset =  height * color.domain().length / 2;
        var horz = -2 * legendRectSize + 350;
        var vert = i * height - offset +20;
        return 'translate(' + horz + ',' + vert + ')';
    });

    legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color)
    .on('click', function(label) {
        var rect = d3.select(this);
        var enabled = true;
        var totalEnabled = d3.sum(dataset.map(function(d) {
            return (d.enabled) ? 1 : 0;
        }));

        if (rect.attr('class') === 'disabled') {
            rect.attr('class', '');
        } else {
            if (totalEnabled < 2) return;
            rect.attr('class', 'disabled');
            enabled = false;
        }

        pie.value(function(d) {
            if (d.label === label) d.enabled = enabled;
            return (d.enabled) ? d.value : 0;
        });

        path = path.data(pie(dataset));

        path.transition()
        .duration(750)
        .attrTween('d', function(d) {
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        });
    });


    legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { return d; })


    svg.append("text")
    .attr('x', -120)
    .attr('y', -height/2 - 60)
    .text("Movie Facebook Likes by Language");

};

function renderPieChart2 (dataset,dom_element_to_append_to, colorScheme){

    var margin = {top:50,bottom:50,left:50,right:50};
    var width = 600 - margin.left - margin.right,
    height = width,
    radius = Math.min(width, height) / 2;
    var donutWidth = 100;
    var legendRectSize = 18;
    var legendSpacing = 4;

    dataset.forEach(function(item){
        item.enabled = true;
    });

    var color = d3.scaleOrdinal()
    .range(colorScheme);

    var svg = d3.select(dom_element_to_append_to)
    .append("svg")
    .attr("width", width + 300)
    .attr("height", height + 800)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 1.5 + ")");

    var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - donutWidth);

    var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.value; });


    var path = svg.selectAll('path')
    .data(pie(dataset))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d, i) {
        return color(d.data.label);
    })
    .each(function(d) { this._current = d; });


    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([0, 0])
    .html(function(d) {
        var total = d3.sum(dataset.map(function(d) {
            return (d.enabled) ? d.value : 0;
        }));
        var percent = Math.round(1000 * d.data.value / total) / 10;

        return d.data.label + " " + percent + "%";
    });

    svg.call(toolTip)

    path.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);
    


    var legend = svg.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset =  height * color.domain().length / 2;
        var horz;
        var vert;

        if (i * height - offset +250 <=217 ){
            vert = i * height - offset +250 
            horz =  -2 * legendRectSize + 300;
        }
        else{
            vert =  (i-25) * height - offset +250 
            horz = -2 * legendRectSize + 450;
        }
        
        // if (i < 25){
        //     console.log(vert)
        // }

        return 'translate(' + horz + ',' + vert + ')';
    });

    legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color)
    .on('click', function(label) {
        var rect = d3.select(this);
        var enabled = true;
        var totalEnabled = d3.sum(dataset.map(function(d) {
            return (d.enabled) ? 1 : 0;
        }));

        if (rect.attr('class') === 'disabled') {
            rect.attr('class', '');
        } else {
            if (totalEnabled < 2) return;
            rect.attr('class', 'disabled');
            enabled = false;
        }

        pie.value(function(d) {
            if (d.label === label) d.enabled = enabled;
            return (d.enabled) ? d.value : 0;
        });

        path = path.data(pie(dataset));

        path.transition()
        .duration(750)
        .attrTween('d', function(d) {
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        });
    });


    legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { return d; })


    svg.append("text")
    .attr('x', -120)
    .attr('y', -height/2 -60)
    .text("Movie Facebook Likes by Country");
};

// var inputData = [{label:"Category 1",value:25},{label:"Category 2",value:12},{label:"Category 3",value:35},{label:"Category 4",value:30},{label:"Category 5",value:18}];

var colorScheme = ["#d3d3d3","steelblue","#00ffff",  "#00bfff","#f4a460"
,"#0000ff","#a020f0","#f08080","#adff2f","#ff6347","#da70d6","#ff00ff","#ffff54",
"#6495ed","#dda0dd","#90ee90","#87ceeb","#ff1493","#7b68ee","#7fffd4","#ffdab9","#ff69b4",
"#ffc0cb","navy","#fbaed2","violet", "#556b2f","#8b4513","#6b8e23","#a52a2a",
"#2e8b57","#708090","#483d8b","#008000","#bc8f8f","#b8860b","#bdb76b", 
"#008b8b","#d2691e","#9acd32","#00008b", "#32cd32", "#8fbc8f",
"#800080", "#b03060", "#9932cc", "#ff8c00", "#ffd700",
"#0000cd", "#00ff00","#00ff7f", "#dc143c", "red"];
// renderPieChart(inputData,"#pie1",colorScheme);


d3.csv("movies.csv", function(row) {
    return {
    'name': row['name'],
    'language': row['language'],
    'MovieFacebookLikes': +row['MovieFacebookLikes']

    };

},
    function(dataset){
        var filtered = dataset.filter(function(d) { return d["language"]!== ''});
        filtered = filtered.filter(function(d) { return d["MovieFacebookLikes"]!== ''});
    
        nested = d3.nest()
            .key(function(d) {
                return d['language']
            })
            .entries(filtered);
    
        var data = []
        var sum;
        var rating;
        nested.forEach((element, i, array) => {
            sum = array[i].values.length;
            // console.log(sum)
            rating = array[i].key
            element = {label: rating, value: sum};
            data.push(element)
        });
        // console.log(data)
        renderPieChart1(data,"#pie1",colorScheme);

        

    });

d3.csv("movies.csv", function(row) {
        return {
        'name': row['name'],
        'Country': row['Country'],
        'MovieFacebookLikes': +row['MovieFacebookLikes']
    
        };
    
    },
        function(dataset){
            var filtered = dataset.filter(function(d) { return d['Country']!== '' });
            filtered = filtered.filter(function(d) { return d["MovieFacebookLikes"]!== ''});
            // console.log(dataset)
        
            nested = d3.nest()
                .key(function(d) {
                    return d['Country']
                })
                .entries(filtered);
        
            var data = []
            var sum;
            var rating;
            nested.forEach((element, i, array) => {
                sum = array[i].values.length;
                // console.log(sum)
                rating = array[i].key
                element = {label: rating, value: sum};
                data.push(element)
            });
            console.log(data)
            renderPieChart2(data,"#pie2",colorScheme);
    
            
    
        });




        