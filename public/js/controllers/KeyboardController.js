'use strict';
function KeyboardController(playerId, keyMap, eventDispatcher) {
	this.playerId = playerId;
	this.keyMap = keyMap;
	this.eventDispatcher = eventDispatcher;
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
		this.keyMap[event.keyCode].down.eventNamespace,
		this.keyMap[event.keyCode].down.eventName,
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
		this.keyMap[event.keyCode].up.eventNamespace,
		this.keyMap[event.keyCode].up.eventName,
		{
			playerId: this.playerId,
			data: this.keyMap[event.keyCode].up.data
		}
	);
};

KeyboardController.prototype.bind = function() {
	this.bindedDownHandler = this.handleKeyDown.bind(this);
	this.bindedUpHandler = this.handleKeyUp.bind(this);
	KeyboardController.document.addEventListener('keydown', this.bindedDownHandler);
	KeyboardController.document.addEventListener('keyup', this.bindedUpHandler);
};

KeyboardController.prototype.unbind = function() {
	if(this.bindedDownHandler === undefined) {
		return;
	}
	KeyboardController.document.removeEventListner('keydown', this.bindedDownHandler);
	KeyboardController.document.removeEventListner('keyup', this.bindedUpHandler);
	delete this.bindedDownHandler;
	delete this.bindedUpHandler;
};


