function Server(eventDispatcher, updater, collisionPredictor, objectsFactory) {
	this.eventDispatcher = eventDispatcher;
	this.updater = updater;
	this.collisionPredictor = collisionPredictor;
	this.playerObjects = {};
	this.mapObjects = {};
	this.objectsFactory = objectsFactory;
	
	this.maps = [
		{
			37: {
				down: {
					eventNamespace: 'player',
					eventName: 'rotateLeft'
				}
			},
			38: {
				down: {
					eventNamespace: 'player',
					eventName: 'moveForward'
				},
				up: {
					eventNamespace: 'player',
					eventName: 'stop'
				}
			},
			39: {
				down: {
					eventNamespace: 'player',
					eventName: 'rotateRight'
				}
			},
			40: {
				down: {
					eventNamespace: 'player',
					eventName: 'moveBackwards'
				},
				up: {
					eventNamespace: 'player',
					eventName: 'stop'
				}
			}
		},
		{
			65: {
				down: {
					eventNamespace: 'player',
					eventName: 'rotateLeft'
				}
			},
			87: {
				down: {
					eventNamespace: 'player',
					eventName: 'moveForward'
				},
				up: {
					eventNamespace: 'player',
					eventName: 'stop'
				}
			},
			68: {
				down: {
					eventNamespace: 'player',
					eventName: 'rotateRight'
				}
			},
			83: {
				down: {
					eventNamespace: 'player',
					eventName: 'moveBackwards'
				},
				up: {
					eventNamespace: 'player',
					eventName: 'stop'
				}
			}
		}
	];
}

Server.prototype.addPlayer = function(playerId) {
	var position = {};
	if(playerId === 1) {
		var objectType = 'blueTank';
		position.x = 100;
		position.y = 100;
		position.rot = 0;
	} else {
		var objectType = 'greenTank';
		position.x = 300;
		position.y = 300;
		position.rot = -Math.PI / 2;
	}
	var object = this.objectsFactory.createObject(objectType);
	object.x = position.x;
	object.y = position.y;
	object.rot = position.rot;
	object.attachToUpdater(this.updater);
	this.playerObjects[playerId] = object;
	this.mapObjects[object.id] = {movingObject: object};
	this.mapObjects[object.id].collidableId = this.collisionPredictor.addItem(object);
	this.eventDispatcher.fireEvent('keyboard', 'mapped', {map: this.maps[playerId]}, playerId);
	this.eventDispatcher.fireEvent('object', 'created', {id: object.id, position: position, type: objectType});
};

Server.prototype.changePlayerMovingObjectState = function(event, eventName, callback) {
	var object = this.playerObjects[event.data.playerId];
	this.collisionPredictor.removeItem(object.collidableId);
	this.updater.updatePositions();
	callback(object);
	object.collidableId = this.collisionPredictor.addItem(object);
	var eventData = {
		id: object.id,
		position: {
			x: object.x,
			y: object.y,
			rot: object.rot
		}
	};
	this.eventDispatcher.fireEvent('object', eventName, eventData);
};

Server.prototype.onMoveForward = function(event) {
	this.changePlayerMovingObjectState(event, 'movedForward', function(object) {
		object.moveForward();
	});
};

Server.prototype.onMoveBackwards= function(event) {
	this.changePlayerMovingObjectState(event, 'movedBackwards', function(object) {
		object.moveBackwards();
	});
};

Server.prototype.onRotateLeft = function(event) {
	this.changePlayerMovingObjectState(event, 'rotatedLeft', function(object) {
		object.rot += Math.PI / 2;
	});
};

Server.prototype.onRotateRight = function(event) {
	this.changePlayerMovingObjectState(event, 'rotatedRight', function(object) {
		object.rot += Math.PI / 2;
	});
};

Server.prototype.onStop = function(event) {
	this.changePlayerMovingObjectState(event, 'stopped', function(object) {
		object.stopMoving();
	});
};

Server.prototype.bindEvents = function() {
	this.eventDispatcher.addHandler('game', 'playerJoined', function(event) {
		this.addPlayer(event.data.playerId);
	}.bind(this));
	this.eventDispatcher.addHandler('player', 'moveForward', this.onMoveForward.bind(this));
	this.eventDispatcher.addHandler('player', 'moveBackwards', this.onMoveBackwards.bind(this));
	this.eventDispatcher.addHandler('player', 'rotateLeft', this.onRotateLeft.bind(this));
	this.eventDispatcher.addHandler('player', 'rotateRight', this.onRotateRight.bind(this));
	this.eventDispatcher.addHandler('player', 'stop', this.onStop.bind(this));
};

