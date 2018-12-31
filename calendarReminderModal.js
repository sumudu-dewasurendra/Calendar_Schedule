'use strict';

/**
 * @ngdoc function
 * @name acpApp.controller:calendarReminderModal
 * @description
 * # calendarReminderModal
 * Controller of the acpApp
 */
angular.module('acpApp')
.controller('calendarReminderModal', function ($scope, reminderTitle, reminderStartTime) {

    $scope.reminderTitle = reminderTitle;
    $scope.reminderStartTime = reminderStartTime;

});