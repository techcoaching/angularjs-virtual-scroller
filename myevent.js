var app = angular.module('virtualScroll');
app.directive("myEvent", function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last===true) {
            //eventManager.publish("scroll_rendered");
            $timeout(function () {
                eventManager.publish("scroll_rendered");
            });
        }
    };
});