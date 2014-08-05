function CollisionDetector(sceneWidth, sceneHeight) {
	this.sceneWidth = sceneWidth;
	this.sceneHeight = sceneHeight;
}

CollisionDetector.TRAJECTORY_TYPE_LINEAR = 1;
CollisionDetector.TRAJECTORY_TYPE_ROTATING = 2;

CollisionDetector.prototype.collidableItems = {};
CollisionDetector.prototype.nextCollidableId = 0;


CollisionDetector.prototype.createLinearTrajectoryItem = function(movingObject) {
	var collidable = {};
	collidable.trajectoryType = CollisionDetector.TRAJECTORY_TYPE_LINEAR;
	collidable.rot = movingObject.rot;
	collidable.x11 = movingObject.x;
	collidable.x12 = movingObject.x + movingObject.width;
	collidable.y11 = movingObject.y;
	collidable.y12 = movingObject.y + movingObject.height;
	
	// Figure out when the object is going to hit the map edge
	var times = [
		movingObject.getTimeForPosition(0, false),
		movingObject.getTimeForPosition(this.sceneWidth, true),
		movingObject.getTimeForPosition(this.sceneHeight, false),
		movingObject.getTimeForPosition(0, true)
	];
	var trajectoryEndTime;
	for (var i = 0; i < 4; i++) {
		if(times[i] !== false && (trajectoryEndTime === undefined || times[i] < trajectoryEndTime)) {
			trajectoryEndTime = times[i];
		}
	}
	
	this.timerId = window.setTimeout(function() {
		console.log('hit', trajectoryEndTime);
	}, trajectoryEndTime);
	console.log('Hit in ' + trajectoryEndTime);
	
	return collidable;
};

CollisionDetector.prototype.createRotatingTrajectoryItem = function(movingObject) {
	
};

CollisionDetector.prototype.addItem = function(movingObject) {
	
	// Determine the type of trajectory - linear or rotating
	var collidable = movingObject.rotSpeed === 0
					? this.createLinearTrajectoryItem(movingObject)
					: this.createRotatingTrajectoryItem(movingObject);
	var id = this.nextCollidableId++;
	this.collidableItems[id] = collidable;
	return id;
};

CollisionDetector.prototype.removeItem = function(id) {
	if(this.collidableItems[id]) {
		delete this.collidableItems[id];
		window.clearInterval(this.timerId);
		console.log('Removed hit');
	}
};