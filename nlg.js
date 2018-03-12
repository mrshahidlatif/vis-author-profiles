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
	// if(supvisee != ""){
	// 	title += '<img id="badge" align="top" src="badges/supervisor_badge.svg">'; 
	// }

	document.getElementById("bio").innerHTML = bio;
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

function firstSentenceV1(a,c, supervisors,supervisees){
	var s ;
	if (DoesExistInList(supervisees, c.Name)){
		s = getLastNamePronoun(a.Name) + " top " + "collaborator" +'<span id=info onclick="showAdditionalInfo()">&#9432</span>' + 
		" and supervisee" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + "is " + getLastName(c.Name); 
		

	}
	else if (DoesExistInSupervisors(supervisors, c.Name)){
			s = getLastNamePronoun(a.Name) + " top " + "collaborator" +'<span id=info onclick="showAdditionalInfo()">&#9432</span>' +
			 " and supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' + "is " + getLastName(c.Name) + ". ";
	}
	else {
		s = getLastNamePronoun(a.Name) + " top " + "collaborator" +'<span id=info onclick="showAdditionalInfo()">&#9432</span>' + 
		" is " + getLastName(c.Name) + ". ";	
	}
	return s;

}
function firstSentenceV2(a,c1,c2){
	var s = "";
	s += getLastNamePronoun(a.Name) + " top collaborators" +'<span id=info onclick="showAdditionalInfo()">&#9432</span>' + 
	" are " + c1.Name + " and " + c2.Name + ". "
	return s;
}
function firstSentenceV3(a,list_c){
	var s = "";
	s += getLastNamePronoun(a.Name) + " top collaborators" +'<span id=info onclick="showAdditionalInfo()">&#9432</span>' + "are " ;
		for (var i=0;i<list_c.length;i++){
			if(i==list_c.length-1){
					s += "and " + list_c[i].Name+ ".";
			}
			else {
					s += list_c[i].Name + ", ";
			}
		}
		return s;
}
function secondSentenceV1(a,c){

	var s = "";
	var startYear = d3.min(c.MutualPubPerYear, function(d){return +d.Year;});
	var lastYear = d3.max(c.MutualPubPerYear, function(d){return +d.Year;});
	//console.log(lastYear); 
	if (lastYear>2015){
		s += " It is ";
		if (lastYear - startYear > 20){
			s += "a prolonged and still";
		} 
		s += " ongoing collaboration since " + startYear + " with " + c.MutualPublications
			 + " publications. "; 

	}
	else if (lastYear<=2015){
		s += " This ";
		if (lastYear-startYear >20){
			text += "was a long lasting "; 
		}
		s += "collaboration ";
			if (lastYear-startYear >20){
				text += "that "
			}
		s += "ended in " + lastYear + " with " + c.MutualPublications
			 + " publications. "; 

	}
	return s;
}
function thirdSentenceV1(a,c,supervisors,supervisees){
		var s = "";
		var startYear1 = d3.min(c.MutualPubPerYear, function(d){return +d.Year;});
		var lastYear1 = d3.max(c.MutualPubPerYear, function(d){return +d.Year;});
		s += getLastName(c.Name) + " is the second most frequent co-author";
		if (lastYear1 -  startYear1 > 15 && lastYear1>2015){
			s += ", a long-lasting and still ongoing collaboration with "+ c.MutualPublications +
					" publications since " + startYear1;
			if (DoesExistInList(supervisees, c.Name)){
						s += " and " + getLastName(a.Name) + " is acting as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' ;
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
						s += " and " + getLastName(c.Name) + " is acting as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' ;
			}
		}
		else if (lastYear1 -  startYear1 > 1 && lastYear1>2015){
			s += ", an ongoing collaboration with "+ c.MutualPublications +
					" publications since " + startYear1;
			if (DoesExistInList(supervisees, c.Name)){
					s += " and " + getLastName(a.Name) + " is acting as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' ;
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
					s += " and " + getLastName(c.Name) + " is acting as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' ;
			}
		}
		else if (lastYear1 -  startYear1 > 1 && lastYear1<=2015) {
			s += ", a collaboration that produced "+ c.MutualPublications +
					" publications in a span of " + (lastYear1 - startYear1) + " years and ended in " + lastYear1;
			if (DoesExistInList(supervisees, c.Name)){
					s += getLastName(a.Name) + " acted as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' + 
					"in this collaboration"
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
					s += getLastName(c.Name) + " acted as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' + 
					 "in this collaboration"
			}
		}
		s += ". ";
		return s;
}
function fourthSentenceV1(a, c, supervisors, supervisees){
	var s = "";
	var startYear1 = d3.min(c.MutualPubPerYear, function(d){return +d.Year;});
	var lastYear1 = d3.max(c.MutualPubPerYear, function(d){return +d.Year;});
		s += "Together with " + getLastName(c.Name) + ", the author published ";
		if (lastYear1 -  startYear1 > 15 && lastYear1>2015){
			s += ", a long-lasting and still ongoing collaboration with "+ c.MutualPublications +
					"publications since " + startYear1;
			if (DoesExistInList(supervisees, c.Name)){
						s += " and " + getLastName(a.Name) + " is acting as a supervisor. "
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
						s += " and " + getLastName(c.Name) + " is acting as a supervisor. "
			}
		}
		else {
			s += c.MutualPublications + " research papers since " + startYear1 + ". "; 
		}
		return s;

}
function fifthSenetenceV1(a,c,supervisees){
	var s = "";
	if(DoesExistInList(supervisees, c.Name)){
		supervisees = RemoveItemFromList(supervisees,c.Name);
		s += "In addition to " + getLastName(c.Name) + ", further supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' +
		 "of " + getLastName(a.Name) + " with considerable amount of publications are " ;
		for (var i=0;i<supervisees.length;i++){
			if(i==supervisees.length-1){
					s += "and " + getLastName(supervisees[i].Name)+ ".";
			}
			else {
					s += getLastName(supervisees[i].Name) + ", ";
			}
		}
	}
	else {
		s += "Supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + 
		"of " + getLastName(a.Name) + " with considerable amount of publications are " ;
		for (var i=0;i<supervisees.length;i++){
			if(i==supervisees.length-1){
					s += "and " + getLastName(supervisees[i].Name)+ ".";
			}
			else {
					s += getLastName(supervisees[i].Name) + ", ";
			}
		}	
	}
	return s;
}
function fifthSenetenceV2(a,c1,c2,supervisees){
	var s = "";
	if (DoesExistInList(supervisees, c1.Name) && DoesExistInList(supervisees, c2.Name)){
		supervisees = RemoveItemFromList(supervisees,c1.Name);
		supervisees = RemoveItemFromList(supervisees,c2.Name);
		s += "In addition to " + getLastName(c1.Name) + "and " + getLastName(c2.Name) + ", further supervisees" +
		 '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + "of " + getLastName(a.Name) + " with considerable amount of publications are " ;
		for (var i=0;i<supervisees.length;i++){
			if(i==supervisees.length-1){
					s += "and " + getLastName(supervisees[i].Name)+ ".";
			}
			else {
					s += getLastName(supervisees[i].Name) + ", ";
			}
		}
	}
	else if (DoesExistInList(supervisees, c1.Name) || DoesExistInList(supervisees, c2.Name)){
		
		if (DoesExistInList(supervisees, c1.Name)){
			supervisees = RemoveItemFromList(supervisees,c1.Name);
			s += "In addition to " + getLastName(c1.Name) + ", further supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' +
			 "of " + getLastName(a.Name) + " with considerable amount of publications are " ;
			for (var i=0;i<supervisees.length;i++){
				if(i==supervisees.length-1){
						s += "and " + getLastName(supervisees[i].Name)+ ".";
				}
				else {
						s += getLastName(supervisees[i].Name) + ", ";
				}
			}
		}
		else if (DoesExistInList(supervisees, c2.Name)){
			supervisees = RemoveItemFromList(supervisees,c2.Name);
			s += "In addition to " + getLastName(c2.Name) + ", further supervisees" + + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' +
			 "of " + getLastName(a.Name) + " with considerable amount of publications are " ;
			for (var i=0;i<supervisees.length;i++){
				if(i==supervisees.length-1){
						s += "and " + getLastName(supervisees[i].Name)+ ".";
				}
				else {
						s += getLastName(supervisees[i].Name) + ", ";
				}
			}
		}
	}
	else {
		s += "Supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + "of " + getLastName(a.Name) + 
		" with considerable amount of publications are " ;
		for (var i=0;i<supervisees.length;i++){
			if(i==supervisees.length-1){
					s += "and " + getLastName(supervisees[i].Name)+ ".";
			}
			else {
					s += getLastName(supervisees[i].Name) + ", ";
			}
		}	
	}
	return s;
}
function fifthSenetenceV3(a,list_c,supervisees){
	var s = "";
	var alreadySupervisees = [];
	for (var i=0; i< list_c.length ; i++){
		if (DoesExistInList(supervisees, list_c[i].Name)){

			alreadySupervisees.push(list_c[i]);
			supervisees = RemoveItemFromList(supervisees, list_c[i].Name);
		}
	}
	console.log(alreadySupervisees); 
	if (alreadySupervisees.length > 0 && supervisees.length > 0){
		if (alreadySupervisees.length == 1){
			s += "In addition to " + alreadySupervisees[0].Name ;
		}
		else if (alreadySupervisees.length == 2){
			s += "In addition to " + alreadySupervisees[0].Name + " and " + alreadySupervisees[0].Name ; 
		}
		else if (alreadySupervisees > 2){
			s += "In addition to ";
			for (var i=0;i<alreadySupervisees.length;i++){
				if(i==alreadySupervisees.length-1){
					s += "and " + getLastName(alreadySupervisees[i].Name)+ ".";
				}
				else {
					s += getLastName(alreadySupervisees[i].Name) + ", ";
				}
			}

		}
		if (supervisees.length > 2){
			s +=  ", further supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + 
			"of " + getLastName(a.Name) + " with considerable amount of publications are " ;
			for (var i=0;i<supervisees.length;i++){
				if(i==supervisees.length-1){
					s += "and " + getLastName(supervisees[i].Name)+ ".";
				}
				else {
					s += getLastName(supervisees[i].Name) + ", ";
				}
			}
		}
		else if (supervisees.length == 2){
			s +=  ", further supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + 
			"of " + getLastName(a.Name) + " with considerable amount of publications are " +
			getLastName(supervisees[0].Name) + " and " + getLastName(supervisees[1].Name) + ".";
		}
		else if (supervisees.length == 1){
			s +=  ", another supervisee" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + 
			"of " + getLastName(a.Name) + " with considerable amount of publications is " +
			getLastName(supervisees[0].Name) + ".";
		}
	}
	// else {
	// 	console.log("Why I am here......");
	// 	s += "Supervisees of " + getLastName(a.Name) + " with considerable amount of publications are " ;
	// 	for (var i=0;i<supervisees.length;i++){
	// 		if(i==supervisees.length-1){
	// 				s += "and " + getLastName(supervisees[i].Name)+ ".";
	// 		}
	// 		else {
	// 				s += getLastName(supervisees[i].Name) + ", ";
	// 		}
	// 	}	
	// }
	return s;
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
		
		if (topCoAuthors.length == 1){
			text += firstSentenceV1(a,topCoAuthors[0],supervisors, supervisees);
			text += secondSentenceV1(a,topCoAuthors[0]);
			if (supervisees.length > 0){
				text += fifthSenetenceV1(a,topCoAuthors[0], supervisees); 
			}
		}
		else if (topCoAuthors.length == 2){
			if (topCoAuthors[0].MutualPublications == topCoAuthors[1].MutualPublications){	
				text += firstSentenceV2(a,topCoAuthors[0],topCoAuthors[1]);
			}
			else {
				text += firstSentenceV1(a,topCoAuthors[0],supervisors, supervisees); 
				text += secondSentenceV1(a,topCoAuthors[0]);
				text += thirdSentenceV1(a,topCoAuthors[1],supervisors,supervisees);
				if (supervisees.length > 0){
					text += fifthSenetenceV2(a,topCoAuthors[0],topCoAuthors[1],supervisees);
				}
			}		

		}
		else if (topCoAuthors.length > 2){
			text += firstSentenceV1(a,topCoAuthors[0],supervisors, supervisees); 
			text += secondSentenceV1(a,topCoAuthors[0]);
			text += thirdSentenceV1(a,topCoAuthors[1],supervisors,supervisees);
			text += fourthSentenceV1(a,topCoAuthors[2],supervisors,supervisees);
			if (supervisees.length > 0){
				text += fifthSenetenceV3(a,topCoAuthors,supervisees);
			}
		}
	}
	return text; 
}
function RemoveItemFromList(list, name){
	var r = [];
	r = list.filter(function(el) {
    	return el.Name !== name;
	});
	return r;
}

function DoesExistInList(list, name){
	var r = false;
	for (var i=0;i<list.length;i++){
		if (list[i].Name == name){
			r = true;
		}
	}
	return r;
}

function DoesExistInSupervisors(list, name){
	//console.log(list);
	// console.log(name);
	var r = false;
	for (var i=0;i<list.length;i++){
		if (list[i] == name){
			r = true;
		}
	}
	return r;
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