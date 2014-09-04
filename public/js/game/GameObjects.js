function BlueTank(id) {
	MovingObject.call(this, id);
	this.config = {
		speed: 0.1,
		rotSpeed: 0.1
	};
	this.width = 200;
	this.height = 100;
};

BlueTank.prototype = new MovingObject();

BlueTank.prototype.getImageCallback = function() {
	if(this.image === undefined) {
		this.image = new Image(200, 100);
		this.image.src = '../img/rect200x100darkBlue.png';
	}
	return this.image;
};

function GreenTank(id) {
	MovingObject.call(this, id);
	this.config = {
		speed: 0.05,
		rotSpeed: 0.1
	};
	this.width = 100;
	this.height = 100;
};

GreenTank.prototype = new MovingObject();

GreenTank.prototype.getImageCallback = function() {
	if(this.image === undefined) {
		this.image = new Image(100, 100);
		this.image.src = '../img/rect100x100darkGreen.png';
	}
	return this.image;
};

