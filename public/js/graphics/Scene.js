'use strict';
function Scene(timerFunctions, canvas) {
	MovingObjectsUpdater.call(this);
	this.timerFunctions = timerFunctions;
	if(canvas) {
		this.setCanvas(canvas);
	}
}

Scene.prototype = new MovingObjectsUpdater();

Scene.prototype.objectsSorted = false;

Scene.prototype.sortObjects = function() {
	this.bjects.sort(function(a, b) {
		return a.z > b.z ? 1 : -1;
	});
	this.objectsSorted = true;
};

Scene.prototype.addObject = function(object) {
	MovingObjectsUpdater.addObject.call(this, object);
	if (this.intervalHandler) {
		this.sortObjects();
	} else {
		this.objectsSorted = false;
	}
};

Scene.prototype.setCanvas = function(canvas) {
	this.canvas = canvas;
	this.canvasContext = canvas.getContext('2d');
	this.canvasContext.fillStyle = '#000000';
};

Scene.prototype.drawObject = function(drawObject) {
	this.canvasContext.save();
	var offsetX = drawObject.object.width / 2;
	var offsetY = drawObject.object.height / 2;
	this.canvasContext.translate(drawObject.object.x, drawObject.object.y);
	this.canvasContext.rotate(drawObject.object.rot);
	this.canvasContext.drawImage(drawObject.object.getImageCallback(), -offsetX, -offsetY);
	this.canvasContext.restore();
};

Scene.prototype.drawFrame = function() {
	this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.updatePositions();
	this.drawObjects.forEach(this.drawObject.bind(this));
};

Scene.prototype.start = function() {
	if (!this.objectsSorted) {
		this.sortObjects();
	}
	this.intervalHandler = this.timerFunctions.setInterval(this.drawFrame.bind(this), 20);
};

Scene.prototype.stop = function() {
	this.timerFunctions.clearInterval(this.intervalHandler);
	this.intervalHandler = null;
};
	