function process(pdata, adata, name,container, minN,maxN, t) {
  //Processing the data 
  // var pdata;
  // var adata;
  var allCoAuthors = [];
  var authorPubCoun = 0;
  var isFound = false;

   for (var k = 0; k < adata.length; k++) {
      if(adata[k].Name == name){
        isFound = true; 
      }
   }
    if (isFound) { //Author found so go ahead with process
      document.getElementById("pageTitle").innerHTML = name + " - VAP";
      var c = 0;
      for (var i = 0; i < pdata.length; i++) {
        for (var j = 0; j < pdata[i].Authors.length; j++) {
          if (pdata[i].Authors[j].Name == name) {
            isFound = true;
            authorPubCoun++;
            for (var k = 0; k < pdata[i].Authors.length; k++) {
              allCoAuthors.push(pdata[i].Authors[k].Name);
            }
          }
        }
      }
      // console.log(allCoAuthors);
      var items = compressArray(allCoAuthors, name);
      //console.log(items); 
      var topNCoAuthor = getTopNItems(items, minN, maxN,t);
      // console.log(topNCoAuthor); 
      
      var topNCoAuthorObjects = [];
      
      for (var i = 0; i < topNCoAuthor.length; i++) {
        for (var j = 0; j < adata.length; j++) {
          if (adata[j].Name == topNCoAuthor[i].Name) {
            topNCoAuthorObjects.push(adata[j]);
          }
        }
      }
      // console.log(topNCoAuthorObjects); 
      if (topNCoAuthorObjects.length == 0){
        //Top Authors are non-VIS authors 
        //So get their data from DBLP and add them to the list of topNCoAuthorObjects[]
        //so that they are displayed on the coauthor visualization 
        for (var i=0;i<topNCoAuthor.length;i++){
            var allpubYears = getAllPublicationYears(pdata, topNCoAuthor[i].Name);
            var author_object = new  Object();
            var ppy = compressArray2(allpubYears);

            author_object.Name = topNCoAuthor[i].Name;
            ppy.sort(function(a,b){return +a.Year - +b.Year;});
            author_object.AllPublicationsPerYear = ppy; 
       
            console.log(author_object); 
            topNCoAuthorObjects.push(author_object); 

        }
      }
        var dataForGantt = [];
        for (var i = 0; i < topNCoAuthorObjects.length; i++) {
          // var sYear = Math.min(getMin(topNCoAuthorObjects[i].JournalsPerYear), getMin(topNCoAuthorObjects[i].ConfsPerYear));
          // var lYear = Math.max(getMax(topNCoAuthorObjects[i].JournalsPerYear), getMax(topNCoAuthorObjects[i].ConfsPerYear));
          var sYear = Math.min(getMin(topNCoAuthorObjects[i].AllPublicationsPerYear));
          var lYear = Math.min(getMax(topNCoAuthorObjects[i].AllPublicationsPerYear));
          //console.log(topNCoAuthorObjects[i].Name + ":" + sYear + ":" + lYear);
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
          //Generating graphs for author stats 
         var pct = percentRank(statData, pubCount);
         
         if(t==1){ // call once as process() is called twice with t=1 and t=2
            generateProfileText(pdata, adata, aObject, pct, dataForGantt);
          }
          generateVis(dataForGantt, topNCoAuthorObjects, container, pdata, name, adata, items);

      }
    
      else {
        document.getElementById("name").innerHTML = '<span style="color:red">' + "Author not found!";
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

// function getTopNItems(items, NoOfAuthorPublications, threshold) {
//   //Basic! Returns the authors which are above a certain percent thresold
//   var topItems = [];
//   // console.log("Here are his coauthors!!!")
//   // items.sort(function(a, b) {
//   //   return b.count - a.count;
//   // });
//   console.log(items);
//   for (var i = 0; i < items.length; i++) {
//     var percentPublications = Math.round(items[i].Value / NoOfAuthorPublications * 100);
//     if (percentPublications > threshold) {
//       topItems.push(items[i]);

//     }
//   }
//   topItems.sort(function(a, b) {
//     return b.Value - a.Value;
//   });
//   return topItems;
// }

// function getTopNItems(items, NoOfAuthorPublications, minN, maxN, MinimumNoOfOutputItems) {
 
//   //Given [minN, maxN] percentage range and N (minimum desired authors) returns the authors that lie in the percent interval [minN, maxN]
//   var N = MinimumNoOfOutputItems; 
//   if (N==0){ N =1 ;}
//   var minN = minN;
//   var maxN = maxN;
//   var topItems = [];
//   var finaltopItems=[];


//   for (var i = 0; i < items.length; i++) {
//     var percentPublications = Math.round(items[i].Value / NoOfAuthorPublications * 100);
//     if (percentPublications >= minN && percentPublications <= maxN) {
//       topItems.push(items[i]);

//     }
//   }
//   topItems.sort(function(a, b) {
//     return b.Value - a.Value;
//   });

//   if (topItems.length > N){
//     //console.log(topItems);
//     var gaps = [];
//     for(var i=N;i<topItems.length;i++){
//       var gap = topItems[i-1].Value - topItems[i].Value;
//       gaps.push(gap);
//     }
//     //console.log(gaps);
//     var maxGap = d3.max(gaps);
//     var cutPoint = gaps.indexOf(maxGap) + N ; // adding 1 due to 0-indexing system 
//     //console.log(cutPoint);

    
//     for (var i=0;i<cutPoint;i++){
//       finaltopItems.push(topItems[i]);
//     }
//   }
//   else {
//     finaltopItems = topItems;
//   }
//   //console.log(finaltopItems);

//   return finaltopItems;
// }

function getTopNItems(items, minN, maxN, t) {
 
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
  if (t==2){
    var tier2authors = subtractArrayOfObjects(topItems,finaltopItems);
    finaltopItems = tier2authors; 
    //console.log(finaltopItems);
  }
  return finaltopItems;
}
function subtractArrayOfObjects(a1,a2){
  for (var i=0; i<a1.length;i++){
    for (var j=0;j<a2.length;j++){
      if (a1[i].Name == a2[j].Name){
        a1.splice(i,1);
      }
    }
  }
  return a1;
}

function percentRank(array, n) {
  var L = 0;
  var S = 0;
  var N = array.length

  for (var i = 0; i < array.length; i++) {
    if (array[i] < n) {
      L += 1
    } else if (array[i] === n) {
      S += 1
    } else {

    }
  }

  var pct = (L + (0.5 * S)) / N

  return pct * 100;
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