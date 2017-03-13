var app = angular.module('virtualScroll', ['ngMaterial']);
app.controller('virtualScrollerController', function JournalController($scope) {
    var self = this;
    $scope.loadData = loadData;
    function loadData(options) {
        options = options || { pageSize: 10, pageIndex: 1 };
        var def = new $.Deferred();
        var url = String.format("/api/journal_{0}.json", options.pageIndex);
        $.getJSON(url, function (json) {
            def.resolve(json)
        });
        return def;
    }
}).directive("scroll", function ($compile) {
    var directive = {
        restrict: "E",
        replace: true,
        scope: {
            pageSize: "=",
            loadData: "&"
        },
        controller: ScrollDirectiveController,
        compile: function ($element, $timeout) {
            var html = $element.html();
            return function ($scope, $element, attrs, controller) {
                controller.init();
                var template = scrollTemplate(html);
                $element.append($compile(template)($scope));

                $scope.scroller = angularHelper.getElement(".scroll-scroller");
                $scope.beforeContent = angularHelper.getElement(".scroll-before-content");
                $scope.afterContent = angularHelper.getElement(".scroll-after-content");
                $scope.content = angularHelper.getElement(".scroll-content");

                $scope.scroller.bind("scroll", controller.onScroll);
            }
        }
    };
    return directive;
    function scrollTemplate(html) {
        return '<div class="scroll-scroller">' +
            '<div class="scroll-before-content"></div>' +
            '<div class="scroll-content" ng-repeat="item in items">' +
            html +
            '</div>' +
            '<div class="scroll-after-content"></div>' +
            '</div>';
    }

    function ScrollDirectiveController($scope, $timeout) {
        var self = this;
        this.onScroll = onScroll;
        this.init = init;

        $scope.domHeight = {};

        loadData();
        window.setTimeout(function () {
            loadData(2);
        }, 2000);

        function init() {
            eventManager.subcribe("onScrollItemHeight_Updated", onItemHeightUpdated);
            eventManager.subcribe("scroll_rendered", onReady);
        }

        function onItemHeightUpdated(option) {
            console.log("onItemHeightUpdated", option);
            $scope.domHeight[option.itemId] = option.height;
        }
        function onReady() {
            console.log("onReady");
            updateItemHeight($scope);
        }
        function updateItemHeight($scope) {
            var items = $scope.scroller[0].querySelectorAll(".scroll-content-item");
            items.forEach(function (item) {
                var height = item.offsetHeight;
                var itemId = item.attributes["item-id"].value;
                eventManager.publish("onScrollItemHeight_Updated", { itemId: itemId, height: height });
            });
        }
        function onScroll(event) {
        }

        function loadData(pageIndex) {
            pageIndex = pageIndex || 1;
            if (!$scope.loadData()) {
                throw "loadData was not specified";
            }
            $scope.loadData()({ pageSize: $scope.pageSize, pageIndex: pageIndex }).then(function (response) {
                $scope.items = response.data;
                $scope.$apply();
            });
        }
    }
});