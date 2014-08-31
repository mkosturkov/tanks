function CollidableObject() {};

CollidableObject.prototype = new MovingObject();

CollidableObject.prototype.getHalfWidth = function() {
	if (!this.halfWidth) {
		this.halfWidth = this.width / 2;
	}
	return this.halfWidth;
};

CollidableObject.prototype.getHalfHeight = function() {
	if (!this.halfHight) {
		this.halfHeight = this.height / 2;
	}
	return this.halfHeight;
};

CollidableObject.prototype.getHalfDiagonal = function() {
	if (!this.halfDiagonal) {
		this.halfDiagonal = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / 2;
	}
	return this.halfDiagonal;
};

CollidableObject.prototype.getDiagonalAngle = function() {
	if (!this.diagonalAngle) {
		this.diagonalAngle = Math.asin(this.getHalfHeight() / this.getHalfDiagonal());
	}
	return this.diagonalAngle;
};

CollidableObject.prototype.edgeCoordinatesFuncs = {
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

CollidableObject.prototype.getPlaneInTime = function(dt) {
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


CollidableObject.prototype.getEdge = function(edge, x) {
	var coord = x ? 'X' : 'Y';
	return Math.round(this.edgeCoordinatesFuncs[edge][coord].call(this));
};

CollidableObject.prototype.getTimeForPositionLinear = function(value, x) {
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

CollidableObject.prototype.coversCoordinate = function(value, x) {
	var a = this.getEdge('A', x);
	var b = this.getEdge('B', x);
	var c = this.getEdge('C', x);
	var d = this.getEdge('D', x);
	
	return  (value >= Math.min(a, c) && value <= Math.max(a, c))
			|| (value >= Math.min(b, d) && value <= Math.max(b, d));
};

CollidableObject.prototype.getTimeForPosition = function(value, x) {
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

CollidableObject.prototype.getTimeForDistance = function(distance) {
	return distance / Math.abs(this.speed);
};

CollidableObject.prototype.getEdgePoint = function(edgeName) {
	return new Geometry.Point(this.getEdge(edgeName, true), this.getEdge(edgeName, false));
};

CollidableObject.prototype.getFrontEdgesNames = function() {
	return this.speed < 0 ? ['A', 'D'] : ['B', 'C'];
};

CollidableObject.prototype.getBackEdgesNames = function() {
	return this.speed >= 0 ? ['A', 'D'] : ['B', 'C'];
};

CollidableObject.prototype.getFrontLine = function() {
	var edgeNames = this.getFrontEdgesNames();
	return new Geometry.Line(this.getEdgePoint(edgeNames[0]), this.getEdgePoint(edgeNames[1]));
};

CollidableObject.prototype.getTimeToPoint = function(point) {
	return this.getTimeForDistance(this.getFrontLine().getDistanceToPoint(point));
};