var MORE_TO_SHOW = 3; 
function generateVis(gdata, adata, canvas,pdata, aName, allAuthorsData, distCoAuthors, t){
  // console.log(gdata);
  // console.log(adata);
  if (t==1){
    MORE_TO_SHOW =3;
  }
  MORE_TO_SHOW = gdata.length; 
  var isFound = true; //Assume author exist in the records
  var main_author = getAuthorObjectByName(allAuthorsData, aName);
  if (typeof main_author === "undefined") {
    isFound = false ; // Author not found [Auhtor deosn't belong to VIS authors]
    document.getElementById("name").innerHTML = '<span style="color:red">' + "Author not found!";
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
 
  //if main author is the most senior one 
  if (main_author_start_year < minYear ){
    minYear = main_author_start_year;
  }

  //console.log(indPub);
  //var svg = d3.select("#" + canvas),
  var h = indPub.length*50 + 30; //adding thirty for the margins 
  var w = (maxYear-minYear)*20;
  if (w > 550) {w = 550;}
  if (w < 250) {w=250;}
  if (h<60){h=80;}


  
  var svg = d3.select("#" + canvas)
  .attr("height", h )
  .attr("width", w );
    margin = {top: 10, right: 0, bottom: 20, left: 20};
    width = +svg.attr("width") - margin.left - margin.right;
    height = +svg.attr("height") - margin.top - margin.bottom;
    //height = indPub.length*60 - margin.top - margin.bottom;

  // console.log(height);
  
  //Clearing the contents of SVG before second search
  svg.selectAll("*").remove();

  var xDomain = [];
  for(var i=0;i<maxYear-minYear+1;i++){
    xDomain.push(+minYear+i);
  }

  for (var j=0;j<N;j++){
    data = indPub[j];
    var x = d3.scaleBand().rangeRound([100, width]).padding(0.3),
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
        var MAX_WIDTH_OF_BAR = 12;
        //Drawing horizontal bar charts to mark start year of each coauthor 
        g.selectAll(".hbar")
          .data(gdata)
          .enter().append("rect")
            .attr("class", "hbar")
            .attr("x", function(d) { return x(d.StartYear); })
            .attr("y", function(d,i) { return (i)*height/N;})
            // .attr("width", width+50)
            .attr("width", function(d){return x(d.EndYear) - x(d.StartYear)+x.bandwidth();})
            .attr("height",height/N);

          //Adding names of coauthors 
          // loadMe(pdata, adata, this.innerHTML)
        g.selectAll(".names")
          .data(gdata)
          .enter().append("text")
          .attr("class", "names")
          .attr("x", 0)
          .attr("y", function (d, i) { return (i + 1) * height / N - 5 })
          .text(function (d) { 
            return getLastName(d.Name) + " (" + d.MutualPublications + ")"; 
          })
          .on("click", function (d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
            loadMe(pdata, allAuthorsData, d.Name);
          })
          .append("svg:title")
          .text(function (d) {
            var jointPubsStartYear = d.MutualPubPerYear[0].Year;
            var jointPubsEndYear = d.MutualPubPerYear[d.MutualPubPerYear.length - 1].Year;
            var s = getFullNameWithoutNo(d.Name) + " has published ";
            s += d.MutualPublications === 1 ? " a joint publication" : (d.MutualPublications + " joint publications");
            s += " (marked in red) with " + getFullNameWithoutNo(aName);
            s += jointPubsEndYear === jointPubsStartYear ? " in " + jointPubsStartYear : " between " + jointPubsStartYear + " and " + jointPubsEndYear;
            return s + ". [Click to see "+getLastName(d.Name)+"'s profile]";
          });
      }
      //adding bars for individual publications 
      g.selectAll(".bar")
        .data(indPub[j])
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.Year); })
        .attr("y", function (d) { return y(d.Value); })
        .attr("width", Math.min(MAX_WIDTH_OF_BAR, x.bandwidth()))
        .attr("height", function (d) { return (j + 1) * height / N - y(d.Value); })
        .on("click", function (d) { showIndividualPublications(pdata, allAuthorsData, d.Year, d.Name) })
        .append("svg:title")
        .text(function(d) {
          return("In "+d.Year+", "+getFullNameWithoutNo(d.Name)+" published " + d.Value +" publications in total. [Click to see details]");
        });
      //Adding bars for mutual publications
      g.selectAll(".mbar")
        .data(gdata[j].MutualPubPerYear)
        .enter().append("rect")
        .attr("class", "mbar")
        .attr("x", function (d) { return x(d.Year); })
        .attr("y", function (d) { return y(d.Value); })
        .attr("width", Math.min(MAX_WIDTH_OF_BAR, x.bandwidth()))
        .attr("height", function (d) { return (j + 1) * height / N - y(d.Value); })
        .on("click", function (d) { showMutualPublications(pdata, allAuthorsData, d.Year, aName, d.Name) })
        .append("svg:title")
        .text(function(d) {
          return("In "+d.Year+", "+getFullNameWithoutNo(d.Name)+" published " + d.Value +" joint publications with "+getFullNameWithoutNo(aName)+". [Click to see details]")
        });

      //Adding horizontal lines 
      g.append("g")
       .attr("transform", "translate(0, "+(j+1)*height/N+")")
       .append("line")
       .attr("class", "x-line")
       .attr("x2", width);

  }
    //Draw Vertical line for showing the starting year of main author 
    var gAuthorLine = g.append("g")
         .attr("transform", "translate("+(x(main_author_start_year)-1)+", 0)");
    gAuthorLine
         .append("line")
         .attr("y2", height)
         .attr("class", "author_line");
    gAuthorLine    
         .append("line")
         .attr("y2", height)
         .attr("class", "author_line_tooltip")
         .append("svg:title")
         .text(function(d){
            return "This line marks the year "+main_author_start_year+", when "+getLastName(aName)+" started publishing."
         });

    g.selectAll(".moreBtn")
          .data(adata)
          .enter().append("text")
          .attr("class", "moreBtn")
          .attr("x", width-30)
          .attr("y",height+14)
          .text("More")
          //.on("click", function(d){});
          .on("click", function(d){updateCoauthorVis(canvas, pdata, aName, allAuthorsData , distCoAuthors);});
  }
}

function updateCoauthorVis(canvas, pdata, aName, adata , distCoAuthors){
     MORE_TO_SHOW += 3; 
     var authorObjects = [];
     // console.log(distCoAuthors); 
     var visAuthor = false; 
      for (var i = 0; i < Math.min(distCoAuthors.length, MORE_TO_SHOW); i++) {
        visAuthor = false; 
        for (var j = 0; j < adata.length; j++) {
          if (adata[j].Name === distCoAuthors[i].Name) {
            authorObjects.push(adata[j]);
            visAuthor = true;
          }
        }
        if(!visAuthor){
           var allpubYears = getAllPublicationYears(pdata, distCoAuthors[i].Name);
           var author_object = new  Object();
           var ppy = compressArray2(allpubYears);
           author_object.Name = distCoAuthors[i].Name;
           ppy.sort(function(a,b){return +a.Year - +b.Year;});
           author_object.AllPublicationsPerYear = ppy; 
           authorObjects.push(author_object); 
        }
     }
     // console.log(authorObjects);
        var dataForGantt = [];
        for (var i = 0; i < authorObjects.length; i++) {
          var sYear = Math.min(getMin(authorObjects[i].AllPublicationsPerYear));
          var lYear = Math.min(getMax(authorObjects[i].AllPublicationsPerYear));

          var a = new Object();
          a.Name = authorObjects[i].Name;
          a.StartYear = sYear;
          a.EndYear = lYear;
          a.MutualPublications = distCoAuthors[i].Value;
          //console.log(a.MutualPublications/(2017-a.StartYear)); 
          dataForGantt.push(a);
        }
        // console.log(dataForGantt);
        for (var i=0;i<dataForGantt.length;i++){
          var mppy = getMutualPublications(pdata, aName, dataForGantt[i].Name);
          // console.log(mppy);
          dataForGantt[i]["MutualPubPerYear"] = mppy;
          
        }
        // console.log(dataForGantt);
        generateVis(dataForGantt, authorObjects, canvas, pdata,aName, adata, distCoAuthors, 2); 

}
function showMutualPublications(pdata, adata, year, aName, cName){
  //Prints the mutual publications on mouse click in side panel 
  //console.log("Hi from Call me ");
  //console.log(year + aName+cName);
  var pubs = getMutualPublicationObjects(pdata, year,aName, cName);
  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Mutual Publications " + "(" + pubs.length + ") : " +
   getLastName(aName) + " and " + getLastName(cName) + ", " + year + "</span>" + "<br>" + "<hr>";
  
  for (var i=0; i<pubs.length;i++){
    StringifyPublication(pdata, adata, pubs[i]);
  }
}

function showIndividualPublications(pdata, adata, year, name){
  //Prints the mutual publications on mouse click in side panel 
  // console.log(year + name);
  var pubs = getIndividualPublicationsObjects(pdata, year, name);
  // console.log(pubs);
  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Individual Publications " + "(" + pubs.length + ") : " + getLastName(name)
  + ", " + year + "</span>" + "<br>" + "<hr>";
  
  for (var i=0; i<pubs.length;i++){
    StringifyPublication(pdata, adata, pubs[i]);
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

function StringifyPublication(pdata, adata, p){
  var authors="";
  for (var i =0;i<p.Authors.length; i++){
    // authors = authors + p.Authors[i].Name + ", ";
    if (authors_list.indexOf(p.Authors[i].Name) != -1){
      authors += '<span id="linkedAuthorName" onclick="loadMe(pdata, adata, this.innerHTML)">' +  p.Authors[i].Name + "</span>";
      if(i != p.Authors.length-1){
        authors += ", ";
      }
    }
    else {
      authors += p.Authors[i].Name ;
      if(i != p.Authors.length-1){
        authors += ", ";
      }
    }
  }
  var pString = '<span id="publicationTitle">' + p.Title + "</span>"
    + "<br>" + authors  + "<br>" + p.Venue + ", " + p.Year;
  var pubKeywords = getPublicationKeywords(p);
  if (pubKeywords.length > 0) {
    pString += "<br/>";
    if (pubKeywords.indexOf("visualization") > -1) {
      pString += '<span class="community">visualization</span> ';
    }
    for (var i = 0; i < pubKeywords.length; i++) {
      if (pubKeywords[i] != "visualization") {
        var cssClass = (visSubfields.indexOf(pubKeywords[i]) > -1) ? "subfield" : "community";
        pString += '<span class="' + cssClass + '">' + pubKeywords[i] + '</span> ';
      }
    }
  }
  document.getElementById("dod").innerHTML += pString + "<br>" + "<br>"; 
  //document.getElementById("dod").innerHTML = pString + "<br>";
}
function loadMe(pdata, adata, name){
  // console.log(pdata);
  // console.log(adata); 
  // console.log(name); 
  process(pdata, adata, name, "CollabChart1", 3, 8); 
  
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

function generateSparkline(data,canvas, h, w, startYear, endYear, ymax, name){

 //console.log(ymax); 
 var largeScale = false;
 if (h>100 || w>200){
  largeScale = true ;
 } 

 data.sort(function(a, b) {
    return +a.Year - +b.Year;
  });
 //console.log(data); 
 // add in missing years 
 var data2 = [];
 //var range = +data[data.length-1].Year - +data[0].Year;
 var range = endYear - startYear; 
 //console.log(range);
 for (var i=0;i<=range;i++){
    //var year = +data[0].Year + i;
    var year = +startYear + i;
    var count = 0;
    for (j=0;j<data.length;j++){
      if(year == data[j].Year){
        count = data[j].Value;
      }
    }
    var obj = new Object()
    obj.Year = year;
    obj.Value = count;
    data2.push(obj);
 }

    //tooltip 
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

 //console.log(data2); 
  // set the dimensions and margins of the graph
  if (largeScale){
    var margin = {top: 10, right: 40, bottom: 10, left: 40},
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
      // .attr("style", "outline: thin solid red;")  

      .append("g")
      .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")"); 
  if (!largeScale){
     var svg = d3.select("#" + canvas)
           .on("click", function(d){enlargeMe(data2, this.id, startYear, endYear, ymax,name)})
           .append("g")
          .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")")
      
      d3.select("#" + canvas)
      .on("mouseover", function(d){addBorder(this.id)})
      .on("mouseout", function(d){removeBorder(this.id)}); 
  }
    
  svg.selectAll(".bar").remove();
  // Scale the range of the data in the domains
  x.domain(data2.map(function(d) { return d.Year; }));
  //y.domain([0, d3.max(data2, function(d) { return d.Value; })]);
  y.domain([0, ymax]);

  // append the rectangles for the bar chart
  if (!largeScale){
  svg.selectAll(".bar")
      .data(data2)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Year); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.Value); })
      .attr("height", function(d) { return height - y(d.Value); });
    }
    if(largeScale){
       svg.selectAll(".bar")
      .data(data2)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Year); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.Value); })
      .attr("height", function(d) { return height - y(d.Value); })
      .on("click", function(d){showIndividualPublications(pdata, adata, d.Year, name)})
      .append("svg:title")
      .text(function(d){
         return("In "+d.Year+", the author published " + d.Value +" publications in total. [Click to see details]");
      });

      svg.append("g")
     .attr("transform", "translate(-25," + height + ")")
     .append("text")
     .attr("class", "xlabelBar")
     .attr("y2", height)
     .text(startYear);

     svg.append("g")
     .attr("transform", "translate("+width+"," + height + ")")
     .append("text")
     .attr("class", "xlabelBar")
     .attr("y2", height)
     .text(endYear);  


     svg.append("g")
     .attr("transform", "translate("+width+",3)")
     .append("text")
     .attr("class", "xlabelBar")
     .attr("y2", height)
     .text("—" + ymax);  
    }
}

function addBorder(container){
    var svg = d3.select("#" + container)
        .attr("style", "outline: thin solid DodgerBlue;")  ; 

}
function removeBorder(container){
  var svg = d3.select("#" + container)
   .attr("style", "outline: none") 
   .style("background-color", '#f2f2f2');
  
}

function generateSparklineForMutualPublications(pdata, adata, a, cName, data,canvas, h, w, startYear, endYear, ymax){

 // console.log(ymax); 
 aName = a.Name; 
 var largeScale = false;
 if (h>100 || w>200){
  largeScale = true ;
 } 

 data.sort(function(a, b) {
    return +a.Year - +b.Year;
  });
 //console.log(data); 
 // add in missing years 
 var data2 = [];
 //var range = +data[data.length-1].Year - +data[0].Year;
 var range = endYear - startYear; 
 //console.log(range);
 for (var i=0;i<=range;i++){
    //var year = +data[0].Year + i;
    var year = +startYear + i;
    var count = 0;
    for (j=0;j<data.length;j++){
      if(year == data[j].Year){
        count = data[j].Value;
      }
    }
    var obj = new Object()
    obj.Year = year;
    obj.Value = count;
    data2.push(obj);
 }
  // set the dimensions and margins of the graph
  if (largeScale){
    var margin = {top: 10, right: 40, bottom: 10, left: 40},
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
  if(!largeScale){
  var svg = d3.select("#" + canvas)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background-color", '#f2f2f2')
      .on("mouseover", function(d){addBorder(this.id)})
      .on("mouseout", function(d){removeBorder(this.id)})
      .on("click", function(d){enlargeMe_MutualPublications(pdata, adata, a, cName, data2, this.id,startYear, endYear, ymax)})
      .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");
   
  }
  if(largeScale){
      var svg = d3.select("#" + canvas)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background-color", '#f2f2f2')
      .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");
      
  }
    //tooltip 
    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
      
  
  svg.selectAll("*.msbar").remove();
  // Scale the range of the data in the domains
  x.domain(data2.map(function(d) { return d.Year; }));
  //y.domain([0, d3.max(data2, function(d) { return d.Value; })]);
  y.domain([0, ymax]);

  // append the rectangles for the bar chart
  if (!largeScale){
    svg.selectAll(".msbar")
        .data(data2)
      .enter().append("rect")
        .attr("class", "msbar")
        .attr("x", function(d) { return x(d.Year); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.Value); })
        .attr("height", function(d) { return height - y(d.Value); });
    }
  
  if (largeScale){
       var data_mainAuthor = a.AllPublicationsPerYear; 
       data_mainAuthor.sort(function(a, b) {
          return +a.Year - +b.Year;
       });

      svg.selectAll(".bar")
        .data(data_mainAuthor)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.Year); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(d.Value); })
        .attr("height", function (d) { return height - y(d.Value); })
        .on("click", function (d) { showIndividualPublications(pdata, adata, d.Year, a.Name) })
        .append("svg:title")
        .text(function (d) {
          return ("In " + d.Year + ", the author published " + d.Value + " publications in total. [Click to see details]");
        });


      // console.log(data2);
      svg.selectAll(".mbar")
        .data(data2)
        .enter().append("rect")
        .attr("class", "mbar")
        .attr("x", function (d) { return x(d.Year); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(d.Value); })
        .attr("height", function (d) { return height - y(d.Value); })
        .on("click", function (d) { showMutualPublications(pdata, adata, d.Year, a.Name, cName) })
        .append("svg:title")
        .text(function (d) {
          return ("In " + d.Year + ", the author published " + d.Value + " joint publications with " +getFullNameWithoutNo(cName)+". [Click to see details]");
        });

      // add the x Axis
      svg.append("g")
         .attr("transform", "translate(-25," + height + ")")
         .append("text")
         .attr("class", "xlabelBar")
         .attr("y2", height)
         .text(startYear);

         svg.append("g")
         .attr("transform", "translate("+width+"," + height + ")")
         .append("text")
         .attr("class", "xlabelBar")
         .attr("y2", height)
         .text(endYear);  


         svg.append("g")
         .attr("transform", "translate("+width+",3)")
         .append("text")
         .attr("class", "xlabelBar")
         .attr("y2", height)
         .text("—" + ymax);  
         
    }
}

function enlargeMe(data, id, startYear, endYear, ymax, name){
   //console.log(data); 
    document.getElementById("info").innerHTML = '<svg width="400" height="200" id="figure"></svg>';
    generateSparkline(data,"figure", 90, 360, startYear, endYear, ymax, name); 

}
function enlargeMe_MutualPublications(pdata, adata, a, cName, data, id, startYear, endYear, ymax){
    //pdata : Data of all publications 
    //adata : Data of all authors 
    //aName : Name of main author 
    //cName : Name of coauthor 
   //console.log(data); 
    document.getElementById("info").innerHTML = '<svg width="400" height="200" id="figure"></svg>';
    generateSparklineForMutualPublications(pdata, adata, a, cName, data,"figure", 90, 360, startYear, endYear, ymax); 

    loadMutualPublications(pdata, adata, a.Name, cName); 

}

function generateBarChart(pdata, adata, authorName, data, canvas){

 // console.log(ymax); 

 var a = getAuthorObjectByName(adata, authorName);
 aName = a.Name;

 var ymax = d3.max(a.AllPublicationsPerYear, function(d){return d.Value});
 
 data.sort(function(a, b) {
    return +a.Year - +b.Year;
  });

 var h=90;
 var w=360;
 // add in missing years 
 var data2 = [];
 //var range = +data[data.length-1].Year - +data[0].Year;
  var startYear = findStartYear(a);
  var endYear = findEndYear(a);
 var range = endYear - startYear; 
 //console.log(range);
 for (var i=0;i<=range;i++){
    //var year = +data[0].Year + i;
    var year = +startYear + i;
    var count = 0;
    for (j=0;j<data.length;j++){
      if(year == data[j].Year){
        count = data[j].Value;
      }
    }
    var obj = new Object()
    obj.Year = year;
    obj.Value = count;
    data2.push(obj);
 }
  // set the dimensions and margins of the graph
    var margin = {top: 10, right: 40, bottom: 10, left: 40},
      width =  w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;
  


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
      .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");
      
    //tooltip 
    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
      
  
  svg.selectAll("*.msbar").remove();
  // Scale the range of the data in the domains
  x.domain(data2.map(function(d) { return d.Year; }));
  //y.domain([0, d3.max(data2, function(d) { return d.Value; })]);
  y.domain([0, ymax]);


   var data_mainAuthor = a.AllPublicationsPerYear; 
   data_mainAuthor.sort(function(a, b) {
      return +a.Year - +b.Year;
   });

      svg.selectAll(".bar")
      .data(data_mainAuthor)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Year); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.Value); })
      .attr("height", function(d) { return height - y(d.Value); })
      .on("mouseover", function(d) {
           div.transition()
             .duration(200)
             .style("opacity", .9);
           div.html("Individual" + "<br/>" + "Year: " + d.Year + "<br/>" + "# Articles: " + d.Value)
             .style("left", (d3.event.pageX) + 5  + "px")
             .style("top", (d3.event.pageY ) - 38 + "px");
           })
       .on("mouseout", function(d) {
           div.transition()
             .duration(500)
             .style("opacity", 0);
           })
      .on("click", function(d){showIndividualPublications(pdata, adata, d.Year, a.Name)});

      // console.log(data2);
       svg.selectAll(".tbar")
        .data(data2)
        .enter().append("rect")
        .attr("class", "tbar")
        .attr("x", function(d) { return x(d.Year); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.Value); })
        .attr("height", function(d) { return height - y(d.Value); })
         .on("mouseover", function(d) {
           div.transition()
             .duration(200)
             .style("opacity", .9);
           div.html("Mutual" + "<br/>" + "Year: " + d.Year + "<br/>" + "# Articles: " + d.Value)
             .style("left", (d3.event.pageX) + 5  + "px")
             .style("top", (d3.event.pageY ) - 38 + "px");
           })
       .on("mouseout", function(d) {
           div.transition()
             .duration(500)
             .style("opacity", 0);
           })
        .on("click", function(d){showMutualPublications(pdata, adata, d.Year, a.Name, cName)});

    // add the x Axis
      svg.append("g")
         .attr("transform", "translate(-25," + height + ")")
         .append("text")
         .attr("class", "xlabelBar")
         .attr("y2", height)
         .text(startYear);

         svg.append("g")
         .attr("transform", "translate("+width+"," + height + ")")
         .append("text")
         .attr("class", "xlabelBar")
         .attr("y2", height)
         .text(endYear);  


         svg.append("g")
         .attr("transform", "translate("+width+",3)")
         .append("text")
         .attr("class", "xlabelBar")
         .attr("y2", height)
         .text("—" + ymax);  
         
}