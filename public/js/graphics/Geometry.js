Geometry = {};

Geometry.Point = function(x, y) {
	this.x = x;
	this.y = y;
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
		this.length = Math.sqrt(Math.pow(this.point2.x - this.point1.x, 2) + Math.pow(this.point2.y - this.point1.y, 2));
	}
	return this.length;
};

Geometry.Line.prototype.getCrossPoints = function(line) {
	if(this.getA() === line.getA()) {
		if(this.getB() !== line.getB() && Math.abs(this.getA()) !== Infinity) {
			// Lines are paralel
			return false;
		}
		// Lines match. Check if they cover each other
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
		// They cover. Find the leftmost and rightmost common points
		var points = [new Geometry.Point(rightLine.point1.x, rightLine.point1.y)];
		if(leftLine.point2.x <= rightLine.point2.x) {
			// Left line ends somewhere on right line
			points.push(new Geometry.Point(leftLine.point2.x, leftLine.point2.y));
		} else {
			// Right line is showrter than left line. Right line ends on left line
			points.push(new Geometry.Point(rightLine.point2.x, rightLine.point2.y));
		}
		return points;
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
		x >= this.point1.x && x <= this.point2.x
		&& x >= line.point1.x && x <= line.point2.x
		&& y >= Math.min(this.point1.y, this.point2.y) && y <= Math.max(this.point1.y, this.point2.y)
		&& y >= Math.min(line.point1.y, line.point2.y) && y <= Math.max(line.point1.y, line.point2.y)
	) {
		return [new Geometry.Point(x, y)];
	}
	// Outside of the given boundaries of the lines
	return false;
};

Geometry.Triangle = function(A, B, C) {
	this.A = A;
	this.B = B;
	this.C = C;
	
	this.lines = {
		AB: new Geometry.Line(A, B),
		BC: new Geometry.Line(B, C),
		AC: new Geometry.Line(A, C)
	};
	
	this.angles = {};
	this.altitudes = {};
};

Geometry.Triangle.prototype.getAngle = function(angleName) {
	switch (angleName) {
		case 'A':
			var a = this.lines.BC;
			var b = this.lines.AC;
			var c = this.lines.AB;
			break;
		case 'B':
			var a = this.lines.AC;
			var b = this.lines.AB;
			var c = this.lines.BC;
			break;
		case 'C':
			var a = this.lines.AB;
			var b = this.lines.AC;
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
			var side = this.lines.AC;
			break;
		case 'C':
			var side = this.lines.AB;
			break;
		default:
			throw 'Unknown angle';
	}
	if(this.altitudes[angleName] === undefined) {
		var a = this.lines.BC.getLength();
		var b = this.lines.AC.getLength();
		var c = this.lines.AB.getLength();
		var s = (a + b + c) / 2;
		this.altitudes[angleName] = 2 * Math.sqrt(s * (s - a) * (s - b) * (s - c)) / side.getLength();
	}
	return this.altitudes[angleName];
};

Geometry.Rectangle = function (A, B, C, D) {
	
	this.points = {A: A, B: B, C: C, D: D};
	
	this.lines = {
		AB: new Geometry.Line(A, B),
		BC: new Geometry.Line(B, C),
		CD: new Geometry.Line(C, D),
		DA: new Geometry.Line(D, A)
	};
	
};

Geometry.Rectangle.prototype.getCrossPoints = function(plane) {
	var points = [];
	for(var i in this.lines) {
		for(var j in plane.lines) {
			var crossPoints = this.lines[i].getCrossPoints(plane.lines[j]);
			if(crossPoints !== false) {
				points = points.concat(crossPoints);
			}
		}
	}
	return points;
};