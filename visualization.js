function generateVis(gdata, adata, canvas){
  
  console.log(adata);
  //Data for individual Publications
  var indPub = [];
  for(var i=0;i<adata.length;i++){
    indPub.push(adata[i].ConfsPerYear); 
  }

  
  var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;
  
  //Clearing the contents of SVG before second search
  svg.selectAll("*").remove();

  var minYear=2017;
  var maxYear=0;
  var minCount=1000;
  var maxCount=0;
  var N = indPub.length;
  for (var i=0;i<N;i++){
    var temp1 = d3.min(indPub[i], function(d){return d.Year;})
    var temp2 = d3.max(indPub[i], function(d){return d.Year;})
    var temp3 = d3.min(indPub[i], function(d){return d.Value;})
    var temp4 = d3.max(indPub[i], function(d){return d.Value;})
    if (temp1<minYear)
      minYear = temp1;
    if (temp2 >maxYear)
      maxYear = temp2;
    if (temp3<minCount)
      minCount=temp3;
    if (temp4>maxCount)
      maxCount = temp4;
  }
  var xDomain = [];
  for(var i=0;i<maxYear-minYear+1;i++){
    xDomain.push(+minYear+i);
  }

  for (var j=0;j<N;j++){

    data = indPub[j];
    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([(j+1)*height/N, j*height/N]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

      //x.domain(data.map(function(d) { return d.Year; }));
      x.domain(xDomain);
      //y.domain([0, d3.max(data, function(d) { return d.Value; })]);
      y.domain([0,maxCount]);
      
      if (j==0){
        //Adding names of coauthors 
        g.selectAll(".names")
          .data(adata)
          .enter().append("text")
          .attr("class", "names")
          .attr("x", 0)
          .attr("y", function(d,i){return (i+1)*height/N-5})
          .text(function(d){return d.Name });

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(2))
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Frequency");
      

        //Drawing horizontal bar charts to mark start year of each coauthor 
        g.selectAll(".hbar")
          .data(gdata)
          .enter().append("rect")
            .attr("class", "hbar")
            .attr("x", function(d) { return x(d.StartYear); })
            .attr("y", function(d,i) { return (i)*height/N;})
            .attr("width", width+50)
            .attr("height",height/N);
    
      }
      g.selectAll(".bar")
        .data(indPub[j])
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.Year); })
          .attr("y", function(d) { return y(d.Value); })
          .attr("width", x.bandwidth())
          .attr("height", function(d) { return (j+1)*height/N - y(d.Value); })
          .on("mouseover",function(d){document.getElementById("tp").setAttribute("data-tooltip", d.Value);})
      
      //Adding bars for mutual publications
      g.selectAll(".mbar")
        .data(gdata[j].MutualPubPerYear)
        .enter().append("rect")
          .attr("class", "mbar")
          .attr("x", function(d) { return x(d.Year); })
          .attr("y", function(d) { return y(d.Value); })
          .attr("width", x.bandwidth())
          .attr("height", function(d) { return (j+1)*height/N - y(d.Value); })
          .on("mousemove", function(d){
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html((d.Year) + "<br>" + "£" + (d.Value));
        })
        .on("mouseout", function(d){ tooltip.style("display", "none");});
    
      //Adding horizontal lines 
      g.append("g")
       .attr("transform", "translate(0, "+(j+1)*height/N+")")
       .append("line")
       .attr("x2", width)
       .attr("stroke", "#6b6b6b")
       .attr("stroke-width", "0.5px");

  }
  g.append("g")
       .attr("transform", "translate("+x(2008)+", 0)")
       .append("line")
       .attr("y2", 450)
       .attr("stroke", "#6b6b6b")
       .attr("stroke-width", "0.5px");

}