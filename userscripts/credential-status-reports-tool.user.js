// ==UserScript==
// @name         [DEV] Credential Status Reports Tool
// @namespace    https://subhive.github.io
// @version      2.0
// @description  Export a .csv report of student grades for credentials listed on the page.
// @author       darren@spacedog.com.au
// @include      https://*.instructure.com/courses/*
// @include      https://*.instructure.com/courses/*/pages/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require     https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// @grant        none
// ==/UserScript==


// ==/UserScript==

(function () {
  'use strict';

  var courseId = getCourseId();
  var isAdmin = false;
  var homePage;
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
  var completeCheck;
  var incompleteCheck;
  var submittedCheck;
  var notSubmittedCheck;
  var excusedCheck;
  const reportText = ' Credential Status Reports';
  const exportText = ' Progress Report';
  const completeText = ' Generate';
  const waitText = ' Please wait...';
  const iconClass = 'icon-stats';
  const waitClass = 'icon-instructure';
  const baseUrl = window.location.protocol + '//' + window.location.host;

  if (courseId !== null) {
    homePage = window.location.href.indexOf('/pages/') === -1;
    getCredentialIds();

    if (credIds.length) {
      reportBtn = $('<button class="btn report-button">' + reportText + '</button>');
      reportBtn.click(showDiv);
      reportIcon = $('<i class="' + iconClass + '">');
      reportBtn.prepend(reportIcon);

      exportBtn = $('<button class="btn export-button">');
      exportBtnText = $('<span>' + exportText + '</span>');
      exportBtn.click(createCsv);
      exportIcon = reportIcon.clone();
      // exportBtn.append(exportIcon);
      exportBtn.append(exportBtnText);

      completeBtn = $('<button class="btn complete-button">');
      completeBtnText = $('<span>' + completeText + '</span>');
      completeBtn.click(createCsv);
      completeIcon = reportIcon.clone();
      // completeBtn.append(completeIcon);
      completeBtn.append(completeBtnText);

      startPickerInput = $('<input type="text" id="startpicker" style="width:80px;vertical-align:baseline;margin-right:5px">');
      endPickerInput = $('<input type="text" id="endpicker" style="width:80px;vertical-align:baseline;margin-right:5px">');

      completeCheck = $('<input type="checkbox" id="complete-check" name="complete-check" style="margin-right:5px;">');
      incompleteCheck = $('<input type="checkbox" id="incomplete-check" name="incomplete-check" style="margin-right:5px;">');
      submittedCheck = $('<input type="checkbox" id="submitted-check" name="submitted-check" style="margin-right:5px;">');

      if (!homePage || isAdmin) {
        notSubmittedCheck = $('<input type="checkbox" id="notsubmitted-check" name="notsubmitted-check" style="margin-right:5px;">');
        excusedCheck = $('<input type="checkbox" id="excused-check" name="excused-check" style="margin-right:5px;">');
      }

      reportDiv = $('<div style="display:none;position:absolute;right:0;top:38px;z-index:99">');
      var styledDiv = $('<div style="border:1px solid #C7CDD1;border-radius:3px;padding:10px;background-color:#fff;">');
      var description = $('<div style="font-size:.9em;color:#D12B26;padding-bottom:15px;">Reports generated include all hyperlinked <br/>credentials on this page</div>');
      var exportDiv = $('<div style="border-bottom:1px solid #C7CDD1;padding-bottom:10px;margin-bottom:10px;">');

      if (!homePage || isAdmin) {
        var exportHeading = $('<div style="font-size:1em;"><strong>Full Progress Report</strong></div><div style="font-size:.8em;padding-bottom:10px;">Includes all credential statuses</div>');
        exportDiv.append(exportHeading);
        exportDiv.append(exportBtn);
      }

      var completeDiv = $('<div>');
      var labelDiv = $('<div>');
      var completeDescription = $('<div style="font-size:1em;"><strong>Grade Report</strong></div><div style="font-size:.8em;">Include only these grades</div>');
      var startLabel = $('<div style="display:inline-block;width:96px;font-size:11px;margin-right:5px;">Start date</div>');
      var endLabel = $('<div style="display:inline-block;width:96px;font-size:11px;margin-right:5px;">End date</div>');
      labelDiv.append(startLabel);
      labelDiv.append(endLabel);
      completeDiv.append(completeDescription);

      var completeCheckWrapper = $('<div class="check-wrapper complete-check-wrapper"><label for="complete-check">Complete</label></div>').prepend(completeCheck);
      var incompleteCheckWrapper = $('<div class="check-wrapper incomplete-check-wrapper"><label for="incomplete-check">Incomplete</label></div>').prepend(incompleteCheck);
      var submittedCheckWrapper = $('<div class="check-wrapper submitted-check-wrapper"><label for="submitted-check">Submitted</label></div>').prepend(submittedCheck);
      completeDiv.append(completeCheckWrapper);
      completeDiv.append(incompleteCheckWrapper);
      completeDiv.append(submittedCheckWrapper);

      if (notSubmittedCheck) {
        var optionalCheckHeading = $('<div style="border-top:1px solid #C7CDD1;font-size:.8em;padding-top:10px;margin-top: 10px;">The following options will ignore date range</div>');
        var notSubmittedCheckWrapper = $('<div class="check-wrapper notsubmitted-check-wrapper"><label for="notsubmitted-check">Not submitted</label></div>').prepend(notSubmittedCheck);
        var excusedCheckWrapper = $('<div class="check-wrapper excused-check-wrapper"><label for="excused-check">Excused</label></div>').prepend(excusedCheck);
        completeDiv.append(optionalCheckHeading);
        completeDiv.append(notSubmittedCheckWrapper);
        completeDiv.append(excusedCheckWrapper);
      }
      
      completeDiv.append(labelDiv);
      completeDiv.append(startPickerInput);
      completeDiv.append(endPickerInput);
      completeDiv.append(completeBtn);

      styledDiv.append(description);
      styledDiv.append(exportDiv);
      styledDiv.append(completeDiv);
      reportDiv.append(styledDiv);

      errorDiv = $('<div class="error-text" style="font-size:11px;">');

      var headerBar = $('.header-bar-right');
      if (headerBar.length > 0) {
        var outerWidth = headerBar.outerWidth();
        if (outerWidth > 12) {
          reportDiv.css('right', (outerWidth + 4) + 'px');
          reportBtn.css('margin-right', '12px')
        }
        $('.header-bar').css('position', 'relative');
        headerBar.prepend(reportBtn);
        headerBar.prepend(reportDiv);

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

    var start, end, completeChecked, incompleteChecked, submittedChecked, notSubmittedChecked, excusedChecked;

    if (complete) {
      completeChecked = completeCheck.is(':checked');
      incompleteChecked = incompleteCheck.is(':checked');
      submittedChecked = submittedCheck.is(':checked');
      notSubmittedChecked = notSubmittedCheck.is(':checked');
      excusedChecked = excusedCheck.is(':checked');

      if (completeChecked || incompleteChecked || submittedChecked) {
        var startParts = startPickerInput.val().split("/");
        var endParts = endPickerInput.val().split("/");

        if (startParts.length !== 3 || endParts.length !== 3) {
          showError('Invalid dates');
          return;
        }

        start = new Date(+startParts[2], +startParts[1] - 1, +startParts[0]);
        end = new Date(+endParts[2], +endParts[1] - 1, +endParts[0]);

        if (!isValidDate(start) || !isValidDate(end)) {
          showError('Invalid dates');
          return;
        }

        if (start > end) {
          showError('End date must be later than start date');
          return;
        }

        // make end inclusive date
        end.setDate(end.getDate() + 1);
      }
      else if (!notSubmittedChecked && !excusedChecked) {
        showError('At least one option must be selected');
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
    getAssignmentIds(url)
      .then(function (allIds) {
        var assignments = [];

        var query = '';
        if (complete && !notSubmittedChecked && !excusedChecked) {
          query += '&submitted_since=' + start.toISOString();
          if (!submittedChecked) {
            query += '&workflow_state=graded';
          }
        }

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
              data.push(["Student ID", "Student name", "Credential", "Current grade", "First submission", "Last submission", "Graded at", "Attempts graded"]);
            }
            else {
              data.push(["Student ID", "Student name", "Credential", "Current grade", "Workflow state", "First submission", "Last submission", "Due date", "Instructor", "Attempts graded"]);
            }

            var userIds = [];

            if (userSubmissions) {
              userSubmissions.forEach(function (userSubmission) {
                var submissions = userSubmission.submissions;
                if (submissions.length === 0 || userIds.indexOf(userSubmission.user_id) !== -1) {
                  return;
                } else {
                  userIds.push(userSubmission.user_id);
                }

                var userName, userId;
                assignments.forEach(function (assignment) {
                  for (var j = 0; j < submissions.length; j++) {
                    var submission = submissions[j];
                    if (submission.assignment_id === assignment.id) {
                      var grade = submission.excused ? 'excused' : (submission.grade != null ? submission.grade : '');
                      var submittedAt = new Date(submission.submitted_at);
                      if (complete) {
                        if (grade === 'excused') {
                          if (!excusedChecked) continue;
                        }
                        else if (submission.workflow_state === 'unsubmitted') {
                          if (!notSubmittedChecked) continue;
                          grade = 'not submitted';
                        }
                        else {
                          if (!completeChecked && grade === 'complete') continue;
                          if (!incompleteChecked && grade === 'incomplete') continue;

                          if (submission.workflow_state === 'submitted' || (submission.workflow_state === 'graded' && grade == '')) {
                            grade = 'submitted';
                          }

                          if (!submittedChecked && grade === 'submitted') continue;
                          if (submittedAt < start || submittedAt > end) continue;
                        }
                      }

                      if (userName == null) {
                        userName = submission.user.short_name;
                        userId = submission.user.sis_user_id != null ? submission.user.sis_user_id : '';
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
                            var attemptSubmittedAt = new Date(attempt.submitted_at);
                            if (firstSubmitted === null) {
                              firstSubmitted = attemptSubmittedAt;
                            } else if (attemptSubmittedAt < firstSubmitted) {
                              firstSubmitted = attemptSubmittedAt;
                            }
                          }
                        });
                      }

                      var options = { timeZone: 'Australia/Melbourne' };
                      firstSubmitted = firstSubmitted != null ? firstSubmitted.toLocaleString('en-GB', options) : '';
                      const lastSubmitted = submission.submitted_at != null ? submittedAt.toLocaleString('en-GB', options) : '';
                      const workflowState = submission.workflow_state === 'unsubmitted' ? 'not submitted' : submission.workflow_state;

                      if (complete) {
                        const graded = submission.graded_at != null ? new Date(submission.graded_at).toLocaleString('en-GB', options) : '';
                        data.push(['"' + userId + '"', '"' + userName + '"', '"' + assignment.name + '"', '"' + grade + '"', '"' + firstSubmitted + '"', '"' + lastSubmitted + '"', '"' + graded + '"', '"' + attemptsGraded + '"']);
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
            link.download = complete ? 'grade_report.csv' : 'progress_report.csv';
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
        var instructor = '';
        var due = '';

        if (!homePage) {
          var row = findRow(a[i]);
          if (row !== null) {
            var j = 0;
            var rowMatches;
            var rowText = row.innerHTML;
            while (rowMatches = rowExp.exec(rowText)) {
              if (j == 1) {
                instructor = rowMatches[1].replace(tagExp, '').replace('&nbsp;', ' ');
              } else if (j == 2) {
                due = rowMatches[1].replace(tagExp, '');
              }
              j++;
            }
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
