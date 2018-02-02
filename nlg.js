function generateProfileText(pdata, adata, aObject, percentile, topCoAuthors) {
	
	//console.log(pdata);
	//console.log(adata);
	// console.log(aObject);
	// console.log(percentile);
	var bio = "";
	var collab="";
	document.getElementById("name").innerHTML = aObject.Name; 

	var bio = generateSummary(pdata, adata, aObject, percentile);
	var collab = generateCollaborationText(pdata, adata, aObject, topCoAuthors);

	document.getElementById("bio").innerHTML = bio;
	document.getElementById("collab").innerHTML = collab;

	generateSparkline(aObject.ConfsPerYear,"sparklineConfs");
	generateSparkline(aObject.JournalsPerYear,"sparklineJournals");
}

function generateSummary(pdata, adata, a, p)
{
	var bio = "";
	var pub = getPublications(pdata, a.Name);
	//console.log(pub);
	var sYear = d3.min(a.AllPublicationsPerYear, function(d){return d.Year;});
	bio = a.Name + " is a senior researcher publishing since " + sYear + "." + " Until now, he has "
	+ "published "+ a.Journals + " journal " + '<svg width="70" height="20" id="sparklineJournals"></svg>' 
	+ "and " + a.Conferences + " conference articles" +  ' <svg width="70" height="20" id="sparklineConfs"></svg>' 
	+ ".";

	return bio;
}

function generateCollaborationText(pdata, adata, a, topCoAuthors){
	console.log(topCoAuthors);
	var collab = "";
	//top collaboration 
	collab = collab + getFirstNamePronoun(a.Name) + " top collaborator" + '<span id=info onclick="showAdditionalInfo()">[?]</span>' 
	+ " is " + topCoAuthors[0].Name 
	+ " and this collaboration resulted in " + topCoAuthors[0].MutualPublications + " research articles over a span of ";
	var range = +d3.max(topCoAuthors[0].MutualPubPerYear, function(d){return d.Year}) - 
	+d3.min(topCoAuthors[0].MutualPubPerYear, function(d){return d.Year}) + 1;
	collab = collab + range + " years. ";
	
	//active collaboration
	var avgPaperPerYear = []; 
	for (var i=0;i<topCoAuthors.length;i++){
		var at = topCoAuthors[i];
		var range = +d3.max(at.MutualPubPerYear, function(d){return d.Year}) - 
		+d3.min(at.MutualPubPerYear, function(d){return d.Year});
		console.log(at.Name + ":" + at.MutualPublications + " : " + range);
		console.log(at.MutualPublications/(range+1));
		var ppy = at.MutualPublications/(range+1);  	
		avgPaperPerYear.push(ppy);

	}
	var maxPPY = d3.max(avgPaperPerYear);
	var aci = avgPaperPerYear.indexOf(maxPPY); // aci : active collaborator index
	var duration = +d3.max(topCoAuthors[aci].MutualPubPerYear, function(d){return d.Year}) - 
		+d3.min(topCoAuthors[aci].MutualPubPerYear, function(d){return d.Year});
	if(duration > 5 && maxPPY > 3){ //active collaborator is different from top collaborator 
		collab += "Among the top collaborators, " + getFirstNamePronoun(a.Name) + " most active collaboration" +  
		'<span id=info onclick="showAdditionalInfo2()">[?]</span>' + " is with " + topCoAuthors[aci].Name + " with an average of "
		+ Math.round(avgPaperPerYear[aci]) + " articles per year.";
	}
	return collab;
}
function showAdditionalInfo(){
	document.getElementById("dod").innerHTML = "Top collaborator is decided on the basis of maximum number of mutual publications."; 
}

function showAdditionalInfo2(){
	document.getElementById("dod").innerHTML = "Active collaboration is measured in terms of maximum number of published articles" +
	" per year."; 
}


function getFirstNamePronoun(fullName){
	var firstName = fullName.split(" ", 1);
	return firstName + "'s";
}

function isFirstAuthor(p, a){
	var tempAuthors = []; 
    for (var j=0;j<p.Authors.length;j++){
      tempAuthors.push(p.Authors[j].Name);
      }
    //console.log(tempAuthors);
    if(tempAuthors[0]===a)
    {
        return true;
    } else return false; 
}

function getPublications(pdata, name){

  var publications = []; 
  for(var i=0;i<pdata.length;i++){
    var tempAuthors = []; 
    for (var j=0;j<pdata[i].Authors.length;j++){
      tempAuthors.push(pdata[i].Authors[j].Name);
      }
      if(tempAuthors.indexOf(name) != -1)
      {
        publications.push(pdata[i]);
      }
    }
    return publications; 
}