'use strict';
function MovingObject() {

}

MovingObject.X = 'X';
MovingObject.Y = 'Y';

MovingObject.prototype.config = {
	speed: 0,
	rotSpeed: 0
};
MovingObject.prototype.width = 0;
MovingObject.prototype.height = 0;
MovingObject.prototype.x = 0;
MovingObject.prototype.y = 0;
MovingObject.prototype.z = 0;
MovingObject.prototype.rot = 0;
MovingObject.prototype.speed = 0;
MovingObject.prototype.rotSpeed = 0;
MovingObject.prototype.getImageCallback = null;

MovingObject.prototype.moveForward = function() {
	this.speed = this.config.speed;
};

MovingObject.prototype.moveBackwards = function() {
	this.speed = this.config.speed * -1;
};

MovingObject.prototype.stopMoving = function() {
	this.speed = 0;
};

MovingObject.prototype.rotateLeft = function() {
	this.rotSpeed = this.config.rotSpeed * -1;
};

MovingObject.prototype.rotateRight = function() {
	this.rotSpeed = this.config.rotSpeed;
};

MovingObject.prototype.stopRotating = function() {
	this.rotSpeed = 0;
};

MovingObject.prototype.getPositionInTime = function(dt) {
	var position = {};
	position.rot = this.rot + this.rotSpeed * dt;
	var s = this.speed * dt;
	position.x = this.x + s * Math.cos(position.rot);
	position.y = this.y + s * Math.sin(position.rot);
	return position;
};

MovingObject.prototype.updatePosition = function(dt) {
	var position = this.getPositionInTime(dt);
	this.rot = position.rot;
	this.x = position.x;
	this.y = position.y;
};



