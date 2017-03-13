window.domHelper = {
    getElement: getElement
};
function getElement(selector) {
    var items;
    if (selector.startWith("#")) {
        items = document.getElementById(String.removeFirst(selector, "#"));
    } else if (selector.startWith(".")) {
        items = document.getElementsByClassName(String.removeFirst(selector, "."));
    } else {
        items = document.getElementsByTagName(selector);
    }
    return items;
}