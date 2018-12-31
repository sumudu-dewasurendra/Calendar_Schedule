function setCalendarWidgetOptions() {
              var calendarOptions;
              var validCalendarJson = false;
              var template = [
                   {
                       name: 'backgroundColor',
                       type: 'colorpicker',
                       label: 'Background Color',
                       value: '#fffff'
                   }
              ];

              if ($scope.chartWidgetConfig.widgetConfig) {
                  $scope.widgetOptions = JSON.parse($scope.chartWidgetConfig.widgetConfig);
                  var backgroundColor = $scope.widgetOptions.filter(function (items) { return items.name === 'backgroundColor' })[0];

                  if (backgroundColor) {
                      validCalendarJson = true;
                  }
              }

              if (validCalendarJson) {
                  calendarOptions = JSON.parse($scope.chartWidgetConfig.widgetConfig);

                  angular.forEach(template, function (setting, key) {
                      var option = calendarOptions.filter(function (items) { return items.name === setting.name });

                      if (option.length == 0) {
                          calendarOptions.push(setting);
                      }
                  });
              }
              else {
                  calendarOptions = template;
              }

              return calendarOptions;
          }