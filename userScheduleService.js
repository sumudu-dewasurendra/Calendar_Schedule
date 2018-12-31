'use strict';

/**
 * @ngdoc service
 * @name acpApp.userScheduleService
 * @description
 * # userScheduleService
 * Factory in the acpApp.
 */

angular.module('acpApp')
  .factory('userScheduleService', function ($rootScope, $http, $q, $resource, ModalService, currentUser) {

      var userScheduleFactory = {};

      var getUserSchedule = function (userId) {
          var deferred = $q.defer();
          var calanderData = [];
          if (userId) {
              $http.get(acpMetadataWebApiUri + 'api/userSchedules?$filter=userId eq ' + userId)
                  .then(function (results) {
                      calanderData = results.data;
                      deferred.resolve(calanderData);
                  });
          }
          return deferred.promise;
      };

      var addUserSchedule = function (result) {
          var deferred = $q.defer();
          var userSchedule = $resource(acpMetadataWebApiUri + 'api/userSchedules');
          return userSchedule.save(result).$promise.then(function () {
              deferred.resolve();
          });
          return deferred.promise;;
      };

      var updateUserSchedule = function (result) {
          var deferred = $q.defer();
          var userSchedule = $resource(acpMetadataWebApiUri + 'api/userSchedules/:userScheduleId', { userScheduleId: result.userScheduleId }, { 'update': { method: 'PUT' } });
          userSchedule.update(result).$promise.then(function () {
              deferred.resolve();
          });
          return deferred.promise;
      };

      var deleteUserSchedule = function (result) {
          var deferred = $q.defer();
          var userSchedule = $resource(acpMetadataWebApiUri + 'api/userSchedules/:userScheduleId', { userScheduleId: result.userScheduleId }, { 'remove': { method: 'DELETE' } });
          userSchedule.remove().$promise.then(function () {
              deferred.resolve();
          });
          return deferred.promise;
      };

      function setTodaySchedules() {
          var deferred = $q.defer();
          var scheduleTimeArray = [];
          currentUser.getCurrentUserId().then(function (id) {
              getUserSchedule(id).then(function (calendarNotes) {
                  if (calendarNotes) {
                      var calendarData = calendarNotes.filter(function (el) { return (new Date(el.date) >= new Date().setMonth(new Date().getMonth() - 4)) });
                  }
                  
                  var currentDate = new Date().toLocaleDateString();
                  var currentTime = new Date().toLocaleTimeString();
                  var reminderArray = angular.copy(calendarData);
                  angular.forEach(reminderArray, function (item) {
                      item.schedule = JSON.parse(item.schedule);
                      var scheduleDate = new Date(item.date).toLocaleDateString();
                      if (scheduleDate == currentDate) {
                          angular.forEach(item.schedule, function (el) {
                              if (new Date(el.startTime).toLocaleTimeString() >= currentTime) {
                                  if (el.alert == true) {
                                      if (el.alertTime == null) {
                                          el.alertTime = 0;
                                      }
                                      var scheduleStartTime = (new Date(el.startTime).getHours() * 3600) + (new Date(el.startTime).getMinutes() * 60) - (Number(el.alertTime));
                                      scheduleTimeArray.push(scheduleStartTime);
                                      scheduleTimeArray.sort(function (a, b) {
                                          return a - b
                                      })     
                                  }
                              }
                          })
                      }
                  })
                  deferred.resolve(scheduleTimeArray);
              })
          });
          return deferred.promise;
      };

      currentUser.registerObserverCallback(getScheduleArray)
      var getScheduleArray = function(refresh) {
          if ($rootScope.scheduleTimeArray == undefined || refresh) {//fixing the issue of registerObserverCallback
              setTodaySchedules().then(function (scheduleTimeArray) {
                  if (scheduleTimeArray) {
                      $rootScope.scheduleTimeArray = scheduleTimeArray;
                      setTimeout(next(), 6000);
                  }
              })
          }
      };

      function next() {
          msg();
          if ($rootScope.scheduleTimeArray != undefined) {
              if ($rootScope.scheduleTimeArray.length) setTimeout(next, (($rootScope.scheduleTimeArray.shift()) - ((new Date().getHours() * 3600) + (new Date().getMinutes() * 60))) * 1000);
          }
      };

      function msg() {
          currentUser.getCurrentUserId().then(function (id) {
              getUserSchedule(id).then(function (calendarNotes) {
                  var remindarArray = angular.copy(calendarNotes);
                  angular.forEach(remindarArray, function (item) {
                      if (new Date().toLocaleDateString() == new Date(item.date).toLocaleDateString()) {
                          item.schedule = JSON.parse(item.schedule);
                          angular.forEach(item.schedule, function (el) {
                              if (el.alert == true) {
                                  if (el.alertTime == null) {
                                      el.alertTime = 0;
                                  }
                                  if ((new Date(el.startTime).getHours() * 3600) + (new Date(el.startTime).getMinutes() * 60) - (Number(el.alertTime)) == (new Date().getHours() * 3600) + (new Date().getMinutes() * 60)) {
                                      var title = el.title;
                                      var startTime = new Date(el.startTime).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
                                      ModalService.showModal({
                                          templateUrl: 'scripts/directives/calendar/calendarReminderModal.html',
                                          controller: 'calendarReminderModal',
                                          inputs: {
                                              reminderTitle: title,
                                              reminderStartTime: startTime
                                          },
                                          size: 'sm'
                                      }).then(function (modal) {
                                          modal.element.modal();
                                          modal.close.then(function (result) { })
                                      })
                                  }
                              }
                          })
                      }
                  })
              })
          })
      }

      userScheduleFactory.getUserSchedule = getUserSchedule;
      userScheduleFactory.addUserSchedule = addUserSchedule;
      userScheduleFactory.updateUserSchedule = updateUserSchedule;
      userScheduleFactory.deleteUserSchedule = deleteUserSchedule;
      userScheduleFactory.getScheduleArray = getScheduleArray;

      return userScheduleFactory;

  });