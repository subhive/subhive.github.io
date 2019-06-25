// ==UserScript==
// @name         [Canvas mini-mod] Aligned Rubrics
// @description  Proper alignment of rubric criteria
// @version      1.0
// @namespace    https://subhive.github.io
// @author       kebbott@swin.edu.au
// @match        https://*.instructure.com/courses/*/assignments/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

// Add styles
    GM_addStyle('.rubric_container table.ratings td { width: 20%;}');

})();
