function generateProfileText(pdata, adata, aObject, percentile) {
	
	//console.log(pdata);
	//console.log(adata);
	// console.log(aObject);
	// console.log(percentile);
	var bio = "";
	//perc<25% means only 2 publication
	if (percentile < 25) {
		bio = getbio_25(pdata, adata, aObject, percentile);

	} else if (percentile >= 75 && percentile < 90) {
		bio = getbio_75_90(pdata, adata, aObject, percentile);
	} else if (percentile >= 90) {
		bio = getbio_90(pdata, adata, aObject, percentile);
	}

	document.getElementById("bio").innerHTML = bio;

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
	generateSparkline(a.ConfsPerYear,"sparklineConfs");
	generateSparkline(a.JournalsPerYear,"sparklineJournals");
	var bio = "";
	var pub = getPublications(pdata, a.Name);
	//console.log(pub);
	var sYear = d3.min(a.AllPublicationsPerYear, function(d){return d.Year;});
	bio = a.Name + " is a junior researcher publishing since " + sYear + "." + " Until now, he has "
	+ "published "+ a.Journals + " journals " + "and " + a.Conferences + " conference articles." ;

	return bio;
}

function getbio_90(pdata, adata, a, p)
{
	//Authors with more than 90 percentile
	generateSparkline(a.ConfsPerYear,"sparklineConfs");
	generateSparkline(a.JournalsPerYear,"sparklineJournals");
	var bio = "";
	var pub = getPublications(pdata, a.Name);
	//console.log(pub);
	var sYear = d3.min(a.AllPublicationsPerYear, function(d){return d.Year;});
	bio = a.Name + " is a senior researcher publishing since " + sYear + "." + " Until now, he has "
	+ "published "+ a.Journals + " journals " + "and " + a.Conferences + " conference articles." ;


	return bio;
}

function isFirstAuthor(p, a){
	var tempAuthors = []; 
    for (var j=0;j<p.Authors.length;j++){
      tempAuthors.push(p.Authors[j].Name);
      }
    console.log(tempAuthors);
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