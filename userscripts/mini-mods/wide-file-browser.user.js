// ==UserScript==
// @name         [Canvas mini-mod] Wide file browser
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Make the file browser wider when editing pages.
// @author       You
// @match        https://*.instructure.com/courses/*/*/*/edit
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Edit styles
    GM_addStyle('#right-side-wrapper {width: 400px;}');
    GM_addStyle('._mtenas {font-size: .7em;}');

})();
