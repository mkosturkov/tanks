'use strict';
function Renderer(canvas) {
	MovingObjectsUpdater.call(this);
	if(canvas) {
		this.setCanvas(canvas);
	}
}

Renderer.prototype = new MovingObjectsUpdater();

Renderer.prototype.objectsSorted = false;

Renderer.prototype.sortObjects = function() {
	this.objects.sort(function(a, b) {
		return a.z > b.z ? 1 : -1;
	});
	this.objectsSorted = true;
};

Renderer.prototype.addObject = function(object) {
	var id = MovingObjectsUpdater.prototype.addObject.call(this, object);
	if (this.intervalHandler) {
		this.sortObjects();
	} else {
		this.objectsSorted = false;
	}
	return id;
};

Renderer.prototype.setCanvas = function(canvas) {
	this.canvas = canvas;
	this.canvasContext = canvas.getContext('2d');
	this.canvasContext.fillStyle = '#000000';
};

Renderer.prototype.drawObject = function(drawObject) {
	this.canvasContext.save();
	var offsetX = drawObject.object.width / 2;
	var offsetY = drawObject.object.height / 2;
	this.canvasContext.translate(drawObject.object.x, drawObject.object.y);
	this.canvasContext.rotate(drawObject.object.rot);
	this.canvasContext.drawImage(drawObject.object.getImageCallback(), -offsetX, -offsetY);
	this.canvasContext.restore();
};

Renderer.prototype.drawFrame = function() {
	this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.updatePositions();
	this.objects.forEach(this.drawObject.bind(this));
};

Renderer.prototype.start = function() {
	if (!this.objectsSorted) {
		this.sortObjects();
	}
	this.intervalHandler = Renderer.timerFunctions.setInterval(this.drawFrame.bind(this), 20);
};

Renderer.prototype.stop = function() {
	Renderer.timerFunctions.clearInterval(this.intervalHandler);
	this.intervalHandler = null;
};
	