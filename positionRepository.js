window.positionRepository = {
    key: "POSITION",
    getByIndex: getByIndex,
    save: save,
    getAll: getAll,
    getLast: getLast,
    getByOffset: getByOffset
};
function getByOffset(offset) {
    var items = getAll();
    var itemIndex = items.indexes.firstOrDefault(function (index) {
        return index && items[index].offsetTop >= offset;
    });
    return parseInt(itemIndex);
}
function getLast() {
    var items = getAll();
    return getByIndex(items.indexes[items.indexes.length - 1]);
}
function save(item) {
    if (!item) { return; }
    var items = getAll();
    items.indexes[item.index] = item.index;
    items[item.index] = item;
    localStorage.setItem(this.key, JSON.stringify(items))
}
function getByIndex(index) {
    var items = getAll();
    var pro = items.indexes[index];
    if (!pro) { return null; }
    return items[pro];
}
function getAll() {
    var json = localStorage.getItem(window.positionRepository.key)
    json = String.isNullOrWhiteSpace(json) ? "{\"indexes\":[]}" : json;
    return JSON.parse(json);
}