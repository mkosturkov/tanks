function CollisionDetector(sceneWidth, sceneHeight, collisionHandler) {
	this.sceneWidth = sceneWidth;
	this.sceneHeight = sceneHeight;
	this.collisionHandler = collisionHandler;
}

CollisionDetector.TRAJECTORY_TYPE_LINEAR = 1;
CollisionDetector.TRAJECTORY_TYPE_ROTATING = 2;

CollisionDetector.prototype.collidableItems = {};

CollisionDetector.prototype.addItem = function(movingObject) {
	return new CollisionDetector.CollidableItem(this, movingObject);	
};

CollisionDetector.prototype.removeItem = function(id) {
	if(this.collidableItems[id]) {
		this.collidableItems[id].remove();
	}
};

CollisionDetector.CollidableItem = function(detector, movingObject) {
	this.detector = detector;
	this.movingObject = movingObject;
	this.id = CollisionDetector.CollidableItem.nextCollidableId++;
	this.detector.collidableItems[this.id] = this;
	
	this.trajectoryType = CollisionDetector.TRAJECTORY_TYPE_LINEAR;
	
	// Figure out when the object is going to hit the map edge
	var times = [
		this.movingObject.getTimeForPosition(0, false),
		this.movingObject.getTimeForPosition(this.detector.sceneWidth, true),
		this.movingObject.getTimeForPosition(this.detector.sceneHeight, false),
		this.movingObject.getTimeForPosition(0, true)
	];
	var trajectoryEndTime;
	for (var i = 0; i < 4; i++) {
		if(times[i] !== false && (trajectoryEndTime === undefined || times[i] < trajectoryEndTime)) {
			trajectoryEndTime = times[i];
		}
	}
	
	new CollisionDetector.CollisionPoint(trajectoryEndTime, this.detector.collisionHandler, this);
};

CollisionDetector.CollidableItem.nextCollidableId = 0;

CollisionDetector.CollidableItem.prototype.collisionPoints = {};

CollisionDetector.CollidableItem.prototype.remove = function() {
	for(var i in this.collisionPoints) {
		this.collisionPoints[i].cancel();
	}
	delete this.detector.collidableItems[this.id];
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