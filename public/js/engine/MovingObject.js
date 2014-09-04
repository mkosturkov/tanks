'use strict';
function MovingObject(id) {
	if(id === undefined) {
		id = MovingObject.nextObjectId++;
	}
	this.id = id;
}

MovingObject.nextObjectId = 0;
MovingObject.X = 'X';
MovingObject.Y = 'Y';

MovingObject.prototype.config = {
	speed: 0,
	rotSpeed: 0
};

MovingObject.prototype.width = 0;
MovingObject.prototype.height = 0;
MovingObject.prototype.x = 0;
MovingObject.prototype.y = 0;
MovingObject.prototype.z = 0;
MovingObject.prototype.rot = 0;
MovingObject.prototype.speed = 0;
MovingObject.prototype.rotSpeed = 0;
MovingObject.prototype.getImageCallback = null;

MovingObject.prototype.moveForward = function() {
	this.speed = this.config.speed;
};

MovingObject.prototype.moveBackwards = function() {
	this.speed = this.config.speed * -1;
};

MovingObject.prototype.stopMoving = function() {
	this.speed = 0;
};

MovingObject.prototype.rotateLeft = function() {
	this.rotSpeed = this.config.rotSpeed * -1;
};

MovingObject.prototype.rotateRight = function() {
	this.rotSpeed = this.config.rotSpeed;
};

MovingObject.prototype.stopRotating = function() {
	this.rotSpeed = 0;
};

MovingObject.prototype.getPositionInTime = function(dt) {
	var position = {};
	position.rot = this.rot + this.rotSpeed * dt;
	var s = this.speed * dt;
	position.x = this.x + s * Math.cos(position.rot);
	position.y = this.y + s * Math.sin(position.rot);
	return position;
};

MovingObject.prototype.updatePosition = function(dt) {
	var position = this.getPositionInTime(dt);
	this.rot = position.rot;
	this.x = position.x;
	this.y = position.y;
};

MovingObject.prototype.attachToUpdater = function(updater) {
	this.updaterId = updater.addObject(this);
	this.updater = updater;
	return this.updaterId;
};

MovingObject.prototype.detachFromUpdater = function() {
	if(this.updater !== undefined) {
		this.updater.removeItem(this.updaterId);
		delete this.updater;
		delete this.updaterId;
	}
};

MovingObject.prototype.getHalfWidth = function() {
	if (!this.halfWidth) {
		this.halfWidth = this.width / 2;
	}
	return this.halfWidth;
};

MovingObject.prototype.getHalfHeight = function() {
	if (!this.halfHight) {
		this.halfHeight = this.height / 2;
	}
	return this.halfHeight;
};

MovingObject.prototype.getHalfDiagonal = function() {
	if (!this.halfDiagonal) {
		this.halfDiagonal = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / 2;
	}
	return this.halfDiagonal;
};

MovingObject.prototype.getDiagonalAngle = function() {
	if (!this.diagonalAngle) {
		this.diagonalAngle = Math.asin(this.getHalfHeight() / this.getHalfDiagonal());
	}
	return this.diagonalAngle;
};

MovingObject.prototype.edgeCoordinatesFuncs = {
	A: {
		X: function() {
			return this.x + this.getHalfDiagonal() * Math.cos(Math.PI + this.getDiagonalAngle() + this.rot);
		},
		Y: function() {
			return this.y + this.getHalfDiagonal() * Math.sin(Math.PI + this.getDiagonalAngle() + this.rot);
		}
	},
	B: {
		X: function() {
			return this.x + this.getHalfDiagonal() * Math.cos(-this.getDiagonalAngle() + this.rot);
		},
		Y: function() {
			return this.y + this.getHalfDiagonal() * Math.sin(-this.getDiagonalAngle() + this.rot);
		}
	},
	C: {
		X: function() {
			return this.x + this.getHalfDiagonal() * Math.cos(this.getDiagonalAngle() + this.rot);
		},
		Y: function() {
			return this.y + this.getHalfDiagonal() * Math.sin(this.getDiagonalAngle() + this.rot);
		}
	},
	D: {
		X: function() {
			return this.x + this.getHalfDiagonal() * Math.cos(Math.PI - this.getDiagonalAngle() + this.rot);
		},
		Y: function() {
			return this.y + this.getHalfDiagonal() * Math.sin(Math.PI - this.getDiagonalAngle() + this.rot);
		}
	}
};

MovingObject.prototype.getPlaneInTime = function(dt) {
	var position = this.getPositionInTime(dt);
	position.width = this.width;
	position.height = this.height;
	position.edgeCoordinatesFuncs = this.edgeCoordinatesFuncs;
	position.getHalfDiagonal = this.getHalfDiagonal;
	position.getDiagonalAngle = this.getDiagonalAngle;
	position.getHalfHeight = this.getHalfHeight;
	
	return new Geometry.Rectangle(
		new Geometry.Point(this.getEdge.call(position, 'A', true), this.getEdge.call(position, 'A', false)),
		new Geometry.Point(this.getEdge.call(position, 'B', true), this.getEdge.call(position, 'B', false)),
		new Geometry.Point(this.getEdge.call(position, 'C', true), this.getEdge.call(position, 'C', false)),
		new Geometry.Point(this.getEdge.call(position, 'D', true), this.getEdge.call(position, 'D', false))
	);
};


MovingObject.prototype.getEdge = function(edge, x) {
	var coord = x ? 'X' : 'Y';
	return Math.round(this.edgeCoordinatesFuncs[edge][coord].call(this));
};

MovingObject.prototype.getTimeForPositionLinear = function(value, x) {
	if (
		(x && (value - this.x) * this.speed * Math.cos(this.rot) > 0) // check if same horizontal direction
		|| (!x && (value - this.y) * this.speed * Math.sin(this.rot) > 0) // check if same vertical direction
	) {
		var edges = this.speed > 0
				? [this.getEdge('B', x), this.getEdge('C', x)]
				: [this.getEdge('D', x), this.getEdge('A', x)];
		var func = x ? 'cos' : 'sin';
		var results = edges.map(function(edge) {
			return Math.abs((value - edge) / (this.speed * Math[func](this.rot)));
		}, this);
		return Math.min.apply(Math, results);
	}
	return false;
};

MovingObject.prototype.coversCoordinate = function(value, x) {
	var a = this.getEdge('A', x);
	var b = this.getEdge('B', x);
	var c = this.getEdge('C', x);
	var d = this.getEdge('D', x);
	
	return  (value >= Math.min(a, c) && value <= Math.max(a, c))
			|| (value >= Math.min(b, d) && value <= Math.max(b, d));
};

MovingObject.prototype.getTimeForPosition = function(value, x) {
	if (this.speed === 0 && this.rotSpeed === 0) {
		// Not moving
		return this.coversCoordinate(value, x) ? 0 : false;
	}
	if (Math.abs(this.speed) > 0 && this.rotSpeed === 0) {
		// Linear movement
		return this.getTimeForPositionLinear(value, x);
	} else {
		// Rotating movement

	}
};

MovingObject.prototype.getTimeForDistance = function(distance) {
	return distance / Math.abs(this.speed);
};

MovingObject.prototype.getEdgePoint = function(edgeName) {
	return new Geometry.Point(this.getEdge(edgeName, true), this.getEdge(edgeName, false));
};

MovingObject.prototype.getFrontEdgesNames = function() {
	return this.speed < 0 ? ['A', 'D'] : ['B', 'C'];
};

MovingObject.prototype.getBackEdgesNames = function() {
	return this.speed >= 0 ? ['A', 'D'] : ['B', 'C'];
};

MovingObject.prototype.getFrontLine = function() {
	var edgeNames = this.getFrontEdgesNames();
	return new Geometry.Line(this.getEdgePoint(edgeNames[0]), this.getEdgePoint(edgeNames[1]));
};

MovingObject.prototype.getTimeToPoint = function(point) {
	return this.getTimeForDistance(this.getFrontLine().getDistanceToPoint(point));
};



