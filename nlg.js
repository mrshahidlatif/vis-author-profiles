function generateProfileText(aObject, percentile) {
	//console.log(aObject);

	var bio = "";
	if (percentile <= 25) {
		bio = bio + "";

	} else if (percentile > 25 && percentile <= 50) {
		bio = bio + "";
	} else if (percentile > 50 && percentile < 75) {
		bio = bio + "";
	} else if (percentile > 75) {
		bio = bio + aObject.Name + " is among the core members of the VIS community. Until now, he has published " +
			aObject.Journals + " journal articles " + "and " + aObject.Conferences + " conference articles." +
			"Distribution of his publications over the years is shown in the graphs on the right.";
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