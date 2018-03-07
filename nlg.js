function generateProfileText(pdata, adata, aObject, percentile, topCoAuthors) {
	
	//console.log(pdata);
	//console.log(adata);
	// console.log(aObject);
	// console.log(percentile);
	var bio = "";
	var collab="";
	var sup=""; 
	document.getElementById("name").innerHTML = aObject.Name; 
	var bio = generateSummary(pdata, adata, aObject, percentile);
	var collab = generateCollaborationText(pdata, adata, aObject, topCoAuthors);
	var sup = generateSupervisorRelationText(pdata, adata, aObject, topCoAuthors);
	var supvisee = generateSuperviseeRelationText(pdata, adata, aObject);

	document.getElementById("bio").innerHTML = bio;
	document.getElementById("collab").innerHTML = collab;
	document.getElementById("sup").innerHTML = sup;
	document.getElementById("supvisee").innerHTML = supvisee;


	generateSparkline(aObject.ConfsPerYear,"sparklineConfs", 20, 90);
	generateSparkline(aObject.JournalsPerYear,"sparklineJournals", 20, 90);
	generateSparkline(aObject.AllPublicationsPerYear,"sparklineAll", 20, 90);
}

function generateSummary(pdata, adata, a, p)
{
	var bio = "";
	var pub = getPublications(pdata, a.Name);
	//console.log(pub);
	var sYear = d3.min(a.AllPublicationsPerYear, function(d){return d.Year;});
	bio = a.Name + " is publishing since " + sYear + "." + " Until now, he has "+ "published " + (a.Journals+a.Conferences)
	+ " articles " + '<svg width="70" height="20" id="sparklineAll"></svg>' + " including "
	+ a.Journals + " journal " + '<svg width="70" height="20" id="sparklineJournals"></svg>' 
	+ "and " + a.Conferences + " conference articles" +  ' <svg width="70" height="20" id="sparklineConfs"></svg>' 
	+ ".";

	return bio;
}
function generateCollaborationText(pdata, adata, a, topCoAuthors){
	//console.log(topCoAuthors);
	var collab = "";
	//top collaboration 
	collab = collab + getFirstNamePronoun(a.Name) + " top collaborator" + '<span id=info onclick="showAdditionalInfo()">&#9432</span>' 
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
		//console.log(at.Name + ":" + at.MutualPublications + " : " + range);
		//console.log(at.MutualPublications/(range+1));
		var ppy = at.MutualPublications/(range+1);  	
		avgPaperPerYear.push(ppy);

	}
	var maxPPY = d3.max(avgPaperPerYear);
	var aci = avgPaperPerYear.indexOf(maxPPY); // aci : active collaborator index
	var duration = +d3.max(topCoAuthors[aci].MutualPubPerYear, function(d){return d.Year}) - 
		+d3.min(topCoAuthors[aci].MutualPubPerYear, function(d){return d.Year});
	if(duration > 5 && maxPPY > 3){ //active collaborator is different from top collaborator 
		collab += "Among the top collaborators, " + getFirstNamePronoun(a.Name) + " most active collaboration" +  
		'<span id=info onclick="showAdditionalInfo2()">&#9432</span>' + " is with " + topCoAuthors[aci].Name + " with an average of "
		+ Math.round(avgPaperPerYear[aci]) + " articles per year.";
	}
	return collab;
}

function generateSupervisorRelationText(pdata, adata, a, topCoAuthors){
	//console.log(topCoAuthors);
	//console.log(a);
	var sup = "";
	var supervisors = []; 
	var main_author_startYear = getStartYear(a);
	//console.log(main_author_startYear);
	for (var i=0;i<topCoAuthors.length;i++){
		if(topCoAuthors[i].StartYear < main_author_startYear + 5) {
			var pubs = getAllMutualPublications(pdata, a.Name, topCoAuthors[i].Name)
			//console.log(pubs); 
			if (isSupervisor(pubs,a.Name,topCoAuthors[i].Name)){
				supervisors.push(topCoAuthors[i].Name);
				//console.log (topCoAuthors[i].Name + " : " + "YES");
			}
		}
	}
	if(supervisors.length == 1){
		sup += "Based on the publication data, the author has worked under the supervision" 
		+'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' + "of " + supervisors[0] + ".";
	}
	else if (supervisors.length == 2) {
			sup += "Based on the publication data, it is inferred that the author has worked under the supervision" 
		+'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' + " of " + supervisors[0] + " and " + supervisors[1] + ".";
	}
	else {
		sup = "";
	}

	return sup;
}
function generateSuperviseeRelationText(pdata, adata, a){
	var text = "";
	var supervisees = findSupervisee(pdata, adata, a);
	console.log(supervisees);
	sortByValue(supervisees);
	console.log(supervisees);
	
	if(supervisees.length>0){
		text += "According to publication data analysis, the author assumes the role of a supervisor" + 
		"His noteable supervised researchers"+ '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + " are ";
		for (var i=0;i<3;i++){
			if(i==2){
				text += " and " + supervisees[i].Name+ ".";
			}
			else {
				text += supervisees[i].Name + ", ";
			}
		}
		
	}
	return text; 

}

function isSupervisor(pdata,aName,cName){
	var count1 = 0; // frequency of main author before potential supervisor
	var count2 = 0; // frequency of main author after potential supervisor
	var count3 = 0; //frequency of potential supervisor being last author
	for (var i=0;i<pdata.length;i++){
		var tempCoAuthors = [];
		for (var j=0;j<pdata[i].Authors.length;j++){
			tempCoAuthors.push(pdata[i].Authors[j].Name)
		}
		//console.log(tempCoAuthors);
		if (tempCoAuthors.indexOf(cName)>tempCoAuthors.indexOf(aName)){
			count1++;
		}
		else {
			count2++;
		}
		if (tempCoAuthors.indexOf(cName) == tempCoAuthors.length-1){
			count3++;
		}
	}
	if (count1>count2){
		if (count3/pdata.length*100 > 50){
			return true; 
		}
	}
	else return false; 
}

function showAdditionalInfo(){
	document.getElementById("dod").innerHTML =  '<span id=sideBarHead>' + "About Top Collaborator" + "</span>" + "<br>" + "<hr>" + 
	"Top collaborator is decided on the basis of maximum number of mutual publications."; 
}

function showAdditionalInfo2(){
	document.getElementById("dod").innerHTML = '<span id=sideBarHead>' + "About Active Collaboration" + "</span>" + "<br>" + "<hr>" + 
	"Active collaboration is measured in terms of maximum number of average articles published per year."; 
}

function showAdditionalInfo3(){
	document.getElementById("dod").innerHTML = '<span id=sideBarHead>' + "About Supervisor Relationship" + "</span>" + "<br>" + "<hr>" + 
	"Supervisor relationship is calculated based on the seniority and the order of authors in publications. If a coauthor started working "+
	"at least 5 year prior to the main author and appeared as the last author in half of the mutual publications, then that coauthor is " +
	"categorized as the supervisor of the main author.";
}
function showAdditionalInfo4(){
	document.getElementById("dod").innerHTML = '<span id=sideBarHead>' + "About Supervisee Relationship" + "</span>" + "<br>" + "<hr>" +
	"To be added....!";
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

function getPublicationsAsLastAuthor(pdata, name){

  var publications = []; 
  for(var i=0;i<pdata.length;i++){
    var tempAuthors = []; 
    for (var j=0;j<pdata[i].Authors.length;j++){
      tempAuthors.push(pdata[i].Authors[j].Name);
      }
      if(tempAuthors.indexOf(name) != -1 && tempAuthors.indexOf(name)==tempAuthors.length-1 && tempAuthors.length >=2)
      {
        publications.push(pdata[i]);
      }
    }
    return publications; 
}

function getStartYear(a){
	var y = d3.min(a.AllPublicationsPerYear, function(d){return +d.Year;})

	return y;
}

function getAllMutualPublications(pubData, aName, cName){
  //Return array of mutual publications of Author and CoAuthor for Year "year"
  var mutualPublications = []; 
  for(var i=0;i<pubData.length;i++){
      var tempAuthors = []; 
      for (var j=0;j<pubData[i].Authors.length;j++){
        tempAuthors.push(pubData[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(aName) != -1 && tempAuthors.indexOf(cName) != -1)
        {
          mutualPublications.push(pubData[i]);
        }
  }
    return mutualPublications; 
}

function getAllMutualPublicationsForSuperVisee(pubData, aName, cName){
  // Return array of mutual publications of Author and potential supervisor when 
  // aName is the first author 
  // cName is the last author 
  var mutualPublications = []; 
  for(var i=0;i<pubData.length;i++){
      var tempAuthors = []; 
      for (var j=0;j<pubData[i].Authors.length;j++){
        tempAuthors.push(pubData[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(aName) != -1 && tempAuthors.indexOf(cName) != -1 && tempAuthors.indexOf(aName) == 0 && tempAuthors.indexOf(cName) == tempAuthors.length-1 )
        {
          mutualPublications.push(pubData[i]);
        }
  }
    return mutualPublications; 
}
function findSupervisee(pubData, adata, author){
	//console.log(pubData);
	//console.log(author);
	//console.log(adata);
	var supervisees=[];
	var potentialSupervisees = [];
	var pubs = getPublicationsAsLastAuthor(pubData, author.Name);
	//console.log(pubs);

	var SupervisorStartYear = Math.min(getMin(author.JournalsPerYear), getMin(author.ConfsPerYear));
	//console.log(SupervisorStartYear);

	for(var i=0;i<pubs.length;i++){
		var firstAuthor = pubs[i].Authors[0].Name;
		if(potentialSupervisees.indexOf(firstAuthor) == -1){
			potentialSupervisees.push(firstAuthor);
		}
	}
	//console.log(potentialSupervisees)
	for(var i=0;i<potentialSupervisees.length;i++){
		var firstAuthor = potentialSupervisees[i];
		//console.log(firstAuthor);
		var aObject = findAuthorObjectByName(adata,firstAuthor);
		//console.log(aObject);
		if(aObject != null){
			var AuthorStartYear = Math.min(getMin(aObject.JournalsPerYear), getMin(aObject.ConfsPerYear));
			//console.log(AuthorStartYear);
			if(SupervisorStartYear + 5 < AuthorStartYear ){
				var mutualPubs = getAllMutualPublicationsForSuperVisee(pubs,aObject.Name,author.Name)
				if(supervisees.indexOf(firstAuthor) == -1 && mutualPubs.length > 1){
					 var obj = new Object();
					 obj.Name = firstAuthor;
					 obj.Count = mutualPubs.length;
					supervisees.push(obj);
				}
			}
		}
	}
	//console.log(supervisees);
	return supervisees;
}
function findAuthorObjectByName(adata, a){
	var obj=null;
	for (var j = 0; j < adata.length; j++) {
        if (adata[j].Name == a) {
            obj = adata[j];
        }
    }
    return obj;
}

function sortByValue(data) {
  data.sort(function(a, b) {
    return +(b.Count) - +(a.Count);
  });
  return data;
}