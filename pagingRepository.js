(function () {
    var KEY = "PAGING";
    window.pagingRepository = {
        add: add,
        getByIndex: getByIndex
        //getByOffset: getByOffset
    };
    function getByOffset(offset) {
        var items = getAll();
    }
    function getByIndex(index) {
        var items = getAll();
        return items[index];
    }
    function add(option) {
        if (!option) { return; }
        var items = getAll();
        items[option.pageIndex] = option;
        localStorage.setItem(KEY, JSON.stringify(items))
    }
    function getAll() {
        var json = localStorage.getItem(KEY)
        json = String.isNullOrWhiteSpace(json) ? "[]" : json;
        return JSON.parse(json);
    }
})();