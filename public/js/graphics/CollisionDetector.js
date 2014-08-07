function CollisionDetector(sceneWidth, sceneHeight, collisionHandler) {
	this.sceneWidth = sceneWidth;
	this.sceneHeight = sceneHeight;
	this.collisionHandler = collisionHandler;
}

CollisionDetector.TRAJECTORY_TYPE_LINEAR = 1;
CollisionDetector.TRAJECTORY_TYPE_ROTATING = 2;

CollisionDetector.prototype.collidableItems = {};
CollisionDetector.prototype.nextCollidableId = 0;


CollisionDetector.prototype.createLinearTrajectoryItem = function(collidable) {
	collidable.trajectoryType = CollisionDetector.TRAJECTORY_TYPE_LINEAR;
	
	// Figure out when the object is going to hit the map edge
	var times = [
		collidable.movingObject.getTimeForPosition(0, false),
		collidable.movingObject.getTimeForPosition(this.sceneWidth, true),
		collidable.movingObject.getTimeForPosition(this.sceneHeight, false),
		collidable.movingObject.getTimeForPosition(0, true)
	];
	var trajectoryEndTime;
	for (var i = 0; i < 4; i++) {
		if(times[i] !== false && (trajectoryEndTime === undefined || times[i] < trajectoryEndTime)) {
			trajectoryEndTime = times[i];
		}
	}
	
	new CollisionDetector.CollisionPoint(trajectoryEndTime, this.collisionHandler, collidable);
	
	return collidable;
};

CollisionDetector.prototype.createRotatingTrajectoryItem = function(movingObject) {
	
};

CollisionDetector.prototype.addItem = function(movingObject) {
	// Determine the type of trajectory - linear or rotating
	var collidable = {};
	collidable.movingObject = movingObject;
	collidable.collisionPoints = {};
	movingObject.rotSpeed === 0 ? this.createLinearTrajectoryItem(collidable) : this.createRotatingTrajectoryItem(collidable);
	collidable.id = this.nextCollidableId++;
	this.collidableItems[collidable.id] = collidable;
	return collidable.id;
};

CollisionDetector.prototype.removeItem = function(id) {
	if(!this.collidableItems[id]) {
		return false;
	}
	for(var i in this.collidableItems[id].collisionPoints) {
		this.collidableItems[id].collisionPoints[i].cancel();
	}
	delete this.collidableItems[id];
};

CollisionDetector.CollisionPoint = function(period, callback, colidableA, colidableB) {
	this.period = period;
	this.callback = callback;
	this.colidableA = colidableA;
	this.colidableB = colidableB;
	this.id = CollisionDetector.CollisionPoint.collisionPointNextId++;
	this.colidableA.collisionPoints[this.id] = this;
	if(this.colidableB) {
		this.colidableB.collisionPoionts[this.id] = this;
	}
	this.timerId = setTimeout(this.execute.bind(this), period);
};

CollisionDetector.CollisionPoint.collisionPointNextId = 0;

CollisionDetector.CollisionPoint.prototype.removeFromLists = function() {
	delete this.colidableA.collisionPoints[this.id];
	if(this.colidableB) {
		delete this.colidableB.collisionPoionts[this.id];
	}
};

CollisionDetector.CollisionPoint.prototype.cancel = function() {
	clearInterval(this.timerId);
	this.removeFromLists();
};

CollisionDetector.CollisionPoint.prototype.execute = function() {
	this.removeFromLists();
	this.callback(this.colidableA, this.colidableB);
};