// ==UserScript==
// @name         Prescribed Credential Grade Export
// @namespace    https://subhive.github.io
// @version      1.5
// @description  Export a .csv of student grades for the listed prescribed credentials.
// @author       darren@subtext.com.au
// @include      https://*.instructure.com/courses/*/pages/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  var courseId = getCourseId();
  var credIds = [];
  var exportBtn;
  var exportIcon;
  var exportBtnText;
  const btnText = ' Export Progress Data';
  const waitText = ' Please wait...';
  const iconClass = 'icon-stats';
  const waitClass = 'icon-instructure';
  const baseUrl = window.location.protocol + '//' + window.location.host;

  if (courseId !== null) {
    getCredentialIds();

    if (credIds.length) {
      exportBtn = document.createElement('button');
      exportBtn.className = 'btn export-button';
      exportBtn.addEventListener('click', createCsv, false);
      exportIcon = document.createElement('i');
      exportIcon.className = iconClass;
      exportBtnText = document.createTextNode(btnText);
      exportBtn.appendChild(exportIcon);
      exportBtn.appendChild(exportBtnText);
      var publishButtons = document.getElementsByClassName('publish-button');
      if (publishButtons !== null) {
        var publishButton = publishButtons[0];
        publishButton.parentNode.insertBefore(exportBtn, publishButton.nextSibling);
      }
      var style = document.createElement('style');
      document.head.appendChild(style);
      var styleSheet = style.sheet;
      styleSheet.insertRule('@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }', 0);
      styleSheet.insertRule('@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }', 1);
      styleSheet.insertRule('i.' + waitClass + '::before { -webkit-animation:spin 1.5s linear infinite; animation:spin 1.5s linear infinite;}', 2);
    }
  }

  function createCsv() {
    exportBtnText.nodeValue = waitText;
    exportIcon.className = waitClass;
    const url = baseUrl + '/api/v1/courses/' + courseId + '/front_page';
    const timeExp = /[T|Z]/g;
    getAssignmentIds(url)
      .then(function (allIds) {
        var assignments = [];
        var query = '';

        credIds.forEach(function (cred) {
          var prop = getProp(allIds, cred.id);
          if (prop !== null) {
            assignments.push({id: prop, name: cred.name, instructor: cred.instructor, due: cred.due});
            query += '&assignment_ids[]=' + prop;
          }
        });

        const subUrl = baseUrl + '/api/v1/courses/' + courseId + '/students/submissions?per_page=999&grouped=1&include[]=user&include[]=submission_history&student_ids[]=all' + query;
        getSubmissions(subUrl)
          .then(function (userSubmissions) {
            console.log(userSubmissions);
            var data = [["Student ID", "Student name", "Credential", "Current grade", "Workflow state", "Last submission", "Due date", "Instructor", "Attempts graded"]];
            var userIds = [];
            userSubmissions.forEach(function (userSubmission) {
              if (userSubmission.submissions[0].user.sis_user_id == null || userIds.indexOf(userSubmission.user_id) !== -1) {
                return;
              }
              else {
                userIds.push(userSubmission.user_id);
              }

              var userName, userId;
              assignments.forEach(function (assignment) {
                var submissions = userSubmission.submissions;
                for (var j = 0; j < submissions.length; j++) {
                  var submission = submissions[j];
                  if (submission.assignment_id === assignment.id) {
                    if (userName == null) {
                      userName = submission.user.short_name;
                      userId = submission.user.sis_user_id;
                    }
                    var submissionHistory = submission.submission_history;
                    var attemptsGraded = 0;
                    if (Array.isArray(submissionHistory) && submissionHistory.length) {
                      submissionHistory.forEach(function (attempt) {
                        if (attempt.workflow_state === 'graded') {
                          attemptsGraded++;
                        }
                      });
                    }
                    const grade = submission.excused ? 'excused' : submission.grade;
                    const submitted = submission.submitted_at != null ? submission.submitted_at.replace(timeExp, ' ') : null;
                    const workflowState = submission.workflow_state === 'unsubmitted' ? 'not submitted' : submission.workflow_state;
                    data.push(['"' + userId + '"', '"' + userName + '"', '"' + assignment.name + '"', '"' + grade + '"', '"' + workflowState + '"', '"' + submitted + '"', '"' + assignment.due + '"', '"' + assignment.instructor + '"', '"' + attemptsGraded + '"']);
                    break;
                  }
                }
              });
            });

            var lineArray = [];
            data.forEach(function (row, index) {
              var line = row.join(",");
              lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
            });
            var csvContent = lineArray.join("\n");
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement('a');
            link.href = encodedUri;
            link.download = 'progress_tracker.csv';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            exportBtnText.nodeValue = btnText;
            exportIcon.className = iconClass;
          });
      })
      .catch(function(error) {
        alert('Export failed with error: ' + error);
        exportBtnText.nodeValue = btnText;
        exportIcon.className = iconClass;
      });
  }

  function getCourseId() {
    var courseId = null;
    const assignEl = document.getElementById('assign-status');
    if (assignEl !== null) {
      const classExp = /(?:EPCID\-)(\d+)/;
      const matches = assignEl.className.match(classExp);
      if (matches) {
        courseId = matches[1];
      }
    }
    return courseId;
  }

  function getCredentialIds() {
    const a = document.getElementsByTagName('a');
    const linkExp = /(?:\?lms_module_id\=)(\d+)/;
    const rowExp = /<td[^>]*>(.+)<\/td>/gi;
    const tagExp = /(<([^>]+)>)/gi;
    for (var i = 0; i < a.length; i++) {
      const linkMatches = a[i].href.match(linkExp);
      if (linkMatches != null) {
        var instructor, due;
        var row = findRow(a[i]);
        if (row !== null) {
          var j = 0;
          var rowMatches;
          var rowText = row.innerHTML;
          while (rowMatches = rowExp.exec(rowText)) {
            if (j == 1) {
              instructor = rowMatches[1].replace(tagExp, '').replace('&nbsp;', ' ');
            }
            else if (j == 2) {
              due = rowMatches[1].replace(tagExp, '');
            }
            j++;
          }
        }
        credIds.push({id: parseInt(linkMatches[1]), name: a[i].text, instructor: instructor, due: due});
      }
    }
  }

  function getAssignmentIds(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var allIds = {};
            const page = JSON.parse(xhr.responseText.substring(9));
            const pageExp = /<div.*(?:\ id\=["']assign-status["']).*>(.+)<\/div>/;
            const matches = page.body.match(pageExp);
            if (matches) {
              allIds = JSON.parse(matches[1]);
            }
            resolve(allIds);
          }
          else {
            reject(xhr.statusText);
          }
        }
      };
      xhr.onerror = function (e) {
        reject(xhr.statusText);
      };
      xhr.send();
    });
  }

  function getSubmissions(url) {
    return getSubmissionPage(url)
      .then(function (page) {
        if (page.url) {
          return getSubmissions(page.url)
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

  function getSubmissionPage(url) {
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

  function getProp(obj, val) {
    var name = null;
    for (var prop in obj) {
      if (obj[prop] === val) {
        name = parseInt(prop);
        break;
      }
    }

    return name;
  }

  function findRow(el) {
    var row = el.parentElement;
    while (row != null && row.tagName.toLowerCase() !== 'tr') {
      row = row.parentElement;
    }
    return row;
  }
})();
