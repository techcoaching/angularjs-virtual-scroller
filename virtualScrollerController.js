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
        self.enableScroll = true;
        self.pageIndex = 1;
        self.onScroll = onScroll;
        self.init = init;
        self.loadData = loadData;
        self.next = next;
        self.previous = previous;
        $scope.heights = {};
        self.direction = 1;

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
            //console.log("onItemHeightUpdated", option);
            $scope.heights[Number.format(option.itemId, 6)] = option;
        }
        function onDataRendered() {
            $scope.heights = {};
            initScrollerObject($scope);


            updateItemHeight($scope);
            aiHelper.updatePredictionRules($scope.heights);

            var beforeContentHeight = getPredictBeforeContentHeight($scope);
            //var beforeContentHeight= $scope.scroller[0].scrollTop;
            var afterContentHeight = getPredictAfterContentHeight($scope, beforeContentHeight);
            var contentHeight = $scope.content.height();
            //var relativeHeight = recalculateRelativeHeight({ beforeContentHeight: beforeContentHeight, contentHeight: contentHeight, afterContentHeight: afterContentHeight });
            //console.log("RelativeHeight: ", relativeHeight)
            if (self.direction == 1) {
                $scope.beforeContent[0].style.height = beforeContentHeight + "px";
                $scope.afterContent[0].style.height = afterContentHeight + "px";
                self.contentHeight = contentHeight;
                self.beforeContentHeight = beforeContentHeight;
            }

            // if (self.direction == -1) {
            //     $scope.beforeContent[0].style.height = (beforeContentHeight - contentHeight) + "px";
            //     $scope.afterContent[0].style.height = (afterContentHeight + contentHeight) + "px";
            //     self.contentHeight = contentHeight;
            //     self.beforeContentHeight = beforeContentHeight;
            // }

            //$scope.beforeContent[0].style.height = relativeHeight.beforeContent + "px";
            //$scope.afterContent[0].style.height = relativeHeight.afterContent + "px";
            //scrollTo(self.pageIndex <= 1 ? 0 : beforeContentHeight);
            //self.relativeUnit = relativeHeight.relativeUnit;

            //pagingRepository.add({ pageIndex: self.pageIndex, topOffset: relativeHeight.beforeContent, bottomOffset: relativeHeight.afterContent });
            self.enableScroll = true;
        }
        function recalculateRelativeHeight(heightOption) {
            var scrollHeight = $scope.scroller[0].scrollHeight;
            var scrollTop = $scope.scroller[0].scrollTop;
            var relativeUnit = (heightOption.beforeContentHeight + heightOption.contentHeight + heightOption.afterContentHeight) / scrollHeight;
            var relativeOption = {
                relativeUnit: relativeUnit,
                beforeContent: scrollTop * relativeUnit,
                content: heightOption.contentHeight,
                afterContent: (scrollHeight - scrollTop) * relativeUnit - heightOption.contentHeight
            };
            return relativeOption;
        }
        function scrollTo(offset) {
            console.log("scrollTo", offset);
            //$scope.scroller[0].scrollTop = 2 * offset + "px";
            //window.scrollTo(3*offset, 3*offset+700);
            // $($scope.scroller).animate({
            //     scrollTop: offset
            // }, 2000);
            //$scope.content[0].top = "0px";
        }
        function initScrollerObject($scope) {
            //if (!$scope.scroller) {
            $scope.scroller = angularHelper.getElement(".scroll-scroller");
            //}
            //if (!$scope.beforeContent) {
            $scope.beforeContent = angularHelper.getElement(".scroll-before-content");
            //}
            //if (!$scope.afterContent) {
            $scope.afterContent = angularHelper.getElement(".scroll-after-content");
            //}
            //if (!$scope.content) {
            $scope.content = angularHelper.getElement(".scroll-content");
            //}
            $scope.scroller.bind("scroll", function (event) {
                if (self.timer) { return; }
                self.timer = window.setTimeout(function () {
                    self.onScroll(event);
                    console.log("clear timeout");
                    window.clearTimeout(self.timer);
                    self.timer = null;
                }, 300);

            });
        }

        function getPredictAfterContentHeight($scope, heightOfBeforeContent) {
            var position = positionRepository.getByIndex($scope.totalItems);
            var lastItemIndex = $scope.items[0].paragraphs.lastOrDefault().itemIndex;
            var itemHeight = scrollerHelper.getScrollItemHeight();
            var numberOfItemAfterContent = $scope.totalItems - lastItemIndex;
            return numberOfItemAfterContent * itemHeight;
        }
        function getPredictBeforeContentHeight($scope) {
            return $scope.scroller[0].scrollTop;
            // //if (!$scope.items || $scope.items.length == 0 || $scope.items[0].paragraphs.length <= 0) { return 0; }
            // var topItemIndex = $scope.fromIndex;
            // var position = positionRepository.getByIndex(topItemIndex);
            // console.log(position, $scope.fromIndex);
            // if (position) {
            //     return position.offsetTop;
            // }
            // var offsetTop = topItemIndex * scrollerHelper.getScrollItemHeight()
            // //positionRepository.save({ index: topItemIndex, offsetTop: offsetTop });
            // return offsetTop;
        }
        function updateItemHeight($scope) {
            var items = $scope.scroller[0].querySelectorAll(".scroll-content-item");
            items.forEach(function (item) {
                var option = {
                    itemId: item.attributes["item-id"].value,
                    height: item.offsetHeight,
                    length: item.innerHTML.length,
                    lineHeight: window.lineHeight(item),
                    itemIndex: parseInt(item.attributes["item-index"].value),
                    offsetTop: item.offsetTop,
                    pageIndex: self.pageIndex,
                    pageSize: $scope.pageSize
                };
                eventManager.publish("onScrollItemHeight_Updated", option);
            });
        }
        function onScroll(event) {
            // console.log(event);
            // self.direction = event.target.scrollTop > self.previousScrollPosition ? 1 : -1;
            // self.previousScrollPosition = event.target.scrollTop;
            if (!self.enableScroll) { return true; }
            var scrollTop = event.target.scrollTop;
            console.log("OnScroll", self.contentHeight, self.beforeContentHeight, scrollTop);
            if (self.contentHeight + self.beforeContentHeight - 100 < scrollTop) {
                self.enableScroll = false;
                console.log("Next", self.contentHeight, self.beforeContentHeight, scrollTop);
                self.next();
            }

            if (self.beforeContentHeight + 100 > scrollTop) {
                self.enableScroll = false;
                console.log("Next", self.contentHeight, self.beforeContentHeight, scrollTop);
                self.previous();
            }
            // var page = window.pagingRepository.getByIndex(self.pageIndex);
            // if (!page) { return; }
            // if (page.bottomOffset - 100 < scrollTop) {
            //     self.enableScroll = false;
            //     console.log("Next", page, scrollTop);
            //     self.next();
            // }
            // // var scrollTop = event.target.scrollTop;
            // // var position = window.positionRepository.getByOffset(scrollTop);
            // // if (!position) { return; }
            // // if (position >= $scope.toIndex - 3) {
            // //     self.enableScroll = false;
            // //     console.log("Next", position, scrollTop);
            // //     self.next();
            // // }
            // // console.log("Scroll:", self.enableScroll, position, scrollTop);
        }

        function loadData(pageIndex) {
            pageIndex = pageIndex || 1;
            if (!$scope.loadData()) {
                throw "loadData was not specified";
            }
            $scope.loadData()({ pageSize: $scope.pageSize, pageIndex: pageIndex }).then(function (response) {
                $scope.items = response.data;
                $scope.fromIndex = parseInt(response.paging.fromIndex);
                $scope.toIndex = parseInt(response.paging.toIndex);
                $scope.totalItems = response.paging.total;
                $scope.$apply();
            });
        }
    }
});
