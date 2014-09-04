function Client(eventDispatcher, renderer, objectsFactory) {
	this.eventDispatcher = eventDispatcher;
	this.renderer = renderer;
	this.objectsFactory = objectsFactory;
	this.keyboardControllers = {};
	this.movingObjects = {};
}

Client.prototype.addPlayer = function(playerId) {
	this.eventDispatcher.fireEvent('game', 'playerJoined', {playerId: playerId});
};

Client.prototype.start = function() {
	this.renderer.start();
};

Client.prototype.setObjectPosition = function(id, position) {
	var object = this.movingObjects[id];
	object.x = position.x;
	object.y = position.y;
};

Client.prototype.onKeyboardMapping = function(event) {
	var kc = new KeyboardController(event.playerId, event.data.map, this.eventDispatcher);
	kc.bind();
	this.keyboardControllers[event.playerId] = kc;
};

Client.prototype.onObjectCreated = function(event) {
	var object = this.objectsFactory.createObject(event.data.type, event.data.id);
	object.x = event.data.position.x;
	object.y = event.data.position.y;
	object.rot = event.data.position.rot;
	object.attachToUpdater(this.renderer);
	this.movingObjects[event.data.id] = object;
};

Client.prototype.onObjectMovedForward = function(event) {
	this.setObjectPosition(event.data.id, event.data.position);
	this.movingObjects[event.data.id].moveForward();
};

Client.prototype.onObjectMovedBackwards = function(event) {
	this.setObjectPosition(event.data.id, event.data.position);
	this.movingObjects[event.data.id].moveBackwards();
};

Client.prototype.onObjectStopped = function(event) {
	this.setObjectPosition(event.data.id, event.data.position);
	this.movingObjects[event.data.id].stopMoving();
};

Client.prototype.onObjectRotatedLeft = function(event) {
	this.setObjectPosition(event.data.id, event.data.position);
	this.movingObjects[event.data.id].rot -= Math.PI / 2;
};

Client.prototype.onObjectRotatedRight = function(event) {
	this.setObjectPosition(event.data.id, event.data.position);
	this.movingObjects[event.data.id].rot += Math.PI / 2;
};

Client.prototype.onObjectDestroyed = function(event) {
	this.setObjectPosition(event.data.id, event.data.position);
	this.movingObjects[event.data.id].detachFromUpdater();
	delete this.movingObjects[event.data.id];
};

Client.prototype.bindEvents = function() {
	this.eventDispatcher.addHandler('keyboard', 'mapped', this.onKeyboardMapping.bind(this));
	this.eventDispatcher.addHandler('object', 'created', this.onObjectCreated.bind(this));
	this.eventDispatcher.addHandler('object', 'movedForward', this.onObjectMovedForward.bind(this));
	this.eventDispatcher.addHandler('object', 'movedBackwards', this.onObjectMovedBackwards.bind(this));
	this.eventDispatcher.addHandler('object', 'rotatedLeft', this.onObjectRotatedLeft.bind(this));
	this.eventDispatcher.addHandler('object', 'rotatedRight', this.onObjectRotatedRight.bind(this));
	this.eventDispatcher.addHandler('object', 'stopped', this.onObjectStopped.bind(this));
};