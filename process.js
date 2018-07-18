function process(pdata, adata, name,container, minN,maxN) {
  //Processing the data 
  // var pdata;
  // var adata;
  //Clearing Stuff when searching for new author
  // console.log(name); 
  document.getElementById("dod").innerHTML= ""; 
  document.getElementById("contact").innerHTML= ""; 
  $('hr').remove();
  listOfSparklines = []; 

  var allCoAuthors = [];
  var isFound = false;

   if(authors_list.indexOf(name) > -1){
        isFound = true; 
   }
    if (isFound) { //Author found so go ahead with process
      document.getElementById("pageTitle").innerHTML = name + " - VAP";
      var c = 0;
      for (var i = 0; i < pdata.length; i++) {
        for (var j = 0; j < pdata[i].Authors.length; j++) {
          if (pdata[i].Authors[j].Name == name) {
            for (var k = 0; k < pdata[i].Authors.length; k++) {
              if (pdata[i].Authors[k].Name == "") continue;
              allCoAuthors.push(pdata[i].Authors[k].Name);
            }
          }
        }
      }
      // console.log(allCoAuthors);
      var items = compressArray(allCoAuthors, name);
      var topNCoAuthor = getTopNItems(items, minN, maxN);
      // console.log(items); 
      
      var topNCoAuthorObjects = [];
      var visAuthor = false; 
      for (var i = 0; i < topNCoAuthor.length; i++) {
        visAuthor = false; 
        for (var j = 0; j < adata.length; j++) {
          if (adata[j].Name == topNCoAuthor[i].Name) {
            topNCoAuthorObjects.push(adata[j]);
            visAuthor = true; 
          }
        }
        if(!visAuthor){
               var allpubYears = getAllPublicationYears(pdata, topNCoAuthor[i].Name);
               var author_object = new  Object();
               var ppy = compressArray2(allpubYears);
               author_object.Name = topNCoAuthor[i].Name;
               ppy.sort(function(a,b){return +a.Year - +b.Year;});
               author_object.AllPublicationsPerYear = ppy; 
               topNCoAuthorObjects.push(author_object); 
        }
      }

        var dataForGantt = [];
        for (var i = 0; i < topNCoAuthorObjects.length; i++) {
          var sYear = Math.min(getMin(topNCoAuthorObjects[i].AllPublicationsPerYear));
          var lYear = Math.min(getMax(topNCoAuthorObjects[i].AllPublicationsPerYear));

          var a = new Object();
          a.Name = topNCoAuthorObjects[i].Name;
          a.StartYear = sYear;
          a.EndYear = lYear;
          a.MutualPublications = topNCoAuthor[i].Value;
          //console.log(a.MutualPublications/(2017-a.StartYear)); 
          dataForGantt.push(a);
        }
        //console.log(dataForGantt);
        for (var i=0;i<dataForGantt.length;i++){
          var mppy = getMutualPublications(pdata,name, dataForGantt[i].Name);
          dataForGantt[i]["MutualPubPerYear"] = mppy;
          
        }
        //Calling NLG function and generating text 
        var jpy;
        var cpy;
        var statData = []; //For computing statistics 
        var pubCount = 0; //No of publications for searched author
        var aObject;
          //console.log(adata);
          for (var i = 0; i < adata.length; i++) {
            statData.push(adata[i].Journals + adata[i].Conferences);
            if (adata[i].Name == name) {
              aObject = adata[i];
              pubCount = adata[i].Journals + adata[i].Conferences;
              jpy = adata[i].JournalsPerYear;
              cpy = adata[i].ConfsPerYear;
            }
          }
          generateProfileText(pdata, adata, aObject, dataForGantt);
          generateVis(dataForGantt, topNCoAuthorObjects, container, pdata, name, adata, items, 1);
      }
    
      else {
        document.getElementById("name").innerHTML = '<span style="color:red">' +  "Profile page for " + getFullNameWithoutNoWithoutAsterisk(name) + " not available!";
      }
}
function getAllPublicationYears(pdata, authorName){
  var pubYears = []; 
  for(var i=0;i<pdata.length;i++){
      var tempAuthors = []; 
      for (var j=0;j<pdata[i].Authors.length;j++){
        tempAuthors.push(pdata[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(authorName) != -1)
        {
          pubYears.push(pdata[i].Year);
        }
  }
  return pubYears; 
}

function getMutualPublications(pubData,aName, cName){
  var MutualPubPerYear = []; 
  for(var i=0;i<pubData.length;i++){
    var tempAuthors = []; 
    for (var j=0;j<pubData[i].Authors.length;j++){
      tempAuthors.push(pubData[i].Authors[j].Name);
      }
      if(tempAuthors.indexOf(aName) != -1 && tempAuthors.indexOf(cName) != -1)
      {
        MutualPubPerYear.push(pubData[i].Year);
      }
    }
    var mppy = countFrequency(MutualPubPerYear);
    for (var i =0;i<mppy.length;i++){
      mppy[i]["Name"]=cName;
    }
    return mppy; 
}
function countFrequency(original) {
  var compressed = [];
  // make a copy of the input array
  var copy = original.slice(0);

  // first loop goes over every element
  for (var i = 0; i < original.length; i++) {

    var myCount = 0;
    // loop over every element in the copy and see if it's the same
    for (var w = 0; w < copy.length; w++) {
      if (original[i] == copy[w]) {
        // increase amount of times duplicate is found
        myCount++;
        // sets item to undefined
        delete copy[w];
      }
    }

    if (myCount > 0) {
      var a = new Object();
      a.Year = original[i];
      a.Value = myCount;
      compressed.push(a);
    }
  }
  return compressed;
}


function sortByYear(data) {
  data.sort(function(a, b) {
    return +(a.Year) - +(b.Year);
  });
  return data;
}

function getMin(data) {
  if (data.length > 1){
    data.sort(function(a, b) {
      return +(a.Year) - +(b.Year);
    });
    return data[0].Year;
  }
  else return 2018;
}

function getMax(data) {
  if (data.length > 1){
    data.sort(function(a, b) {
      return +(a.Year) - +(b.Year);
    });
    return data[data.length-1].Year;
  }
  else return 1800;
}

function getTopNItems(items, minN, maxN) {
 
  //Given [minN, maxN] range: returns the authors in that range by systematically cutting off the list
  //For instance, check for Fabian Beck, Thomas Ertl, Daniel A. Keim to see its effect
  var topItems = [];
  var finaltopItems=[];

  items.sort(function(a, b) {
    return b.Value - a.Value;
  });
  // console.log(items);
  if (maxN < items.length){
    for (var i = 0; i <= maxN; i++) {
        topItems.push(items[i]);

    }   
  }
  else {
    topItems = items;
  }

  if (topItems.length > minN){
    // console.log(topItems);
    var gaps = [];
    for(var i=minN;i<topItems.length;i++){
      var gap = topItems[i-1].Value - topItems[i].Value;
      gaps.push(gap);
    }
    // console.log(gaps);
    var maxGap = d3.max(gaps);
    var cutPoint = gaps.indexOf(maxGap) + minN ; // adding 1 due to 0-indexing system 
    // console.log(cutPoint);
    
    for (var i=0;i<cutPoint;i++){
      finaltopItems.push(topItems[i]);
    }
  }
  else {
    finaltopItems = topItems;
  }
  // console.log(finaltopItems); 

  return finaltopItems;
}
//Counting frequency of each element in array and return a (key,value) pair
//Also removes the self author
function compressArray(original, name) {
  //console.log(original);
  //console.log(name);
  var compressed = [];
  // make a copy of the input array
  var copy = original.slice(0);

  // first loop goes over every element
  for (var i = 0; i < original.length; i++) {

    var myCount = 0;
    // loop over every element in the copy and see if it's the same
    for (var w = 0; w < copy.length; w++) {
      if (original[i] == copy[w]) {
        // increase amount of times duplicate is found
        myCount++;
        // sets item to undefined
        delete copy[w];
      }
    }

    if (myCount > 0) {
      var a = new Object();
      a.Name = original[i];
      a.Value = myCount;
      compressed.push(a);
    }
  }
  //Remove the self author 
  // console.log(compressed); 
  // compressed.filter(function(e){return e.Name!=name;});
  compressed = $.grep(compressed,
    function(o, i) {
      return o.Name === name;
    },
    true);

  return compressed;
}

//Return (Year, Value ) 
//Later to be merged with compressArray() as it is duplication
function compressArray2(original) {
  //console.log(original);
  //console.log(name);
  var compressed = [];
  // make a copy of the input array
  var copy = original.slice(0);

  // first loop goes over every element
  for (var i = 0; i < original.length; i++) {

    var myCount = 0;
    // loop over every element in the copy and see if it's the same
    for (var w = 0; w < copy.length; w++) {
      if (original[i] == copy[w]) {
        // increase amount of times duplicate is found
        myCount++;
        // sets item to undefined
        delete copy[w];
      }
    }

    if (myCount > 0) {
      var a = new Object();
      a.Year = original[i];
      a.Value = myCount;
      compressed.push(a);
    }
  }
  return compressed;
}