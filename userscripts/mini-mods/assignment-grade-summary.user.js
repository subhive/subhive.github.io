// ==UserScript==
// @name         [Canvas mini-mod] Assignment Grade Summary
// @description  Embeds a summary of all grades for the currently viewed assignment.
// @version      1.0
// @namespace    https://subhive.github.io
// @author       kebbott@swin.edu.au based on the work of brian.p.reid@dartmouth.edu
// @include      https://*.instructure.com/courses/*/assignments/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
 	var courseId = getCourseId(); // getCourseID gets the ID from the current page URL
    var assignmentId = getAssignmentId();
    var grades_results = [];
    var resub_results = [];
 	var pending = -1;  // used for pagination
	// the "url" is the Canvas endpoint; no need for tokens since this will be used when logged into Canvas
	var url = "/api/v1/courses/" + courseId + "/assignments/" + assignmentId + "/submissions?per_page=100&include[]=user";

    if ($('#GradeSummary').length === 0) {   // Check to see if #GradeSummary is already created
        setTimeout(loadGrades,500);  // Wait half a sec to let Canvas load the page before auto loading Grade Summary
    }

    function loadGrades(){
        getGrades(url, grades_retrieved);
    }

    // Get grades data
    function grades_retrieved(){
        var grades_count_1 = {}; // count for each type of grade
        $.each(grades_results, function(index, file){ //count the number of each type of grade & change null value to "no submission"
            if (file.grade === null) {
                file.grade = "Not Submitted";
            }
            if (file.grade in grades_count_1){
                grades_count_1[file.grade]++;
            } else {
                grades_count_1[file.grade] = 1;
            }

        });

        var grades_count_2 = {}; // count for each resubmission for grading
        $.each(resub_results, function(index, file){
           if (file["grade_matches_current_submission"] == false in grades_count_2) {
                grades_count_2[file["grade_matches_current_submission"]]++;
            } else {
                grades_count_2[file["grade_matches_current_submission"]] = 0;
            }
        });


    var grades_report = '<h2>Grading summary</h2><table cellpadding="2" style="font-size: .95em; text-transform: capitalize">';//added table formatting
        grades_report += '<tr style="text-align: left;"><th style="text-align: left; padding-right: 20px;"><b>Count</b></th><th><b>Grade</b></th></tr>';//add table header
        $.each(grades_count_1, function(type,count){
                grades_report += '<tr><td>' + count + ' </td><td> '+ type +'</td></tr>';
        });
        grades_report += "</table>";
        display_report_grades(grades_report);
    }

    // display_report will pop up a dialog with the file counts
    function display_report_grades(grades_report_text){
        $('#sidebar_content').append('<div id="GradeSummary">' + grades_report_text + '</div>');
        $('#GradeSummary').css("padding-top","25px");
    }


    // Implement API call with jQuery to get tabs from Canvas
	function getGrades(api_url, return_function) {
        console.log("Starting grades collection...");
		try {
			pending++;
 			$.getJSON(api_url, function (the_data, status, jqXHR) {
                $.each(the_data, function(index, value){ grades_results.push(value);});
                api_url = nextURL(jqXHR.getResponseHeader('Link')); // make sure we get all pages of data
				if (api_url) getGrades(api_url, return_function);  // if there is a link in the header, call this routine recursively
				pending--;
				if (pending < 0) return_function();
			}).fail(function () {
				pending--;
				return_function();
				throw new Error('Failed to get File data '+api_url);
			});
		}
    	catch (e) { console.log(e); alert(e); }
	}


//COMMON

    // See if there is paginated data - https://github.com/jamesjonesmath/canvancement
    function nextURL(linkTxt) {
        var n_url = null;
        if (linkTxt) {
            var links = linkTxt.split(',');
            var nextRegEx = new RegExp('^<(.*)>; rel="next"$');
            for (var i = 0; i < links.length; i++) {
                var matches = nextRegEx.exec(links[i]);
                if (matches) { n_url = matches[1]; }
            }
        }
        return n_url;
    }

    // Get course ID from current URL - https://github.com/jamesjonesmath/canvancement
    function getCourseId() {
        var courseId = null;
        try {
            var courseRegex = new RegExp('/courses/([0-9]+)');
            var matches = courseRegex.exec(window.location.href);
            if (matches) { courseId = matches[1]; }
            else { throw new Error('Unable to detect Course ID'); }
        }
        catch (e) { errorHandler(e); }
        return courseId;
    }

    // Get assignment ID from current URL
    function getAssignmentId() {
        var assignmentId = null;
        try {
            var assignmentRegex = new RegExp('/assignments/([0-9]+)');
            var matches = assignmentRegex.exec(window.location.href);
            if (matches) { assignmentId = matches[1]; }
            else { throw new Error('Unable to detect Assignment ID'); }
        }
        catch (e) { errorHandler(e); }
        return assignmentId;
    }
})();
