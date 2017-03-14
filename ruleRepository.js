window.ruleRepository = {
    key: "RULES",
    getRules: getRules,
    save: save
};
function save(rules) {
    rules = rules || {};
    var json = JSON.stringify(rules);
    localStorage.setItem(this.key, json)
}
function getRules() {
    var json = localStorage.getItem(this.key)
    json = String.isNullOrWhiteSpace(json) ? "{}" : json;
    return JSON.parse(json);
}