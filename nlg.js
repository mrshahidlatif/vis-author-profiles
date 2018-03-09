function generateProfileText(pdata, adata, aObject, percentile, topCoAuthors) {
	
	//console.log(pdata);
	//console.log(adata);
	// console.log(aObject);
	// console.log(percentile);
	var isSupervisorBadge=false;
	var bio = "";
	var collab="";
	var sup=""; 
	var title= aObject.Name;
	
	//document.getElementById("name").innerHTML = title;

	var bio = generateSummary(pdata, adata, aObject, percentile);

	var text = generateCollaborationRelationship(pdata, adata, aObject, topCoAuthors);

	var collab = generateCollaborationText(pdata, adata, aObject, topCoAuthors);
	var sup = generateSupervisorRelationText(pdata, adata, aObject, topCoAuthors);
	var supvisee = generateSuperviseeRelationText(pdata, adata, aObject);
	var firstAuthorPubs = getPublicationsAsFirstAuthor(pdata,aObject.Name,"A");
	var firstAuthorJournals = getPublicationsAsFirstAuthor(pdata,aObject.Name,"J");
	var firstAuthorConfs = getPublicationsAsFirstAuthor(pdata,aObject.Name,"C");

	//Displaying the badges 
	var totalpubCount = (aObject.Journals+aObject.Conferences);
	if (totalpubCount>=100){
		title += '<img id="badge" align="top" src="badges/golden_badge.svg">'; 
	}
	else if(totalpubCount>=50 && totalpubCount<100){
		title += '<img id="badge" align="top" src="badges/silver_badge.svg">'; 
	}
	else if(totalpubCount>=10 && totalpubCount <50){
		title += '<img id="badge" align="top" src="badges/bronze_badge.svg">'; 
	}
	if(supvisee != ""){
		title += '<img id="badge" align="top" src="badges/supervisor_badge.svg">'; 
	}

	document.getElementById("bio").innerHTML = bio;
	document.getElementById("collab").innerHTML = collab;
	document.getElementById("sup").innerHTML = sup;
	document.getElementById("supvisee").innerHTML = supvisee;
	document.getElementById("name").innerHTML = title;
	document.getElementById("collRelation").innerHTML = text;
	

	var sYear = findStartYear(aObject);
	var eYear = findEndYear(aObject);
	var ymax = d3.max(aObject.AllPublicationsPerYear, function(d){return d.Value});

	generateSparkline(aObject.ConfsPerYear,"sparklineConfs", 20, 90, sYear,eYear, ymax);
	generateSparkline(aObject.JournalsPerYear,"sparklineJournals", 20, 90, sYear,eYear, ymax);
	generateSparkline(aObject.AllPublicationsPerYear,"sparklineAll", 20, 90, sYear,eYear, ymax);
	generateSparkline(firstAuthorPubs,"sparklineAsFirstAuthor", 20, 90, sYear,eYear, ymax);
	generateSparkline(firstAuthorJournals,"sparklineJournalsAsFirstAuthor", 20, 90, sYear,eYear, ymax);
	generateSparkline(firstAuthorConfs,"sparklineConfsAsFirstAuthor", 20, 90, sYear,eYear, ymax);
	
}
function findStartYear(aObject){
	var sYear = d3.min(aObject.AllPublicationsPerYear, function(d){return d.Year});
	return sYear; 
}
function findEndYear(aObject){
	var eYear = d3.max(aObject.AllPublicationsPerYear, function(d){return d.Year});
	return eYear; 
}


function generateSummary(pdata, adata, a, p)
{
	var bio = "";
	var pub = getPublications(pdata, a.Name);
	//console.log(pub);
	var sYear = d3.min(a.AllPublicationsPerYear, function(d){return d.Year;});
	bio = getLastName(a.Name) + " is publishing since " + sYear + "." + " Until now, he has "+ "published " + (a.Journals+a.Conferences)
	+ " articles " + '<svg width="70" height="20" id="sparklineAll"></svg>' + " including "
	+ a.Journals + " journal " + '<svg width="70" height="20" id="sparklineJournals"></svg>' 
	+ "and " + a.Conferences + " conference articles" +  ' <svg width="70" height="20" id="sparklineConfs"></svg>' 
	+ ".";

	var firstAuthorPubs = getPublicationsAsFirstAuthor(pdata,a.Name,"A");
	var firstAuthorJournals = getPublicationsAsFirstAuthor(pdata,a.Name,"J");
	var firstAuthorConfs = getPublicationsAsFirstAuthor(pdata,a.Name,"C");

	bio += " Out of " + (a.Journals+a.Conferences) + " articles, the author published " + sumAllValues(firstAuthorPubs) +
	" articles as first author " + '<svg width="70" height="20" id="sparklineAsFirstAuthor"></svg>' + 
	" (" + sumAllValues(firstAuthorJournals) + " journal articles " + '<svg width="70" height="20" id="sparklineJournalsAsFirstAuthor"></svg>'
	+ ", " + sumAllValues(firstAuthorConfs) + " conference articles " + '<svg width="70" height="20" id="sparklineConfsAsFirstAuthor"></svg>' + ").";

	if (a.PhDThesisTitle != ""){
		bio += " The author completed his/her PhD at " + a.PhDSchool + " and the PhD thesis titled \"" + a.PhDThesisTitle + 
		"\" was published in " + a.PhDYear+".";
	}
	
	return bio;
}

function generateCollaborationRelationship(pdata, adata, a, topCoAuthors){
	var text = "";
	console.log(topCoAuthors);
	var supervisees = findSupervisee(pdata, adata, a);
	//console.log(supervisees);
	sortByValue(supervisees);
	console.log(supervisees);

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
	console.log(supervisors);

	if (topCoAuthors.length > 0){
		text += getLastNamePronoun(a.Name) + " top ";
		if (topCoAuthors.length == 1){
			text += "collaborator is " + topCoAuthors[0].Name + ".";
			var startYear = d3.min(topCoAuthors[0].MutualPubPerYear, function(d){return +d.Year;});
			var lastYear = d3.max(topCoAuthors[0].MutualPubPerYear, function(d){return +d.Year;});
			console.log(lastYear); 
			if (lastYear>2015){
				text += " It is ";
				if (lastYear - startYear > 20){
					text += "a prolonged and still";
				} 
				text += " ongoing collaboration since " + startYear + " with " + topCoAuthors[0].MutualPublications
				+ " publications"; 

				if (DoesExistInList(supervisees, topCoAuthors[0].Name)){
					text += " and " + getLastName(a.Name) + " is acting as a supervisor."
				}
				if (DoesExistInSupervisors(supervisors, topCoAuthors[0].Name)){
					text += " and " + getLastName(topCoAuthors[0].Name) + " is acting as a supervisor."
				}
			}
			else if (lastYear<=2015){
				text += " This ";
				if (lastYear-startYear >20){
					text += "was a long lasting "; 
				}
				text += "collaboration ";
				if (lastYear-startYear >20){
					text += "that "
				}
				text += "ended in " + lastYear + " with " + topCoAuthors[0].MutualPublications
				+ " publications "; 

				if (DoesExistInList(supervisees, topCoAuthors[0].Name)){
					text += " and " + getLastName(a.Name) + " acted as a supervisor."
				}
				if (DoesExistInSupervisors(supervisors, topCoAuthors[0].Name)){
					text += " and " + getLastName(topCoAuthors[0].Name) + " acted as a supervisor."
				}
			}

		}
		else if (topCoAuthors.length == 2){
			if (topCoAuthors[0].MutualPublications == topCoAuthors[1].MutualPublications){
				text += " collaborators are " + topCoAuthors[0].Name + " and " + topCoAuthors[1].Name + "."	
			}
			else {
				text += " collaborator is " + topCoAuthors[0].Name + "."; 
				var startYear = d3.min(topCoAuthors[0].MutualPubPerYear, function(d){return +d.Year;});
				var lastYear = d3.max(topCoAuthors[0].MutualPubPerYear, function(d){return +d.Year;});

				var startYear1 = d3.min(topCoAuthors[1].MutualPubPerYear, function(d){return +d.Year;});
				var lastYear1 = d3.max(topCoAuthors[1].MutualPubPerYear, function(d){return +d.Year;});

				if (lastYear>2015){
					text += " It is ";
					if (lastYear - startYear > 20){
						text += "a prolonged and still";
					} 
					text += " ongoing collaboration since " + startYear + " with " + topCoAuthors[0].MutualPublications
					+ " publications"; 

					if (DoesExistInList(supervisees, topCoAuthors[0].Name)){
						text += " and " + getLastName(a.Name) + " is acting as a supervisor"
					}
					if (DoesExistInSupervisors(supervisors, topCoAuthors[0].Name)){
						text += " and " + getLastName(topCoAuthors[0].Name) + " is acting as a supervisor"
					}
				}
				else if (lastYear<=2015){
					text += " This ";
					if (lastYear-startYear >20){
						text += "was a long lasting "; 
					}
					text += "collaboration ";
					if (lastYear-startYear >20){
						text += "that "
					}
					text += "ended in " + lastYear + " with " + topCoAuthors[0].MutualPublications
					+ " publications "; 

					if (DoesExistInList(supervisees, topCoAuthors[0].Name)){
						text += " and " + getLastName(a.Name) + " acted as a supervisor."
					}
					if (DoesExistInSupervisors(supervisors, topCoAuthors[0].Name)){
						text += " and " + getLastName(topCoAuthors[0].Name) + " acted as a supervisor."
					}
				}
				text += ". " + getLastName(topCoAuthors[1].Name) + " is the second most frequent co-author ";
				if (lastYear1 -  startYear1 > 15 && lastYear1>2015){
					text += ", a long-lasting and still ongoing collaboration with "+ topCoAuthors[1].MutualPublications +
					"publications since " + startYear1;
					if (DoesExistInList(supervisees, topCoAuthors[1].Name)){
						text += " and " + getLastName(a.Name) + " is acting as a supervisor"
					}
					if (DoesExistInSupervisors(supervisors, topCoAuthors[1].Name)){
						text += " and " + getLastName(topCoAuthors[1].Name) + " is acting as a supervisor"
					}
				}
				else {
					text += "with " + topCoAuthors[1].MutualPublications + " mutual publications since " + startYear1 ; 
				}
				
			}		


		}
		else if (topCoAuthors.length > 2){
			text += "collaborators are " ;
			for (var i=0;i<topCoAuthors.length;i++){
				if(i==topCoAuthors.length-1){
					text += "and " + topCoAuthors[i].Name+ ".";
				}
				else {
					text += topCoAuthors[i].Name + ", ";
				}
			}
		}
	}
	return text; 
}

function DoesExistInList(list, name){
	for (var i=0;i<list.length;i++){
		if (list[i].Name == name){
			return true;
		}
		return false; 
	}
}

function DoesExistInSupervisors(list, name){
	for (var i=0;i<list.length;i++){
		if (list[i] == name){
			return true;
		}
		return false; 
	}
}

function generateCollaborationText(pdata, adata, a, topCoAuthors){
	//console.log(topCoAuthors);
	var collab = "";
	//top collaboration 
	collab = collab + getLastNamePronoun(a.Name) + " top collaborator" + '<span id=info onclick="showAdditionalInfo()">&#9432</span>' 
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
		collab += "Among the top collaborators, " + getLastNamePronoun(a.Name) + " most active collaboration" +  
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
		+'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' + " of " + supervisors[0] + ".";
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
	//console.log(supervisees);
	sortByValue(supervisees);
	//console.log(supervisees);
	
	if(supervisees.length>0){
		isSupervisorBadge=true;
		text += "According to publication data analysis, the author assumes the role of a supervisor" + 
		". His noteable supervised researchers"+ '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + " are ";
		if (supervisees.length>2){
			for (var i=0;i<3;i++){
				if(i==2){
					text += " and " + supervisees[i].Name+ ".";
				}
				else {
					text += supervisees[i].Name + ", ";
				}
			}
		}
		
	}
	return text; 

}
// function isASupervisorOfB(pdata, b, a){
// 	console.log(a.Name);
// 	console.log(b.Name); 
// 	var flag = false; 
// 	var A_startYear = getStartYear(b);
// 	console.log(A_startYear); 
// 	if(b.StartYear < A_startYear + 5) {
// 			console.log("Ben is senior ");
// 			var pubs = getAllMutualPublications(pdata, a.Name, b.Name)
// 			console.log(pubs); 
// 			if (isSupervisor(pubs,a.Name,b.Name)){
// 				flag = true;
// 				console.log("I am dakjfdklajf kdl");
// 				//console.log (topCoAuthors[i].Name + " : " + "YES");
// 			}
// 	}
// 	return flag; 
// }

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

function getLastNamePronoun(fullName){
	var name = fullName.split(" ");
	if(isNaN(name[name.length-1])){
		return name[name.length-1] + "'s";
	}
	else {
		return name[name.length-2]+ "'s";
	}
}
function getLastName(fullName){
	var name = fullName.split(" ");
	if(isNaN(name[name.length-1])){
		return name[name.length-1];
	}
	else {
		return name[name.length-2];
	}
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

function getPublicationsAsFirstAuthor(pdata, name, type){
	//type = [A, J, C]
	//A for all articles 
	//J for journal articles 
	//C for conference articles 
  var publications = []; 
  for(var i=0;i<pdata.length;i++){
    var tempAuthors = []; 
    for (var j=0;j<pdata[i].Authors.length;j++){
      tempAuthors.push(pdata[i].Authors[j].Name);
      }
      if(tempAuthors.indexOf(name) != -1 && tempAuthors.indexOf(name)==0)
      {
      	if(type == "A")
        publications.push(pdata[i].Year);
    	else if (type == "J"){
    		if(pdata[i].Type == "J"){
    			publications.push(pdata[i].Year);
    		}
    	}
    	else if (type == "C"){
    		if (pdata[i].Type == "C"){
    			publications.push(pdata[i].Year);
    		}
    	}

      }
    }
    var pubsPerYear = groupPublicationsByYear(publications);
    return pubsPerYear; 
}
function groupPublicationsByYear(pubs){
	var pubsPerYear = countFrequency(pubs);
	sortByYear(pubsPerYear);
	//console.log(pubsPerYear);
	return pubsPerYear;
}

function sumAllValues(data){
	var sum =0;
	for(var i=0;i<data.length;i++){
		sum += data[i].Value; 
	}
	return sum;
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