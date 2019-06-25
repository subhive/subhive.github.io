// ==UserScript==
// @name         [Canvas mini-mod] Wide file browser
// @description  Make the file browser wider when editing pages and assignments
// @version      1.0
// @namespace    https://subhive.github.io
// @author       kebbott@swin.edu.au
// @match        https://*.instructure.com/courses/*/*/*/edit
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Edit styles
    GM_addStyle('#right-side-wrapper {width: 400px;}');
    GM_addStyle('._mtenas {font-size: .7em;}');

})();
