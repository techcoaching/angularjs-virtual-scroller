window.angularHelper = {
    getElement: getElement
};
function getElement(selector) {
    var item = domHelper.getElement(selector);
    if (!item) { return null; }
    if (item.length > 1) {
        item = item[0];
    }
    return angular.element(item);
}