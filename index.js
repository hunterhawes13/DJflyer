(function () {
  "use strict";
  /* ==== definitions ==== */
  var Xi = 0, Yi = 0, Zi = 0;
  var screen = ge1doot.screen;
  var drag = ge1doot.drag;
   	
  /* ==== setup camera ==== */
	var cameraView = {
		x: 0,
		y: 0,
		z: 140,
		rotation: 0,
		upAngle: 0,
		xcos: 0,
		xsin: 0,
		ycos: 0,
		ysin: 0,
		zoom: 0,
		rotate: function (rotation, upAngle) {
			this.rotation = rotation;
			this.upAngle = upAngle;
			this.xcos = Math.cos(rotation);
			this.xsin = Math.sin(rotation);
			this.ycos = Math.cos(upAngle);
			this.ysin = Math.sin(upAngle);
		}
	}
	
  /* ==== vertex constructor ==== */
	var Point = function (x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.X = 0;
		this.Y = 0;
	}
	
	Point.prototype.project = function () {
		var x = this.x;
		var y = this.y;
		var z = this.z;
		var tx = cameraView.xcos * x - cameraView.xsin * z;
		var tz = cameraView.xsin * x + cameraView.xcos * z;
		x = tx;
		z = tz;
		var ty = cameraView.ycos * y - cameraView.ysin * z;
		tz = cameraView.ysin * y + cameraView.ycos * z;
		y = ty;
		z = tz;
		this.X = screen.width  * 0.5 + ((cameraView.z * ((x * cameraView.zoom) - cameraView.x) / (cameraView.z + z))) + cameraView.x;
		this.Y = screen.height * 0.5 + ((cameraView.z * ((y * cameraView.zoom) - cameraView.y) / (cameraView.z + z))) + cameraView.y;
	}
	
  /* ==== face constructor ==== */
	var Polygon = function (points, id) {
		this.points = [];
		for (var i = 0, n = points.length; i < n; i++) {
			this.points.push(listPoints.points[points[i]]);
		}
		this.img = new CSS3Dtransform(document.getElementById(id));
	}
	
	Polygon.prototype.draw = function () {
		var 
			x0 = this.points[0].X,
			y0 = this.points[0].Y,
			x1 = this.points[1].X,
			y1 = this.points[1].Y,
			x2 = this.points[2].X,
			y2 = this.points[2].Y,
			x3 = this.points[3].X,
			y3 = this.points[3].Y;
			
		if ((x1-x0)*(y2-y0) < (x2-x0)*(y1-y0)) {
			this.img.elem.style.visibility = "hidden";
		} else {
			this.img.elem.style.visibility = "visible";
			this.img.transform(x0, y0, x1, y1, x2, y2, x3, y3);
		}
	}
	
  /* ==== points ==== */
	var listPoints = {
		points: [],
		add: function (p) {
			this.points.push(new Point(p[0], p[1], p[2]));
		},
		project: function () {
			for (var i = 0, n = this.points.length; i < n; i++ ) {
				this.points[i].project();
			}
		}
	}
	
  /* ==== polygons ==== */
	var listPolygons = {
		polygons: [],
		add: function (points, id) {
			this.polygons.push(new Polygon(points, id));
		},
		draw: function () {
			for (var i = 0, n = this.polygons.length; i < n; i++ ) {
				this.polygons[i].draw();
			}
		}
	}
	
  /* ==== magic 2D to 3D projective transformation ==== */
	var CSS3Dtransform = function (element) {
		this.elem = element;
		this.w = element.offsetWidth;
		this.h = element.offsetHeight;
		var t = ["transform", "msTransform", "MozTransform", "WebkitTransform", "OTransform"];
		for (var test, i = 0; test = t[i++];) {
			if (typeof document.body.style[test] != "undefined") {
				this.CSSTransform = test;
				break;
			}
		}
		this.elem.style[this.CSSTransform+"Origin"] = "0 0";
	}


	CSS3Dtransform.prototype.transform = function (x1, y1, x2, y2, x3, y3, x4, y4) {
		
		// projective transformation (reduced)

		var v0, v1, v2;
		var m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17, m18, m19, m20, m21, m22, m23;
		var a0, a1, a2, a3, a4, a5, a6, a7, a8, b0, b1, b2, b3, b4, b5, b6, b7, b8;
		v0  = (y2-y3)*x4+(x3-x2)*y4+(x2*y3-x3*y2);
		v1  = (y3-y1)*x4+(x1-x3)*y4+(x3*y1-x1*y3);
		v2  = (y1-y2)*x4+(x2-x1)*y4+(x1*y2-x2*y1);
		m1  = (x1+x2+x3-y1-y2-2)*v1;
		m2  = (x1-y1)*v1;
		m3  = y2*(-v0-v1+v2);
		m4  = (-x1+y1+y2)*(v0+v1);
		m5  = -(y1+y2)*v0;
		m6  = x1*v0;
		m7  = (-x1+2)*v0;
		m9  = -2*v0;
		m11 = -v0-v1;
		m12 = (-x3+2)*v1;
		m13 = (x3-1)*v1;
		m16 = -(-x3+y2+y3)*v2;
		m17 = -(x3-y3)*v2;
		m18 = (y2+y3)*v2;
		a0  = m6;
		a1  = m1+m4+m5+m6+m12; 
		a2  = m6+m7+m9+m16+m18; 
		a3  = m2+m3+m4+m6+m16+m17; 
		a4  = m2+m4+m5+m6;
		a5  = m16+m17+m18; 
		a6  = m6+m7+m11+m12+m13; 
		a7  = m12+m13;
		a8  = m6+m7+m9+v2;
		b0  = this.h;
		b2  = -this.w*this.h;
		b4  = -this.w;
		m1  = (a0+a1+a2-a3-a4-a7-a8)*b4;
		m2  = (a0-a3)*b4;
		m3  = -a4*b4;
		m4  = (-a0+a3+a4)*(b0+b4);
		m5  = -(a3+a4)*b0;
		m6  = a0*b0;
		m7  = (-a0+a6+a7)*(b0-b2);
		m8  = (-a0+a6)*b2;
		m9  = (a6+a7)*(-b0+b2);
		m11 = a7*b2;
		m15 = (a7+a8)*b4;
		m19 = a1*b0;
		m20 = a5*b4;
		m21 = a3*b2;
		a8  = m6+m7+m8+m9;
		a0  = (m6+m19)/a8;
		a1  = (m1+m4+m5+m6+m15)/a8;
		a2  = (m6+m7+m9)/a8;
		a3  = (m2+m3+m4+m6)/a8;
		a4  = (m2+m4+m5+m6+m20)/a8;
		a5  = m21/a8;
		a6  = (m6+m7+m8+m11)/a8;
		a7  = m15/a8;
		var t = "matrix3d(" + 
			a0 + ", " + a3 + ", 0, " + a6 + ", " +
			a1 + ", " + a4 + ", 0, " + a7 + ", 0, 0, 1, 0, " +
			a2 + ", " + a5 + ", 0, 1)";
		this.elem.style[this.CSSTransform] = t;
	}

	/* ==== init script ==== */
	var init = function (param) {
		screen.init("screen", function () {
			cameraView.zoom = screen.width / 170;
		}, true);
		drag.init(screen);
		/* ==== init cubes ==== */
		for (var i = 0; i < param.points.length; i++) {
			listPoints.add(param.points[i]);
		}
		for (var i = 0; i < param.poly.length; i++) {
			listPolygons.add(param.poly[i][0], param.poly[i][1]);
		}
		cameraView.rotate(0, 0);
		run();
	}
	
	// ==== main loop ====
	var run = function () {
		
		Xi += (drag.x - Xi) / 10;
		Yi += (drag.y - Yi) / 10;
		cameraView.rotate(Zi + Xi / 100, Zi / 4 + Yi / 100);
		listPoints.project();
		listPolygons.draw();
		Zi += 0.01;
		
		requestAnimationFrame(run); 
		
	}
	
	return {
		/* ==== load data ==== */
		load : function (p) {
			window.addEventListener('load', function () {
				init(p);
			}, false);
		}
	}
})().load({
	points: [
		[-80,-80,80],[80,-80,80],[80,80,80],[-80,80,80],[-80,-80,-80],[80,-80,-80],[80,80,-80],[-80,80,-80],
		[-15,-15,15],[15,-15,15],[15,15,15],[-15,15,15],[-15,-15,-15],[15,-15,-15],[15,15,-15],[-15,15,-15]
	],
	poly: [
		[[0, 1, 2, 3], "i1"],[[1, 5, 6, 2], "i2"],[[4, 0, 3, 7], "i3"],[[5, 4, 7, 6], "i4"],[[7, 3, 2, 6], "i5"],[[5, 1, 0, 4], "i6"],
		[[9, 8, 11, 10], "i7"],[[13, 9, 10, 14], "i8"],[[8, 12, 15, 11], "i9"],[[12, 13, 14, 15], "i10"],[[14, 10, 11, 15], "i11"],[[12, 8, 9, 13], "i12"]
	]
});