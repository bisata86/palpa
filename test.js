function nocheckLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));

    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};
function checkLineIntersection(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};


var lab = [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ];
var squares = [];
var lines = [];
var ddim = 10
for (var a = 0; a < lab.length; a++) {
	for (var b = 0; b < lab.length; b++) {
	  
	  if(lab[a][b]==0) {
	  	lines = []
	    //left
	    var line = {from:{x:b*ddim,y:a*ddim},to:{x:b*ddim,y:(a*ddim)+ddim}}
	    lines.push(line)
	    //bottom
	    line = {from:{x:b*ddim,y:(a*ddim)+ddim},to:{x:(b*ddim)+ddim,y:(a*ddim)+ddim}}
	    lines.push(line)
	    //right
	    line = {from:{x:(b*ddim)+ddim,y:a*ddim},to:{x:(b*ddim)+ddim,y:(a*ddim)+ddim}}
	    lines.push(line)
	    //top
	    line = {from:{x:b*ddim,y:a*ddim},to:{x:(b*ddim)+ddim,y:a*ddim}}
	    lines.push(line)
	    squares.push({pos:{x:b,y:a},lines:lines})
	  }
	}
	
}


var liner = {from:{x:0,y:0},to:{x:(3*ddim)+ddim,y:3*ddim}} 
var inters = [];
var soloilprimo = true;
for (var i = 0; i < squares.length; i++) {
	for (var g = 0; g < squares[i].lines.length; g++) {
		var cline = squares[i].lines[g]
		var piru = checkLineIntersection(liner.from.x, liner.from.y, liner.to.x, liner.to.y, cline.from.x, cline.from.y, cline.to.x, cline.to.y)
		if(piru) {
			console.log(liner.from.x, liner.from.y, liner.to.x, liner.to.y, cline.from.x, cline.from.y, cline.to.x, cline.to.y)
			console.log(piru)
			console.log(liner,cline)
			soloilprimo = false;
			inters.push(squares[i].pos)
		}
	}
}

console.log(inters)