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



                $scope.next = function () {
                    controller.next();
                };
                $scope.previous = function () {
                    controller.previous();;
                };
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
            '</div><div>' +
            '<button ng-click="previous()">Previous</button>' +
            '<button ng-click="next()">Next</button>' +
            '</div>';
    }

    function ScrollDirectiveController($scope, $timeout) {
        var self = this;
        self.pageIndex = 1;
        self.onScroll = onScroll;
        self.init = init;
        self.loadData = loadData;
        self.next = next;
        self.previous = previous;
        $scope.heights = {};

        loadData(self.pageIndex);

        function next() {
            self.pageIndex += 1;
            loadData(self.pageIndex);
        }
        function previous() {
            self.pageIndex -= 1;
            self.pageIndex < 0 ? 0 : self.pageIndex;
            loadData(self.pageIndex);
        }
        function init() {
            eventManager.subcribe("onScrollItemHeight_Updated", onItemHeightUpdated);
            eventManager.subcribe("scroll_rendered", onDataRendered);
        }

        function onItemHeightUpdated(option) {
            console.log("onItemHeightUpdated", option);
            $scope.heights[Number.format(option.itemId, 6)] = option;
        }
        function onDataRendered() {
            $scope.heights = {};
            initScrollerObject($scope);


            updateItemHeight($scope);
            aiHelper.updatePredictionRules($scope.heights);

            var beforeContentHeight = getPredictBeforeContentHeight($scope);
            var afterContentHeight = getPredictAfterContentHeight($scope, beforeContentHeight);
            $scope.beforeContent[0].style.height = beforeContentHeight + "px";
            $scope.afterContent[0].style.height = afterContentHeight + "px";
            scrollTo(self.pageIndex <= 1 ? 0 : beforeContentHeight);
        }
        function initScrollerObject($scope) {
            $scope.scroller = angularHelper.getElement(".scroll-scroller");
            $scope.beforeContent = angularHelper.getElement(".scroll-before-content");
            $scope.afterContent = angularHelper.getElement(".scroll-after-content");
            $scope.content = angularHelper.getElement(".scroll-content");
            $scope.scroller.bind("scroll", self.onScroll);
        }
        function scrollTo(offset) {
            $scope.scroller[0].scrollTop = offset;
        }
        function getPredictAfterContentHeight($scope, heightOfBeforeContent) {
            var position = positionRepository.getByIndex($scope.totalItems);
            var lastItemIndex = $scope.items[0].paragraphs.lastOrDefault().itemIndex;
            var itemHeight = scrollerHelper.getScrollItemHeight();
            var numberOfItemAfterContent = $scope.totalItems - lastItemIndex;
            return numberOfItemAfterContent * itemHeight;
        }
        function getPredictBeforeContentHeight($scope) {
            if (!$scope.items || $scope.items.length == 0 || $scope.items[0].paragraphs.length <= 0) { return 0; }
            var topItemIndex = $scope.items[0].paragraphs.firstOrDefault().itemIndex;
            var position = positionRepository.getByIndex(topItemIndex);
            if (position) {
                return position.offsetTop;
            }
            var offsetTop = topItemIndex * scrollerHelper.getScrollItemHeight()
            //positionRepository.save({ index: topItemIndex, offsetTop: offsetTop });
            return offsetTop;
        }
        function updateItemHeight($scope) {
            var items = $scope.scroller[0].querySelectorAll(".scroll-content-item");
            items.forEach(function (item) {
                var option = {
                    itemId: item.attributes["item-id"].value,
                    height: item.offsetHeight,
                    length: item.innerHTML.length,
                    lineHeight: window.lineHeight(item),
                    itemIndex: item.attributes["item-index"].value,
                    offsetTop: item.offsetTop,
                    pageIndex: self.pageIndex,
                    pageSize: 8
                };
                eventManager.publish("onScrollItemHeight_Updated", option);
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
                $scope.totalItems = response.paging.total;
                $scope.$apply();
            });
        }
    }
});