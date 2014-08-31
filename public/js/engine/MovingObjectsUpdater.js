function MovingObjectsUpdater() {
	this.objects = [];
};

MovingObjectsUpdater.prototype.lastUpdateTime = 0;
MovingObjectsUpdater.prototype.nextObjectId = 0;

MovingObjectsUpdater.prototype.addObject = function(object) {
	var id = this.nextObjectId++;
	this.drawObjects.push({
		object: object,
		id: id
	});
	return id;
};

MovingObjectsUpdater.prototype.removeObject = function(id) {
	for (var i = 0; i < this.objects.length; i++) {
		if (this.objects[i].id === id) {
			this.objects.splice(i, 1);
			return true;
		}
	}
	return false;
};

MovingObjectsUpdater.prototype.updatePositions = function() {
	var currentTime = (new Date()).getTime();
	var dt = 0;
	if (this.lastUpdateTime > 0) {
		dt = currentTime - this.lastUpdateTime;
	}
	this.objects.forEach(function(object) {
		object.object.updatePosition(dt);
	});
	this.lastUpdateTime = currentTime;
};