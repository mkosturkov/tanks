'use strict';
function KeyboardController(playerId, keyMap, eventDispatcher, document) {
	this.playerId = playerId;
	this.keyMap = keyMap;
	this.eventDispatcher = eventDispatcher;
	this.document = document;
	this.depressedKeys = {};
}

KeyboardController.prototype.handleKeyDown = function(event) {
	if (this.depressedKeys[event.keyCode]
			|| this.keyMap[event.keyCode] === undefined
			|| this.keyMap[event.keyCode].down === undefined
		) {
			return;
	}
	this.depressedKeys[event.keyCode] = true;
	this.eventDispatcher.fireEvent(
		this.keyMap[event.keyCode].eventData.down.eventNamespace,
		this.keyMap[event.keyCode].eventData.down.eventName,
		{
			playerId: this.playerId,
			data: this.keyMap[event.keyCode].down.data
		}
	);
};

KeyboardController.prototype.handleKeyUp = function(event) {
	if (this.depressedKeys[event.keyCode]) {
		this.depressedKeys[event.keyCode] = false;
	}
	if (this.keyMap[event.keyCode] === undefined || this.keyMap[event.keyCode].up === undefined) {
		return;
	}
	this.eventDispatcher.fireEvent(
		this.keyMap[event.keyCode].eventData.up.eventNamespace,
		this.keyMap[event.keyCode].eventData.up.eventName,
		{
			playerId: this.playerId,
			data: this.keyMap[event.keyCode].up.data
		}
	);
};

KeyboardController.prototype.bind = function() {
	this.bindedDownHandler = this.handleKeyDown.bind(this);
	this.bindedUpHandler = this.handleKeyUp.bind(this);
	this.document.addEventListener('keydown', this.bindedDownHandler);
	this.document.addEventListener('keyup', this.bindedUpHandler);
};

KeyboardController.prototype.unbind = function() {
	if(this.bindedDownHandler === undefined) {
		return;
	}
	this.document.removeEventListner('keydown', this.bindedDownHandler);
	this.document.removeEventListner('keyup', this.bindedUpHandler);
	delete this.bindedDownHandler;
	delete this.bindedUpHandler;
};


