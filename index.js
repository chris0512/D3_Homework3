let scatterLeft = 0, scatterTop = 0;
let scatterTotalWidth = 500, scatterTotalHeight = 400;
let scatterMargin = {top: 10, right: 30, bottom: 30, left: 100},
    scatterWidth = scatterTotalWidth - scatterMargin.left - scatterMargin.right,
    scatterHeight = scatterTotalHeight - scatterMargin.top - scatterMargin.bottom;

let lineLeft = 0, lineTop = 400; //400 actually is scatterTotalHeight
let lineTotalWidth = 600, lineTotalHeight = 100;
let lineMargin = {top: 10, right: 30, bottom: 10, left: 100},
    lineWidth = lineTotalWidth  - lineMargin.left - lineMargin.right,
    lineHeight = lineTotalHeight - lineMargin.top - lineMargin.bottom;

let barLeft = 0, barTop = 500; //500 actually is scatterTotalHeight + lineTotalHeight
let barTotalWidth = 1000, barTotalHeight = 150;
let barMargin = {top: 30, right: 30, bottom: 40, left: 100},
    barWidth = barTotalWidth - barMargin.left - barMargin.right,
    barHeight = barTotalHeight - barMargin.top - barMargin.bottom;

let mapLeft = 500-200, mapTop = 0-150;
let mapTotalWidth = 1000, mapTotalHeight = 800;
let mapMargin = {top: 10, right: 10, bottom: 10, left: 10},
    mapWidth = mapTotalWidth - mapMargin. left - mapMargin. right,
    mapHeight = mapTotalHeight - mapMargin. top - mapMargin. bottom;

//----- Data Process -----//
d3.csv("highPollution.csv").then(Data =>{
    Data.forEach(function(d){
        d.siteID = Number(d.siteID);
        d.year = Number(d.year);
        d.month = Number(d.month);
        d.day = Number(d.day);
        d.hour = Number(d.hour);
        d.weekday = Number(d.weekday);
        d.gps_lat = Number(d.gps_lat);
        d.gps_lon = Number(d.gps_lon);
        d.umapX = Number(d.umapX);
        d.umapY = Number(d.umapY);
        d.value= d.value.match(/\d+(?:\.\d+)?/g).map(Number);
    });

    console.log(Data)

    // scatter
    let scatter_Y_Scale = d3.scaleLinear()
        .domain([d3.max(Data, d=>d.umapY), d3.min(Data, d=>d.umapY)])
        .range([0, scatterHeight]);
    let scatter_Y_axis = d3.axisLeft(scatter_Y_Scale);

    let scatter_X_Scale = d3.scaleLinear()
        .domain([d3.max(Data, d=>d.umapX), d3.min(Data, d=>d.umapX)])
        .range([scatterWidth, 0])
    let scatter_X_axis = d3.axisBottom(scatter_X_Scale);

    let g_scatter = d3.select('svg')
        .append('g')
        .attr("transform", `translate(${scatterLeft},${scatterTop})`)

    //Scatter: Axis
    let g_scatter_Y_axis = g_scatter.append('g')
        .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`)
        .call(scatter_Y_axis)
        .selectAll("text").remove();
    let g_scatter_X_axis = g_scatter.append('g')
        .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top + scatterHeight})`)
        .call(scatter_X_axis)
        .selectAll("text").remove();

    //calculate average function
    const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

    //circle color
    let circle_color = d3.scaleSequential()
        .domain([d3.min(Data, d=>average(d.value)), d3.max(Data, d=>average(d.value))])

    let circle_g = g_scatter.append('g')
        .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`)

    //Scatter: draw the circles
    let circle = circle_g.selectAll("circle")
        .data(Data).enter()
        .append("circle")
        .attr("cx", function(d, i){
            return scatter_X_Scale(d.umapX);  })
        .attr("cy", function(d, i){
            return scatter_Y_Scale(d.umapY);  })
        .attr("r", 1.5)
        .attr("fill", function(d, i){
            return d3.interpolateReds(circle_color(average(d.value)));  })

    //----- Line Chart -----//
    let line_Y_scale = d3.scaleLinear()
        .domain([d3.max(Data, d=>Math.max(...d.value)), d3.min(Data, d=>Math.min(...d.value))])
        .range([0, lineHeight]);
    let lineYaxis = d3.axisLeft(line_Y_scale);

    let line_X_scale = d3.scaleLinear()
        .domain([3, -3])
        .range([lineWidth, 0])

    let line_X_axis = d3.axisBottom(line_X_scale).ticks(7);

    let g_line = d3.select('svg')
        .append('g')
        .attr("transform", `translate(${lineLeft},${lineTop})`)

    //Line: axis
    let g_line_Y_axis = g_line.append('g')
        .attr("transform", `translate(${lineMargin.left},${lineMargin.top})`)
        .call(lineYaxis)

    let g_line_X_axis = g_line.append('g')
        .attr("transform", `translate(${lineMargin.left},${lineMargin.top + lineHeight})`)
        .call(line_X_axis)

    //Line: yLabel
    g_line_Y_axis.append("text")
        .attr("x", -((lineHeight)/2))
        .attr("y", -(lineMargin.left/2))
        //.attr("font-size", "6px")
        .attr("text-anchor", "middle")
        .attr("fill","black")
        .attr("transform", "rotate(-90)")
        .text("PM2.5");
    //Line: xLabel
    g_line_X_axis.append("text")
        .attr("x", lineWidth/2)
        .attr("y", lineMargin.bottom + lineMargin.top*2)
        .text("Local Time (hour)").attr("fill","black");

    let line_g = g_line.append('g')
        .attr("transform", `translate(${lineMargin.left},${lineMargin.top})`)

    let line_hour_value = [];

    Data.forEach(function(d){
        d.value.forEach(function(s,i){
            let obj = new Object();
            obj.hour=i-3
            obj.value=s
            line_hour_value.push(obj)
        })
    })

    console.log(line_hour_value)
    let lineGenerator = d3.line()
        .x(d=>line_X_scale(d.hour))
        .y(d=>line_Y_scale(d.value))

    //line: draw the path
    let line = line_g.append("path")
        .attr("fill","none")
        .attr("stroke","black")
        .attr('stroke-width',0.5)
        .style("opacity", 0.1)
        .attr("d", lineGenerator(line_hour_value))

    //----- Bar Chart -----//
    let bar_value = d3.nest()          //bar_value: (['day', 'values']['hour', 'value'])
        .key(function(d) { return d.day; })
        .key(function(d) { return d.hour; })
        .rollup(function(v) { return v.length; })
        .entries(Data);

    let max_bar_Y=0;
    let min_bar_Y=100;
    let bar_value_num=0;    //total amount of devices
    let bar_day_hour=[];    //('time', 'value', 'hour') value is amount of devices

    bar_value.forEach(function(d){
        d.values.forEach(function(v){
            let obj = new Object();

            if(v.key.length==1)
                obj.time=d.key+'-0'+v.key;
            else
                obj.time=d.key+'-'+v.key;

            obj.value=v.value;
            obj.hour=v.key;
            bar_day_hour.push(obj)
            if(v.value>max_bar_Y)
                max_bar_Y=v.value;
            if(v.value<min_bar_Y)
                min_bar_Y=v.value;
            bar_value_num++;
        })
    })
    bar_day_hour.sort((a, b) => d3.ascending(a.time, b.time))

    let bar_Y_Scale = d3.scaleLinear()
        .domain([max_bar_Y, min_bar_Y])
        .range([0, barHeight]);

    let bar_X_Scale = d3.scaleBand()
        .domain(bar_day_hour.map(d =>d.time))
        .range([0,barWidth]);
    let barXtickValues = (bar_day_hour.map(d =>d.time)).filter((d,i)=>i%2!=0)

    let g_bar = d3.select('svg')
        .append('g')
        .attr("transform", `translate(${barLeft},${barTop})`);

    //Bar: Axis
    let barYaxis = d3.axisLeft(bar_Y_Scale).ticks(6);
    let barXaxis = d3.axisBottom(bar_X_Scale);
    let barXaxis2 = d3.axisBottom(bar_X_Scale)
        .tickValues(barXtickValues);

    let g_bar_Y_axis = g_bar.append('g')
        .attr("transform", `translate(${barMargin.left},${barMargin.top})`)
        .call(barYaxis);

    let g_bar_X_axis = g_bar.append('g')
        .attr("transform", `translate(${barMargin.left},${barMargin.top + barHeight})`)
        .call(barXaxis)
        .selectAll("text").remove();

    g_bar_X_axis = g_bar.append('g')
        .attr("transform", `translate(${barMargin.left},${barMargin.top + barHeight})`)
        .call(barXaxis2)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)")

    //Bar: yLabel
    g_bar_Y_axis.append("text")
        .attr("x", -((barHeight)/2))
        .attr("y", -(barMargin.left/2))
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("fill","black")
        .text("Numbr of Devices");
    //Bar: xLabel
    g_bar.append('g')
        .attr("transform", `translate(${barMargin.left},${barMargin.top + barHeight})`)
        .append("text")
        .attr("x", barWidth/2)
        .attr("y", barMargin.top*1.5)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill","black")
        .text("Time");

    let bar_color = d3.scaleSequential()
        .domain([0,23])

    //Bar: draw the rect
    let rects = g_bar.append('g')
        .attr("transform", `translate(${barMargin.left},${barMargin.top})`)
        .selectAll("rect").data(bar_day_hour)
        .enter().append("rect")
        .attr("y", d => bar_Y_Scale(d.value))
        .attr("x", (d) => bar_X_Scale(d.time))
        .attr("width", barWidth/bar_value_num-1)
        .attr("height", d => barHeight - bar_Y_Scale(d.value))
        .attr("stroke", "black")
        .attr("fill", function(d, i){
            return d3.interpolateBuGn(bar_color(d.hour));
        })

    //----- Map and Customized Mark -----//
    let g_map = d3.select('svg')
        .append('g')
        .attr("transform", `translate(${mapLeft},${mapTop})`)

    let gDrawMap= d3.json("taiwan.json").then(drawTaiwan)

    function drawTaiwan(taiwan) {
        var width = mapWidth;
        var height = mapHeight;

        var projection = d3.geoMercator()
            .fitExtent([[0,0], [width, height]], taiwan);

        var geoGenerator = d3.geoPath()
            .projection(projection);

        //Map: draw the map
        var paths = g_map.append('g')
            .selectAll('path')
            .data(taiwan.features)
            .enter()
            .append('path')
            .attr('stroke', "black")
            .attr('fill', 'white')
            .attr('d', geoGenerator);

        // Customized Mark(pin) svg
        // var pin_d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"
        var pin_d="m6 0c-2.099 0-4 1.702-4 3.801 0 2.099 1.734 4.605 4 8.199 2.265-3.594 4-6.1 4-8.199 0-2.099-1.901-3.801-4-3.801zm0 5.5c-.828 0-1.5-.671-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.671 1.5-1.5 1.5z"

        //Map: draw the Customized Mark
        draw_pushpin = g_map.append('g')
            .selectAll(".pushpin")
            .data(Data).enter()
            .append("path")
            .attr("class",".pushpin")
            .attr("d", pin_d)
            .attr("fill", "red")
            .attr("stroke", "black")
            .attr("stroke-width", 0.3)
            .attr("transform", function(d){
                return `translate(${projection([d.gps_lon,d.gps_lat])[0]},${projection([d.gps_lon,d.gps_lat])[1]})`
            });

    }

}).catch(function(error){
    console.log(error);
});



  