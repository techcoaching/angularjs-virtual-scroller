var app = angular.module('journalApp', ['ngMaterial']);

app.controller('JournalController', function JournalController($scope) {
    $.getJSON("/api/journal1.json", function(json) {    
        $scope.items = json;
        $scope.$apply();
    });
});
