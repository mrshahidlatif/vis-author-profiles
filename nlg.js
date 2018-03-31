var hasSupversied = false; 
var isSupSupervisor = false; 
var listOfSparklines = []; 
var alreadyListedTopics = []; 
var MAX_SUPERVISEES = 5; 

function generateProfileText(pdata, adata, aObject, topCoAuthors) {
 	
	hasSupversied = false; 
	isSupSupervisor=false; 
	var alreadyListedTopics = []; 
	var bio = "";
	var collab="";
	var title= getFullNameWithoutNo(aObject.Name)  ;
	var researchTopicsText = "";
	var collaborationRelationText = ""; 


	var sYear = findStartYear(aObject);
	var eYear = findEndYear(aObject);

	var totalpubCount = (aObject.Journals+aObject.Conferences);
	var yearsActive = eYear - sYear + 1; 
	
	//document.getElementById("name").innerHTML = title;
	getKeywords(pdata, aObject); 

	if (totalpubCount > 2) {
		researchTopicsText = generateResearchTopicsText(pdata, adata, aObject); 
		// collaborationRelationText = generateCollaborationRelationText(pdata, adata, aObject, topCoAuthors);
		document.getElementById("info").innerHTML = ""; //resetting bar chart on new profile load
	}
	else document.getElementById("rtopics").innerHTML = ""; 
	//For Outliers
	if (totalpubCount < 10 ){
		//Special Summary for these authors
		var bio = generateSummaryForOutliers(pdata, adata, aObject);
		// console.log(topCoAuthors);
		if (topCoAuthors.length > 0){
			collaborationRelationText = getLastName(aObject.Name) + " worked with " + stringifyListWithAuthorLinks(convertToStringArray(topCoAuthors)) + "."; 
		}
		$collRelation = $("#collRelation");
		$collRelation.html(collaborationRelationText); 
		document.getElementById("bio").innerHTML = bio;
		document.getElementById("name").innerHTML = title;
		// document.getElementById("collRelation").innerHTML = collaborationRelationText;
	}
	else if (totalpubCount >= 10){
			var bio = generateSummary(pdata, adata, aObject);
			researchTopicsText = generateResearchTopicsText(pdata, adata, aObject); 
		
		if (topCoAuthors.length > 0){
			collaborationRelationText = generateCollaborationRelationText(pdata, adata, aObject, topCoAuthors);
		}
		var firstAuthorPubs = getPublicationsAsFirstAuthor(pdata,aObject.Name,"A");

		//Displaying the badges 
		if (totalpubCount>=100){
			title += '<img class="badge" align="top" src="badges/article_gold.svg">'; 
		}
		else if(totalpubCount>=30 && totalpubCount<100){
			title += '<img class="badge" align="top" src="badges/article_silver.svg">'; 
		}
		else if(totalpubCount>=10 && totalpubCount <30){
			title += '<img class="badge" align="top" src="badges/article_bronze.svg">'; 
		}
		if(hasSupversied && !isSupSupervisor){
			title += '<img class="badge" align="top" src="badges/supervisor.svg">'; 
		}
		// console.log(isSupSupervisor);
		if(isSupSupervisor){
			title += '<img class="badge" align="top" src="badges/sup_supervisor.svg">'; 
		}

		if (yearsActive >= 20){
			title += '<img class="badge" align="top" src="badges/active_gold.svg">'; 
		}
		else if (yearsActive < 20 && yearsActive >= 10){
			title += '<img class="badge" align="top" src="badges/active_silver.svg">'; 
		}
		else if (yearsActive < 10 && yearsActive >= 5){
			title += '<img class="badge" align="top" src="badges/active_bronze.svg">'; 
		}
		
		var ymax = d3.max(aObject.AllPublicationsPerYear, function(d){return d.Value});
		document.getElementById("bio").innerHTML = bio;
		document.getElementById("name").innerHTML = title;
		// document.getElementById("collRelation").innerHTML = collaborationRelationText;

		generateSparkline(aObject.ConfsPerYear,"sparklineConfs", 20, 90, sYear,eYear, ymax, aObject.Name);
		generateSparkline(aObject.JournalsPerYear,"sparklineJournals", 20, 90, sYear,eYear, ymax, aObject.Name);
		generateSparkline(aObject.AllPublicationsPerYear,"sparklineAll", 20, 90, sYear,eYear, ymax, aObject.Name);
		generateSparkline(firstAuthorPubs,"sparklineAsFirstAuthor", 20, 90, sYear,eYear, ymax, aObject.Name);
		//Initial Display of Info header graph
		document.getElementById("info").innerHTML = '<svg width="350" height="100" id="figure"></svg>';
		generateSparkline(aObject.AllPublicationsPerYear,"figure", 90, 360, sYear, eYear, ymax, aObject.Name);  
		
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
	var trend = analyzeTimeSeries(a.AllPublicationsPerYear, a);
	// console.log(trend); 

	var bio = "";
	var pub = getPublications(pdata, a.Name);
	//console.log(pub);
	var sYear = d3.min(a.AllPublicationsPerYear, function(d){return d.Year;});
	var eYear = d3.max(a.AllPublicationsPerYear, function(d){return d.Year;});


	if (eYear >= 2015) {
		if (a.Journals+a.Conferences >= 10 && (a.Journals+a.Conferences) < 100 && eYear-sYear >= 5 ){
			bio = getFullNameWithoutNo(a.Name) + " is" ;
			if (eYear-sYear >= 20) {
				bio += " a longtime research contributor ";
			}
			else {
				bio += " an active researcher "; 
			}
			bio += "since " + sYear + " and has "+ "published " + 
			makeMeLive_LoadAllIndividualPublications(pdata, adata, (a.Journals+a.Conferences) + " research papers", a.Name) + " "
			+ '<span class="no-wrap"><svg width="70" height="20" id="sparklineAll"></svg>,</span> ';
			bio += trend?(trend+"The publications include "): "including ";
			bio += makeMeLive_loadJournalsIndividualPublications(pdata, adata, a.Journals + " journal articles", a.Name) + " "
			+ '<svg width="70" height="20" id="sparklineJournals"></svg>' 
			+ " and " 
			+ makeMeLive_loadConferenceIndividualPublications(pdata, adata, a.Conferences + " proceedings papers", a.Name) + " " 

			+ ' <span class="no-wrap"><svg width="70" height="20" id="sparklineConfs"></svg>' 
			+ ".</span>";
		}
		else if (a.Journals + a.Conferences >= 100 && eYear - sYear >= 5 ) {
			var nPub = a.Journals + a.Conferences
			var nPubRoundedDownToFifties = Math.floor(nPub / 50.0) * 50;
			bio = getFullNameWithoutNo(a.Name) + " is" ;
			if (eYear-sYear >= 20) {
				bio += " an active and longtime research contributor ";
			}
			else {
				bio += " an active researcher "; 
			}
			bio += "with "
			bio += (nPub === nPubRoundedDownToFifties) ? "" : "more than "
			bio += makeMeLive_LoadAllIndividualPublications(pdata, adata, nPubRoundedDownToFifties + " publications", a.Name) + " "
				+ '<svg width="70" height="20" id="sparklineAll"></svg>'
				+ " since " + sYear;
			bio += trend? ", " + trend: ". ";
			bio += getLastNamePronoun(a.Name) + " published work includes "
				+ makeMeLive_loadJournalsIndividualPublications(pdata, adata, a.Journals + " journal articles", a.Name) + " "
				+ '<svg width="70" height="20" id="sparklineJournals"></svg>' + " and "
				+ makeMeLive_loadConferenceIndividualPublications(pdata, adata, a.Conferences + " proceedings papers", a.Name) + " "
				+ ' <span class="no-wrap"><svg width="70" height="20" id="sparklineConfs"></svg>'
				+ ".</span>";
		}
		else {
			bio = getFullNameWithoutNo(a.Name) + " has published " + 
			makeMeLive_LoadAllIndividualPublications(pdata, adata, (a.Journals+a.Conferences) + " research papers ", a.Name)
			+ '<svg width="70" height="20" id="sparklineAll"></svg>' + " since " + sYear + ", including " +
			makeMeLive_loadJournalsIndividualPublications(pdata, adata, a.Journals + " journal articles", a.Name) + " "
			+ '<svg width="70" height="20" id="sparklineJournals"></svg>' 
			+ " and " 
			+ makeMeLive_loadConferenceIndividualPublications(pdata, adata, a.Conferences + " proceedings papers", a.Name) + " " 

			+ ' <span class="no-wrap"><svg width="70" height="20" id="sparklineConfs"></svg>' 
			+ ".</span>";
		}
	}
	else {
		bio = getLastName(a.Name) + " published " + makeMeLive_LoadAllIndividualPublications(pdata, adata, (a.Journals+a.Conferences) + " research papers", a.Name) + " "
			+ '<svg width="70" height="20" id="sparklineAll"></svg>' + " between " +  sYear + " and " + eYear +", ";	
		bio += trend?(trend+"The publications include "): "including ";
		bio	+= makeMeLive_loadJournalsIndividualPublications(pdata, adata, a.Journals + " journal articles", a.Name) + " "
			+ '<svg width="70" height="20" id="sparklineJournals"></svg>' 
			+ " and " 
			+ makeMeLive_loadConferenceIndividualPublications(pdata, adata, a.Conferences + " proceedings papers", a.Name) + " " 
			+  ' <span class="no-wrap"><svg width="70" height="20" id="sparklineConfs"></svg>' 
			+ ".</span>";
	}

	if (pub.length < 100){
		var firstAuthorPubs = getPublicationsAsFirstAuthor(pdata,a.Name,"A");
		var firstAuthorJournals = getPublicationsAsFirstAuthor(pdata,a.Name,"J");
		var firstAuthorConfs = getPublicationsAsFirstAuthor(pdata,a.Name,"C");

		bio += " Out of the total " + (a.Journals+a.Conferences) + " publications, the author published " + sumAllValues(firstAuthorPubs) +
		" articles as first author " + '<span class="no-wrap"><svg width="70" height="20" id="sparklineAsFirstAuthor"></svg>' + ".</span>";
	}

	if (a.PhDThesisTitle != ""){
		bio += " The author received a PhD degree from " + a.PhDSchool + " with the dissertation published in "+ a.PhDYear +" and titled &ldquo;" + a.PhDThesisTitle.split(".")[0] + 
		"&rdquo;.";
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
			bio += getFullNameWithoutNo(a.Name) + " published one journal article in " + sYear + "."; 
		}
		else {
			bio += getFullNameWithoutNo(a.Name) + " published one proceedings paper in " + sYear + "."; 
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
				bio += no2word[a.Conferences] + " proceedings papers."; 
			}
			else {
				bio += no2word[a.Conferences] + " proceedings paper."; 
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
			bio += getFullNameWithoutNo(a.Name) + " has published " + no2word[pub.length] + " research papers since " + sYear + ", including " + no2word[a.Journals] ;
			if (a.Journals > 1){
			  bio += " journal articles and ";
			}
			else{ 
				bio += " journal article and ";
			}
			if (a.Conferences > 1){
				bio += no2word[a.Conferences] + " proceedings papers."; 
			}
			else {
				bio += no2word[a.Conferences] + " proceedings paper."; 
			}
		}
		else {
			bio += getFullNameWithoutNo(a.Name) + " has published " + no2word[pub.length] + " research papers since " + sYear +"."; 
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

function mostFrequentCoauthorPhrase(pdata, adata, a, c, supervisors,supervisees){
	var s = "" ;
	//console.log(c.Name); makeMeLive(c.Name)

	// var sYear = findStartYear(a);
	// var eYear = findEndYear(c);
	var endOfCollaborationYear = getMax(c.MutualPubPerYear);
	// console.log(endOfCollaborationYear);
	// console.log(c); 

	if (DoesExistInList(supervisees, c.Name)){

		s = getLastNamePronoun(a.Name) + " most frequent co-author" + '<span class="info" onclick="infoMostFrequentCoAuthor()">&#9432</span>' ;
		
		s += (endOfCollaborationYear <=2013) ? " is " + makeMeLive_FullName(c.Name) + " and " + makeMeLive_LastName(c.Name) + " " + 
		'<span class="no-wrap"><svg width="70" height="20" id="sparkline_top_coll_supervisee"></svg>' + ".</span> " + " supervised in the early years. " 
			: " and supervisee " + '<span class="info" onclick="infoSupervisee()">&#9432</span>' + " is " + makeMeLive_FullName(c.Name) + " "+
		'<span class="no-wrap"><svg width="70" height="20" id="sparkline_top_coll_supervisee"></svg>' + ".</span> ";
		
		var obj = new Object();
		obj.sparklineID = "sparkline_top_coll_supervisee";
		obj.data = c.MutualPubPerYear; 
		obj.coauthor = c.Name; 
		listOfSparklines.push(obj); 

		if (endOfCollaborationYear <=2013){
			s += getLastNamePronoun(a.Name) + " most frequent co-author" + '<span class="info" onclick="infoMostFrequentCoAuthor()">&#9432</span>' + 
				" and supervisee" + '<span class="info" onclick="infoSupervisee()">&#9432</span>' + " is " + makeMeLive_FullName(c.Name)
		}
	}
	else if (DoesExistInSupervisors(supervisors, c.Name)){

		s = getLastNamePronoun(a.Name) + " most frequent co-author" +'<span class="info" onclick="infoMostFrequentCoAuthor()">&#9432</span>' ;
		s+= (endOfCollaborationYear <=2013) ? " is " + makeMeLive_FullName(c.Name) + " " + '<svg width="70" height="20" id="sparkline_top_coll_supvervisor"></svg>' +
		" and " + makeMeLive_LastName(c.Name) + " acted as a supervisor in the early years. " : 
		 " and supervisor" +'<span class="info" onclick="infoSupervisor()">&#9432</span>' + " is " + makeMeLive_FullName(c.Name)+ " " +
		 '<span class="no-wrap"><svg width="70" height="20" id="sparkline_top_coll_supvervisor"></svg>' + ".</span> ";
		var obj = new Object();
		obj.sparklineID = "sparkline_top_coll_supvervisor";
		obj.data = c.MutualPubPerYear; 
		obj.coauthor = c.Name; 
		listOfSparklines.push(obj); 
	}
	else {
		s = getLastNamePronoun(a.Name) + " most frequent co-author" +'<span class="info" onclick="infoMostFrequentCoAuthor()">&#9432</span>' + 
		" is " + makeMeLive_FullName(c.Name) + " " + '<span class="no-wrap"><svg width="70" height="20" id="sparkline_top_coll"></svg>' + ".</span> ";	
		var obj = new Object();
		obj.sparklineID = "sparkline_top_coll";
		obj.data = c.MutualPubPerYear; 
		obj.coauthor = c.Name; 
		listOfSparklines.push(obj); 
	}
	return s;

}
function mostFrequentCoauthorPhrase_2(pdata, adata, a,c1,c2){
	var s = "";
	s += getLastNamePronoun(a.Name) + " most frequent co-authors" +'<span class="info" onclick="infoMostFrequentCoAuthor()">&#9432</span>' + 
	" are " + makeMeLive_FullName(c1.Name) + " and " + makeMeLive_FullName(c2.Name) + ". "
	return s;
}
function mostFrequentCoauthorPhrase_N(pdata, adata, a,list_c){
	var s = "";
	s += getLastNamePronoun(a.Name) + " most frequent co-authors" +'<span class="info" onclick="infoMostFrequentCoAuthor()">&#9432</span>' + " are " ;
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
function firstCollaborationDescriptionPhrase(pdata, adata, a,c){

	var s = "";
	var startYear = d3.min(c.MutualPubPerYear, function(d){return +d.Year;});
	var lastYear = d3.max(c.MutualPubPerYear, function(d){return +d.Year;});
	//console.log(lastYear); 
	if (lastYear>2015){
		s += " It is ";
		if (lastYear - startYear > 20){
			s += "a prolonged and still";
		} 
		s += " ongoing collaboration since " + startYear + " with " + makeMeLive_LoadData(pdata, adata, c.MutualPublications.toString() + " publications", a.Name, c.Name) + ". ";
	}
	else if (lastYear<=2015){
		s += " This ";
		if (lastYear-startYear >20){
			s += "was a long lasting "; 
		}
		s += "collaboration ";
			if (lastYear-startYear >20){
				s += "that "; 
			}

		s += "produced " + makeMeLive_LoadData(pdata, adata, c.MutualPublications.toString() + " publications", a.Name, c.Name) ;
		s += (lastYear - startYear > 1) ? " between " + startYear + " and " + lastYear + ". " : " during " + startYear + ". " ; 
	}
	return s;
}
function secondMostFrequentCoauthorPhrase(pdata, adata, a,c,supervisors,supervisees){
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
			s += ", a long-lasting and still ongoing collaboration with "+ makeMeLive_LoadData(pdata, adata, c.MutualPublications + " publications", a.Name, c.Name)  +
					" since " + startYear1;
			if (DoesExistInList(supervisees, c.Name)){
						s += " and " + getLastName(a.Name) + " is acting as a supervisor" +'<span class="info" onclick="infoSupervisor()">&#9432</span>' ;
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
						s += " and " + makeMeLive_LastName(c.Name) + 
						" is acting as a supervisor" +'<span class="info" onclick="infoSupervisor()">&#9432</span>' ;
			}
		}
		else if (lastYear1 -  startYear1 > 1 && lastYear1>2015){
			s += ", an ongoing collaboration with "+ makeMeLive_LoadData(pdata, adata, c.MutualPublications + " publications", a.Name, c.Name) +
					" since " + startYear1;
			if (DoesExistInList(supervisees, c.Name)){
					s += " and " + getLastName(a.Name) + " is acting as a supervisor" +'<span class="info" onclick="infoSupervisor()">&#9432</span>' ;
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
					s += " and " +  makeMeLive_LastName(c.Name) +
					 " is acting as a supervisor" +'<span class="info" onclick="infoSupervisor()">&#9432</span>' ;
			}
		}
		else if (lastYear1 -  startYear1 > 1 && lastYear1<=2015) {
			s += ", a collaboration that produced "+ makeMeLive_LoadData(pdata, adata, c.MutualPublications + " publications", a.Name, c.Name) +
					" between " + startYear1 + " and " + lastYear1 ;
			if (DoesExistInList(supervisees, c.Name)){
					s += ", and " + getLastName(a.Name) + " acted as a supervisor" +'<span class="info" onclick="infoSupervisor()">&#9432</span>' ;
					
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
					s += ", and " +  makeMeLive_LastName(c.Name) + 
					" acted as a supervisor" +'<span class="info" onclick="infoSupervisor()">&#9432</span>' ;
				
			}
		}
		s += ". ";
		return s;
}
function thirdCoauthorPhrase(pdata, adata, a, c, supervisors, supervisees){
	var s = "";
	var startYear1 = d3.min(c.MutualPubPerYear, function(d){return +d.Year;});
	var lastYear1 = d3.max(c.MutualPubPerYear, function(d){return +d.Year;});
		s += "Together with " +  makeMeLive_FullName(c.Name)  + 
		" " + '<svg width="70" height="20" id="sparkline_third_coll"></svg>' + ", ";
		var obj = new Object();
		obj.sparklineID = "sparkline_third_coll";
		obj.data = c.MutualPubPerYear; 
		obj.coauthor = c.Name; 
		listOfSparklines.push(obj); 
		if (lastYear1 -  startYear1 > 15 && lastYear1>2015){
			s += " a long-lasting and still ongoing collaboration produced "+ makeMeLive_LoadData(pdata, adata, c.MutualPublications + " publications", a.Name, c.Name)+
					" since " + startYear1;
			if (DoesExistInList(supervisees, c.Name)){
						s += " and " + getLastName(a.Name) + " is acting as a supervisor. "
			}
			if (DoesExistInSupervisors(supervisors, c.Name)){
						s += " and " +  makeMeLive_LastName(c.Name) + 
						" is acting as a supervisor. "
			}
			if(!DoesExistInList(supervisees, c.Name) && !DoesExistInSupervisors(supervisors, c.Name)){
				s+= ". "
			}
		}
		else {
			s += " the author published " + makeMeLive_LoadData(pdata, adata, c.MutualPublications + " research papers", a.Name, c.Name) ;
			s += (lastYear1 < 2015) ?  " between " + startYear1 + " and " + lastYear1 + ". " : " since " + startYear1 + ". "; 
		}
		return s;

}
function stringifyListWithSparklines(list) {
	switch (list.length) {
		case 0: return "";
		case 1: 
		// console.log(list[0]); 
			var ID = "sparkline_coll"+0;
			s = makeMeLive_FullName(list[0].Name) + " " + '<svg width="70" height="20" id="' + ID + '"></svg>';
			var obj = new Object();
			obj.sparklineID = ID; 
			obj.data = list[0].MutualPubPerYear; 
			obj.coauthor = list[0].Name; 
			listOfSparklines.push(obj);
			return s; 

		case 2: 
			var ID1 = "sparkline_coll"+0;
			var ID2 = "sparkline_coll"+1;
			s = makeMeLive_FullName(list[0].Name) + " " + '<svg width="70" height="20" id="' + ID1 + '"></svg>' + " and " +
			 makeMeLive_FullName(list[1].Name) + " " + '<svg width="70" height="20" id="' + ID2 + '"></svg>' ;

			var obj = new Object();
			obj.sparklineID = ID1; 
			obj.data = list[0].MutualPubPerYear; 
			obj.coauthor = list[0].Name; 
			listOfSparklines.push(obj);

			var obj = new Object();
			obj.sparklineID = ID2; 
			obj.data = list[1].MutualPubPerYear; 
			obj.coauthor = list[1].Name; 
			listOfSparklines.push(obj);
			return s; 

		default:
			var s = "";
			for (var i=0; i<Math.min(list.length,MAX_SUPERVISEES);i++){
			// list.forEach(function (element, i) {
				element = list[i]; 
				if (i > 0) {
					s += ",</span> ";
					if (i === Math.min(list.length,MAX_SUPERVISEES) - 1) {
						s += "and ";
					}
				}
				var ID = "sparkline_coll"+i;
				s += makeMeLive_FullName(element.Name) + " " + '<span class="no-wrap"><svg width="70" height="20" id="' + ID + '"></svg>' ;
				var obj = new Object();
				obj.sparklineID = ID; 
				obj.data = element.MutualPubPerYear; 
				obj.coauthor = element.Name; 
				listOfSparklines.push(obj); 
			}
			return s + "</span>";
	}
}
function superviseePhrase_InAdditionTo1(pdata, adata, a,c,supervisees){
	var s = "";
	if(DoesExistInList(supervisees, c.Name)){
		supervisees = RemoveItemFromList(supervisees,c.Name);
		s += "In addition to " +  makeMeLive_LastName(c.Name) + 
		", further supervisees" + '<span class="info" onclick="infoSupervisee()">&#9432</span>' +
		 " of " + getLastName(a.Name) + " with considerable amount of publications are " ;
		 s += stringifyListWithSparklines(supervisees) + "."; 
	}
	else {
		if (supervisees.length > 2){
			s += "Supervisees" + '<span class="info" onclick="infoSupervisee()">&#9432</span>' + 
			" of " + getLastName(a.Name) + " with considerable amount of publications are " ;
			s+=stringifyListWithSparklines(supervisees)+ "."; 
		}
		else if (supervisees.length == 1){
			// console.log(supervisees[0]);
			var ID = "sparkline_coll"+0;
			s += "Supervisee" + '<span class="info" onclick="infoSupervisee()">&#9432</span>' + " of " + getLastName(a.Name) ;  
			s += (supervisees[0].Count > 5) ? " with considerable amount of publications is " : " is ";
			
			s+=stringifyListWithSparklines(supervisees) + "."; 
		}	
	
	}
	return s;
}

function superviseePhrase_InAdditionTo1OR2(pdata, adata, a,c1,c2,supervisees){
	var s = "";
	if (DoesExistInList(supervisees, c1.Name) && DoesExistInList(supervisees, c2.Name)){
		supervisees = RemoveItemFromList(supervisees,c1.Name);
		supervisees = RemoveItemFromList(supervisees,c2.Name);
		console.log(c1.Name + " : " + c2.Name); 
		s += "In addition to " +  makeMeLive_LastName(c1.Name) + " and " +  makeMeLive_LastName(c2.Name) + ", further supervisees" +
		 '<span class="info" onclick="infoSupervisee()">&#9432</span>' + " of " + getLastName(a.Name) + " with considerable amount of publications are " ;
		s+=stringifyListWithSparklines(supervisees);
	}
	else if (DoesExistInList(supervisees, c1.Name) || DoesExistInList(supervisees, c2.Name)){
		
		if (DoesExistInList(supervisees, c1.Name)){
			supervisees = RemoveItemFromList(supervisees,c1.Name);
			s += "In addition to " + makeMeLive_LastName(c1.Name) + ", further supervisees" + '<span class="info" onclick="infoSupervisee()">&#9432</span>' +
			 " of " + getLastName(a.Name) + " with considerable amount of publications are " ;
			s+=stringifyListWithSparklines(supervisees)+ ".";
		}
		else if (DoesExistInList(supervisees, c2.Name)){
			supervisees = RemoveItemFromList(supervisees,c2.Name);
			s += "In addition to " +  makeMeLive_LastName(c2.Name) + ", further supervisees" + + '<span class="info" onclick="infoSupervisee()">&#9432</span>' +
			 " of " + getLastName(a.Name) + " with considerable amount of publications are " ;
			s+=stringifyListWithSparklines(supervisees)+ ".";
		}
	}
	else {
		s += "Supervisees" + '<span class="info" onclick="infoSupervisee()">&#9432</span>' + " of " + getLastName(a.Name) + 
		" with considerable amount of publications are " ;
		s+=stringifyListWithSparklines(supervisees)+ ".";	
	}
	return s;
}
function superviseePhrase_InAdditionToN(pdata, adata, a,list_c,supervisees){
	var s = "";
	var alreadySupervisees = [];
	for (var i=0; i< list_c.length ; i++){
		if (DoesExistInList(supervisees, list_c[i].Name)){

			alreadySupervisees.push(list_c[i]);
			supervisees = RemoveItemFromList(supervisees, list_c[i].Name);
		}
	}
	// console.log(alreadySupervisees); 
	if (alreadySupervisees.length > 0 && supervisees.length > 0){
		if (alreadySupervisees.length == 1){
			s += "In addition to " + makeMeLive_LastName(alreadySupervisees[0].Name) ;
		}
		else if (alreadySupervisees.length == 2){
			s += "In addition to " +  makeMeLive_LastName(alreadySupervisees[0].Name) + " and " +  makeMeLive_LastName(alreadySupervisees[1].Name) ; 
		}
		else {
			// console.log(alreadySupervisees); 
			s += "In addition to ";
			for (var i=0;i<alreadySupervisees.length;i++){
				if(i==alreadySupervisees.length-1){
					s += "and " + makeMeLive_LastName(alreadySupervisees[i].Name)+" " +".";
				}
				else {
					s +=makeMeLive_LastName(alreadySupervisees[i].Name)+	" " + ", ";
				}
			}
		}
		if (supervisees.length > 2){
			s +=  ", further supervisees" + '<span class="info" onclick="infoSupervisee()">&#9432</span>' + 
			" of " + getLastName(a.Name) + " with considerable amount of publications are " ;
			s+=stringifyListWithSparklines(supervisees)+ ".";
		}
		else if (supervisees.length == 1){
			s +=  ", another supervisee" + '<span class="info" onclick="infoSupervisee()">&#9432</span>' + 
			" of " + getLastName(a.Name) ;
			s+= (supervisees[0].Count>5) ? " with considerable amount of publications is " : " is ";
			s += stringifyListWithSparklines(supervisees)+ ".";
		}
	}
	return s;
}
function collaborationGroupPhrase(pdata, adata, a){
	// console.log(a.CollaborationGroups);
	var s="";
	var groups = a.CollaborationGroups;
	// console.log(groups); 
	var info = '<span class="info" onclick="">&#9432</span>';
	//Adding attribute "Value" for using in getTopNItems()
	for(var i=0;i<groups.length ;i++){
		groups[i]["Value"]= groups[i].Publications;
	}
	// console.log(groups);
	var topGroups = getTopNItems(groups, 2,3);
	// console.log(topGroups);
	switch (topGroups.length) {
		case 0: return "";
		case 1:
			s += " Analysis of subgroups within " + getLastNamePronoun(a.Name) + " co-author network" + info + " shows that the author along with " + stringifyListWithAuthorLinks(topGroups[0].Members);
			s += (getGroupKeywords(pdata, a, topGroups[0].Members).length >= 1) ? " has worked on " + stringifyList(getGroupKeywords(pdata, a, topGroups[0].Members)) + " and" : "";
			s += " produced " + makeMeLive_LoadGroupPublications(pdata, adata, topGroups[0].Value + " research papers", a.Name, topGroups[0].Members) + " .";
			$subgroups = $("<span>" + s + "<span>");
			$subgroups.find(".info").click(function () {
				showAdditionalInfoGroups(a, a.CollaborationGroups);
			});
			// console.log(s);
			return $subgroups;
		case 2:
			s += " Analysis of subgroups within " + getLastNamePronoun(a.Name) + " co-author network" + info + " shows that the author along with " + stringifyListWithAuthorLinks(topGroups[0].Members);
			s += (getGroupKeywords(pdata, a, topGroups[0].Members).length >= 1) ? " has worked on " + stringifyList(getGroupKeywords(pdata, a, topGroups[0].Members)) + " and" : "";
			s += " produced " + makeMeLive_LoadGroupPublications(pdata, adata, topGroups[0].Value + " research papers", a.Name, topGroups[0].Members) + ".";
			s += (topGroups[1].Members.length >= 5) ? " Another considerably large group " : " Another notable group ";
			s += " is with " + stringifyListWithAuthorLinks(topGroups[1].Members) + " resulting in " +
				makeMeLive_LoadGroupPublications(pdata, adata, topGroups[1].Value + " publications", a.Name, topGroups[1].Members);
			s += (getGroupKeywords(pdata, a, topGroups[1].Members) >= 1) ? " in the field of " + stringifyList(getGroupKeywords(pdata, a, topGroups[1].Members)) : ". ";
			$subgroups = $("<span>" + s + "<span>");
			$subgroups.find(".info").click(function () {
				showAdditionalInfoGroups(a, a.CollaborationGroups);
			});
			return $subgroups;
		default:
			s += " Analysis of subgroups within " + getLastNamePronoun(a.Name) + " co-author network" + info + " shows that the author along with " + stringifyListWithAuthorLinks(topGroups[0].Members);
			s += (getGroupKeywords(pdata, a, topGroups[0].Members).length >= 1) ? " has worked on " + stringifyList(getGroupKeywords(pdata, a, topGroups[0].Members)) + " and" : "";
			s += " produced " + makeMeLive_LoadGroupPublications(pdata, adata, topGroups[0].Value + " research papers", a.Name, topGroups[0].Members) + ".";
			s += (topGroups[1].Members.length >= 5) ? " Another considerably large group " : " Another notable group ";
			s += " is with " + stringifyListWithAuthorLinks(topGroups[1].Members) + " resulting in " +
				makeMeLive_LoadGroupPublications(pdata, adata, topGroups[1].Value + " publications", a.Name, topGroups[1].Members);
			s += (getGroupKeywords(pdata, a, topGroups[1].Members) >= 1) ? " in the field of " + stringifyList(getGroupKeywords(pdata, a, topGroups[1].Members)) : ". ";
			$subgroups = $("<span>" + s + "<span>");
			$subgroups.find(".info").click(function () {
				showAdditionalInfoGroups(a, a.CollaborationGroups);
			});
			return $subgroups;
	}
}
function getGroupKeywords(pdata, a, groupMembers){
	var keywords = {};
	var pubs = getPublications(pdata, a.Name);
	var groupPubs = getGroupPublications(pubs, groupMembers);
	// console.log(groupPubs);
	for (var i = 0; i < groupPubs.length; i++) {
		var pubKeywords = getPublicationKeywords(groupPubs[i])
		for (var j = 0; j < pubKeywords.length; j++) {
			var keyword = pubKeywords[j];
			if (!keywords[keyword]) {
				keywords[keyword] = { Name: keyword, Value: 0, MaxYear: 0 };
			}
			keywords[keyword].Value++;
			keywords[keyword].MaxYear = Math.max(keywords[keyword].MaxYear, pubs[i].Year);
		}
	}
	var keywordList = Object.keys(keywords).map(function (keyword) {
		return {Name: keyword, Value: keywords[keyword].Value, MaxYear: keywords[keyword].MaxYear};
	});
	keywordList.sort(function (a, b) {
		return +(b.Value) - +(a.Value);
	});
	// console.log(keywordList);
	FilteredkeywordList = keywordList.filter(function(d){return d.Value > 1; });
	FilteredkeywordList = FilteredkeywordList.filter(function(d){return d.Name != "visualization"}); 
	// console.log(FilteredkeywordList);

	return convertToStringArray(FilteredkeywordList);
}
function getGroupPublications(pubs, groupMembers){
	// console.log(pubs);
	var groupPubs = [];
	for (var i=0;i<pubs.length;i++){
		var allAuthors = convertToStringArray(pubs[i].Authors);
		if(isGroupPublication(allAuthors,groupMembers)){
			groupPubs.push(pubs[i]);
		}
	}
	// console.log(groupPubs);
	return groupPubs;
}
function convertToStringArray(listOfObjects){
	var arr = [];
	for (var i=0;i<listOfObjects.length;i++){
		arr.push(listOfObjects[i].Name);
	}
	// console.log(arr);
	return arr;

}
function isGroupPublication(allAuthors, groupMembers){
	var r= false;
	var memberFoundCount = 0;
	for (var i=0;i<groupMembers.length;i++){
		// console.log(allAuthors);
		// console.log(groupMembers);
		if (allAuthors.indexOf(groupMembers[i]) > -1){
			memberFoundCount++;
		}
	}
	// console.log(memberFoundCount);
	if (memberFoundCount==groupMembers.length) {r = true;}
	// console.log(r);
	return r;
}

function generateCollaborationRelationText(pdata, adata, a, topCoAuthors){
	var text = "";
	var supervisees = findSupervisee(pdata, adata, a);
	sortByValue(supervisees);
	var $collRelation = $("#collRelation");
	var supervisors = []; 
	var main_author_startYear = getStartYear(a);
	var pubCount = a.Journals + a.Conferences; 
	//console.log(main_author_startYear);
	for (var i=0;i<topCoAuthors.length;i++){
		if(topCoAuthors[i].StartYear < main_author_startYear + 5) {
			var pubs = getAllMutualPublications(pdata, a.Name, topCoAuthors[i].Name)
			if (isSupervisor(pubs,a.Name,topCoAuthors[i].Name)){
				supervisors.push(topCoAuthors[i].Name);
			}
		}
	}
	if (topCoAuthors.length > 0){

		if (topCoAuthors.length == 1){
			text += mostFrequentCoauthorPhrase(pdata, adata, a,topCoAuthors[0],supervisors, supervisees);
			text += firstCollaborationDescriptionPhrase(pdata, adata, a,topCoAuthors[0]);
			if (supervisees.length > 0){
				hasSupversied = true;
				text += superviseePhrase_InAdditionTo1(pdata, adata, a,topCoAuthors[0], supervisees); 
			}
		}
		else if (topCoAuthors.length == 2){
			if (topCoAuthors[0].MutualPublications == topCoAuthors[1].MutualPublications){	
				text += mostFrequentCoauthorPhrase(pdata, adata, a,topCoAuthors[0],topCoAuthors[1]);
			}
			else {
				text += mostFrequentCoauthorPhrase(pdata, adata, a,topCoAuthors[0],supervisors, supervisees); 
				text += firstCollaborationDescriptionPhrase(pdata, adata, a,topCoAuthors[0]);
				text += secondMostFrequentCoauthorPhrase(pdata, adata, a,topCoAuthors[1],supervisors,supervisees);
				if (supervisees.length > 0){
					hasSupversied = true;
					text += superviseePhrase_InAdditionTo1OR2(pdata, adata, a,topCoAuthors[0],topCoAuthors[1],supervisees);
				}
			}		

		}
		else if (topCoAuthors.length > 2){
			text += mostFrequentCoauthorPhrase(pdata, adata, a,topCoAuthors[0],supervisors, supervisees); 
			text += firstCollaborationDescriptionPhrase(pdata, adata, a,topCoAuthors[0]);
			text += secondMostFrequentCoauthorPhrase(pdata, adata, a,topCoAuthors[1],supervisors,supervisees);
			text += thirdCoauthorPhrase(pdata, adata, a,topCoAuthors[2],supervisors,supervisees);
			if (supervisees.length > 0){
				hasSupversied = true;
				text += superviseePhrase_InAdditionToN(pdata, adata, a,topCoAuthors,supervisees);
			}
		}
		text += supSupervisorPhrase(pdata, adata, a, supervisees); 
	}
	$subgroups = collaborationGroupPhrase(pdata, adata, a); 
	$collRelation.html(text);
	$collRelation.append($subgroups);
	// return text; 
}
function supSupervisorPhrase(pdata, adata, author, supervisees){
	var s="";
	var supSupervisees = supSupervisor(pdata, adata, author, supervisees); 

	// var names = stringifyListWithAuthorLinks(convertToStringArray(supSupervisees));

	if (supSupervisees.length > 0){
		isSupSupervisor = true;
		s+= " " + getLastNamePronoun(author.Name) ;
		s+= (supSupervisees.length == 1) ? " supervisee, " : " supvervisees, " ; 
		s+= stringifyListWithAuthorLinks(convertToStringArray(supSupervisees)) ;
		s+= (supSupervisees.length == 1) ? " is " : " are " ;
		s+= " already supervising other researchers. ";
	}
	// console.log(s); 
	return s; 

}
function supSupervisor(pdata, adata, author, supervisees){
	var supSupervisees = [];
	// console.log(author);
	// console.log(supervisees); 
	for (var i=0; i<supervisees.length;i++){
		var superviseeObj = findAuthorObjectByName(adata,supervisees[i].Name);
		var supViseeList = findSupervisee(pdata, adata, superviseeObj);
		// console.log(supervisees[i]); 
		if (supViseeList.length >1){
			supSupervisees.push(supervisees[i]); 
		}
	}
	// console.log(supSupervisees); 
	return supSupervisees;

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
function getLastNameForVis(fullName){
	//it marks non-vis authors with *
	if (fullName != undefined){ 
		if(authors_list.indexOf(fullName) != -1){
			var name = fullName.split(" ");
			if(isNaN(name[name.length-1])){
				return name[name.length-1];
			}
			else {
				return name[name.length-2];
			}
		}
		else {
			var name = fullName.split(" ");
			if(isNaN(name[name.length-1])){
				//s = '<span title="More information about this author is not available" id="nonVISAuthors" onclick="">' +name[name.length-1]+"*" + "</span>";
				//return s; 
				return name[name.length-1]+"*";
			}
			else {
				//s = '<span title="More information about this author is not available" id="nonVISAuthors" onclick="">' +name[name.length-2]+"*" + "</span>";
				//return s; 
				return name[name.length-2]+"*";
			}
		}
	}
}
function getFullNameWithoutNoForVis(fullName){
	var name = fullName.split(" ");
	var no = "";
	if (authors_list.indexOf(fullName) != -1){ //vis author
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
	else { // non-vis author 
		if(!isNaN(name[name.length-1])){
			no = name[name.length-1];
			name = name.filter(function(item) { 
		    	return item !== no
			})
			name = name.join(" ");
			return name+"*";  
		}
		else {
			return fullName+"*"; 

		}
	}
	
}

function getFullNameWithoutNo(fullName){
	var name = fullName.split(" ");
	var no = "";
	if (authors_list.indexOf(fullName) != -1){ //vis author
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
	else { // non-vis author 
		if(!isNaN(name[name.length-1])){
			no = name[name.length-1];
			name = name.filter(function(item) { 
		    	return item !== no
			})
			name = name.join(" ");
			s = '<span title="More information about this author is not available" id="nonVISAuthors">' + name+"*" + "</span>";
        	return s;
			// return name+"*";  
		}
		else {
			//return fullName+"*"; 
			s = '<span title="More information about this author is not available" id="nonVISAuthors">' + fullName+"*" + "</span>";
        	return s;

		}
	}
	
}
function getFullNameWithoutNoWithoutAsterisk(fullName){
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
			if(SupervisorStartYear + 5 <= AuthorStartYear ){
				var mutualPubs = getAllMutualPublicationsForSuperVisee(pubs,aObject.Name,author.Name); // Publications of supervisee as first authors (deciding publications)
				var allMutualPubs = getAllMutualPublications(pdata, aObject.Name, author.Name); // All mutual publications of supervisee with supervisor (for sparkline)
				//console.log(mutualPubs);
				if(supervisees.indexOf(firstAuthor) == -1 && mutualPubs.length > 1){
					 var obj = new Object();
					 obj.Name = firstAuthor;
					 obj.Count = allMutualPubs.length;
					 var list = [];
					 for(var j=0;j<allMutualPubs.length;j++){
					 	list.push(allMutualPubs[j].Year); 
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
	var $rtopics = $("#rtopics");
	var keywords = getKeywords(pdata, a);
	var visKeyword = keywords.find(function (element) {
		return element.Name === "visualization";
	});
	if (visKeyword != undefined){
		var visIsActive = (new Date()).getFullYear() - visKeyword.MaxYear <= 5;
		if (keywords.length > 0) {
			text += visCommunityPhraseTopics(pdata, adata, keywords, a, visKeyword, visIsActive);
			text += visSubfieldPhraseTopics(pdata, adata, keywords, a, visIsActive);
			text += visAreaPhraseTopics(a, visIsActive);
			text += otherCommunityPhraseTopics(pdata, adata, keywords, a, visIsActive);
			$similarResearchers = similarResearchersPhraseTopics(pdata,adata, a);
		}
		$rtopics.html(text);
		$rtopics.append($similarResearchers)
	} else {
		$rtopics.empty();
	}
}
function visCommunityPhraseTopics(pdata, adata, keywords, a, keyword, isActive) {
	var pubCount = keyword.Value;
	var s = getLastName(a.Name);
	if (pubCount >= 30) {
		s += (isActive ? " is a current" : " was a") + " core member of the " + makeMeLive_LoadDataOnTopic(pdata, adata, keyword.Name, a.Name, keyword.Name, "community") + " community";
	}
	else if (pubCount > 10) {
		s += (isActive ? " is a current" : " was a") + " member of the " + makeMeLive_LoadDataOnTopic(pdata, adata, keyword.Name, a.Name, keyword.Name, "community") + " community";
	}
	else {
		s += (isActive ? " is a current contributor of" : " made contributions to") + " the " + makeMeLive_LoadDataOnTopic(pdata, adata, keyword.Name, a.Name, keyword.Name, "community") + " research community";
	}
	alreadyListedTopics.push(keyword.Name);
	return s;
}
function visSubfieldPhraseTopics(pdata, adata, keywords, a, visIsActive) {
	var s = ". ";
	var subfields = [];
	for (var i = 0; i < keywords.length; i++) {
		if (visSubfields.indexOf(keywords[i].Name) != -1 && keywords[i].Value > 1) {
			subfields.push(keywords[i].Name);
			alreadyListedTopics.push(keywords[i].Name);
		}
	}
	// console.log(subfields); 
	if (subfields.length > 0) {
		if (subfields.length == 1) {
			s = " with publications mainly within the subfield of " + makeMeLive_LoadDataOnTopic(pdata, adata, subfields[0], a.Name, subfields[0], "subfield") + "."

		}
		else if (subfields.length == 2) {
			s = ". " + getLastNamePronoun(a.Name) + " expertise mainly covers the subfields of " + makeMeLive_LoadDataOnTopic(pdata, adata, subfields[0], a.Name, subfields[0], "subfield") +
				" and " + makeMeLive_LoadDataOnTopic(pdata, adata, subfields[1], a.Name, subfields[1], "subfield") + ".";
		}
		else if (subfields.length > 2) {
			s = ". " + getLastName(a.Name) + (visIsActive ? " has" : "") + " contributed to all ";
			for (var i = 0; i < subfields.length; i++) {
				if (i == subfields.length - 1) {
					s += "and " + makeMeLive_LoadDataOnTopic(pdata, adata, subfields[i], a.Name, subfields[i], "subfield") + ".";
				}
				else {
					var ID = "sparkline_coll" + i;
					s += makeMeLive_LoadDataOnTopic(pdata, adata, subfields[i], a.Name, subfields[i], "subfield") + ", ";
				}
			}
		}
	}
	return s;
}
function visAreaPhraseTopics(a, visIsActive) {
	//Recent topics of author
	var s = "";
	var topics = [];
	// console.log(a);
	for (var i = 0; i < a.Keywords.length; i++) {
		if (author_keywords[a.Keywords[i]] != undefined && author_keywords[a.Keywords[i]] != "unclear") {
			topics.push(author_keywords[a.Keywords[i]]);
		}
	}
	var uniqueTopics = compressArray(topics, "");
	uniqueTopics.sort(function (a, b) {
		return +(b.Value) - +(a.Value);
	});
	// console.log(uniqueTopics);
	//uniqueTopics = uniqueTopics.slice(1,20); 
	var topicThreshold = a.Conferences + a.Journals >= 100 ? 3 : 2;
	var listOfTopics = [];
	for (var i = 0; i < uniqueTopics.length; i++) {
		if (keywordMapping[uniqueTopics[i].Name] != undefined && uniqueTopics[i].Value >= topicThreshold) {
			listOfTopics.push(uniqueTopics[i].Name);
		}
	}
	// console.log(listOfTopics);
	var text = "";
	var cleanedKeywords = [];
	var allVisVersionsAvailable = true;
	var allVisOfDataVersionsAvailable = true;
	$.each(listOfTopics, function (i, keyword) {
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
	if (cleanedKeywords.length != 0) {
		var isSingular = cleanedKeywords.length === 1;
		$.each(cleanedKeywords, function (i, keyword) {
			var mapping = keywordMapping[keyword];
			text += '<span class="topic">'
			text += allVisOfDataVersionsAvailable ? mapping.visOfData :
				(allVisVersionsAvailable ? mapping.vis : mapping.default);
			text += '</span>'
			if (i + 2 < cleanedKeywords.length) {
				text += ", ";
			} else if (i + 1 < cleanedKeywords.length) {
				text += (cleanedKeywords.length > 2) ? ", and " : " and ";
			}
		});
		var pre = allVisOfDataVersionsAvailable ? "the visualization of " : "";
		var post = allVisOfDataVersionsAvailable ? " data" : (allVisVersionsAvailable ? " visualization" : "");
		if (isSingular) {
			s = " A focus area of the author " + (visIsActive ? "is " : "was ") + pre + text + post + ".";
		} else {
			s = " Focus areas of the author " + (visIsActive ? "are " : "were ") + pre + text + post + ".";
		}
	}
	return s;
}
function otherCommunityPhraseTopics(pdata, adata, keywords, a, visIsActive){
	var s = "";
	//console.log(a);
	//console.log(alreadyListedTopics);
	var keywordThreshold = 2;
	var otherCommutiesActive = [];
	var otherCommutiesOld = [];
	for (var i = 0; i < keywords.length; i++) {
		if (alreadyListedTopics.indexOf(keywords[i].Name) === -1 && keywords[i].Value >= keywordThreshold) {
			var currentYear = (new Date()).getFullYear();
			var isActive = currentYear - keywords[i].MaxYear <= 5;
			(isActive?otherCommutiesActive:otherCommutiesOld).push(keywords[i]);
		}
	}
	otherCommutiesActive = getTopNItems(otherCommutiesActive, 3, 6, 1);
	if (otherCommutiesActive.length > 0){
		if (otherCommutiesActive.length == 1){
			s += (!visIsActive?"Currently, the author is ": " The author is also ")+ " contributing to the area of ";
			s +=  makeMeLive_LoadDataOnTopic(pdata, adata, otherCommutiesActive[0].Name, a.Name, otherCommutiesActive[0].Name, "community") + "."

		}
		else if (otherCommutiesActive.length == 2){
			s += (!visIsActive?" Current": " Other current")+ " research areas of the author are ";
			s += makeMeLive_LoadDataOnTopic(pdata, adata, otherCommutiesActive[0].Name, a.Name, otherCommutiesActive[0].Name, "community")
			+ " and " + makeMeLive_LoadDataOnTopic(pdata, adata, otherCommutiesActive[1].Name, a.Name, otherCommutiesActive[1].Name, "community") + ".";
		}
		else if (otherCommutiesActive.length > 2) {
			s += (!visIsActive?" Current": " Other current")+ " research areas of the author are ";
			for (var i=0;i<otherCommutiesActive.length;i++){
				if(i==otherCommutiesActive.length-1){
					s += "and " + makeMeLive_LoadDataOnTopic(pdata, adata, otherCommutiesActive[i].Name, a.Name, otherCommutiesActive[i].Name, "community")+".";
				}
				else {
					s += makeMeLive_LoadDataOnTopic(pdata, adata, otherCommutiesActive[i].Name, a.Name, otherCommutiesActive[i].Name, "community") + ", ";
				}
			}
		}
	}
	otherCommutiesOld = getTopNItems(otherCommutiesOld, 3, 6, 1);
	var minNActiveCommunities = (otherCommutiesActive.length > 0)?otherCommutiesActive[otherCommutiesActive.length - 1].Value:0;
	var oldCommunitiesList = [];
	for (var i = 0; i < otherCommutiesOld.length; i++) {
		if (otherCommutiesOld[i].Value >= minNActiveCommunities) {
			oldCommunitiesList.push(makeMeLive_LoadDataOnTopic(pdata, adata, otherCommutiesOld[i].Name, a.Name, otherCommutiesOld[i].Name, "community"));
		}
	}
	if (oldCommunitiesList.length > 0) {
		s += (otherCommutiesActive.length > 0)?" In the past, the": " The";
		s += " author also worked in the field" + ((oldCommunitiesList.length > 1) ? "s" : "") + " of " + stringifyList(oldCommunitiesList) + ".";
	}
	return s; 
}
function stringifyList(list) {
	switch (list.length) {
		case 0: return "";
		case 1: return list[0];
		case 2: return list[0] + " and " + list[1];
		default:
			var s = "";
			list.forEach(function (element, i) {
				if (i > 0) {
					s += ", ";
					if (i === list.length - 1) {
						s += "and ";
					}
				}
				s += element;
			});
			return s;
	}
}

function stringifyListWithAuthorLinks(list) {
	switch (list.length) {
		case 0: return "";
		case 1: return makeMeLive_FullName(list[0]);
		case 2: return makeMeLive_FullName(list[0]) + " and " + makeMeLive_FullName(list[1]);
		default:
			var s = "";
			list.forEach(function (element, i) {
				if (i > 0) {
					s += ", ";
					if (i === list.length - 1) {
						s += "and ";
					}
				}
				s += makeMeLive_FullName(element);
			});
			return s;
	}
}


function similarResearchersPhraseTopics(pdata, adata, a){
	var s=""; 
	var similarAuthors = findAuthorsWithSimilarResearchTopics(pdata, adata, a); 
	var similarAuthorsFiltered = getTopNItems(similarAuthors, 3, 5, 1);
	similarAuthors = getTopNItems(similarAuthors, 10, 15, 1);
	var info = '<span class="info" onclick="">&#9432</span>';
	if (similarAuthorsFiltered.length > 0){
		if (similarAuthorsFiltered.length == 1){
			s += " Another researcher with similar areas of expertise"+info+" is " + makeMeLive_FullName(similarAuthorsFiltered[0].Name) + ".";
		}
	 	else if (similarAuthorsFiltered.length == 1){
	 		s += " Researchers with similar areas of expertise"+info+" are " + makeMeLive_FullName(similarAuthorsFiltered[0].Name) + " and " + makeMeLive_FullName(similarAuthorsFiltered[1]) +"." 
	 	}
	 	else {
			s += " Researchers with similar areas of expertise"+info+" are " ;
			for (var i=0;i<similarAuthorsFiltered.length;i++){
				if(i==similarAuthorsFiltered.length-1){
					s += "and " + makeMeLive_FullName(similarAuthorsFiltered[i].Name)+".";
				}
				else {
					s += makeMeLive_FullName(similarAuthorsFiltered[i].Name) + ", ";
				}
			}
		}
	}
	$similarResearchers = $("<span>"+s+"<span>");
	$similarResearchers.find(".info").click(function() {
		showAdditionalInfoAuthorSimilarity(a, similarAuthors);
	});
	return $similarResearchers;
}
function getKeywords(pdata, a){
	var keywords = {};
	var pubs = getPublications(pdata, a.Name);
	for (var i = 0; i < pubs.length; i++) {
		var pubKeywords = getPublicationKeywords(pubs[i])
		// console.log(pubKeywords);

		for (var j = 0; j < pubKeywords.length; j++) {
			var keyword = pubKeywords[j];
			if (!keywords[keyword]) {
				keywords[keyword] = { Name: keyword, Value: 0, MaxYear: 0 };
			}
			keywords[keyword].Value++;
			keywords[keyword].MaxYear = Math.max(keywords[keyword].MaxYear, pubs[i].Year);
		}
	}
	var keywordList = Object.keys(keywords).map(function (keyword) {
		return {Name: keyword, Value: keywords[keyword].Value, MaxYear: keywords[keyword].MaxYear};
	});
	keywordList.sort(function (a, b) {
		return +(b.Value) - +(a.Value);
	});
	// console.log(keywordList);
	return keywordList;
}

// ONLY TO PREPROCESS 
// CREATES AUTHOR : LIST OF VENUE KEYWORDS MAPPING
// function getKeywordsForAllAuthors(pdata, adata){
	
// 	var keywords = {};

// 	var author_venuekeywords_Map = {}; 
// 	for (var k=0;k<adata.length;k++){
// 		var pubs = getPublications(pdata, adata[k].Name);
// 		var keywordList= [];
// 		for (var i = 0; i < pubs.length; i++) {
// 			var pubKeywords = getPublicationKeywords(pubs[i]);
// 			 // console.log(pubKeywords);

// 		// 	for (var j = 0; j < pubKeywords.length; j++) {
// 		// 		var keyword = pubKeywords[j];
// 		// 		if (!keywords[keyword]) {
// 		// 			keywords[keyword] = { Name: keyword, Value: 0, MaxYear: 0 };
// 		// 		}
// 		// 		keywords[keyword].Value++;
// 		// 		keywords[keyword].MaxYear = Math.max(keywords[keyword].MaxYear, pubs[i].Year);
// 		// 	}
// 		// }
// 		// var keywordList = Object.keys(keywords).map(function (keyword) {
// 		// 	return {Name: keyword, Value: keywords[keyword].Value, MaxYear: keywords[keyword].MaxYear};
// 		// });
// 		// keywordList.sort(function (a, b) {
// 		// 	return +(b.Value) - +(a.Value);
// 		// });
// 		keywordList.push.apply(keywordList, pubKeywords); 
	
// 		}
// 		author_venuekeywords_Map[adata[k].Name] = keywordList; 
// 		// console.log(keywordList);
// 	}
// 	console.log(author_venuekeywords_Map); 
// 	// return keywordList;
// }


function getPublicationKeywords(publication) {
	var pubKeywords = [];
	if (venue_keywords[publication.Venue]) {
		pubKeywords = venue_keywords[publication.Venue].slice();
	}
	$.each(titleKeywords, function (term) {
		if (publication.Title.toLowerCase().indexOf(term) > -1) {
			var keyword = titleKeywords[term];
			if (pubKeywords.indexOf(keyword) == -1) {
				pubKeywords.push(keyword);
				// console.log(keyword + "->" + publication.Title);
			}

		}
	})
	return pubKeywords;
}

function getKeywordsPerYear(pubs, keyword){
	var keywordPerYear = []; 
	for (var i=0;i<pubs.length; i++){
		if (getPublicationKeywords(pubs[i]).indexOf(keyword) != -1) {
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

function findAuthorsWithSimilarResearchTopics(pdata, adata, a) {
	var publications = getPublications(pdata, a.Name);
	var coauthorFreq = {};
	for (var i = 0; i < publications.length; i++) {
		var authors = publications[i].Authors;
		for (let j = 0; j < authors.length; j++) {
			var name = authors[j].Name;
			if (name === a.Name) continue;
			if (!coauthorFreq[name]) {
				coauthorFreq[name] = 0;
			}
			coauthorFreq[name]++;			
		}
	}
	if (a.Conferences + a.Journals < 30) return [];
	var keywordMap1 = createKeywordMap(a.Keywords, author_venue_keywords[a.Name]);
	var similarAuthors = [];
	for (var i = 0; i < adata.length; i++) {
		if (adata[i].Name === a.Name || adata[i].Conferences + adata[i].Journals < 30 || coauthorFreq[adata[i].Name] > 2) continue;
		var keywordMap2 = createKeywordMap(adata[i].Keywords, author_venue_keywords[adata[i].Name]);
		var similarity = computeSimilarityOfKeywords(keywordMap1, keywordMap2);
		if (similarity > 0.5) {
			similarAuthors.push({Name: adata[i].Name, Value: similarity});
		}
	}
	similarAuthors.sort(function(a, b) {
    	return b.Value - a.Value;
  	});
	return similarAuthors;
}
function createKeywordMap(keywords, venueKeywords) {
	var keywordMap = {};
	for (var i = 0; i < keywords.length; i++) {
		var keyword = author_keywords[keywords[i]];
		if (keyword === undefined || keyword === "unclear") {
			continue;
		}
		if (!keywordMap[keyword]) {
			keywordMap[keyword] = 0;
		}
		keywordMap[keyword]++;
	}
	for (var i = 0; i < venueKeywords.length; i++) {
		var keyword = venueKeywords[i];
		if (keyword === "visualization") {
			continue;
		}
		if (!keywordMap[keyword]) {
			keywordMap[keyword] = 0;
		}
		keywordMap[keyword]++;
	}
	return keywordMap;
}
function computeSimilarityOfKeywords(keywordMap1, keywordMap2) {
	var sum = 0;
	var length1 = 0;
	var length2 = 0;
	for (var keyword in keywordMap1) {
		if (keyword in keywordMap2) {
			sum += keywordMap1[keyword] * keywordMap2[keyword];
		}
		length1 += Math.pow(keywordMap1[keyword], 2);
	}
	for (var keyword in keywordMap2) {
		length2 += Math.pow(keywordMap2[keyword], 2);
	}
	return sum / (Math.sqrt(length1) * Math.sqrt(length2));
}
function makeMeLive_FullName(name){

	if (authors_list.indexOf(name) != -1){
		// console.log(name); 
		return  '<span id="linkedAuthorName" onclick="loadMe(pdata, adata, \''+name+'\')">' + getFullNameWithoutNo(name) + "</span>";
	}
	else 
	{
		return getFullNameWithoutNo(name);
	}
}
function makeMeLive_LastName(name){
	if (authors_list.indexOf(name) != -1){
		return  '<span id="linkedAuthorName" onclick="loadMe(pdata, adata, \''+name+'\')">' + getLastName(name) + "</span>";
	}
	else {
		return getLastName(name);
	}
}
function makeMeLive_LoadGroupPublications(pdata, adata, text, author, group){

	return  '<span id="linkedAuthorName" onclick="loadGroupPublications(pdata, adata, \''+author+'\', \''+group+'\');">' + text + "</span>";
}
function makeMeLive_LoadData(pdata, adata, text, a, c){

	return  '<span id="linkedAuthorName" onclick="loadMutualPublications(pdata, adata, \''+a+'\', \''+c+'\')">' + text + "</span>";
}

function makeMeLive_LoadDataOnTopic(pdata, adata, text, a, topic, cssClass){

	return  '<span id="linkedAuthorName" class="'+cssClass+'" onclick="loadPublicationsOnTopic(pdata, adata, \''+a+'\', \''+topic+'\')">' + text + "</span>";
}

function makeMeLive_LoadAllIndividualPublications(pdata, adata, text, a){

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

function loadGroupPublications(pdata,adata, a, g){
	var groupMembers = g.split(",");

	var pubs = getPublications(pdata, a);
	var groupPubs = [];
	for (var i=0;i<pubs.length;i++){
		var allAuthors = convertToStringArray(pubs[i].Authors);
		if(isGroupPublication(allAuthors,groupMembers)){
			groupPubs.push(pubs[i]);
		}
	}

	document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Group Publications " + "(" + groupPubs.length + ") : " + 
	a + ", " + stringifyList(groupMembers) + "</span>" + "<br>" + "<hr>";
  
	  for (var i=0; i<groupPubs.length;i++){
	    StringifyPublication(pdata, adata, groupPubs[i]);
	  }
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
  
  var dataForBarChart = [];
  for (var i=0; i<mutualPublications.length;i++){
    StringifyPublication(pdata, adata, mutualPublications[i]);
       dataForBarChart.push(mutualPublications[i].Year); 
  }
  //return mutualPublications;  

  dataForBarChart = countFrequency(dataForBarChart); 
  // generateBarChart(pdata, adata, a, dataForBarChart, "figure", "msbar"); 
  // console.log(dataForBarChart); 

}

function loadPublicationsOnTopic(pdata, adata, a, topic){
  //Return array of mutual publications of Author and CoAuthor for Year "year"
  // console.log(a); 
  var pubsOnTopic = []; 
  for(var i=0;i<pdata.length;i++){
      var tempAuthors = []; 
      for (var j=0;j<pdata[i].Authors.length;j++){
        tempAuthors.push(pdata[i].Authors[j].Name);
        }
        if(tempAuthors.indexOf(a) != -1)
        {
        	if (getPublicationKeywords(pdata[i]).indexOf(topic) != -1){
          		pubsOnTopic.push(pdata[i]);
          	}
        }
  }

  pubsOnTopic.sort(function(a, b) {
    return +b.Year - +a.Year;
  });

  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Publications " + "(" + pubsOnTopic.length + ") : " + getLastName(a) +  "</span>" + "<br>" + "<hr>";
  
  var dataForBarChart = []; 
  for (var i=0; i<pubsOnTopic.length;i++){
    StringifyPublication(pdata, adata, pubsOnTopic[i]);
    dataForBarChart.push(pubsOnTopic[i].Year); 
	   
  }
  dataForBarChart = countFrequency(dataForBarChart); 
  generateBarChart(pdata, adata, a, dataForBarChart, "figure", "tbar"); 
  // console.log(dataForBarChart); 

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

  document.getElementById("dod").innerHTML= '<span id=sideBarHead>' + "Proceedings Papers " + "(" + indPublications.length + ") : " + getLastName(name)
  + "</span>" + "<br>" + "<hr>";
  
  for (var i=0; i<indPublications.length;i++){
    StringifyPublication(pdata, adata, indPublications[i]);
  }

  // return indPublications;
}

function analyzeTimeSeries(timeseries,author){
	// console.log(timeseries); 
	var result= ""; 
	// console.log(author); 
	var totalpubCount = author.Journals + author.Conferences; 
	var minYear = d3.min(timeseries, function(d){return d.Year;});
	var maxYear = d3.max(timeseries, function(d){return d.Year;});

	var sortedTimeseries = timeseries.slice(0); 
	sortedTimeseries.sort(function(a,b){return b.Value - a.Value});
	// console.log(timeseries); 

	var max = sortedTimeseries[0].Value;
	var secondMax = sortedTimeseries[1].Value;
	// console.log(max);
	// console.log(secondMax); 
	//Looking for a peak in data 
	if (max > 2*secondMax && max > 3){ 
		result = "where a clear peak is in " + timeseries.find(function(d){return d.Value == max}).Year + " (" + max + " publications ). "; 
		return result; 
	}


	var midYear = Math.round((+maxYear - +minYear) / 2 + +minYear); 
	// console.log(midYear); 

	// if(computeSteadyRate(timeseries, minYear, midYear) > 0.80) { 
	// 	result = " with the majority of the publications in the first half";
	// 	return result; 
	// }
	// if(computeSteadyRate(timeseries, midYear, maxYear) > 0.80) {
	// 	 result = " with the majority of the publications in the second half";
	// 	 return result; 
	// }

	//Dividing interval in three parts
	var firstPointYear = Math.round((+maxYear - +minYear) / 3 + +minYear);
	var secondPointYear = Math.round((+maxYear - +minYear)*2/3 + +minYear); 
	// console.log(firstPointYear);
	// console.log(secondPointYear);

	var sum13 = computeSum(timeseries, minYear, firstPointYear);
	var sum23 = computeSum(timeseries, firstPointYear, secondPointYear);
	var sum33 = computeSum(timeseries, secondPointYear, maxYear);
	
	// console.log(sum13); 
	// console.log(sum23); 
	// console.log(sum33); 	
	if(sum13/totalpubCount > 0.50){
		result = "where most contributions appeared until " + firstPointYear + " ("+ sum13 + " publications). ";
		return result;
	}
	if(sum23/totalpubCount > 0.50){
		result = "where most contributions appeared between " +firstPointYear + " and " + secondPointYear + " ("+ sum23 + " publications). ";
		return result; 	
	}
	if(sum33/totalpubCount > 0.50){
		if (maxYear >= 2017) {
			// Michael Burch
			result = "where most contributions appeared since "+ secondPointYear + " ("+ sum33 + " publications). ";
		} else {
			// Wolfgang Straßer
			result = "where most contributions appeared between "+ secondPointYear + " and " + maxYear +" ("+ sum33 + " publications). ";
		}
		return result; 
	}
	// if(sum13 < sum23 && sum23 < sum33) {result = " with an increase in number of publications over the years";}
	return result; 
}

function computeSteadyRate(data, from, to){
	var mean = computeMean(data,from,to);
	// console.log(mean); 
	var count=0;
	var lengthOfSubArray =0; 
	for (var i=0;i<data.length;i++){
			if(+data[i].Year <= to && +data[i].Year > from)
			{
				lengthOfSubArray++; 
				if (data[i].Value <= (mean+0.2*mean) && data[i].Value >= (mean-0.2*mean) ){
					count++; 
				}
			}
		}
		// console.log(count); 
		// console.log(lengthOfSubArray); 
		return count/lengthOfSubArray; 

	
}
function computeSum(data, from, to){
	var sum = 0;
	for (var i=0;i<data.length;i++){
		if(+data[i].Year <= to && +data[i].Year > from){
			sum += data[i].Value;
		}
	}
	return sum;
}
	
function computeMean(data, from, to){

	var sum = 0;
	var count = 0;
	for (var i=0;i<data.length;i++){
		if(+data[i].Year <= to && +data[i].Year > from){
			sum += data[i].Value;
			count++;
		}
	}
	return sum/count; 
}

function infoMostFrequentCoAuthor(){
	document.getElementById("dod").innerHTML =  '<span id=sideBarHead>' + "Most Frequent Collaborators" + "</span>" + "<br>" + "<hr>" + 
	"Most frequent collaborators are decided based on the number of joint publications and are described in descending order of their joint publications in the text."; 
}

function infoSupervisor(){
	document.getElementById("dod").innerHTML = '<span id=sideBarHead>' + "Supervisor" + "</span>" + "<br>" + "<hr>" + 
	"A co-author is identified as a supervisor of the profile author if the co-author started publishing at least five years prior to the collaboration "+
	" and appeared as the last author in almost half of the joint publications.";
}
function infoSupervisee(){
	document.getElementById("dod").innerHTML = '<span id=sideBarHead>' + "Supervisees" + "</span>" + "<br>" + "<hr>" +
	"A co-author is categorized as a supervisee of the profile author if the co-author is at least five years junior to the profile author and published" +
	" at least one publication as a first author where the profile author was the last author.";
}

function showAdditionalInfoAuthorSimilarity(author, similarAuthors) {
	$dod = $("#dod");
	$dod.empty();
	$("<span id='sideBarHead'>Similar authors to " + getLastName(author.Name) + "</span>")
		.appendTo($dod);
	$("<br/><hr/>").appendTo($dod);
	$("<p>")
		.text("Similar authors are computed based having a similar distribution of keywords assigned to their publications (cosine similarity). Frequent co-authors of the selected author are excluded from the list because they naturally cover similar keywords. Read more on co-author collaboration in the next paragraph if available.")
		.appendTo($dod);
	$("<p>")
		.text("The most similar authors are:")
		.appendTo($dod);
	$similarAuthorList = $("<ul>")
		.appendTo($dod);
	$.each(similarAuthors, function (i, similarAuthor) {
		$("<li>")
			.html("<span class='sim" + similarAuthor.Value.toFixed(2)[2] + "'>" + makeMeLive_FullName(similarAuthor.Name) + " (" + similarAuthor.Value.toFixed(2) + ")</span>")
			.appendTo($similarAuthorList);
	});
}
function showAdditionalInfoGroups(author, groups){
	// console.log(author);
	// console.log(groups); 

	$dod = $("#dod");
	$dod.empty();
	$("<span id='sideBarHead'>Subgroups within " + getLastNamePronoun(author.Name) + " co-author network" + "</span>")
		.appendTo($dod);
	$("<br/><hr/>").appendTo($dod);
	$("<p>")
		.text("Subgroups within the co-author network are computed using the Formal Concept Analysis (FCA). It provides us with paired sets of co-authors and joint publications that are maximal both w.r.t to co-authors and publications. Subgroups with fewer than three publications and two co-authors are discarded. ")
		.appendTo($dod);
	$("<p>")
		.text("The most notable groups are described below (Number in the parenthesis shows number of group publications):")
		.appendTo($dod);
	$topGroups = $("<ul>")
		.appendTo($dod);
	$.each(groups, function (i, groups) {
		$("<li>")
			.html("<span " + groups.Score.toFixed(2)[2] + "'>" + stringifyListWithAuthorLinks(groups.Members) + " (" + groups.Value + ")</span>")
			.appendTo($topGroups);
	});
}