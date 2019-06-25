// ==UserScript==
// @name         [Staff Tool] Canvas Module Mapper (console display only)
// @description  Generate mapping of assignments to modules in the browser console for use with the Associate browser extension
// @version      1.0
// @namespace    https://github.com/dazweeja/tUUvTQQ0QTnY5OH
// @author       darren@subtext.com.au
// @include      https://*.instructure.com/courses/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  var courseId;
  var exportBtn;
  var exportIcon;
  var exportBtnText;
  const btnText = ' Export Module Mapping';
  const waitText = ' Please wait...';
  const iconClass = 'icon-export-content';
  const waitClass = 'icon-instructure';
  const assignEl = document.getElementById('assign-status');
  const baseUrl = window.location.protocol + '//' + window.location.host;

  if (assignEl != null) {
    const classExp = /(?:EPCID\-)(\d+)/;
    const classMatches = assignEl.className.match(classExp);

    if (classMatches != null) {
      courseId = classMatches[1];

      exportBtn = document.createElement('button');
      exportBtn.className = 'btn export-button Button--warning';
      exportBtn.addEventListener('click', exportModules, false);
      exportIcon = document.createElement('i');
      exportIcon.className = iconClass;
      exportBtnText = document.createTextNode(btnText);
      exportBtn.appendChild(exportIcon);
      exportBtn.appendChild(exportBtnText);
//      var editButtons = document.getElementsByClassName('edit-wiki');
      var editButtons = document.getElementsByClassName('report-button'); // dependant on credential status reports tool
      if (editButtons !== null) {
        var editButton = editButtons[0];
        editButton.parentNode.insertBefore(exportBtn, editButton);
      }
      var style = document.createElement('style');
      document.head.appendChild(style);
      var styleSheet = style.sheet;
      styleSheet.insertRule('@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }', 0);
      styleSheet.insertRule('@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }', 1);
      styleSheet.insertRule('i.' + waitClass + '::before { -webkit-animation:spin 1.5s linear infinite; animation:spin 1.5s linear infinite;}', 2);
      styleSheet.insertRule('.export-button {margin-right:5px;}');
    }
  }

  function exportModules() {
    exportBtnText.nodeValue = waitText;
    exportIcon.className = waitClass;

    const url = baseUrl + '/api/v1/courses/' + courseId + '/modules?per_page=999';
    getModules(url)
      .then(function (moduleValues) {
        var assIds = {};
        Promise.all(moduleValues.map(getModuleItems))
          .then(function (itemValues) {
            var numIds = 0;
            for (var k = 0; k < itemValues.length; k++) {
              const moduleItems = JSON.parse(itemValues[k].substring(9));

              for (var m = 0; m < moduleItems.length; m++) {
                var item = moduleItems[m];
                if (item.type == 'Assignment') {
                  assIds[item.content_id] = item.module_id;
                  numIds++;
                }
              }
            }

            const assStr = JSON.stringify(assIds);
            console.log('module.js: ' + assStr);
            console.log(numIds);
            exportBtnText.nodeValue = btnText;
            exportIcon.className = iconClass;
          });
      })
      .catch(function(error) {
        exportBtnText.nodeValue = btnText;
        exportIcon.className = iconClass;
        console.log('Failed with error: ' + error);
      });
  }

  function getModules(url) {
    return getModulePage(url)
      .then(function (page) {
        if (page.url) {
          return getModules(page.url)
            .then(function (nextPage) {
              return page.data.concat(nextPage);
            });
        }
        else {
          return page.data;
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  function getModulePage(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve({
              data: JSON.parse(xhr.responseText.substring(9)),
              url: nextURL(xhr.getResponseHeader('Link'))
            })
          }
        }
        else {
          reject(xhr.statusText);
        }
      };
      xhr.onerror = function () {
        reject(xhr.statusText);
      };
      xhr.send();
    });
  }

  function getModuleItems(module) {
    const url = baseUrl + '/api/v1/courses/' + courseId + '/modules/' + module.id + '/items';
    return fetch(url, {credentials: 'same-origin'}).then(function (response) {
        if (!response.ok) {
          throw new Error('Fetch Error');
        }
        return response.text();
      })
      .catch(function (error) {
        console.error('Fetch Error: ', error);
      });
  }

  function nextURL(linkTxt) {
    var nextUrl = null;
    if (linkTxt) {
      const links = linkTxt.split(',');
      var nextRegEx = /^<(.*)>; rel="next"$/;
      for (var i = 0; i < links.length; i++) {
        var matches = links[i].match(nextRegEx);
        if (matches) {
          nextUrl = matches[1];
        }
      }
    }
    return nextUrl;
  }
})();
