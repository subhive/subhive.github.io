// ==UserScript==
// @name         [DEV] TinyMCE Mod
// @description  try to take over the world!
// @version      0.1
// @namespace    https://subhive.github.io
// @author       kebbott@swin.edu.au
// @match        https://*.instructure.com/courses/*/*/*/edit
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require      https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var timerCount = 0;

//Display Text Editor Cheatsheet ~ https://codepen.io/subhive/pen/JgOvdg
    if ($('#mce_cheat').length === 0) {
      $('#right-side-wrapper').prepend('<div style="font-size:.8em; padding:10px; margin-bottom: 20px; background-color: #f5f5f5; border: 1px solid #dbdbdb; border-radius: 0.25rem"><span id="text-cheat-header" style="cursor: pointer;"><strong>Text Editor Cheatsheet</strong>&nbsp;&nbsp;^_^</span><div id="text-cheat" style="display:none;"><table style="width: 100%;"><tbody><tr><td style="width: 17%; vertical-align: top;">h1-6:<br />p:<br />ul:<br />ol:<br />indent:</td><td style="width: 33%; vertical-align: top;">Alt + Shift + 1-6<br />Alt + Shift + 7<br />Alt + Shift + U<br />Alt + Shift + O<br />Alt + Shift + A</td><td style="width: 17%; vertical-align: top;">sup:<br />sub:<br />code:<br />pre:<br />outdent:</td><td style="width: 33%; vertical-align: top;">Alt + Shift + P<br />Alt + Shift + B<br />Alt + Shift + C<br />Alt + Shift + R<br />Alt + Shift + D</td></tr></tbody></table><table style="width: 100%; border-top: 1px solid #cccccc; margin-top: 10px;"><tbody><tr><td style="width: 50%; padding-top: 10px;">Insert / Edit Image:<br />Insert Maths Equation:</td><td style="width: 50%; padding-top: 10px;">Alt + Shift + I<br />Alt + Shift + M</td></tr></tbody></table></div></div>');
    }

    var button = document.getElementById('text-cheat-header'); // ID of toggle element

    button.onclick = function() {
        var div = document.getElementById('text-cheat');
        if (div.style.display !== 'none') {
            div.style.display = 'none';
        }
        else {
            div.style.display = 'block'; // 'block'
        }
    };

// Add Editor Buttons
    function addButtons () {
        // Make sure that RCE has loaded and that an HR button isn't already in place
        if (typeof tinymce !== "undefined") {

            console.log("TimyMCE Loaded");

        // Shortcuts
            // https://about.tiny.cloud/wp-content/uploads/2016/10/TinyMCE-kbd-shortcuts.pdf
            // https://www.tiny.cloud/docs/advanced/editor-command-identifiers/
            tinyMCE.activeEditor.addShortcut("alt+shift+u","Unordered List","InsertUnorderedList");
            tinyMCE.activeEditor.addShortcut("alt+shift+o","Ordered List","InsertOrderedList");
            tinyMCE.activeEditor.addShortcut("alt+shift+p","Superscript","Superscript");
            tinyMCE.activeEditor.addShortcut("alt+shift+b","Subscript","Subscript");
            tinyMCE.activeEditor.addShortcut("alt+shift+d","Indent","Indent");
            tinyMCE.activeEditor.addShortcut("alt+shift+a","Outdent","Outdent");
            tinyMCE.activeEditor.addShortcut("alt+shift+m","Insert Maths Equation","instructureEquation");
            tinyMCE.activeEditor.addShortcut("alt+shift+i","Embed Image","mceInstructureImage");

            // https://www.tiny.cloud/docs/configure/content-formatting/
            tinyMCE.activeEditor.addShortcut("alt+shift+c","Code",['mceToggleFormat', false, 'code']);
            tinyMCE.activeEditor.addShortcut("alt+shift+r","Pre",['mceToggleFormat', false, 'pre']);


        // Buttons
            var btn_hr = tinymce.ui.Factory
            .create({
                type: "button",
                icon: "hr",
                tooltip: 'Insert Horizontal Line',
                onclick: function () {
                    tinymce.execCommand("InsertHorizontalRule", !1);
                }
            });

            var btn_blockquote = tinymce.ui.Factory
            .create({
                type: "button",
                icon: "blockquote",
                tooltip: 'Insert Blockquote',
                onclick: function () {
                    tinymce.execCommand("mceBlockQuote", !1);
                }
            });

            var btn_cstm1 = tinymce.ui.Factory
            .create({
                type: "button",
                //icon: "code",
                text: "🦄",
                tooltip: 'class="not_external"',
                onclick: function () {
                    tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('a'), 'not_external');
                }
            });

            var btn_cstm2 = tinymce.ui.Factory
            .create({
                type: "button",
                icon: "code",
                //text: "🦄",
                tooltip: 'Alphabetically ordered list, lowercase',
                onclick: function () {
                    tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('ol'), 'test');
                }
            });

            var bar = tinymce.editors[0].theme.panel.find("toolbar buttongroup");
            // bar[1].append(btn_hr);
            bar[1].append(btn_blockquote);
            bar[1].append(btn_cstm1);
            bar[1].append(btn_cstm2);
        }
    }



    function waitForElement(elementId, callBack){
        window.setTimeout(function(){
            var element = document.getElementById(elementId);
            timerCount ++;
            if(element){
                callBack(elementId, element);
            } else {
                if (timerCount > 800) {
                    //console.log('RCE not found');
                    return;
                }
                waitForElement(elementId, callBack);
            }
        },30)
    }

    waitForElement("wiki_page_body_ifr", addButtons);
    waitForElement("assignment_description_ifr", addButtons);

})();
