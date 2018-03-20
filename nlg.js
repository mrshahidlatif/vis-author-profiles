var hasSupversied = false; 
var listOfSparklines = []; 
var alreadyListedTopics = []; 
var MAX_SUPERVISEES = 5; 
function generateProfileText(pdata, adata, aObject, percentile, topCoAuthors) {
	
	//console.log(pdata);
	//console.log(adata);
	 console.log(aObject);
	hasSupversied = false; 
	// console.log(percentile);
	var bio = "";
	var collab="";
	var title= getFullNameWithoutNo(aObject.Name)  ;
	var researchTopicsText = "";
	var text = ""; 


	var sYear = findStartYear(aObject);
	var eYear = findEndYear(aObject);

	var totalpubCount = (aObject.Journals+aObject.Conferences);
	var yearsActive = eYear - sYear; 
	
	//document.getElementById("name").innerHTML = title;
	getKeywords(pdata, aObject); 

	//For Outliers
	if (totalpubCount < 10 ){
		//Special Summary for these authors
		var bio = generateSummaryForOutliers(pdata, adata, aObject, percentile);

		document.getElementById("bio").innerHTML = bio;
		document.getElementById("name").innerHTML = title;
		document.getElementById("collRelation").innerHTML = text;
		document.getElementById("rtopics").innerHTML = researchTopicsText;
	}
	else if (totalpubCount >= 10){
		// if (eYear <= 2013){
		// 	var bio = generateSummaryForOutliers(pdata, adata, aObject, percentile);
		// }
		// else {
			var bio = generateSummary(pdata, adata, aObject, percentile);
		// }
		
		if (topCoAuthors.length > 0){
			var text = generateCollaborationRelationship(pdata, adata, aObject, topCoAuthors);
			// var collab = generateCollaborationText(pdata, adata, aObject, topCoAuthors);
		}
		researchTopicsText = generateResearchTopicsText(pdata, adata, aObject); 
		var firstAuthorPubs = getPublicationsAsFirstAuthor(pdata,aObject.Name,"A");


		//Displaying the badges 
		if (totalpubCount>=100){
			title += '<img id="badge" align="top" src="badges/article_gold.svg">'; 
		}
		else if(totalpubCount>=50 && totalpubCount<100){
			title += '<img id="badge" align="top" src="badges/article_silver.svg">'; 
		}
		else if(totalpubCount>=10 && totalpubCount <50){
			title += '<img id="badge" align="top" src="badges/article_bronze.svg">'; 
		}
		if(hasSupversied){
			title += '<img id="badge" align="top" src="badges/supervisor_badge.svg">'; 
		}
		if (yearsActive >= 20){
			title += '<img id="badge" align="top" src="badges/active_gold.svg">'; 
		}
		else if (yearsActive < 20 && yearsActive >= 10){
			title += '<img id="badge" align="top" src="badges/active_silver.svg">'; 
		}
		else if (yearsActive < 10 && yearsActive >= 5){
			title += '<img id="badge" align="top" src="badges/active_bronze.svg">'; 
		}
		
		var ymax = d3.max(aObject.AllPublicationsPerYear, function(d){return d.Value});
		document.getElementById("bio").innerHTML = bio;
		document.getElementById("name").innerHTML = title;
		document.getElementById("collRelation").innerHTML = text;
		document.getElementById("rtopics").innerHTML = researchTopicsText;

		generateSparkline(aObject.ConfsPerYear,"sparklineConfs", 20, 90, sYear,eYear, ymax);
		generateSparkline(aObject.JournalsPerYear,"sparklineJournals", 20, 90, sYear,eYear, ymax);
		generateSparkline(aObject.AllPublicationsPerYear,"sparklineAll", 20, 90, sYear,eYear, ymax);
		generateSparkline(firstAuthorPubs,"sparklineAsFirstAuthor", 20, 90, sYear,eYear, ymax);
		//Initial Display of Info header graph
		document.getElementById("info").innerHTML = '<svg width="350" height="100" id="figure"></svg>';
		generateSparkline(aObject.AllPublicationsPerYear,"figure", 90, 300, sYear, eYear, ymax);  
		
		for (var i=0;i<listOfSparklines.length;i++){
			// console.log(listOfSparklines[i]);
			generateSparklineForMutualPublications(pdata, adata, aObject, listOfSparklines[i].coauthor, listOfSparklines[i].data,listOfSparklines[i].sparklineID, 20, 90, sYear,eYear, ymax);
		}
	}
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
	var eYear = d3.max(a.AllPublicationsPerYear, function(d){return d.Year;});

	if (eYear >= 2013) {

		bio = getFullNameWithoutNo(a.Name) + " is publishing since " + sYear + "." + " Until now, the author has "+ "published " + 
		makeMeLive_LoadAllIndividualPublications(pdata, adata, (a.Journals+a.Conferences) + " research papers", a.Name) + " "
		+ '<svg width="70" height="20" id="sparklineAll"></svg>' + " including " +
		makeMeLive_loadJournalsIndividualPublications(pdata, adata, a.Journals + " journal articles", a.Name) + " "
		+ '<svg width="70" height="20" id="sparklineJournals"></svg>' 
		+ " and " 
		+ makeMeLive_loadConferenceIndividualPublications(pdata, adata, a.Conferences + " conference papers", a.Name) + " " 

		+ ' <svg width="70" height="20" id="sparklineConfs"></svg>' 
		+ ".";
	}
	else if (eYear < 2013){

		bio = getLastName(a.Name) + " published from " + sYear + " to " + eYear + "." + " The author has "+ "published " + 
			makeMeLive_LoadAllIndividualPublications(pdata, adata, (a.Journals+a.Conferences) + " research papers", a.Name) + " "
			+ " articles " + '<svg width="70" height="20" id="sparklineAll"></svg>' + " including "
			+ makeMeLive_loadJournalsIndividualPublications(pdata, adata, a.Journals + " journal articles", a.Name) + " "
			+ '<svg width="70" height="20" id="sparklineJournals"></svg>' 
			+ " and " 
			+ makeMeLive_loadConferenceIndividualPublications(pdata, adata, a.Conferences + " conference papers", a.Name) + " " 
			+  ' <svg width="70" height="20" id="sparklineConfs"></svg>' 
			+ ".";

	}

	if (pub.length < 100){
		var firstAuthorPubs = getPublicationsAsFirstAuthor(pdata,a.Name,"A");
		var firstAuthorJournals = getPublicationsAsFirstAuthor(pdata,a.Name,"J");
		var firstAuthorConfs = getPublicationsAsFirstAuthor(pdata,a.Name,"C");

		bio += " Out of " + (a.Journals+a.Conferences) + " publications, the author published " + sumAllValues(firstAuthorPubs) +
		" articles as first author " + '<svg width="70" height="20" id="sparklineAsFirstAuthor"></svg>' + ".";
	}

	if (a.PhDThesisTitle != ""){
		bio += " The author completed PhD at " + a.PhDSchool + " and the PhD thesis titled \"" + a.PhDThesisTitle + 
		"\" was published in " + a.PhDYear+".";
	}
	
	return bio;
}
function generateSummaryForOutliers(pdata, adata, a, p)
{
	var bio = "";
	var pub = getPublications(pdata, a.Name);
	//console.log(a);
	//console.log(pub); 
	var sYear = d3.min(a.AllPublicationsPerYear, function(d){return d.Year;});
	var eYear = d3.max(a.AllPublicationsPerYear, function(d){return d.Year;});
	
	if (pub.length == 1){ //Case with Single Publication 
		
		if (a.Journals == 1){
			bio += getFullNameWithoutNo(a.Name) + " published one journal paper in " + sYear + "."; 
		}
		else {
			bio += getFullNameWithoutNo(a.Name) + " published one conference paper in " + sYear + "."; 
		}
		
		//Showing publication on the sidebar 
		document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Individual Publications " + "(" + pub.length + ") : " + a.Name  
	  		+ ", " + sYear + "</span>" + "<br>" + "<hr>";
		StringifyPublication(pdata, adata, pub[0]);
	}
	
	if (pub.length > 1 && eYear < 2013 ){ // Case of discontinued author 
		if ( a.Journals > 0 && a.Conferences > 0) {
			bio += getFullNameWithoutNo(a.Name) + " published " + no2word[pub.length] + " research papers between " + sYear + " and " + eYear + ", including " + no2word[a.Journals] ;
			if (a.Journals > 1){
			  bio += " journal articles and ";
			}
			else{ 
				bio += " journal article and ";
			}
			if (a.Conferences > 1){
				bio += no2word[a.Conferences] + " conference papers."; 
			}
			else {
				bio += no2word[a.Conferences] + " conference paper."; 
			}
		}
		else {
			bio += getFullNameWithoutNo(a.Name) + " published " + no2word[pub.length] + " research papers between " + sYear + " and " + eYear + "."
		}
		//Showing publication on the sidebar 
		document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Individual Publications " + "(" + pub.length + ") : " + a.Name  
	  		+ ", " + sYear + "</span>" + "<br>" + "<hr>";
	  	for (var i =0; i<pub.length;i++){
			StringifyPublication(pdata, adata, pub[i]);
		}

	}
	else if (pub.length > 1 && eYear >= 2013 ){ 
		if ( a.Journals > 0 && a.Conferences > 0) {
			bio += getFullNameWithoutNo(a.Name) + " has published " + no2word[pub.length] + " research papers so far, including " + no2word[a.Journals] ;
			if (a.Journals > 1){
			  bio += " journal articles and ";
			}
			else{ 
				bio += " journal article and ";
			}
			if (a.Conferences > 1){
				bio += no2word[a.Conferences] + " conference papers."; 
			}
			else {
				bio += no2word[a.Conferences] + " conference paper."; 
			}
		}
		else {
			bio += getFullNameWithoutNo(a.Name) + " has published " + no2word[pub.length] + " research papers so far."; 
		}
		//Showing publication on the sidebar 
		document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Individual Publications " + "(" + pub.length + ") : " + a.Name  
	  		+ ", " + sYear + "</span>" + "<br>" + "<hr>";
	  	for (var i =0; i<pub.length;i++){
			StringifyPublication(pdata, adata, pub[i]);
		}

	}
	if (a.PhDThesisTitle != ""){
		bio += " The author completed PhD at " + a.PhDSchool + " and the PhD thesis titled \"" + a.PhDThesisTitle + 
		"\" was published in " + a.PhDYear+".";
	}

	
	return bio;
}

function firstSentenceV1(pdata, adata, a, c, supervisors,supervisees){
	var s = "" ;
	//console.log(c.Name); makeMeLive(c.Name)
	if (DoesExistInList(supervisees, c.Name)){
		s = getLastNamePronoun(a.Name) + " top " + "collaborator" + '<span id=info onclick="showAdditionalInfo()">&#9432</span>' + 
		" and supervisee" + '<span id=info onlick="showAdditionalInfo4()">&#9432</span>' + " is " + makeMeLive_FullName(c.Name) + " "+
		'<svg width="70" height="20" id="sparkline_top_coll_supervisee"></svg>' + ". ";
		
		var obj = new Object();
		obj.sparklineID = "sparkline_top_coll_supervisee";
		obj.data = c.MutualPubPerYear; 
		obj.coauthor = c.Name; 
		listOfSparklines.push(obj); 

	}
	else if (DoesExistInSupervisors(supervisors, c.Name)){
			s = getLastNamePronoun(a.Name) + " top " + "collaborator" +'<span id=info onclick="showAdditionalInfo()">&#9432</span>' +
			 " and supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' + " is "
			 + makeMeLive_FullName(c.Name) + " " +
			 '<svg width="70" height="20" id="sparkline_top_coll_supvervisor"></svg>' + ". ";
			var obj = new Object();
			obj.sparklineID = "sparkline_top_coll_supvervisor";
			obj.data = c.MutualPubPerYear; 
			obj.coauthor = c.Name; 
			listOfSparklines.push(obj); 
	}
	else {
		s = getLastNamePronoun(a.Name) + " top " + "collaborator" +'<span id=info onclick="showAdditionalInfo()">&#9432</span>' + 
		" is " + makeMeLive_FullName(c.Name) + " " + '<svg width="70" height="20" id="sparkline_top_coll"></svg>' + ". ";	
		var obj = new Object();
		obj.sparklineID = "sparkline_top_coll";
		obj.data = c.MutualPubPerYear; 
		obj.coauthor = c.Name; 
		listOfSparklines.push(obj); 
	}
	return s;

}
function firstSentenceV2(pdata, adata, a,c1,c2){
	var s = "";
	s += getLastNamePronoun(a.Name) + " top collaborators" +'<span id=info onclick="showAdditionalInfo()">&#9432</span>' + 
	" are " + makeMeLive_FullName(c1.Name) + " and " + makeMeLive_FullName(c2.Name) + ". "
	return s;
}
function firstSentenceV3(pdata, adata, a,list_c){
	var s = "";
	s += getLastNamePronoun(a.Name) + " top collaborators" +'<span id=info onclick="showAdditionalInfo()">&#9432</span>' + " are " ;
		for (var i=0;i<list_c.length;i++){
			if(i==list_c.length-1){
					s += "and "+ makeMeLive_FullName(list_c[i].Name) +  ".";
			}
			else {
					s +=  makeMeLive_FullName(list_c[i].Name) + ", ";
			}
		}
		return s;
}
function secondSentenceV1(pdata, adata, a,c){

	var s = "";
	var startYear = d3.min(c.MutualPubPerYear, function(d){return +d.Year;});
	var lastYear = d3.max(c.MutualPubPerYear, function(d){return +d.Year;});
	//console.log(lastYear); 
	if (lastYear>2015){
		s += " It is ";
		if (lastYear - startYear > 20){
			s += "a prolonged and still";
		} 
		s += " ongoing collaboration since " + startYear + " with " + makeMeLive_LoadData(pdata, adata, c.MutualPublications.toString(), a.Name, c.Name)
			 + " publications. "; 

	}
	else if (lastYear<=2015){
		s += " This ";
		if (lastYear-startYear >20){
			s += "was a long lasting "; 
		}
		s += "collaboration ";
			if (lastYear-startYear >20){
				s += "that "
			}
		s += "ended in " + lastYear + " with " + makeMeLive_LoadData(pdata, adata, c.MutualPublications.toString(), a.Name, c.Name) 
			 + " publications. "; 

	}
	return s;
}
function thirdSentenceV1(pdata, adata, a,c,supervisors,supervisees){
		var s = "";
		var startYear1 = d3.min(c.MutualPubPerYear, function(d){return +d.Year;});
		var lastYear1 = d3.max(c.MutualPubPerYear, function(d){return +d.Year;});
		s +=  makeMeLive_FullName(c.Name) + 
		" " + '<svg width="70" height="20" id="sparkline_second_coll"></svg>' + " is the second most frequent co-author";
		var obj = new Object();
		obj.sparklineID = "sparkline_second_coll";
		obj.data = c.MutualPubPerYear; 
		obj.coauthor = c.Name; 
		listOfSparklines.push(obj); 

		if (lastYear1 -  startYear1 > 15 && lastYear1>2015){
			s += ", a long-lasting and still ongoing collaboration with "+ makeMeLive_LoadData(pdata, adata, c.MutualPublications, a.Name, c.Name)  +
					" publications since " + startYear1;
			if (DoesExistInList(supervisees, c.Name)){
						s += " and " + getLastName(a.Name) + " is acting as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' ;
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
						s += " and " + makeMeLive_LastName(c.Name) + 
						" is acting as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' ;
			}
		}
		else if (lastYear1 -  startYear1 > 1 && lastYear1>2015){
			s += ", an ongoing collaboration with "+ makeMeLive_LoadData(pdata, adata, c.MutualPublications, a.Name, c.Name) +
					" publications since " + startYear1;
			if (DoesExistInList(supervisees, c.Name)){
					s += " and " + getLastName(a.Name) + " is acting as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' ;
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
					s += " and " +  makeMeLive_LastName(c.Name) +
					 " is acting as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' ;
			}
		}
		else if (lastYear1 -  startYear1 > 1 && lastYear1<=2015) {
			s += ", a collaboration that produced "+ makeMeLive_LoadData(pdata, adata, c.MutualPublications, a.Name, c.Name) +
					" publications in a span of " + (lastYear1 - startYear1) + " years and ended in " + lastYear1;
			if (DoesExistInList(supervisees, c.Name)){
					s += getLastName(a.Name) + " acted as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' + 
					"in this collaboration"
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
					s +=  makeMeLive_LastName(c.Name) + 
					" acted as a supervisor" +'<span id=info onclick="showAdditionalInfo3()">&#9432</span>' + 
					 "in this collaboration"
			}
		}
		s += ". ";
		return s;
}
function fourthSentenceV1(pdata, adata, a, c, supervisors, supervisees){
	var s = "";
	var startYear1 = d3.min(c.MutualPubPerYear, function(d){return +d.Year;});
	var lastYear1 = d3.max(c.MutualPubPerYear, function(d){return +d.Year;});
		s += "Together with " +  makeMeLive_FullName(c.Name)  + 
		" " + '<svg width="70" height="20" id="sparkline_third_coll"></svg>' + ", the author published ";
		var obj = new Object();
		obj.sparklineID = "sparkline_third_coll";
		obj.data = c.MutualPubPerYear; 
		obj.coauthor = c.Name; 
		listOfSparklines.push(obj); 
		if (lastYear1 -  startYear1 > 15 && lastYear1>2015){
			s += ", a long-lasting and still ongoing collaboration with "+ makeMeLive_LoadData(pdata, adata, c.MutualPublications, a.Name, c.Name)+
					"publications since " + startYear1;
			if (DoesExistInList(supervisees, c.Name)){
						s += " and " + getLastName(a.Name) + " is acting as a supervisor. "
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
						s += " and " +  makeMeLive_LastName(c.Name) + 
						" is acting as a supervisor. "
			}
		}
		else {
			s += makeMeLive_LoadData(pdata, adata, c.MutualPublications, a.Name, c.Name) + " research papers since " + startYear1 + ". "; 
		}
		return s;

}
function fifthSenetenceV1(pdata, adata, a,c,supervisees){
	var s = "";
	if(DoesExistInList(supervisees, c.Name)){
		supervisees = RemoveItemFromList(supervisees,c.Name);
		s += "In addition to " +  makeMeLive_LastName(c.Name) + 
		", further supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' +
		 " of " + getLastName(a.Name) + " with considerable amount of publications are " ;
		for (var i=0;i<Math.min(MAX_SUPERVISEES,supervisees.length);i++){
			if(i==Math.min(MAX_SUPERVISEES,supervisees.length)-1){
					var ID = "sparkline_coll"+i;
					s += "and " +  makeMeLive_FullName(supervisees[i].Name) + 
					" " + '<svg width="70" height="20" id="' + ID + '"></svg>' +".";
					var obj = new Object();
					obj.sparklineID = ID; 
					obj.data = supervisees[i].MutualPubPerYear; 
					listOfSparklines.push(obj); 
			}
			else {
					var ID = "sparkline_coll"+i;
					s +=  makeMeLive_FullName(supervisees[i].Name) + 
					" " + '<svg width="70" height="20" id="' + ID + '"></svg>' + ", ";
					var obj = new Object();
						obj.sparklineID = ID; 
						obj.data = supervisees[i].MutualPubPerYear; 
						listOfSparklines.push(obj);
			}
		}
	}
	else {
		s += "Supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + 
		" of " + getLastName(a.Name) + " with considerable amount of publications are " ;
		for (var i=0;i<Math.min(MAX_SUPERVISEES,supervisees.length);i++){
			if(i==Math.min(MAX_SUPERVISEES,supervisees.length)-1){
					var ID = "sparkline_coll"+i;
					s += "and " +  makeMeLive_FullName(supervisees[i].Name)+ " " + '<svg width="70" height="20" id="' + ID + '"></svg>' +".";
					var obj = new Object();
					obj.sparklineID = ID; 
					obj.data = supervisees[i].MutualPubPerYear; 
					listOfSparklines.push(obj); 
			}
			else {
					var ID = "sparkline_coll"+i;
					s +=  makeMeLive_FullName(supervisees[i].Name)+ " " + '<svg width="70" height="20" id="' + ID + '"></svg>' + ", ";
					var obj = new Object();
						obj.sparklineID = ID; 
						obj.data = supervisees[i].MutualPubPerYear; 
						listOfSparklines.push(obj);
			}
		}	
	}
	return s;
}


function fifthSenetenceV2(pdata, adata, a,c1,c2,supervisees){
	var s = "";
	if (DoesExistInList(supervisees, c1.Name) && DoesExistInList(supervisees, c2.Name)){
		supervisees = RemoveItemFromList(supervisees,c1.Name);
		supervisees = RemoveItemFromList(supervisees,c2.Name);
		s += "In addition to " +  makeMeLive_LastName(c1.Name) + " and " +  makeMeLive_LastName(c2.Name) + ", further supervisees" +
		 '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + " of " + getLastName(a.Name) + " with considerable amount of publications are " ;
		for (var i=0;i<Math.min(MAX_SUPERVISEES,supervisees.length);i++){
			if(i==Math.min(MAX_SUPERVISEES,supervisees.length)-1){
					var ID = "sparkline_coll"+i;
					s += "and " +  makeMeLive_FullName(supervisees[i].Name) + " " + '<svg width="70" height="20" id="' + ID + '"></svg>' +".";
					var obj = new Object();
					obj.sparklineID = ID; 
					obj.data = supervisees[i].MutualPubPerYear; 
					listOfSparklines.push(obj); 
			}
			else {
					var ID = "sparkline_coll"+i;
					s +=  makeMeLive_FullName(supervisees[i].Name) + " " + '<svg width="70" height="20" id="' + ID + '"></svg>' + ", ";
					var obj = new Object();
						obj.sparklineID = ID; 
						obj.data = supervisees[i].MutualPubPerYear; 
						listOfSparklines.push(obj);
			}
		}
	}
	else if (DoesExistInList(supervisees, c1.Name) || DoesExistInList(supervisees, c2.Name)){
		
		if (DoesExistInList(supervisees, c1.Name)){
			supervisees = RemoveItemFromList(supervisees,c1.Name);
			s += "In addition to " + makeMeLive_LastName(c1.Name) + ", further supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' +
			 " of " + getLastName(a.Name) + " with considerable amount of publications are " ;
			for (var i=0;i<Math.min(MAX_SUPERVISEES,supervisees.length);i++){
				if(i==Math.min(MAX_SUPERVISEES,supervisees.length)-1){
					var ID = "sparkline_coll"+i;
					s += "and " +   makeMeLive_FullName(supervisees[i].Name) + " " + '<svg width="70" height="20" id="' + ID + '"></svg>' +".";
					var obj = new Object();
					obj.sparklineID = ID; 
					obj.data = supervisees[i].MutualPubPerYear; 
					listOfSparklines.push(obj); 
				}
				else {
					var ID = "sparkline_coll"+i;
					s +=   makeMeLive_FullName(supervisees[i].Name) + " " + '<svg width="70" height="20" id="' + ID + '"></svg>' + ", ";
					var obj = new Object();
						obj.sparklineID = ID; 
						obj.data = supervisees[i].MutualPubPerYear; 
						listOfSparklines.push(obj);
				}
			}
		}
		else if (DoesExistInList(supervisees, c2.Name)){
			supervisees = RemoveItemFromList(supervisees,c2.Name);
			s += "In addition to " +  makeMeLive_LastName(c2.Name) + ", further supervisees" + + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' +
			 " of " + getLastName(a.Name) + " with considerable amount of publications are " ;
			for (var i=0;i<Math.min(MAX_SUPERVISEES,supervisees.length);i++){
				if(i==Math.min(MAX_SUPERVISEES,supervisees.length)-1){
					var ID = "sparkline_coll"+i;
					s += "and " +   makeMeLive_FullName(supervisees[i].Name) + " " + '<svg width="70" height="20" id="' + ID + '"></svg>' +".";
					var obj = new Object();
					obj.sparklineID = ID; 
					obj.data = supervisees[i].MutualPubPerYear; 
					listOfSparklines.push(obj); 
				}
				else {
					var ID = "sparkline_coll"+i;
					s +=   makeMeLive_FullName(supervisees[i].Name) + " " + '<svg width="70" height="20" id="' + ID + '"></svg>' + ", ";
					var obj = new Object();
						obj.sparklineID = ID; 
						obj.data = supervisees[i].MutualPubPerYear; 
						listOfSparklines.push(obj); 
				}
			}
		}
	}
	else {
		s += "Supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + "of " + getLastName(a.Name) + 
		" with considerable amount of publications are " ;
		for (var i=0;i<Math.min(MAX_SUPERVISEES,supervisees.length);i++){
			if(i==Math.min(MAX_SUPERVISEES,supervisees.length)-1){
				var ID = "sparkline_coll"+i;
					s += "and " +  makeMeLive_FullName(supervisees[i].Name) + " " + '<svg width="70" height="20" id="' + ID + '"></svg>' +".";
					var obj = new Object();
					obj.sparklineID = ID; 
					obj.data = supervisees[i].MutualPubPerYear; 
					listOfSparklines.push(obj); 
			}
			else {
				var ID = "sparkline_coll"+i;
				s +=  makeMeLive_FullName(supervisees[i].Name) + " " + '<svg width="70" height="20" id="' + ID + '"></svg>' + ", ";
				var obj = new Object();
					obj.sparklineID = ID; 
					obj.data = supervisees[i].MutualPubPerYear; 
					listOfSparklines.push(obj); 
			}
		}	
	}
	return s;
}
function fifthSenetenceV3(pdata, adata, a,list_c,supervisees){
	var s = "";
	var alreadySupervisees = [];
	for (var i=0; i< list_c.length ; i++){
		if (DoesExistInList(supervisees, list_c[i].Name)){

			alreadySupervisees.push(list_c[i]);
			supervisees = RemoveItemFromList(supervisees, list_c[i].Name);
		}
	}
	//console.log(alreadySupervisees); 
	if (alreadySupervisees.length > 0 && supervisees.length > 0){
		if (alreadySupervisees.length == 1){
			s += "In addition to " + makeMeLive_LastName(alreadySupervisees[0].Name) ;
		}
		else if (alreadySupervisees.length == 2){
			s += "In addition to " +  makeMeLive_LastName(alreadySupervisees[0].Name) + " and " +  makeMeLive_LastName(alreadySupervisees[1].Name) ; 
		}
		else if (alreadySupervisees > 2){
			s += "In addition to ";
			for (var i=0;i<alreadySupervisees.length;i++){
				if(i==alreadySupervisees.length-1){
					var ID = "sparkline_coll"+i;
					s += "and " + makeMeLive_LastName(alreadySupervisees[i].Name)+" " +".";
				}
				else {
					s +=makeMeLive_LastName(alreadySupervisees[i].Name)+	" " + ", ";
				}
			}
		}
		if (supervisees.length > 2){
			s +=  ", further supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + 
			"of " + getLastName(a.Name) + " with considerable amount of publications are " ;
			for (var i=0;i<Math.min(MAX_SUPERVISEES,supervisees.length);i++){
				if(i==Math.min(MAX_SUPERVISEES,supervisees.length)-1){
					var ID = "sparkline_coll"+i;
					s += "and " + makeMeLive_FullName(supervisees[i].Name) +
					 " " + '<svg width="70" height="20" id="' + ID + '"></svg>' +".";
					var obj = new Object();
					obj.sparklineID = ID; 
					obj.data = supervisees[i].MutualPubPerYear; 
					listOfSparklines.push(obj); 
				}
				else {
					var ID = "sparkline_coll"+i;
					s += makeMeLive_FullName(supervisees[i].Name) + " " + '<svg width="70" height="20" id="' + ID + '"></svg>' + ", ";
					var obj = new Object();
					obj.sparklineID = ID; 
					obj.data = supervisees[i].MutualPubPerYear; 
					listOfSparklines.push(obj); 
				}
			}
		}
		else if (supervisees.length == 2){
			s +=  ", further supervisees" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + 
			"of " + getLastName(a.Name) + " with considerable amount of publications are " +
			 makeMeLive_FullName(supervisees[0].Name) + " and " +  makeMeLive_FullName(supervisees[1].Name) + ".";
		}
		else if (supervisees.length == 1){
			s +=  ", another supervisee" + '<span id=info onclick="showAdditionalInfo4()">&#9432</span>' + 
			"of " + getLastName(a.Name) + " with considerable amount of publications is " +	 makeMeLive_FullName(supervisees[0].Name) + ".";
		}
	}
	return s;
}
function generateCollaborationRelationship(pdata, adata, a, topCoAuthors){
	var text = "";
	//console.log(topCoAuthors);
	var supervisees = findSupervisee(pdata, adata, a);
	//console.log(supervisees);
	sortByValue(supervisees);
	//console.log(supervisees);

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
	//console.log(supervisors);

	if (topCoAuthors.length > 0){
		
		if (topCoAuthors.length == 1){
			text += firstSentenceV1(pdata, adata, a,topCoAuthors[0],supervisors, supervisees);
			text += secondSentenceV1(pdata, adata, a,topCoAuthors[0]);
			if (supervisees.length > 0){
				hasSupversied = true;
				text += fifthSenetenceV1(pdata, adata, a,topCoAuthors[0], supervisees); 
			}
		}
		else if (topCoAuthors.length == 2){
			if (topCoAuthors[0].MutualPublications == topCoAuthors[1].MutualPublications){	
				text += firstSentenceV2(pdata, adata, a,topCoAuthors[0],topCoAuthors[1]);
			}
			else {
				text += firstSentenceV1(pdata, adata, a,topCoAuthors[0],supervisors, supervisees); 
				text += secondSentenceV1(pdata, adata, a,topCoAuthors[0]);
				text += thirdSentenceV1(pdata, adata, a,topCoAuthors[1],supervisors,supervisees);
				if (supervisees.length > 0){
					hasSupversied = true;
					text += fifthSenetenceV2(pdata, adata, a,topCoAuthors[0],topCoAuthors[1],supervisees);
				}
			}		

		}
		else if (topCoAuthors.length > 2){
			text += firstSentenceV1(pdata, adata, a,topCoAuthors[0],supervisors, supervisees); 
			text += secondSentenceV1(pdata, adata, a,topCoAuthors[0]);
			text += thirdSentenceV1(pdata, adata, a,topCoAuthors[1],supervisors,supervisees);
			text += fourthSentenceV1(pdata, adata, a,topCoAuthors[2],supervisors,supervisees);
			if (supervisees.length > 0){
				hasSupversied = true;
				text += fifthSenetenceV3(pdata, adata, a,topCoAuthors,supervisees);
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
	if (fullName != undefined){ 
		var name = fullName.split(" ");
		if(isNaN(name[name.length-1])){
			return name[name.length-1];
		}
		else {
			return name[name.length-2];
		}
	}
}

function getFullNameWithoutNo(fullName){
	var name = fullName.split(" ");
	var no = "";
	if(!isNaN(name[name.length-1])){
		no = name[name.length-1];
		name = name.filter(function(item) { 
	    return item !== no
		})
		name = name.join(" ");
		return name;  
	}
	else {
		return fullName; 
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
				//console.log(mutualPubs);
				if(supervisees.indexOf(firstAuthor) == -1 && mutualPubs.length > 1){
					 var obj = new Object();
					 obj.Name = firstAuthor;
					 obj.Count = mutualPubs.length;
					 var list = [];
					 for(var j=0;j<mutualPubs.length;j++){
					 	list.push(mutualPubs[j].Year); 
					 }
					 var ppy = compressArray2(list);
					 obj.MutualPubPerYear = ppy; 
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
function generateResearchTopicsText(pdata, adata, a){
	var text = "";
	var keywords = getKeywords(pdata, a); 
	// console.log(keywords);
	// console.log(a); 

	if (keywords.length > 0){
		if (keywords[0].Value > 5) {
			text += firstSentenceTopicsV1(pdata, adata, keywords[0], a); 
			text += secondSentenceTopicsV1(pdata, adata, keywords, keywords[0].Name, a);
			
			text += thirdSentenceTopicsV1(a); 

			text += fourthSentenceTopicsV1(pdata, adata, keywords, a); 

			text += sixthSentenceTopicsV1(adata, a); 
		}
	}
	return text; 

}
function firstSentenceTopicsV1(pdata, adata, keyword, a){
	var s = "";
	var pubCount = a.Conferences + a.Journals; 
	var sYear = findStartYear(a);
	var eYear = findEndYear(a);

	if (pubCount >= 100){
		s += getLastName(a.Name) + " is a core member of the " + keyword.Name + " community with " + 
		makeMeLive_LoadDataOnTopic(pdata, adata, keyword.Value + " contributions ", a.Name, keyword.Name) + " since " + sYear + ". "; 
	}
	else if (pubCount > 50 && pubCount < 100){
		s += getLastName(a.Name) + " is a member of the " + keyword.Name + " community with " + 
		makeMeLive_LoadDataOnTopic(pdata, adata, keyword.Value + " contributions ", a.Name, keyword.Name) + " since " + sYear + ". "; 
	}
	else {
		s += getLastName(a.Name) + " is a contributor of the " + keyword.Name + " community with " + 
		makeMeLive_LoadDataOnTopic(pdata, adata, keyword.Value + " contributions " , a.Name, keyword.Name) + " since " + sYear + ". "; 
	}
	alreadyListedTopics.push(keyword.Name); 
	return s;
}
function secondSentenceTopicsV1(pdata, adata, keywords, community, a){
	var s = "";
	var subfields = []; 
	var subs = subfields_community[community];
	//console.log(subs); 
	if (subs != undefined){
		for (var i=0;i<keywords.length;i++){
			if (subs.indexOf(keywords[i].Name) != -1 && keywords[i].Value > 1){
				subfields.push(keywords[i].Name);
				alreadyListedTopics.push(keywords[i].Name); 
			}
		}
	}
	// console.log(subfields); 
	if (subfields.length > 0){
		if (subfields.length == 1){
			s += getLastNamePronoun(a.Name) + " expertise covers subfield of " + makeMeLive_LoadDataOnTopic(pdata, adata, subfields[0], a.Name, subfields[0], "subfield") + "."

		}
		else if (subfields.length == 2){
			s += getLastNamePronoun(a.Name) + " expertise covers subfields such as " + makeMeLive_LoadDataOnTopic(pdata, adata, subfields[0], a.Name, subfields[0], "subfield") +
			" and " + makeMeLive_LoadDataOnTopic(pdata, adata, subfields[1], a.Name, subfields[1], "subfield")+ ".";
		}
		else if (subfields.length > 2) {
			s += getLastNamePronoun(a.Name) + " expertise covers subfields such as " ;
			for (var i=0;i<subfields.length;i++){
				if(i==subfields.length-1){
					s += "and " + makeMeLive_LoadDataOnTopic(pdata, adata, subfields[i], a.Name, subfields[i], "subfield") +".";
				}
				else {
					var ID = "sparkline_coll"+i;
					s += makeMeLive_LoadDataOnTopic(pdata, adata, subfields[i], a.Name, subfields[i], "subfield") + ", ";
				}
			}
		}
	}
	return s; 
}
function thirdSentenceTopicsV1(a){
	//Recent topics of author
	var s=" ";
	var topics = []; 
	//console.log(a); 
	for (var i=0; i<a.Keywords.length;i++){
		if(author_keywords[a.Keywords[i]] != undefined || author_keywords[a.Keywords[i]] == "unclear"){
			topics.push(author_keywords[a.Keywords[i]]); 
		}
	}
	var uniqueTopics = compressArray(topics, "");
	uniqueTopics.sort(function(a, b) {
    	return +(b.Value) - +(a.Value);
  	});

	// console.log(uniqueTopics); 
	//uniqueTopics = uniqueTopics.slice(1,20); 
  	
  	var listOfTopics = [];
  	for (var i=0; i<uniqueTopics.length;i++){
  		if (keywordMapping[uniqueTopics[i].Name] != undefined){
  			listOfTopics.push(uniqueTopics[i].Name); 
  		}
  	}
  	// console.log(listOfTopics); 
  
  	s += convertKeywordList(listOfTopics);
  	//console.log(s); 

  // 	if (uniqueTopics.length > 0){
  // 		s += " Current focus areas are "
  // 		for (var i=0;i<uniqueTopics.length;i++){
		// 		if(i==uniqueTopics.length-1){
		// 			s += "and " + uniqueTopics[i].Name +".";
		// 		}
		// 		else {
		// 			var ID = "sparkline_coll"+i;
		// 			s += uniqueTopics[i].Name + ", ";
		// 		}
		// }
  // 	}
	//console.log(uniqueTopics); 
	return s; 
}
function fourthSentenceTopicsV1(pdata, adata, keywords, a){
	var s="";
	//console.log(alreadyListedTopics); 
	var diverse_topics = [];
	for (var i=0; i<keywords.length;i++){
		if (alreadyListedTopics.indexOf(keywords[i].Name) == -1 && diverse_fields.indexOf(keywords[i].Name) != -1){
			diverse_topics.push(keywords[i].Name); 
		}
	}
	//console.log(diverse_topics); 
	if (diverse_topics.length > 0){
		if (diverse_topics.length == 1){
			s += " The author has also worked on " + makeMeLive_LoadDataOnTopic(pdata, adata, diverse_topics[0], a.Name, diverse_topics[0], "community") + "."

		}
		else if (diverse_topics.length == 2){
			s += " Other research topics of " + getLastNamePronoun(a.Name) + " include " + makeMeLive_LoadDataOnTopic(pdata, adata, diverse_topics[0], a.Name, diverse_topics[0], "community")
			+ " and " + makeMeLive_LoadDataOnTopic(pdata, adata, diverse_topics[1], a.Name, diverse_topics[1], "community") + ".";
		}
		else if (diverse_topics.length > 2) {
			s += " Other research topics of " + getLastNamePronoun(a.Name) + " include " ;
			for (var i=0;i<diverse_topics.length;i++){
				if(i==diverse_topics.length-1){
					s += "and " + makeMeLive_LoadDataOnTopic(pdata, adata, diverse_topics[i], a.Name, diverse_topics[i], "community")+".";
				}
				else {
					s += makeMeLive_LoadDataOnTopic(pdata, adata, diverse_topics[i], a.Name, diverse_topics[i], "community") + ", ";
				}
			}
		}
	}
	return s; 
}

function sixthSentenceTopicsV1(adata, a){
	var s=""; 
	var similarAuthors = findAuthorsWithSimilarResearchTopics(adata, a); 
	if (similarAuthors.length > 0){
		if (similarAuthors.length == 1){
			s += " Another researcher with similar areas of expertise is " + makeMeLive_FullName(similarAuthors[0]) + ".";
		}
	 	else if (similarAuthors.length == 1){
	 		s += " Researchers with similar areas of expertise are " + makeMeLive_FullName(similarAuthors[0]) + " and " + makeMeLive_FullName(similarAuthors[1]) +"." 
	 	}
	 	else {
			s += " Researchers with similar areas of expertise are " ;
			for (var i=0;i<similarAuthors.length;i++){
				if(i==similarAuthors.length-1){
					s += "and " + makeMeLive_FullName(similarAuthors[i])+".";
				}
				else {
					s += makeMeLive_FullName(similarAuthors[i]) + ", ";
				}
			}
		}
	}
	return s; 
}
function getKeywords(pdata, a){
	var allKeywords = []; 
	var pubs = getPublications(pdata, a.Name);
	for (var i=0;i<pubs.length; i++){
		var listOfKeywords = venue_keywords[pubs[i].Venue];
		if (listOfKeywords != undefined){
			//console.log(listOfKeywords);
			for (var j=0 ; j<listOfKeywords.length; j++){
				allKeywords.push(listOfKeywords[j]);
			}
		}
	}
	var allUniqueKeywords = compressArray(allKeywords, "");
	allUniqueKeywords.sort(function(a, b) {
    	return +(b.Value) - +(a.Value);
  	});

	return allUniqueKeywords; 
}

function getKeywordsPerYear(pubs, keyword){
	var keywordPerYear = []; 
	for (var i=0;i<pubs.length; i++){
		//console.log(venue_keywords[pubs[i].Venue]);
		if (venue_keywords[pubs[i].Venue] != undefined && venue_keywords[pubs[i].Venue].indexOf(keyword) != -1) {
			keywordPerYear.push(pubs[i].Year); 
		}
	}
	keywordPerYear = compressArray(keywordPerYear); 
	keywordPerYear.sort(function(a, b) {
    	return +(a.Name) - +(b.Name);
  	});
	//console.log(keywordPerYear); 
	return keywordPerYear; 
}

function convertKeywordList(keywords) {
    //console.log(keywords);
    var text = "";
    var cleanedKeywords = [];
    var allVisVersionsAvailable = true;
    var allVisOfDataVersionsAvailable = true;
    $.each(keywords, function (i, keyword) {
        if (keywordMapping[keyword].default) {
            cleanedKeywords.push(keyword);
            if (!keywordMapping[keyword].vis) {
                allVisVersionsAvailable = false;
            }
            if (!keywordMapping[keyword].visOfData) {
                allVisOfDataVersionsAvailable = false;
            }
        }
    });
    if (cleanedKeywords.length === 0) {
        return "";
    }
    var isSingular = cleanedKeywords.length === 1;
    $.each(cleanedKeywords, function (i, keyword) {
        var mapping = keywordMapping[keyword];
        text += allVisOfDataVersionsAvailable ? mapping.visOfData :
            (allVisVersionsAvailable ? mapping.vis : mapping.default);
        if (i + 2 < cleanedKeywords.length) {
            text += ", ";
        } else if (i + 1 < cleanedKeywords.length) {
            text += (cleanedKeywords.length > 2) ? ", and " : " and ";
        }
    });
    var pre = allVisOfDataVersionsAvailable ? "the visualization of " : "";
    var post = allVisOfDataVersionsAvailable ? " data" : (allVisVersionsAvailable ? " visualization" : "");
    if (isSingular) {
        return "A current focus area of the author is " + pre + text + post + ".";
    }
    return "Current focus areas of the author are " + pre + text + post + ".";
}
function appendKeyword(keyword) {
        if (selectedKeywords.indexOf(keyword) < 0) {
            selectedKeywords.push(keyword);
            $("#keyword_text").text(convertKeywordList(selectedKeywords));
        }
}

function findAuthorsWithSimilarResearchTopics(adata, a){
	var similarAuthors = []; 
	var mainAuthorsTopics = [];
	for (var i=0; i<a.Keywords.length;i++){
		if(author_keywords[a.Keywords[i]] != undefined ){
			mainAuthorsTopics.push(author_keywords[a.Keywords[i]]); 
		}
	} 
	//console.log(mainAuthorsTopics); 
	for (var j=0;j<adata.length;j++){
		var currentAuthorTopics = [];
		for (var k=0;k<adata[j].Keywords.length;k++){
			if(author_keywords[adata[j].Keywords[k]] != undefined ){
				currentAuthorTopics.push(author_keywords[adata[j].Keywords[k]]); 
			}
		}
		var overlap = getIntersect(mainAuthorsTopics,currentAuthorTopics); 
		if(overlap.length > 5 && overlap.length/mainAuthorsTopics.length > 0.5){
			//console.log(adata[j].Name);
			similarAuthors.push(adata[j].Name);  
		}
	}
	var selfAuthorIndex = similarAuthors.indexOf(a.Name);
	similarAuthors.splice(selfAuthorIndex, 1); 
	return similarAuthors; 
}
function getIntersect(arr1, arr2) {
    var r = [], o = {}, l = arr2.length, i, v;
    for (i = 0; i < l; i++) {
        o[arr2[i]] = true;
    }
    l = arr1.length;
    for (i = 0; i < l; i++) {
        v = arr1[i];
        if (v in o) {
            r.push(v);
        }
    }
    return r;
}
function makeMeLive_FullName(name){
	if (authors_list.indexOf(name) != 1){
		return  '<span id="linkedAuthorName" onclick="loadMe(pdata, adata, \''+name+'\')">' + getFullNameWithoutNo(name) + "</span>";
	}
	else 
	{
		return getFullNameWithoutNo(name);
	}
}
function makeMeLive_LastName(name){
	if (authors_list.indexOf(name) != 1){
		return  '<span id="linkedAuthorName" onclick="loadMe(pdata, adata, \''+name+'\')">' + getLastName(name) + "</span>";
	}
	else {
		return getLastName(name); 
	}
}
function makeMeLive_LoadData(pdata, adata, text, a, c){
	//text : hyperlink 
	//a : main author 
	//c: coauthor 
	//y : year
	return  '<span id="linkedAuthorName" onclick="loadMutualPublications(pdata, adata, \''+a+'\', \''+c+'\')">' + text + "</span>";
}

function makeMeLive_LoadDataOnTopic(pdata, adata, text, a, topic, cssClass){
	//text : hyperlink 
	//a : main author 
	//c: coauthor 
	//y : year
	return  '<span id="linkedAuthorName" class="'+cssClass+'" onclick="loadPublicationsOnTopic(pdata, adata, \''+a+'\', \''+topic+'\')">' + text + "</span>";
}

function makeMeLive_LoadAllIndividualPublications(pdata, adata, text, a){
	//text : hyperlink 
	//a : main author 
	//c: coauthor 
	//y : year
	return  '<span id="linkedAuthorName" onclick="loadAllIndividualPublications(pdata, adata, \''+a+'\')">' + text + "</span>";
}

function makeMeLive_loadJournalsIndividualPublications(pdata, adata, text, a){
	//text : hyperlink 
	//a : main author 
	//c: coauthor 
	//y : year
	return  '<span id="linkedAuthorName" onclick="loadJournalsIndividualPublications(pdata, adata, \''+a+'\')">' + text + "</span>";
}
function makeMeLive_loadConferenceIndividualPublications(pdata, adata, text, a){
	//text : hyperlink 
	//a : main author 
	//c: coauthor 
	//y : year
	return  '<span id="linkedAuthorName" onclick="loadConferenceIndividualPublications(pdata, adata, \''+a+'\')">' + text + "</span>";
}


function loadMutualPublications(pdata, adata, a, c){
  //Return array of mutual publications of Author and CoAuthor for Year "year"
  var mutualPublications = []; 
  for(var i=0;i<pdata.length;i++){
      var tempAuthors = []; 
      for (var j=0;j<pdata[i].Authors.length;j++){
        tempAuthors.push(pdata[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(a) != -1 && tempAuthors.indexOf(c) != -1)
        {
          mutualPublications.push(pdata[i]);
        }
  }
  mutualPublications.sort(function(a, b) {
    return +b.Year - +a.Year;
  });

  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Mutual Publications " + "(" + mutualPublications.length + ") : " + getLastName(a) + " and " +
   getLastName(c) + "</span>" + "<br>" + "<hr>";
  
  for (var i=0; i<mutualPublications.length;i++){
    StringifyPublication(pdata, adata, mutualPublications[i]);
  }
  //return mutualPublications; 

}

function loadPublicationsOnTopic(pdata, adata, a, topic){
  //Return array of mutual publications of Author and CoAuthor for Year "year"
  var pubsOnTopic = []; 
  for(var i=0;i<pdata.length;i++){
      var tempAuthors = []; 
      for (var j=0;j<pdata[i].Authors.length;j++){
        tempAuthors.push(pdata[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(a) != -1 && venue_keywords[pdata[i].Venue] != undefined)
        {
        	if (venue_keywords[pdata[i].Venue].indexOf(topic) != -1){
          		pubsOnTopic.push(pdata[i]);
          	}
        }
  }

  pubsOnTopic.sort(function(a, b) {
    return +b.Year - +a.Year;
  });

  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Publications " + "(" + pubsOnTopic.length + ") : " + getLastName(a) +  "</span>" + "<br>" + "<hr>";
  
  for (var i=0; i<pubsOnTopic.length;i++){
    StringifyPublication(pdata, adata, pubsOnTopic[i]);
  }
  //console.log(pubsOnTopic); 
  //return pubsOnTopic; 
}

function loadAllIndividualPublications(pdata, adata, name){
  var indPublications = []; 
  for(var i=0;i<pdata.length;i++){
      var tempAuthors = []; 
      for (var j=0;j<pdata[i].Authors.length;j++){
        tempAuthors.push(pdata[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(name) != -1)
        {
          indPublications.push(pdata[i]);
        }
  }

   indPublications.sort(function(a, b) {
    return +b.Year - +a.Year;
  });

  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Individual Publications " + "(" + indPublications.length + ") : " + name  
  + "</span>" + "<br>" + "<hr>";
  
  for (var i=0; i<indPublications.length;i++){
    StringifyPublication(pdata, adata, indPublications[i]);
  }

  // return indPublications;
}

function loadJournalsIndividualPublications(pdata, adata, name){
  
  var indPublications = []; 
  for(var i=0;i<pdata.length;i++){
  	if (pdata[i].Type == "J"){
      var tempAuthors = []; 
      for (var j=0;j<pdata[i].Authors.length;j++){
        tempAuthors.push(pdata[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(name) != -1)
        {
          indPublications.push(pdata[i]);
        }
    }
  }

  indPublications.sort(function(a, b) {
    return +b.Year - +a.Year;
  });

  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Journal Publications " + "(" + indPublications.length + ") : " + name  
  + "</span>" + "<br>" + "<hr>";
  
  for (var i=0; i<indPublications.length;i++){
    StringifyPublication(pdata, adata, indPublications[i]);
  }

  // return indPublications;
}

function loadConferenceIndividualPublications(pdata, adata, name){
  
  var indPublications = []; 
  for(var i=0;i<pdata.length;i++){
  	if (pdata[i].Type == "C"){
      var tempAuthors = []; 
      for (var j=0;j<pdata[i].Authors.length;j++){
        tempAuthors.push(pdata[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(name) != -1)
        {
          indPublications.push(pdata[i]);
        }
    }
  }

  indPublications.sort(function(a, b) {
    return +b.Year - +a.Year;
  });

  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Conference Publications " + "(" + indPublications.length + ") : " + name  
  + "</span>" + "<br>" + "<hr>";
  
  for (var i=0; i<indPublications.length;i++){
    StringifyPublication(pdata, adata, indPublications[i]);
  }

  // return indPublications;
}