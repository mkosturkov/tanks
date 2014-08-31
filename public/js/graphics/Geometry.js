'use strict';
Geometry = {};

Geometry.Point = function(x, y) {
	this.x = x;
	this.y = y;
};

Geometry.Point.prototype.getDistanceToPoint = function(point) {
	return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
};

Geometry.Line = function(point1, point2) {
	if(point1.x < point2.x) {
		this.point1 = point1;
		this.point2 = point2;
	} else {
		this.point1 = point2;
		this.point2 = point1;
	}
};

Geometry.Line.prototype.getA = function() {
	if(this.a === undefined) {
		this.a = (this.point2.y - this.point1.y) / (this.point2.x - this.point1.x);
	}
	return this.a;
};

Geometry.Line.prototype.getB = function() {
	if(this.b === undefined) {
		if(Math.abs(this.getA()) !== Infinity) {
			this.b = this.point1.y - this.getA() * this.point1.x;
		} else { // Vertical line
			this.b = this.point1.x;
		}
	}
	return this.b;
};

Geometry.Line.prototype.getLength = function() {
	if(this.length === undefined) {
		this.length = this.point1.getDistanceToPoint(this.point2);
	}
	return this.length;
};

Geometry.Line.prototype.getCrossPoints = function(line, ignoreLengths) {
	if(this.getA() === line.getA()) {
		if(this.getB() !== line.getB() && Math.abs(this.getA()) !== Infinity) {
			// Lines are paralel
			return false;
		}
		// Lines match
		if(!ignoreLengths) {
			return Infinity;
		}
		// Check if they cover each other
		if(this.point1.x < line.point1.x) {
			var leftLine = this;
			var rightLine = line;
		} else {
			var leftLine = line;
			var rightLine = this;
		}
		if(leftLine.point2.x < rightLine.point1.x) {
			// They do not cover
			return false;
		}
		// They cover
		return Infinity;
	}
	
	// Lines cross
	if(Math.abs(this.getA()) === Infinity) {
		// this is paralel to y-axis
		var x = this.point1.x;
		var y = line.getA() * x + line.getB();
	} else if (Math.abs(line.getA()) === Infinity) {
		// line is paralel to y-axis
		var x = line.point1.x;
		var y = this.getA() * x + this.getB();
	} else {
		// neither is paralel to y-axis
		var x = (line.getB() - this.getB()) / (this.getA() - line.getA());
		var y = this.getA() * x + this.getB();
	}
	
	// Check if the cross point is in the range of the lines
	if(
		ignoreLengths || (
			x >= this.point1.x && x <= this.point2.x
			&& x >= line.point1.x && x <= line.point2.x
			&& y >= Math.min(this.point1.y, this.point2.y) && y <= Math.max(this.point1.y, this.point2.y)
			&& y >= Math.min(line.point1.y, line.point2.y) && y <= Math.max(line.point1.y, line.point2.y)
		)
	) {
		return new Geometry.Point(x, y);
	}
	// Outside of the given boundaries of the lines
	return false;
};

Geometry.Line.prototype.getDistanceToPoint = function(point) {
	return (new Geometry.Triangle(this.point1, this.point2, point)).getAltitude('C');
};

Geometry.Line.prototype.getAngle = function(line) {	
	var a = Math.atan(this.getA());
	var b = Math.atan(line.getA());
	return a > b ? a - b : b - a;
};

Geometry.Plane = function() {
	var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R'];
	this.points = {};
	this.lines = {};
	for (var i = 0; i < arguments.length; i++) {
		this.points[letters[i]] = arguments[i];
		if(i + 1 === arguments.length) {
			this.lines[letters[i] + letters[0]] = new Geometry.Line(arguments[i], arguments[0]);
		} else {
			this.lines[letters[i] + letters[i + 1]] = new Geometry.Line(arguments[i], arguments[i + 1]);
		}
	}
};

Geometry.Plane.prototype.getCrossPoints = function(plane) {
	var points = [];
	for(var i in this.lines) {
		for(var j in plane.lines) {
			var crossPoints = this.lines[i].getCrossPoints(plane.lines[j]);
			if(crossPoints !== false) {
				points.push(crossPoints);
			}
		}
	}
	return points;
};

Geometry.Triangle = function(A, B, C) {
	Geometry.Plane.call(this, A, B, C);
	this.angles = {};
	this.altitudes = {};
};

Geometry.Triangle.prototype = new Geometry.Plane();

Geometry.Triangle.prototype.getAngle = function(angleName) {
	switch (angleName) {
		case 'A':
			var a = this.lines.BC;
			var b = this.lines.CA;
			var c = this.lines.AB;
			break;
		case 'B':
			var a = this.lines.CA;
			var b = this.lines.AB;
			var c = this.lines.BC;
			break;
		case 'C':
			var a = this.lines.AB;
			var b = this.lines.CA;
			var c = this.lines.BC;
			break;
		default:
			throw 'Unknown angle';
	}
	if(this.angles[angleName] === undefined) {
		this.angles[angleName] = Math.acos(
			(Math.pow(b.getLength(), 2) + Math.pow(c.getLength(), 2) - Math.pow(a.getLength(), 2)) /
			(2 * b.getLength() * c.getLength())
		);
	}
	return this.angles[angleName];
};

Geometry.Triangle.prototype.getAltitude = function(angleName) {
	switch (angleName) {
		case 'A':
			var side = this.lines.BC;
			break;
		case 'B':
			var side = this.lines.CA;
			break;
		case 'C':
			var side = this.lines.AB;
			break;
		default:
			throw 'Unknown angle';
	}
	if(this.altitudes[angleName] === undefined) {
		var a = this.lines.BC.getLength();
		var b = this.lines.CA.getLength();
		var c = this.lines.AB.getLength();
		var s = (a + b + c) / 2;
		this.altitudes[angleName] = 2 * Math.sqrt(s * (s - a) * (s - b) * (s - c)) / side.getLength();
	}
	return this.altitudes[angleName];
};

Geometry.Rectangle = function (A, B, C, D) {
	Geometry.Plane.call(this, A, B, C, D);
};

Geometry.Rectangle.prototype = new Geometry.Plane();

Geometry.Rectangle.prototype.containsPoint = function(point) {
	var data = [
		{
			pointA: this.points.A,
			pointB: this.points.B,
			side: this.lines.BC 
		},
		{
			pointA: this.points.C,
			pointB: this.points.D,
			side: this.lines.BC
		},
		{
			pointA: this.points.B,
			pointB: this.points.C,
			side: this.lines.AB
		},
		{
			pointA: this.points.A,
			pointB: this.points.D,
			side: this.lines.AB
		}
	];
	for(var i = 0; i < data.length; i++) {
		var triangle = new Geometry.Triangle(data[i].pointA, data[i].pointB, point);
		if(triangle.getAltitude('C') > data[i].side.getLength()) {
			return false;
		}
	}
	return true;
};