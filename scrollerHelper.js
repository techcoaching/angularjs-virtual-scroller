window.scrollerHelper = {
    getScrollItemHeight: getScrollItemHeight
};
function getScrollItemHeight() {
    var last = positionRepository.getLast();
    // default height. this should be configuration
    if (!last) { return 100; }
    return Number.roundUpper(last.offsetTop / parseInt(last.index));
}
