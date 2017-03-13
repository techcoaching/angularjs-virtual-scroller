window.eventManager = new EventManager();
function EventManager() {
    var self = this;
    self.events = {};
    self.publish = publish;
    self.subcribe = subcribe;
    function publish(name, param) {
        if (!this.events[name]) {
            throw String.format("'{0}' event does not exist", name);
        }
        param = param || {};
        this.events[name](param);
    }
    function subcribe(name, callback) {
        this.events[name] = callback;
    }
}