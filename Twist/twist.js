var gl;
var points = [];
var vertices = [];
var gradTese;
var numSides;
var amOfTwist;
var uAmountOfTwist;
var uTrianColor;

var redTR;
var greenTR;
var blueTR;

var radianes;
var grados;
var radianes2;


function init(){
	vertices = [];
	points = [];
	var canvas = document.getElementById("gl-canvas");

	numSides = Number(document.getElementById("numSidesVal").value);
	gradTese = Number(document.getElementById("tesDegVal").value);
	

	var redBG = $( "#red" ).slider( "value" )/255,
        greenBG = $( "#green" ).slider( "value" )/255,
        blueBG = $( "#blue" ).slider( "value" )/255;

        redTR = $( "#red2" ).slider( "value" )/255,
        greenTR = $( "#green2" ).slider( "value" )/255,
        blueTR = $( "#blue2" ).slider( "value" )/255;

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl){ alert("WebGL isn't available") }

	grados = 360/numSides;
	radianes = grados * Math.PI / 180;

	for (var i = 0; i < numSides; i++){
		vertices.push(Math.cos(i*radianes));
		vertices.push(Math.sin(i*radianes));
	}

	for (var i = 0; i < numSides; i++){
		if (i < numSides - 1){
			divideTriangulo( vec2(vertices[i*2], vertices[(i*2)+1]), vec2(vertices[(i*2)+2], vertices[(i*2)+3]), vec2(0, 0), gradTese );
		}
		else{
			divideTriangulo( vec2(vertices[i*2], vertices[(i*2)+1]), vec2(vertices[0], vertices[1]), vec2(0, 0), gradTese );
		}	
	}	

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( redBG, greenBG, blueBG, 1.0 );
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram(program);
	uAmountOfTwist = gl.getUniformLocation(program, "uAmountOfTwist");
	uTrianColor = gl.getUniformLocation(program, "uTrianColor");

	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	amOfTwist = Number(document.getElementById("amoTwistVal").value);
	radianes2 = amOfTwist * Math.PI / 180;
	render();
}

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.uniform1f(uAmountOfTwist, radianes2);
	gl.uniform4f(uTrianColor, redTR, greenTR, blueTR, 1.0);
	gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function triangulo( a, b, c ){
	points.push(a, b, c);
}

function divideTriangulo( a, b, c, cuenta ){
	if (cuenta === 0){
		triangulo( a, b, c );
	}
	else{
		var ab = mix( a, b, 0.5 );
		var ac = mix( a, c, 0.5 );
		var bc = mix( b, c, 0.5 );

		divideTriangulo( a, ab, ac, cuenta - 1 );
		divideTriangulo( c, ac, bc, cuenta - 1 );
		divideTriangulo( b, ab, bc, cuenta - 1 );
		if (cuenta === 1){
			triangulo( ab, ac, bc );
		}
		else{
			divideTriangulo( ab, ac, bc, cuenta - 1 );
		}
		
	}
}