'use strict'
function MovingObject() {};
	
MovingObject.prototype.x = 0;
MovingObject.prototype.y = 0;
MovingObject.prototype.z = 0;
MovingObject.prototype.rot = 0;
MovingObject.prototype.speed = 0;
MovingObject.prototype.rotSpeed = 0;
MovingObject.prototype.getImageCallback = null;
	
MovingObject.prototype.updatePosition = function(dt) {
	this.rot += this.rotSpeed * dt;
	var s = this.speed * dt;
	this.x += s * Math.cos(this.rot);
	this.y += s * Math.sin(this.rot);
};;