'use strict';

/**
 * @ngdoc directive
 * @name acpApp.directive:calendar
 * # calendar
 */
angular.module('acpApp')
  .directive('calendar', function () {
      return {
          scope: {
              widgetId: "="
          },
          templateUrl: 'scripts/directives/calendar/calendar.html',
          restrict: 'E',
          replace: true,
          controller: function ($scope, $rootScope, chartWidgetService, ModalService, currentUser, userScheduleService, toaster) {

              initCalendarData();
              function initCalendarData() {
                  var selectedEnvironmentId = $rootScope.currentLoginEnvironment.environment.id;
                  if (selectedEnvironmentId) {
                      currentUser.getCurrentUserId().then(function (id) {
                          $scope.userId = id;
                          userScheduleService.getUserSchedule($scope.userId).then(function (calendarNotes) {
                              if (calendarNotes) {
                                  $scope.calendarData = calendarNotes.filter(function (el) { return (new Date(el.date) >= new Date().setMonth(new Date().getMonth() - 4)) });
                                  $scope.tooltipsArray = angular.copy($scope.calendarData.map(function (el) { return { 'date': new Date(el.date), 'text': el.preview } }));
                                  $scope.initDatepicker();
                              }
                          })
                      });
                  }
              }

              $scope.calendarWidgetConfig = chartWidgetService.getDonutChart($scope.widgetId);
              $scope.calendarWidgetConfig.$promise.then(function () {
                  var validCalendarJson = false;
                  $scope.widgetOptions = [];
                  if ($scope.calendarWidgetConfig.widgetConfig) {
                      $scope.widgetOptions = JSON.parse($scope.calendarWidgetConfig.widgetConfig);
                      var backgroundColor = $scope.widgetOptions.filter(function (items) { return items.name === 'backgroundColor' })[0];

                      if (backgroundColor) {
                          validCalendarJson = true;
                      }
                  }
                  if (validCalendarJson && !!backgroundColor.value) {
                      $scope.bgColor = backgroundColor.value;
                  }
                  else {
                      $scope.bgColor = "#fffff";
                  }
              });

              //Initializing calendar to the widget
              $scope.initDatepicker = function () {
                  $scope.datepicker = new Datepickk({
                      container: document.querySelector('#calendar1'),

                      inline: true,

                      tooltips: $scope.tooltipsArray,
                  });
                  $scope.datepicker.onSelect = function () {
                      var dateOfCalendar = this;
                      openCalendarModal(dateOfCalendar);
                  };
              };

              function openCalendarModal(dateOfCalendar) {
                  if ($scope.selectedDate == undefined) {//fixing the issue of the library
                      $scope.selectedDate = dateOfCalendar.getTime();
                      var filterdOptions = $scope.calendarData.filter(function (items) { return new Date(items.date).getTime() === $scope.selectedDate })[0];
                      if (!filterdOptions) {

                          filterdOptions = {
                              userId: $scope.userId,
                              date: dateOfCalendar,
                              note: [],
                              schedule: [],
                              preview: null
                          }
                          var type = 'Save';
                      }
                      else {
                          if (typeof filterdOptions.note === 'string') {
                              filterdOptions.note = JSON.parse(filterdOptions.note);
                          }
                          if (typeof filterdOptions.schedule === 'string') {
                              filterdOptions.schedule = JSON.parse(filterdOptions.schedule);
                          }
                          angular.forEach(filterdOptions.schedule, function (el) {
                              el.startTime = new Date(el.startTime);
                              el.endTime = new Date(el.endTime);
                          });
                          var type = 'Update';
                      }
                      ModalService.showModal({
                          templateUrl: 'scripts/directives/calendar/calendarModal.html',
                          controller: 'calendarModal',
                          inputs: {
                              optionsObj: filterdOptions,
                              type: type
                          },
                          size: 'sm'
                      }).then(function (modal) {
                          modal.element.modal();
                          modal.close.then(function (result) {
                              
                              //update,insert or delete objects from the tooltipsArray and database
                              if (result != null) {
                                  if (result == 'delete') {
                                      userScheduleService.deleteUserSchedule(filterdOptions).then(function () {
                                          userScheduleService.getScheduleArray(true);
                                      })
                                      $scope.calendarData.splice($scope.calendarData.indexOf(filterdOptions), 1);
                                      toaster.pop('error', 'Tooltip Deleted!', '');
                                      $scope.datepicker.tooltips = '';                                      
                                  }
                                  else {
                                      if (type == 'Update') {
                                          result.date = new Date(result.date).toLocaleDateString().split(' ').slice(0, 4).join(' ');
                                          result.note = JSON.stringify(result.note);
                                          result.schedule = JSON.stringify(result.schedule);
                                          userScheduleService.updateUserSchedule(result).then(function () {
                                              userScheduleService.getScheduleArray(true);
                                          })
                                          filterdOptions = result;
                                          toaster.pop('success', 'Updated Tooltip!');
                                      }
                                      else {
                                          result.date = new Date(result.date).toLocaleDateString().split(' ').slice(0, 4).join(' ');
                                          result.note = JSON.stringify(result.note);
                                          result.schedule = JSON.stringify(result.schedule);
                                          userScheduleService.addUserSchedule(result).then(function () {
                                              userScheduleService.getScheduleArray(true);
                                          })
                                          $scope.calendarData.push(result);
                                          toaster.pop('success', 'Created new Tooltip!');
                                      };
                                  }
                                  $scope.datepicker.tooltips = angular.copy($scope.calendarData.map(function (el) { return { 'date': new Date(el.date), 'text': el.preview } }));
                              };
                              $scope.selectedDate = undefined;
                          });
                      });
                  };
              }

              $scope.removeWidget = function () {
                  $scope.$emit('removeWidget', $scope.widgetId);
              };              
          }
      };
  });