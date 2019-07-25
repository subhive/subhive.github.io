// ==UserScript==
// @name         [Canvas mini-mod] Wide file browser
// @description  Make the file browser wider when editing pages.
// @version      1.0
// @namespace    https://subhive.github.io
// @author       kebbott@swin.edu.au
// @match        https://*.instructure.com/courses/*/*/*/edit
// @match        https://*.instructure.com/courses/*/files
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // In-page file browser
    GM_addStyle('#right-side-wrapper {width: 400px;}');
    GM_addStyle('._mtenas {font-size: .7em;}');

    // Files file browser
    GM_addStyle('.ef-name-col {flex: 17;}');

})();
