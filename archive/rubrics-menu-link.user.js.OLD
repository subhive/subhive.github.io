// ==UserScript==
// @name         [Canvas] Course Rubric Link
// @namespace    https://github.com/subhive/SwinCanvas
// @version      1.0
// @description  Adds a link to the rubrics page in the course navigation.
// @author       kebbott@swin.edu.au
// @match        https://*.instructure.com/courses/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
 	var courseId = getCourseId(); // getCourseID gets the ID from the current page URL


// Add Rubrics link to Course Navigation
    if ($('#rubrics_link').length === 0) {
      $('#section-tabs').append('<li id="rubrics_link" class="section"><a href="/courses/' + courseId + '/rubrics" title="Rubrics" class="settings" tabindex="0">Rubrics</a></li>');
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

    function errorHandler(e) {
        console.log(e.name + ': ' + e.message);
    }


})();
