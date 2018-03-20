function process(pdata, adata, name,container, l,u, t) {
  //Processing the data 
  // var pdata;
  // var adata;
  var allCoAuthors = [];
  var authorPubCoun = 0;
  var isFound = false;

  // loadJSON("pubdata.json", function(response) {
  //   pdata = JSON.parse(response);

  // loadJSON("authordata.json", function(response) {
  //   adata = JSON.parse(response);

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

      var distCoAuthors = compressArray(allCoAuthors, name);
      //console.log(distCoAuthors); 
      var topNCoAuthor = getTopNCoAuthors(distCoAuthors, l, u,t);
      var topNCoAuthorObjects = [];

      
      for (var i = 0; i < topNCoAuthor.length; i++) {
        for (var j = 0; j < adata.length; j++) {
          if (adata[j].Name == topNCoAuthor[i].Name) {
            topNCoAuthorObjects.push(adata[j]);
          }
        }
      }
        var dataForGantt = [];
        for (var i = 0; i < topNCoAuthorObjects.length; i++) {
          var sYear = Math.min(getMin(topNCoAuthorObjects[i].JournalsPerYear), getMin(topNCoAuthorObjects[i].ConfsPerYear));
          var lYear = Math.max(getMax(topNCoAuthorObjects[i].JournalsPerYear), getMax(topNCoAuthorObjects[i].ConfsPerYear));
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

          generateCollaborationChart(dataForGantt, topNCoAuthorObjects, container, pdata, name, adata, distCoAuthors, 1); 

      }
    
      else {
        document.getElementById("name").innerHTML = '<span style="color:red">' + "Author not found!";
      }
  //   });
  // });
}
function generateCollaborationChart(dataForGantt, topNCoAuthorObjects, container, pdata, name, adata , distCoAuthors, times){
    if (dataForGantt.length > 0 && times == 1 ){
            generateVis(dataForGantt, topNCoAuthorObjects, container, pdata, name, adata, distCoAuthors);
          }
    else 
    {
        console.log("loading more!!!");
        // Preparing data for collaboration visualization 
        //-----------------------------------------------------
        var distCoAuthorsObjects = []; 
        for (var i = 0; i < distCoAuthors.length; i++) {
          for (var j = 0; j < adata.length; j++) {
            if (adata[j].Name == distCoAuthors[i].Name) {
              distCoAuthorsObjects.push(adata[j]);
            }
          }
        }
        //console.log(distCoAuthorsObjects); 
          var dataForCollaborationVis = [];
          for (var i = 0; i < distCoAuthorsObjects.length; i++) {
            var sYear = Math.min(getMin(distCoAuthorsObjects[i].JournalsPerYear), getMin(distCoAuthorsObjects[i].ConfsPerYear));
            var lYear = Math.max(getMax(distCoAuthorsObjects[i].JournalsPerYear), getMax(distCoAuthorsObjects[i].ConfsPerYear));
            //console.log(distCoAuthorsObjects[i].Name + ":" + sYear + ":" + lYear);
            var a = new Object();
            a.Name = distCoAuthorsObjects[i].Name;
            a.StartYear = sYear;
            a.EndYear = lYear;
            a.MutualPublications = distCoAuthors[i].Value;
            //console.log(a.MutualPublications/(2017-a.StartYear)); 
            dataForCollaborationVis.push(a);
          }
          
          for (var i=0;i<dataForCollaborationVis.length;i++){
            var mppy = getMutualPublications(pdata,name, dataForCollaborationVis[i].Name);
            dataForCollaborationVis[i]["MutualPubPerYear"] = mppy;
            
          }
          //console.log(dataForCollaborationVis);
          //----------------------------------------------------------------------------------------------
           //console.log(dataForGantt);
          generateVis(dataForCollaborationVis, distCoAuthorsObjects, container, pdata, name, adata);
    }
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

// function getTopNCoAuthors(distCoAuthors, NoOfAuthorPublications, threshold) {
//   //Basic! Returns the authors which are above a certain percent thresold
//   var topAuthors = [];
//   // console.log("Here are his coauthors!!!")
//   // distCoAuthors.sort(function(a, b) {
//   //   return b.count - a.count;
//   // });
//   console.log(distCoAuthors);
//   for (var i = 0; i < distCoAuthors.length; i++) {
//     var percentPublications = Math.round(distCoAuthors[i].Value / NoOfAuthorPublications * 100);
//     if (percentPublications > threshold) {
//       topAuthors.push(distCoAuthors[i]);

//     }
//   }
//   topAuthors.sort(function(a, b) {
//     return b.Value - a.Value;
//   });
//   return topAuthors;
// }

// function getTopNCoAuthors(distCoAuthors, NoOfAuthorPublications, lowerThreshold, UpperThreshold, MinimumNoOfOutputItems) {
 
//   //Given [l, u] percentage range and N (minimum desired authors) returns the authors that lie in the percent interval [l, u]
//   var N = MinimumNoOfOutputItems; 
//   if (N==0){ N =1 ;}
//   var l = lowerThreshold;
//   var u = UpperThreshold;
//   var topAuthors = [];
//   var finalTopAuthors=[];

//   for (var i = 0; i < distCoAuthors.length; i++) {
//     var percentPublications = Math.round(distCoAuthors[i].Value / NoOfAuthorPublications * 100);
//     if (percentPublications >= l && percentPublications <= u) {
//       topAuthors.push(distCoAuthors[i]);

//     }
//   }
//   topAuthors.sort(function(a, b) {
//     return b.Value - a.Value;
//   });

//   if (topAuthors.length > N){
//     //console.log(topAuthors);
//     var gaps = [];
//     for(var i=N;i<topAuthors.length;i++){
//       var gap = topAuthors[i-1].Value - topAuthors[i].Value;
//       gaps.push(gap);
//     }
//     //console.log(gaps);
//     var maxGap = d3.max(gaps);
//     var cutPoint = gaps.indexOf(maxGap) + N ; // adding 1 due to 0-indexing system 
//     //console.log(cutPoint);

    
//     for (var i=0;i<cutPoint;i++){
//       finalTopAuthors.push(topAuthors[i]);
//     }
//   }
//   else {
//     finalTopAuthors = topAuthors;
//   }
//   //console.log(finalTopAuthors);

//   return finalTopAuthors;
// }

function getTopNCoAuthors(distCoAuthors, lowerThreshold, UpperThreshold, t) {
 
  //Given [l, u] range: returns the authors in that range by systematically cutting off the list
  //For instance, check for Fabian Beck, Thomas Ertl, Daniel A. Keim to see its effect
  var l = lowerThreshold;
  var u = UpperThreshold;
  var topAuthors = [];
  var finalTopAuthors=[];

  distCoAuthors.sort(function(a, b) {
    return b.Value - a.Value;
  });
  //console.log(distCoAuthors);
  if (u < distCoAuthors.length){
    for (var i = 0; i < u; i++) {
        topAuthors.push(distCoAuthors[i]);

    }   
  }
  else {
    topAuthors = distCoAuthors;
  }

  if (topAuthors.length > l){
    // console.log(topAuthors);
    var gaps = [];
    for(var i=l;i<topAuthors.length;i++){
      var gap = topAuthors[i-1].Value - topAuthors[i].Value;
      gaps.push(gap);
    }
    // console.log(gaps);
    var maxGap = d3.max(gaps);
    var cutPoint = gaps.indexOf(maxGap) + l ; // adding 1 due to 0-indexing system 
    //console.log(cutPoint);
    
    for (var i=0;i<cutPoint;i++){
      finalTopAuthors.push(topAuthors[i]);
    }
  }
  else {
    finalTopAuthors = topAuthors;
  }
  // console.log(finalTopAuthors);
  if (t==2){
    var tier2authors = subtractArrayOfObjects(topAuthors,finalTopAuthors);
    finalTopAuthors = tier2authors; 
    //console.log(finalTopAuthors);
  }
  return finalTopAuthors;
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