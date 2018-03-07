function generateVis(gdata, adata, canvas,pdata,aName, allAuthorsData){
  
  //console.log(gdata);
  //console.log(adata);
  var isFound = true; //Assume author exist in the records
  var main_author = getAuthorObjectByName(allAuthorsData, aName);
  if (typeof main_author === "undefined") {
    isFound = false ; // Author not found [Auhtor deosn't belong to VIS authors]
    document.getElementById("name").innerHTML = '<span style="color:red">' + "Author not found!";
    //Clear the previous conetens here

}
if(isFound) {
  var main_author_start_year = d3.min(main_author.AllPublicationsPerYear, function(d){return d.Year});
  //console.log(main_author);
  //Data for individual Publications
  var indPub = [];
  for(var i=0;i<adata.length;i++){
    for (var j=0; j<adata[i].AllPublicationsPerYear.length;j++){
      adata[i].AllPublicationsPerYear[j]["Name"] = adata[i].Name; //adding name of each author to list
    }
    indPub.push(adata[i].AllPublicationsPerYear); 
  }
  //console.log(indPub);

  var svg = d3.select("#" + canvas),
    margin = {top: 10, right: 0, bottom: 20, left: 20},
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
    var x = d3.scaleBand().rangeRound([80, width]).padding(0.3),
        y = d3.scaleLinear().rangeRound([(j+1)*height/N, j*height/N+3]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //tooltip 
    var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
      
      //x.domain(data.map(function(d) { return d.Year; }));
      x.domain(xDomain);
      //y.domain([0, d3.max(data, function(d) { return d.Value; })]);
      y.domain([0,maxCount]);
      
      if (j==0){
        // g.append("g")
        //     .attr("class", "axis axis--x")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(d3.axisBottom(x));

        // g.append("g")
        //     .attr("class", "axis axis--y")
        //     .call(d3.axisRight(y).ticks(2))
        //   .append("text")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", 6)
        //     .attr("dy", "0.71em")
        //     .attr("text-anchor", "end")
      

        //Drawing horizontal bar charts to mark start year of each coauthor 
        g.selectAll(".hbar")
          .data(gdata)
          .enter().append("rect")
            .attr("class", "hbar")
            .attr("x", function(d) { return x(d.StartYear); })
            .attr("y", function(d,i) { return (i)*height/N;})
            .attr("width", width+50)
            .attr("height",height/N);

          //Adding names of coauthors 
        g.selectAll(".names")
          .data(adata)
          .enter().append("text")
          .attr("class", "names")
          .attr("x", 0)
          .attr("y", function(d,i){return (i+1)*height/N-5})
          .text(function(d){return d.Name });
    
      }
      //adding bars for individual publications 
      g.selectAll(".bar")
        .data(indPub[j])
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.Year); })
          .attr("y", function(d) { return y(d.Value); })
          .attr("width", x.bandwidth())
          .attr("height", function(d) { return (j+1)*height/N - y(d.Value); })
          .on("mouseover", function(d) {
           div.transition()
             .duration(200)
             .style("opacity", .9);
           div.html("Individual" + "<br/>" + "Year: " + d.Year + "<br/>" + "# Articles: " + d.Value)
             .style("left", (d3.event.pageX) + 5 + "px")
             .style("top", (d3.event.pageY - 38) + "px");
           })
         .on("mouseout", function(d) {
           div.transition()
             .duration(500)
             .style("opacity", 0);
           })
            .on("click", function(d){showIndividualPublications(pdata, d.Year, d.Name)});
  
      //Adding bars for mutual publications
      g.selectAll(".mbar")
        .data(gdata[j].MutualPubPerYear)
        .enter().append("rect")
          .attr("class", "mbar")
          .attr("x", function(d) { return x(d.Year); })
          .attr("y", function(d) { return y(d.Value); })
          .attr("width", x.bandwidth())
          .attr("height", function(d) { return (j+1)*height/N - y(d.Value); })
         .on("mouseover", function(d) {
           div.transition()
             .duration(200)
             .style("opacity", .9);
           div.html("Mutual" + "<br/>" + "Year: " + d.Year + "<br/>" + "# Articles: " + d.Value)
             .style("left", (d3.event.pageX) + 5 + "px")
             .style("top", (d3.event.pageY - 38) + "px");
           })
         .on("mouseout", function(d) {
           div.transition()
             .duration(500)
             .style("opacity", 0);
           })
            .on("click", function(d){showMutualPublications(pdata, d.Year, aName, d.Name)});
    
      //Adding horizontal lines 
      g.append("g")
       .attr("transform", "translate(0, "+(j+1)*height/N+")")
       .append("line")
       .attr("x2", width)
       .attr("stroke", "#6b6b6b")
       .attr("stroke-width", "0.3px");

  }
  //Draw Vertical line for showing the starting year of main author 
  g.append("g")
       .attr("transform", "translate("+x(main_author_start_year)+", 0)")
       .append("line")
       .attr("y2", height)
       .attr("stroke", "#ff2b2b")
       .attr("stroke-width", "0.5px");
}
}
function showMutualPublications(pdata, year, aName, cName){
  //Prints the mutual publications on mouse click in side panel 
  //console.log("Hi from Call me ");
  //console.log(year + aName+cName);
  var pubs = getMutualPublicationObjects(pdata, year,aName, cName);
  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Mutual Publications " + "(" + pubs.length + ") : " +
   aName + " and " + cName + ", " + year + "</span>" + "<br>" + "<hr>";
  
  for (var i=0; i<pubs.length;i++){
    StringifyPublication(pubs[i]);
  }
}

function showIndividualPublications(pdata, year, name){
  //Prints the mutual publications on mouse click in side panel 
  //console.log("Hi from Call me ");
  //console.log(year + aName+cName);
  var pubs = getIndividualPublicationsObjects(pdata, year, name);
  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Individual Publications " + "(" + pubs.length + ") : " + name  
  + ", " + year + "</span>" + "<br>" + "<hr>";
  
  for (var i=0; i<pubs.length;i++){
    StringifyPublication(pubs[i]);
  }
}
function getIndividualPublicationsObjects(pubData, year, name){
  var indPublications = []; 
  for(var i=0;i<pubData.length;i++){
    if(pubData[i].Year == year){
      var tempAuthors = []; 
      for (var j=0;j<pubData[i].Authors.length;j++){
        tempAuthors.push(pubData[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(name) != -1)
        {
          indPublications.push(pubData[i]);
        }
    }
  }
  return indPublications;
}

function StringifyPublication(p){
  var authors=""; 
  for (var i =0;i<p.Authors.length; i++){
    // authors = authors + p.Authors[i].Name + ", ";
    authors += '<span id="linkedAuthorName" onclick="loadMe(this.innerHTML)">' +  p.Authors[i].Name + "</span>";
    if(i != p.Authors.length-1){
      authors += ", ";
    }
  }
  var pString = p.Title + "<br>" + authors  + "<br>" + p.Venue + ", " + p.Year;
  document.getElementById("dod").innerHTML += pString + "<br>" + "<br>"; 
  //document.getElementById("dod").innerHTML = pString + "<br>";
}
function loadMe(name){
  process(name,"CollabChart1",l,u,1); 
  process(name,"CollabChart2",l,u,2); 
}

function getMutualPublicationObjects(pubData, year, aName, cName){
  //Return array of mutual publications of Author and CoAuthor for Year "year"
  var mutualPublications = []; 
  for(var i=0;i<pubData.length;i++){
    if(pubData[i].Year == year){
      var tempAuthors = []; 
      for (var j=0;j<pubData[i].Authors.length;j++){
        tempAuthors.push(pubData[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(aName) != -1 && tempAuthors.indexOf(cName) != -1)
        {
          mutualPublications.push(pubData[i]);
        }
    }
  }
    return mutualPublications; 
}
function getAuthorObjectByName(adata, name){
  //console.log(adata)
  //console.log(name);
  for (var i=0;i<adata.length;i++){
    if (adata[i].Name==name){
      var obj =adata[i];
    }
  }
  return obj;
}

function generateSparkline(data,canvas, h, w){

 var largeScale = false;
 if (h>100 || w>200){
  largeScale = true ;
 } 

 data.sort(function(a, b) {
    return +a.Year - +b.Year;
  });
  // set the dimensions and margins of the graph
  if (largeScale){
    var margin = {top: 10, right: 20, bottom: 20, left: 30},
      width =  w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;
  }
  else {
    var margin = {top: 3, right: 0, bottom: 0, left: 0},
      width =  w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;
  }

  // set the ranges
  var x = d3.scaleBand()
            .range([0, width])
            .padding(0.3);
  var y = d3.scaleLinear()
            .range([height, 0]);
            
  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#" + canvas)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background-color", '#f2f2f2')
      .on("click", function(d){enlargeMe(data, this.id)})

    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
    
  
  svg.selectAll("*").remove();
  // Scale the range of the data in the domains
  x.domain(data.map(function(d) { return d.Year; }));
  y.domain([0, d3.max(data, function(d) { return d.Value; })]);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Year); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.Value); })
      .attr("height", function(d) { return height - y(d.Value); });
  
  if (largeScale){
    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
    }
}
function enlargeMe(data, id){
  //console.log(data); 
  if (id == "sparklineAll"){
    document.getElementById("dod").innerHTML =  '<span id=sideBarHead>' + "Distribution of All Articles" + "</span>" + "<br>" + "<hr>" 
  + '<svg width="400" height="200" id="figure"></svg>';
    generateSparkline(data,"figure", 125, 350);   
  }
  else if (id == "sparklineJournals") {
    document.getElementById("dod").innerHTML =  '<span id=sideBarHead>' + "Distribution of Journal Articles" + "</span>" + "<br>" + "<hr>" 
  + '<svg width="400" height="200" id="figure"></svg>';
    generateSparkline(data,"figure", 125, 350);  
  }
  else if (id == "sparklineConfs") {
    document.getElementById("dod").innerHTML =  '<span id=sideBarHead>' + "Distribution of Conference Articles" + "</span>" + "<br>" + "<hr>" 
  + '<svg width="400" height="200" id="figure"></svg>';
    generateSparkline(data,"figure", 125, 350);  
  }
  else if (id == "sparklineAsFirstAuthor") {
    document.getElementById("dod").innerHTML =  '<span id=sideBarHead>' + "Distribution of All Articles as First Author" + "</span>" + "<br>" + "<hr>" 
  + '<svg width="400" height="200" id="figure"></svg>';
    generateSparkline(data,"figure", 125, 350);  
  }
  else if (id == "sparklineJournalsAsFirstAuthor") {
    document.getElementById("dod").innerHTML =  '<span id=sideBarHead>' + "Distribution of Journal Articles as First Author" + "</span>" + "<br>" + "<hr>" 
  + '<svg width="400" height="200" id="figure"></svg>';
    generateSparkline(data,"figure", 125, 350);  
  }
  else if (id == "sparklineConfsAsFirstAuthor") {
    document.getElementById("dod").innerHTML =  '<span id=sideBarHead>' + "Distribution of Conference Articles as First Author" + "</span>" + "<br>" + "<hr>" 
  + '<svg width="400" height="200" id="figure"></svg>';
    generateSparkline(data,"figure", 125, 350);  
  }
}