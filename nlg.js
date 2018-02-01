function generateProfileText(pdata, adata, aObject, percentile, topCoAuthors) {
	
	//console.log(pdata);
	//console.log(adata);
	// console.log(aObject);
	// console.log(percentile);
	var bio = "";
	var collab="";
	document.getElementById("name").innerHTML = aObject.Name; 
	//perc<25% means only 2 publication
	if (percentile < 25) {
		bio = getbio_25(pdata, adata, aObject, percentile);

	} else if (percentile >= 75 && percentile < 90) {
		bio = getbio_75_90(pdata, adata, aObject, percentile);
		collab = generateCollaborationText(pdata, adata, aObject, topCoAuthors);
	} else if (percentile >= 90) {
		bio = getbio_90(pdata, adata, aObject, percentile);
		collab = generateCollaborationText(pdata, adata, aObject, topCoAuthors);
	}

	// document.getElementById("bio").innerHTML = bio;
	document.getElementById("bio").innerHTML = bio;
	document.getElementById("collab").innerHTML = collab;

	generateSparkline(aObject.ConfsPerYear,"sparklineConfs");
	generateSparkline(aObject.JournalsPerYear,"sparklineJournals");
	//generateSparkline(aObject.JournalsPerYear,"sparklineJournals");
	//Research Group 
	if (aObject.CoAuthors != 0) {
		//document.getElementById("collab").innerHTML = "He has worked with " + aObject.CoAuthors + " coauthors so far." +
			//" His maximum number of publications are with " + aObject.ResearchGroup[0].Name + "." 
	}

	//PhD Supervisor 
	if (aObject.Supervisor != "") {
		//document.getElementById("supervisor").innerHTML = "His probable PhD supervisor is " + aObject.Supervisor + ".";
	}
}
function getbio_25(pdata, adata, a, p)
{
	//Authors with 1 or two publications!
	var bio = "";
	var pub = getPublications(pdata, a.Name);
	//console.log(pub);
	var sYear = d3.min(a.AllPublicationsPerYear, function(d){return d.Year;});
	if(pub.length == 1){
		if(sYear>=2012 && isFirstAuthor(pub[0],a.Name)) { 
			bio = "It seems, "+ a.Name + " is a PhD student and published his first article in " +
			pub[0].Year + ".";
		}
		else if (sYear < 2012 && isFirstAuthor(pub[0],a.Name)){
			bio = "It seems, "+ a.Name + " published as a bachelor/master/PhD student in " + pub[0].Year + 
			" and later moved to industry or an academic field other than CS.";
		}
		else if (sYear < 2012 && !isFirstAuthor(pub[0],a.Name)){
			bio = "It seems, "+ a.Name + " published as a bachelor/master student in " + pub[0].Year + 
			" and later moved to industry or an academic field other than CS.";
		}
	}
	return bio;
}
function getbio_75_90(pdata, adata, a, p)
{
	//Authors with more than 90 percentile
	
	var bio = "";
	var pub = getPublications(pdata, a.Name);
	//console.log(pub);
	var summ = generateSummary(pdata, adata, a.Name);
	var sYear = d3.min(a.AllPublicationsPerYear, function(d){return d.Year;});
	bio = a.Name + " is a junior researcher publishing since " + sYear + "." + " Until now, he has "
	+ "published "+ a.Journals + " " + '<svg width="70" height="20" id="sparklineJournals"></svg>' 
	+ " journals " + "and " + a.Conferences + " " + ' <svg width="70" height="20" id="sparklineConfs"></svg>' 
	+ " conference articles.";

	return bio + summ;
}

function getbio_90(pdata, adata, a, p)
{
	//Authors with more than 90 percentile
	// generateSparkline(a.ConfsPerYear,"sparklineConfs");
	// generateSparkline(a.JournalsPerYear,"sparklineJournals");
	var summ = generateSummary(pdata, adata, a.Name);
	var bio = "";
	var pub = getPublications(pdata, a.Name);
	//console.log(pub);
	var sYear = d3.min(a.AllPublicationsPerYear, function(d){return d.Year;});
	bio = a.Name + " is a senior researcher publishing since " + sYear + "." + " Until now, he has "
	+ "published "+ a.Journals + " journals " + '<svg width="70" height="20" id="sparklineJournals"></svg>' 
	+ "and " + a.Conferences + " conference " +  ' <svg width="70" height="20" id="sparklineConfs"></svg>' 
	+ " articles.";

	return bio + summ;
}

function generateSummary(pdata, adata, a){
	
	//console.log(adata);
	var summary = "";
	var fpub;
	var aObj = getAuthorObjectByName(adata, a)
	var pubs = getPublications(pdata, a);
	var StartYear = d3.min(aObj.AllPublicationsPerYear, function(d){return d.Year;});
	
	for (var i=0;i<pubs.length;i++){
		if(pubs[i].Year == StartYear)
			fpub = pubs[i];
	}
	summary = " He published his first article with "
	for (var i=0;i<fpub.Authors.length;i++)
		if (fpub.Authors[i].Name != a)
		summary = summary + fpub.Authors[i].Name + ", ";
	return summary; 
}

function generateCollaborationText(pdata, adata, a, topCoAuthors){
	//console.log(topCoAuthors);
	var collab = "Throughout his career, he has worked with ";
	if(a.CoAuthors > 100) {
		collab = collab + "hundreds of coauthors "
	}
	else if (a.CoAuthors>10 && a.CoAuthors<100){
		collab = collab + "tens of coauthors "
	}
	else if (a.CoAuthors <= 10)
		collab = collab + a.CoAuthors + "coauthers "

	collab = collab + "and his most fruitful collaboration was with " + topCoAuthors[0].Name 
	+ " resulting in " + topCoAuthors[0].MutualPublications + " research articles over a span of ";
	var range = +d3.max(topCoAuthors[0].MutualPubPerYear, function(d){return d.Year}) - 
	+d3.min(topCoAuthors[0].MutualPubPerYear, function(d){return d.Year});
	collab = collab + range + " years.";
	
	for (var i=0;i<topCoAuthors.length;i++){
		var a = topCoAuthors[i];
		var range = +d3.max(a.MutualPubPerYear, function(d){return d.Year}) - 
		+d3.min(a.MutualPubPerYear, function(d){return d.Year});
		//console.log(a.MutualPublications/range); 	
	}
	
	return collab;
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