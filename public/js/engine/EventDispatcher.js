'use strict';
function EventDispatcher() {
	this.handlers = {'*': {}};
	this.reverseMap = {};
};

EventDispatcher.prototype.nextHandlerId = 0;

EventDispatcher.prototype.addGlobalHandler = function(handler) {
	var id = this.nextHandlerId++;
	this.handlers['*'][id] = handler;
	this.reverseMap[id] = '*';
	return id;
};

EventDispatcher.prototype.addNamespaceHandler = function(eventNamespace, handler) {
	var id = this.nextHandlerId++;
	if(this.handlers[eventNamespace] === undefined) {
		this.handlers[eventNamespace] = {'*' : {}};
	}
	this.handlers[eventNamespace]['*'][id] = handler;
	this.reverseMap[id] = eventNamespace;
	return id;
};

EventDispatcher.prototype.addHandler = function(eventNamespace, eventName, handler) {
	var id = this.nextHandlerId++;
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
	if(this.reverseMap[id] === '*') {
		// Global handlers
		delete this.handlers['*'][id];
	} else if(typeof this.reverseMap[id] === 'string') {
		// Namespace handlers
		delete this.handlers[this.reverseMap[id]]['*'][id];
	} else {
		// Event handlers
		delete this.handlers[this.reverseMap[id].eventNamespace][this.reverseMap[id].eventName][id];
	}
	delete this.reverseMap[id];
};

EventDispatcher.prototype.fireEvent = function(eventNamespace, eventName, eventData, eventTime) {
	var event = {
		namespace: eventNamespace,
		name: eventName,
		data: eventData
	};
	if(eventTime !== undefined) {
		event.eventTime = eventTime;
	} else {
		event.eventTime = (new Date()).getTime();
	}
	// Fire global event handlers
	if(this.handlers['*'] !== undefined) {
		for(var id in this.handlers['*']) {
			this.handlers['x'][id](event);
		}
	}
	if(this.handlers[eventNamespace] === undefined) {
		return;
	}
	// Fire namespace event handlers
	if(this.handlers[eventNamespace]['*'] !== undefined) {
		for(var id in this.handlers[eventNamespace]['*']) {
			this.handlers[eventNamespace]['*'][id](event);
		}
	}
	// Fire specific event event handlers
	if(this.handlers[eventNamespace][eventName] !== undefined) {
		for(var id in this.handlers[eventNamespace][eventName]) {
			this.handlers[eventNamespace][eventName][id](eventData);
		}
	}
};


