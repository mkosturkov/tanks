'use strict';
function Scene() {
}

Scene.prototype.lastDrawTime = 0;
Scene.prototype.drawObjects = [];
Scene.prototype.drawObjectsNextId = 0;
Scene.prototype.drawObjectsSorted = false;

Scene.prototype.setCanvas = function(canvas) {
	this.canvas = canvas;
	this.canvasContext = canvas.getContext('2d');
	this.canvasContext.fillStyle = '#ffffff';
};

Scene.prototype.setTimeout = function(callback, time) {
};
Scene.prototype.setInterval = function(callback, interval) {
};
Scene.prototype.clearTimeout = function(timeoutId) {
};
Scene.prototype.clearInterval = function(intervalId) {
};

Scene.prototype.sortDrawObjects = function() {
	this.drawObjects.sort(function(a, b) {
		return a.z > b.z ? 1 : -1;
	});
	this.drawObjectsSorted = true;
};

Scene.prototype.addDrawObject = function(drawObject) {
	var id = this.drawObjectsNextId++;
	this.drawObjects.push({
		object: drawObject,
		id: id
	});
	if (this.intervalHandler) {
		sortDrawObjects();
	} else {
		this.drawObjectsSorted = false;
	}
	return id;
};

Scene.prototype.removeDrawObject = function(id) {
	for (var i = 0; i < this.drawObjects.length; i++) {
		if (this.drawObjects[i].id === id) {
			this.drawObjects.splice(i, 1);
			return true;
		}
	}
	return false;
};

Scene.prototype.drawObject = function(dt, drawObject) {
	if (typeof drawObject.object.getImageCallback !== 'function') {
		return;
	}
	var image = drawObject.object.getImageCallback(dt);
	drawObject.object.updatePosition(dt);

	this.canvasContext.save();
	var offsetX = image.width / 2;
	var offsetY = image.height / 2;
	this.canvasContext.translate(drawObject.object.x + offsetX, drawObject.object.y + offsetY);
	this.canvasContext.rotate(drawObject.object.rot);
	this.canvasContext.drawImage(image, -offsetX, -offsetY);
	this.canvasContext.restore();
};

Scene.prototype.drawFrame = function() {
	this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
	var currentTime = (new Date()).getTime();
	var dt = 0;
	if (this.lastDrawTime > 0) {
		dt = currentTime - this.lastDrawTime;
	}
	this.drawObjects.forEach(this.drawObject.bind(this, dt));
	this.lastDrawTime = currentTime;
};

Scene.prototype.start = function() {
	if (!this.drawObjectsSorted) {
		this.sortDrawObjects();
	}
	this.intervalHandler = this.setInterval(this.drawFrame.bind(this), 20);
};

Scene.prototype.stop = function() {
	this.clearInterval(intervalHandler);
	this.intervalHandler = null;
};
	