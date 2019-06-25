// ==UserScript==
// @name         [Canvas mini-mod] Course Navigation Quick Links
// @description  Usability tweaks for Canvas LMS
// @version      1.0
// @namespace    https://subhive.github.io
// @author       kebbott@swin.edu.au
// @match        https://*.instructure.com/courses/*
// ==/UserScript==

(function() {
    'use strict';

    var courseId = getCourseId(); // getCourseID gets the ID from the current page URL

// Add links to Course Navigation
    if ($('#rubrics_link').length === 0) {
      $('#section-tabs').append('<li id="rubrics_link" class="section" style="border-top: 1px solid #C7CDD1;"><a href="/courses/' + courseId + '/rubrics" title="Rubrics" class="settings" tabindex="0">Rubrics</a></li>');
      $('#section-tabs').append('<li id="student_link" class="section"><a rel="nofollow" data-method="post" href="/courses/' + courseId + '/student_view">Student view</a></li>');
    }



// COMMON //

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
