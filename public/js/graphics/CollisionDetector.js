function CollisionDetector(sceneWidth, sceneHeight, collisionHandler, scene) {
	this.sceneWidth = sceneWidth;
	this.sceneHeight = sceneHeight;
	this.collisionHandler = collisionHandler;
	this.scene = scene;
	
	this.collidableItems = {};
}

CollisionDetector.TRAJECTORY_TYPE_LINEAR = 1;
CollisionDetector.TRAJECTORY_TYPE_ROTATING = 2;

CollisionDetector.prototype.haveCollisionInTime = function(dt, movingObject1, movingObject2) {
	var edges = movingObject1.getEdgesInTime(dt);
	var plane1 = new Geometry.Rectangle(edges.A, edges.B, edges.C, edges.D);
	edges = movingObject2.getEdgesInTime(dt);
	var plane2 = new Geometry.Rectangle(edges.A, edges.B, edges.C, edges.D);
	return plane1.getCrossPoints(plane2).length > 0;
};

CollisionDetector.prototype.getCollisionInPointTime = function(point, movingObject1, movingObject2) {
	var dt = movingObject1.getTimeForPosition(point.x, true);
	if(dt === false) {
		return false;
	}
	var dt2 = movingObject2.getTimeForPosition(point.x, true);
	if(dt2 === false) {
		return false;
	}
	
	var minDt = Math.min(dt, dt2);
	var maxDt = Math.max(dt, dt2);
	if(this.haveCollisionInTime(minDt, movingObject1, movingObject2)) {
		return minDt;
	}
	if(this.haveCollisionInTime(maxDt, movingObject1, movingObject2)) {
		return maxDt;
	}
	return false;
};

CollisionDetector.prototype.addItem = function(movingObject) {
	var item = new CollisionDetector.CollidableItem(this, movingObject);
	this.scene.updatePositions();
	
	// Walk through all the current collidables and check for intersections
	for(var x in this.collidableItems) {
		if(this.collidableItems[x] === item) {
			continue;
		}
		var crossPoints = this.collidableItems[x].plane.getCrossPoints(item.plane);
		if(crossPoints.length === 0) {
			continue; // no intersections
		}
		
		// Find the times for all intersections and select the closest to set a collision point
		var times = [];
		for(var i = 0; i < crossPoints.length; i++) {
			var time = this.getCollisionInPointTime(crossPoints[i], movingObject, this.collidableItems[x].movingObject);
			if(time !== false) {
				times.push(time);
			}
		}
		if(times.length > 0) {
			new CollisionDetector.CollisionPoint(
				Math.min.apply(Math, times),
				this.collisionHandler,
				item,
				this.collidableItems[x]
			);
		}
	}
	return item.id;
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
	this.collisionPoints = {};
	
	this.trajectoryType = CollisionDetector.TRAJECTORY_TYPE_LINEAR;
	
	if(movingObject.speed === 0) {
		this.plane = new Geometry.Rectangle(
			new Geometry.Point(
				this.movingObject.getEdge('A', true),
				this.movingObject.getEdge('A', false)
			),
			new Geometry.Point(
				this.movingObject.getEdge('B', true),
				this.movingObject.getEdge('B', false)
			),
			new Geometry.Point(
				this.movingObject.getEdge('C', true),
				this.movingObject.getEdge('C', false)
			),
			new Geometry.Point(
				this.movingObject.getEdge('D', true),
				this.movingObject.getEdge('D', false)
			)
		);
		return;
	}
	
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
	
	// Calculate the edges of the collidable object
	var distance = this.movingObject.speed * trajectoryEndTime;
	var sindistance = distance * Math.sin(this.movingObject.rot);
	var cosdistance = distance * Math.cos(this.movingObject.rot);

	if(movingObject.speed > 0) {
		this.plane = new Geometry.Rectangle(
			new Geometry.Point(
				this.movingObject.getEdge('A', true),
				this.movingObject.getEdge('A', false)
			),
			new Geometry.Point(
				this.movingObject.getEdge('B', true) + cosdistance,
				this.movingObject.getEdge('B', false) + sindistance
			),
			new Geometry.Point(
				this.movingObject.getEdge('C', true) + cosdistance,
				this.movingObject.getEdge('C', false) + sindistance
			),
			new Geometry.Point(
				this.movingObject.getEdge('D', true),
				this.movingObject.getEdge('D', false)
			)
		);
	} else {
		this.plane = new Geometry.Rectangle(
			new Geometry.Point(
				this.movingObject.getEdge('A', true) + cosdistance,
				this.movingObject.getEdge('A', false) + sindistance
			),
			new Geometry.Point(
				this.movingObject.getEdge('B', true),
				this.movingObject.getEdge('B', false)
			),
			new Geometry.Point(
				this.movingObject.getEdge('C', true),
				this.movingObject.getEdge('C', false)
			),
			new Geometry.Point(
				this.movingObject.getEdge('D', true) + cosdistance,
				this.movingObject.getEdge('D', false) + sindistance
			)
		);
	}
};

CollisionDetector.CollidableItem.nextCollidableId = 0;

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
		this.colidableB.collisionPoints[this.id] = this;
	}
	this.timerId = setTimeout(this.execute.bind(this), period);
};

CollisionDetector.CollisionPoint.collisionPointNextId = 0;

CollisionDetector.CollisionPoint.prototype.removeFromLists = function() {
	delete this.colidableA.collisionPoints[this.id];
	if(this.colidableB) {
		delete this.colidableB.collisionPoints[this.id];
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