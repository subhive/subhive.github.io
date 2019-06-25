// ==UserScript==
// @name         [Canvas mini-mod] Aligned Rubrics
// @namespace    https://subhive.github.io
// @version      1.0
// @updateURL    https://github.com/subhive/eng-prac/raw/master/tampermonkey/canvas%20tweaks/aligned-rubrics.user.js
// @description  Proper alignment of rubric criteria
// @author       kebbott@swin.edu.au
// @match        https://*.instructure.com/courses/*/assignments/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

// Add styles
    GM_addStyle('.rubric_container table.ratings td { width: 20%;}');

})();
