(function () {
    var KEY = "PAGING";
    window.pagingRepository = {
        add: add,
        get: get
    };
    function get(index) {
        var items = getAll();
        var pro = items[index];
        if (!pro) { return null; }
        return items[pro];
    }
    function add(option) {
        if (!item) { return; }
        var items = getAll();
        items[option.pageIndex] = option;
        localStorage.setItem(this.key, JSON.stringify(items))
    }
    function getAll() {
        var json = localStorage.getItem(KEY)
        json = String.isNullOrWhiteSpace(json) ? "[]" : json;
        return JSON.parse(json);
    }
})();