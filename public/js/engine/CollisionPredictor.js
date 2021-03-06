'use strict';
function CollisionPredictor(sceneWidth, sceneHeight, collisionHandler, updater) {
	this.sceneWidth = sceneWidth;
	this.sceneHeight = sceneHeight;
	this.collisionHandler = collisionHandler;
	this.updater = updater;
	
	this.collisionTrajectories = {};
}

CollisionPredictor.TRAJECTORY_TYPE_LINEAR = 1;
CollisionPredictor.TRAJECTORY_TYPE_ROTATING = 2;

CollisionPredictor.prototype.haveCollisionInTime = function(dt, movingObject1, movingObject2) {
	var plane1 = movingObject1.getPlaneInTime(dt);
	var plane2 = movingObject2.getPlaneInTime(dt);
	return plane1.getCrossPoints(plane2).length > 0;
};

CollisionPredictor.prototype.getCollisionTimes = function(incomming, target) {
		var times = [];
		var pointTimes = {
			A: {point: incomming.plane.lines.AB.getCrossPoints(target.plane.lines.AB, true)},
			B: {point: incomming.plane.lines.CD.getCrossPoints(target.plane.lines.AB, true)},
			C: {point: incomming.plane.lines.AB.getCrossPoints(target.plane.lines.CD, true)},
			D: {point: incomming.plane.lines.CD.getCrossPoints(target.plane.lines.CD, true)}
		};
		for(var x in pointTimes) {
			if(pointTimes[x].point === Infinity) {
				pointTimes[x].time = Infinity;
			} else if(pointTimes[x].point !== false){
				pointTimes[x].time = incomming.movingObject.getTimeToPoint(pointTimes[x].point);
			}
		}
		
		
		for(var x in pointTimes) {
			if(this.haveCollisionInTime(pointTimes[x].time, incomming.movingObject, target.movingObject)) {
				times.push(pointTimes[x].time);
			}
		}
		
		
//		var product = Math.cos(incomming.movingObject.rot) * incomming.movingObject.speed 
//					* Math.cos(target.movingObject.rot) * target.movingObject.speed;
//		if(product === 0) {
//			product = Math.sin(incomming.movingObject.rot) * incomming.movingObject.speed 
//					* Math.sin(target.movingObject.rot) * target.movingObject.speed;
//		}
//		var sameDirection = product > 0;
//		var orderedPoints = [{}, {}];
//		if(pointTimes.A.time < pointTimes.C.time) {
//			orderedPoints[0].entryTime = pointTimes.A.time;
//			orderedPoints[0].entryPoint = pointTimes.A.point;
//			orderedPoints[0].exitPoint = pointTimes.C.point;
//			orderedPoints[0].targetPointName = sameDirection ? 'A' : 'B';
//		} else {
//			orderedPoints[0].entryTime = pointTimes.C.time;
//			orderedPoints[0].entryPoint = pointTimes.C.point;
//			orderedPoints[0].exitPoint = pointTimes.A.point;
//			orderedPoints[0].targetPointName = sameDirection ? 'D' : 'C';
//		}
//		if(pointTimes.B.time < pointTimes.D.time) {
//			orderedPoints[1].entryTime = pointTimes.B.time;
//			orderedPoints[1].entryPoint = pointTimes.B.point;
//			orderedPoints[1].exitPoint = pointTimes.D.point;
//			orderedPoints[1].targetPointName = sameDirection ? 'A' : 'B';
//		} else {
//			orderedPoints[1].entryTime = pointTimes.D.time;
//			orderedPoints[1].entryPoint = pointTimes.D.point;
//			orderedPoints[1].exitPoint = pointTimes.B.point;
//			orderedPoints[1].targetPointName = sameDirection ? 'D' : 'C';
//		}
//		var crossLine = new Geometry.Line(orderedPoints[0].entryPoint, orderedPoints[0].exitPoint);
//		var angle = Math.PI - crossLine.getAngle(target.plane.lines.AB);
//		var relativeSpeed = Math.abs(incomming.movingObject.speed * Math.cos(angle)) * (sameDirection ? 1 : -1);
//		
//		orderedPoints.forEach(function(point) {
//			var plane = target.movingObject.getPlaneInTime(point.entryTime);
//			var triangle = new Geometry.Triangle(
//				plane.points[point.targetPointName],
//				point.entryPoint,
//				point.exitPoint
//			);
//			var distance = plane.points[point.targetPointName].getDistanceToPoint(point.entryPoint);
//			if(sameDirection) {
//				var coef = triangle.getAngle('B') > Math.PI / 2 ? -1 : 1;
//				var planeOffset = distance * coef;
//				var time = planeOffset / (relativeSpeed - target.movingObject.speed);
//			} else {
//				var time = distance / (Math.abs(relativeSpeed) + Math.abs(target.movingObject.speed));
//			}
//			
//			
//			if(time >= 0) {
//				times.push(point.entryTime + time);
//			}
//		});
		return times;
};

CollisionPredictor.prototype.addItem = function(movingObject) {
	var item = new CollisionPredictor.CollisionTrajectory(this, movingObject);
	
	// Walk through all the current collidables and check for intersections
	for(var x in this.collisionTrajectories) {
		var item2 = this.collisionTrajectories[x];
		if(item2 === item) {	// No need to check for collisions with itself
			continue;
		}
		
		var times = this.getCollisionTimes(item, item2)
						.concat(this.getCollisionTimes(item2, item));
		
		if(times.length > 0) {
			new CollisionPredictor.CollisionPoint(
				Math.min.apply(Math, times),
				this.collisionHandler,
				item,
				this.collisionTrajectories[x]
			);
		}
	}
	return item.id;
};

CollisionPredictor.prototype.removeItem = function(id) {
	if(this.collisionTrajectories[id]) {
		this.collisionTrajectories[id].remove();
	}
};

CollisionPredictor.CollisionTrajectory = function(detector, movingObject) {
	this.detector = detector;
	this.movingObject = movingObject;
	this.id = CollisionPredictor.CollisionTrajectory.nextCollidableId++;
	this.detector.collisionTrajectories[this.id] = this;
	this.collisionPoints = {};
	
	this.trajectoryType = CollisionPredictor.TRAJECTORY_TYPE_LINEAR;
	
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
	new CollisionPredictor.CollisionPoint(trajectoryEndTime, this.detector.collisionHandler, this);
	
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

CollisionPredictor.CollisionTrajectory.nextCollidableId = 0;

CollisionPredictor.CollisionTrajectory.prototype.remove = function() {
	for(var i in this.collisionPoints) {
		this.collisionPoints[i].cancel();
	}
	delete this.detector.collisionTrajectories[this.id];
};



CollisionPredictor.CollisionPoint = function(period, callback, colidableA, colidableB) {
	this.period = period;
	this.callback = callback;
	this.colidableA = colidableA;
	this.colidableB = colidableB;
	this.id = CollisionPredictor.CollisionPoint.collisionPointNextId++;
	this.colidableA.collisionPoints[this.id] = this;
	if(this.colidableB) {
		this.colidableB.collisionPoints[this.id] = this;
	}
	// TODO: Handle immidiate collisions
	this.timerId = setTimeout(this.execute.bind(this), period);
};

CollisionPredictor.CollisionPoint.collisionPointNextId = 0;

CollisionPredictor.CollisionPoint.prototype.removeFromLists = function() {
	delete this.colidableA.collisionPoints[this.id];
	if(this.colidableB) {
		delete this.colidableB.collisionPoints[this.id];
	}
};

CollisionPredictor.CollisionPoint.prototype.cancel = function() {
	clearInterval(this.timerId);
	this.removeFromLists();
};

CollisionPredictor.CollisionPoint.prototype.execute = function() {
	this.removeFromLists();
	this.colidableA.detector.updater.updatePositions();
	this.callback(this.colidableA, this.colidableB);
};