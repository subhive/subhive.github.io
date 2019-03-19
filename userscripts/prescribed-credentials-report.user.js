// ==UserScript==
// @name         Prescribed Credentials Progress Report
// @namespace    https://subhive.github.io
// @version      1.7
// @description  Export a .csv report of student grades for the listed prescribed credentials.
// @author       darren@subtext.com.au
// @include      https://*.instructure.com/courses/*/pages/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require     https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// @grant        none
// ==/UserScript==


// ==/UserScript==

(function () {
  'use strict';

  var courseId = getCourseId();
  var credIds = [];
  var errorDiv;
  var reportDiv;
  var reportBtn;
  var reportIcon;
  var exportBtn;
  var exportBtnText;
  var exportIcon;
  var completeBtn;
  var completeBtnText;
  var completeIcon;
  var startPickerInput;
  var endPickerInput;
  const reportText = ' Reports';
  const exportText = ' Progress Report';
  const completeText = ' Grade Report';
  const waitText = ' Please wait...';
  const iconClass = 'icon-stats';
  const waitClass = 'icon-instructure';
  const baseUrl = window.location.protocol + '//' + window.location.host;

  if (courseId !== null) {
    getCredentialIds();

    if (credIds.length) {
      reportBtn = $('<button class="btn report-button" style="margin-right:16px">' + reportText + '</button>');
      reportBtn.click(showDiv);
      reportIcon = $('<i class="' + iconClass + '">');
      reportBtn.prepend(reportIcon);

      exportBtn = $('<button class="btn export-button">');
      exportBtnText = $('<span>' + exportText + '</span>');
      exportBtn.click(createCsv);
      exportIcon = reportIcon.clone();
      exportBtn.append(exportIcon);
      exportBtn.append(exportBtnText);

      completeBtn = $('<button class="btn complete-button">');
      completeBtnText = $('<span>' + completeText + '</span>');
      completeBtn.click(createCsv);
      completeIcon = reportIcon.clone();
      completeBtn.append(completeIcon);
      completeBtn.append(completeBtnText);

      startPickerInput = $('<input type="text" id="startpicker" style="width:80px;vertical-align:baseline;margin-right:5px">');
      endPickerInput = $('<input type="text" id="endpicker" style="width:80px;vertical-align:baseline;margin-right:5px">');

      reportDiv = $('<div style="display:none;position:absolute;right:267px;top:38px;z-index:99">');
      var styledDiv = $('<div style="border:1px solid #C7CDD1;border-radius:3px;padding:10px;background-color:#fff;">');

      var exportDiv = $('<div style="border-bottom:1px solid #C7CDD1;padding-bottom:10px;margin-bottom:10px;">');
      exportDiv.append(exportBtn);

      var completeDiv = $('<div>');
      var labelDiv = $('<div>');
      var startLabel = $('<div style="display:inline-block;width:96px;font-size:11px;margin-right:5px;">Start</div>');
      var endLabel = $('<div style="display:inline-block;width:96px;font-size:11px;margin-right:5px;">End</div>');
      labelDiv.append(startLabel);
      labelDiv.append(endLabel);
      completeDiv.append(labelDiv);
      completeDiv.append(startPickerInput);
      completeDiv.append(endPickerInput);
      completeDiv.append(completeBtn);

      styledDiv.append(exportDiv);
      styledDiv.append(completeDiv);
      reportDiv.append(styledDiv);

      errorDiv = $('<div class="error-text" style="font-size:11px;">');
      
      var publishButton = $('.publish-button');
      if (publishButton.length > 0) {
        $('.header-bar').css('position', 'relative');
        publishButton.before(reportBtn);
        publishButton.before(reportDiv);

        startPickerInput.datepicker({ dateFormat: 'dd/mm/yy' });
        endPickerInput.datepicker({ dateFormat: 'dd/mm/yy' });
      }
      
      var style = document.createElement('style');
      document.head.appendChild(style);
      var styleSheet = style.sheet;
      styleSheet.insertRule('@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }', 0);
      styleSheet.insertRule('@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }', 1);
      styleSheet.insertRule('i.' + waitClass + '::before { -webkit-animation:spin 1.5s linear infinite; animation:spin 1.5s linear infinite;}', 2);
    }
  }

  function createCsv(e) {
    var complete = $(e.delegateTarget).hasClass('complete-button');

    var start = null;
    var end = null;

    if (complete) {
      var startParts = startPickerInput.val().split("/");
      var endParts = endPickerInput.val().split("/");

      if (startParts.length !== 3 || endParts.length !== 3) {
        showError('Invalid dates');
        return;
      }

      var start = new Date(+startParts[2], +startParts[1] - 1, +startParts[0]);
      var end = new Date(+endParts[2], +endParts[1] - 1, +endParts[0]);

      if (!isValidDate(start) || !isValidDate(start)) {
        showError('Invalid dates');
        return;
      }

      if (start > end) {
        showError('End date must be later than start date');
        return;
      }
    }

    hideError();

    var btnText = complete ? completeBtnText : exportBtnText;
    var icon = complete ? completeIcon : exportIcon;
    var btnTextOld = btnText.text();
    btnText.text(waitText);
    icon.removeClass();
    icon.addClass(waitClass);

    const url = baseUrl + '/api/v1/courses/' + courseId + '/front_page';
    const timeExp = /[T|Z]/g;
    getAssignmentIds(url)
      .then(function (allIds) {
        var assignments = [];

        var query = complete ? '&workflow_state=graded&submitted_since=' + start.toISOString() : '';

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
            var data = [];
            if (complete) {
              data.push(["Student ID", "Student name", "Credential", "First submission", "Last submission", "Graded at", "Attempts graded"]);
            }
            else {
              data.push(["Student ID", "Student name", "Credential", "Current grade", "Workflow state", "First submission", "Last submission", "Due date", "Instructor", "Attempts graded"]);
            }

            var userIds = [];

            if (userSubmissions) {
              userSubmissions.forEach(function (userSubmission) {
                if (userSubmission.submissions.length === 0 || userSubmission.submissions[0].user.sis_user_id == null || userIds.indexOf(userSubmission.user_id) !== -1) {
                  return;
                } else {
                  userIds.push(userSubmission.user_id);
                }

                var userName, userId;
                assignments.forEach(function (assignment) {
                  var submissions = userSubmission.submissions;
                  for (var j = 0; j < submissions.length; j++) {
                    var submission = submissions[j];
                    if (submission.assignment_id === assignment.id) {
                      var submittedAt =  new Date(submission.submitted_at);
                      if (complete && (submission.grade !== 'complete' || submittedAt > end.toISOString())) {
                        continue;
                      }

                      if (userName == null) {
                        userName = submission.user.short_name;
                        userId = submission.user.sis_user_id;
                      }
                      var submissionHistory = submission.submission_history;
                      var attemptsGraded = 0;
                      var firstSubmitted = null;
                      if (Array.isArray(submissionHistory) && submissionHistory.length) {
                        submissionHistory.forEach(function (attempt) {
                          if (attempt.workflow_state === 'graded') {
                            attemptsGraded++;
                          }

                          if (attempt.submitted_at) {
                            if (firstSubmitted === null) {
                              firstSubmitted = attempt.submitted_at;
                            } else if (attempt.submitted_at < firstSubmitted) {
                              attempt.submitted_at < firstSubmitted;
                            }
                          }
                        });
                      }
                      const grade = submission.excused ? 'excused' : submission.grade;
                      firstSubmitted = firstSubmitted != null ? firstSubmitted.replace(timeExp, ' ') : null;
                      const lastSubmitted = submission.submitted_at != null ? submission.submitted_at.replace(timeExp, ' ') : null;
                      const workflowState = submission.workflow_state === 'unsubmitted' ? 'not submitted' : submission.workflow_state;

                      if (complete) {
                        const graded = submission.graded_at != null ? submission.graded_at.replace(timeExp, ' ') : null;
                        data.push(['"' + userId + '"', '"' + userName + '"', '"' + assignment.name + '"', '"' + firstSubmitted + '"', '"' + lastSubmitted + '"', '"' + graded + '"', '"' + attemptsGraded + '"']);
                      } else {
                        data.push(['"' + userId + '"', '"' + userName + '"', '"' + assignment.name + '"', '"' + grade + '"', '"' + workflowState + '"', '"' + firstSubmitted + '"', '"' + lastSubmitted + '"', '"' + assignment.due + '"', '"' + assignment.instructor + '"', '"' + attemptsGraded + '"']);
                      }
                      break;
                    }
                  }
                });
              });
            }

            var lineArray = [];
            data.forEach(function (row, index) {
              var line = row.join(",");
              lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
            });
            var csvContent = lineArray.join("\n");
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement('a');
            link.href = encodedUri;
            link.download = 'grade_complete.csv';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            btnText.text(btnTextOld);
            icon.removeClass();
            icon.addClass(iconClass);
          });
      })
      .catch(function(error) {
        alert('Export failed with error: ' + error);
        btnText.text(btnTextOld);
        icon.removeClass();
        icon.addClass(iconClass);
      });
  }

  function showDiv(e) {
    reportDiv.slideToggle();
  }

  function showError(text) {
    errorDiv.text(text);

    if (!$.contains(document.documentElement, errorDiv[0])) {
      completeDiv.append(errorDiv);
    }
  }

  function hideError() {
    errorDiv.detach();
  }

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
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
