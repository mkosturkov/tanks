'use strict';
function EventDispatcher() {
	this.handlers = {};
	this.reverseMap = {};
};

EventDispatcher.prototype.nextEventId = 0;

EventDispatcher.prototype.addHandler = function(eventNamespace, eventName, handler) {
	var id = this.nextEventId++;
	if(this.handlers[eventNamespace] === undefined) {
		this.handlers[eventNamespace] = {};
	}
	if(this.handlers[eventNamespace][eventName] === undefined) {
		this.handlers[eventNamespace][eventName] = {};
	}
	this.handlers[eventNamespace][eventName][id] = handler;
	this.reverseMap[id] = {eventNamespace: eventNamespace, eventName: eventName};
	return id;
};

EventDispatcher.prototype.removeHandler = function(id) {
	if(this.reverseMap[id] === undefined) {
		return;
	}
	delete this.handlers[this.reverseMap[id].eventNamespace][this.reverseMap[id].eventName][id];
	delete this.reverseMap[id];
};

EventDispatcher.prototype.fireEvent = function(eventNamespace, eventName, eventData) {
	if(this.handlers[eventNamespace] === undefined || this.handlers[eventNamespace][eventName] === undefined) {
		return;
	}
	for(var id in this.handlers[eventNamespace][eventName]) {
		this.handlers[eventNamespace][eventName][id](eventData);
	}
};


