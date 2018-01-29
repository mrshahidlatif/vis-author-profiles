function process(name) {
  //Processing the data 
  var pdata;
  var adata;
  var allCoAuthors = [];
  var authorPubCoun = 0;
  loadJSON("pubdata.json", function(response) {
    pdata = JSON.parse(response);
    var c = 0;
    for (var i = 0; i < pdata.length; i++) {
      for (var j = 0; j < pdata[i].Authors.length; j++) {
        if (pdata[i].Authors[j].Name == name) {
          authorPubCoun++;
          for (var k = 0; k < pdata[i].Authors.length; k++) {
            allCoAuthors.push(pdata[i].Authors[k].Name);
          }
        }
      }
    }
    var distCoAuthors = compressArray(allCoAuthors, name);
    var topNCoAuthor = getTopNCoAuthors(distCoAuthors, authorPubCoun, 8);
    var topNCoAuthorObjects = [];

    loadJSON("authordata.json", function(response) {
      adata = JSON.parse(response);
      for (var i = 0; i < topNCoAuthor.length; i++) {
        for (var j = 0; j < adata.length; j++) {
          if (adata[j].Name == topNCoAuthor[i].value) {
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
        a.MutualPublications = topNCoAuthor[i].count;
        //console.log(a.MutualPublications/(2017-a.StartYear)); 
        dataForGantt.push(a);
      }
      //console.log(dataForGantt);
      for (var i=0;i<dataForGantt.length;i++){
        var mppy = getMutualPublications(pdata,name, dataForGantt[i].Name);
        dataForGantt[i]["MutualPubPerYear"] = mppy;
        
      }
      //console.log(dataForGantt);
      generateVis(dataForGantt, topNCoAuthorObjects, "CollabChart",pdata, name);
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
       generateProfileText(pdata, adata, aObject, pct);
  });
});
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

function getTopNCoAuthors(distCoAuthors, NoOfAuthorPublications, threshold) {
  var topAuthors = [];
  // console.log("Here are his coauthors!!!")
  // distCoAuthors.sort(function(a, b) {
  //   return b.count - a.count;
  // });
  //console.log(distCoAuthors);
  for (var i = 0; i < distCoAuthors.length; i++) {
    var percentPublications = Math.round(distCoAuthors[i].count / NoOfAuthorPublications * 100);
    if (percentPublications > threshold) {
      topAuthors.push(distCoAuthors[i]);

    }
  }
  topAuthors.sort(function(a, b) {
    return b.count - a.count;
  });
  return topAuthors;
}

// function generateProfile(name) {
//   //Generate graphics
//   var adata;
//   var jpy;
//   var cpy;
//   var statData = []; //For computing statistics 
//   var pubCount = 0; //No of publications for searched author
//   var aObject;
//   loadJSON("authordata.json", function(response) {
//     adata = JSON.parse(response);
//     //console.log(adata);
//     for (var i = 0; i < adata.length; i++) {
//       statData.push(adata[i].Journals + adata[i].Conferences);
//       if (adata[i].Name == name) {
//         aObject = adata[i];
//         pubCount = adata[i].Journals + adata[i].Conferences;
//         jpy = adata[i].JournalsPerYear;
//         cpy = adata[i].ConfsPerYear;
//       }
//     }
//     //Generating graphs for author stats 
//    var pct = percentRank(statData, pubCount);
//    generateProfileText(adata, aObject, pct);

//   });
// }

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
      a.value = original[i];
      a.count = myCount;
      compressed.push(a);
    }
  }
  //Remove the self author 
  compressed = $.grep(compressed,
    function(o, i) {
      return o.value === name;
    },
    true);
  return compressed;
};