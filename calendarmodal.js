'use strict';

/**
 * @ngdoc function
 * @name acpApp.controller:calendarModal
 * @description
 * # calendarModal
 * Controller of the acpApp
 */
angular.module('acpApp')
.controller('calendarModal', function ($scope, optionsObj, type, close) {

    $scope.buttonType = type;
    $scope.optionsObj = optionsObj;
    $scope.optionsObj.date = new Date($scope.optionsObj.date);
    angular.forEach($scope.optionsObj.schedule, function (el) {
        el.startTime = new Date(el.startTime);
        el.endTime = new Date(el.endTime);
    });

    buttonName();
    function buttonName() {
        $scope.button = $scope.buttonType;
    };

    var scheduleTemplate = {
        title: 'New Schedule',
        startTime: null,
        endTime: null,
        alert: null,
        alertType: 'popupmessage',
        alertTime: null
    };

    var textTemplate = {
        text: 'New Note',
    };

    $scope.hideShowRowSchedule = function (schedule) {
        schedule.expanded = !schedule.expanded;
    };

    $scope.hideShowRowText = function (text) {
        text.expanded = !text.expanded;
    };

    $scope.removeSchedule = function (index) {
        $scope.optionsObj.schedule.splice(index, 1);
    };

    $scope.removeText = function (index) {
        $scope.optionsObj.note.splice(index, 1);
    };

    $scope.addSchedule = function () {
        var schedule = angular.copy(scheduleTemplate);
        $scope.optionsObj.schedule.push(schedule);
    };

    $scope.addText = function () {
        var text = angular.copy(textTemplate);
        $scope.optionsObj.note.push(text);
    };

    $scope.abort = function () {
        close(null, 100);
        $(".modal-backdrop").hide();
    };

    $scope.save = function () {
        $scope.updatedOptionsObj = angular.copy($scope.optionsObj);
        if ($scope.updatedOptionsObj.note.length == 0) {
            $scope.textHtml = [];
        } else {
            angular.forEach($scope.updatedOptionsObj.note, function (el) {
                $scope.textHtml = '<table class="textTable">' +
                                  '<tr>' +
                                  '<th class="calModalth"> Notes</th>' +
                                  '</tr>';
                for (var i = 0; i < $scope.updatedOptionsObj.note.length; i++) {
                    $scope.textHtml += '<tr>' +
                    '<td> <li class="tooltipBullet">' + $scope.updatedOptionsObj.note[i].text + '</li></td>' +
                    '</tr>'
                }
            })
            $scope.textHtml += '</table>';
        }
        if ($scope.updatedOptionsObj.schedule.length == 0) {
            $scope.html = [];
        } else {
            angular.forEach($scope.updatedOptionsObj.schedule, function (el) {
                el.startTime = new Date(el.startTime).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
                el.endTime = new Date(el.endTime).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });

                $scope.html = '<table class="scheduleTable">' +
                              '<tr>' +
                              '<th colspan="0" class="calModalth"> Schedules</th>' +
                              '<th class="calModalth"></th>' +
                              '<th class="calModalth"></th>' +
                              '</tr>';
                for (var i = 0; i < $scope.updatedOptionsObj.schedule.length; i++) {
                    $scope.html += '<tr>' +
                    '<td class="calModaltd"> <li class="tooltipBullet">' + $scope.updatedOptionsObj.schedule[i].title + '</li></td>' +
                    '<td class="calModaltd">' + 'From : ' + $scope.updatedOptionsObj.schedule[i].startTime + '</td>' +
                    '<td class="calModaltd">' + 'To : ' + $scope.updatedOptionsObj.schedule[i].endTime + '</td>' +
                    '</tr>'
                }
            })
            $scope.html += '</table>';
        };
        if (!$scope.textHtml.length && !$scope.html.length) {
            $scope.abort();
        }
        else {
            $scope.optionsObj.preview = '<div class="scheduleHeader">' + $scope.textHtml + '</div>' + '<div class="scheduleHeader">' + $scope.html + '</div>';
            close($scope.optionsObj, 100);
            $(".modal-backdrop").hide();
        }
    };

    $scope.delete = function () {
        close('delete', 100);
        $(".modal-backdrop").hide();
    };
  });