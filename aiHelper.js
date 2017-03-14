window.aiHelper = {
    updatePredictionRules: updatePredictionRules
};
function updatePredictionRules(items) {
    var rules = ruleRepository.getRules();
    for (var pro in items) {
        var item = items[pro];
        var lines = Number.roundUpper(item.height / item.lineHeight);
        rules[Number.format(item.length, 6)] = lines;
        var previousItem = positionRepository.getByIndex(item.itemIndex - 1);
        var currentPositionItem = { index: item.itemIndex, offsetTop: item.offsetTop, height: item.height };
        if (previousItem && (parseInt(item.itemIndex) > item.pageSize)) {
            currentPositionItem.offsetTop = previousItem.offsetTop + previousItem.height;
        }
        positionRepository.save(currentPositionItem);
    }
    optimizeRules(rules);
    ruleRepository.save(rules);
}
function optimizeRules(rules) {
    return rules;
    // if (rules || rules.length == 0) { return []; }
    // var optimizedRules = [];
    // var lowerBound = 0;
    // var upperBound = 0;
    // var lines = 0;
    // rules.iterate(function (previous, current, next) {
    //     if (String.isNullOrWhiteSpace(previous)) {
    //         this.lowerBound = numberHelper.parse(current);
    //     }
    //     if (String.isNullOrWhiteSpace(next)) {
    //         this.upperBound = numberHelper.parse(current);
    //     }

    // });
}