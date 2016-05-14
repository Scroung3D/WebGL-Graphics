var gl;
var points = [];
var index = 0;
var numPixels = 1;
var uColor;

window.onload = function init(){
	var flag = false;
	index = 0;

	var canvas = document.getElementById( "id-canvas" );

	gl = WebGLUtils.setupWebGL( canvas );

	if ( !gl ) { alert( "WebGL isn't available" ); }

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );
	uColor = gl.getUniformLocation(program, "uColor");

	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, sizeof['vec2']*40000, gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	var cBufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
	gl.bufferData( gl.ARRAY_BUFFER, sizeof['vec4']*40000, gl.STATIC_DRAW );

	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );



	canvas.addEventListener( "mousedown", function(event){
		flag = true;
		//punta
		points[0] = -1 + 2*event.clientX/canvas.width;
		points[1] = -1 + 2*(canvas.height - event.clientY)/canvas.height;
	} );

	canvas.addEventListener( "mousemove", function(event){
		if (flag){
			var pixelWidth = 2/canvas.width;
			var width = pixelWidth * numPixels;
			var cola = [];
			var cabeza = [];
			var s = vec4($( "#red" ).slider( "value" )/255,$( "#green" ).slider( "value" )/255,$( "#blue" ).slider( "value" )/255, 1.0);

			//cola
			points[2] = -1 + 2*event.clientX/canvas.width;
			points[3] = -1 + 2*(canvas.height - event.clientY)/canvas.height;
			//direccion
			points[4] = points[2] - points[0];
			points[5] = points[3] - points[1];
			var aux = Math.sqrt( Math.pow(points[4],2.0) + Math.pow(points[5],2.0) );
			//direccion normalizada
			points[4] = points[4]/aux;
			points[5] = points[5]/aux;
			//normal unitaria
			points[6] = -points[5];
			points[7] = points[4];
			//nuevo punto
			points[8] = points[0] + width*points[6];
			points[9] = points[1] + width*points[7];
			//Aside
			
			cola[0] = points[0] - width*points[4]
			cola[1] = points[1] - width*points[5]

			cabeza[0] = points[2] + width*points[4]
			cabeza[1] = points[3] + width*points[5]
			
			gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index, flatten(vec2(cabeza[0],cabeza[1])) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index + sizeof['vec2'], flatten(vec2(cola[0],cola[1])) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index + sizeof['vec2']*2, flatten(vec2(points[8],points[9])) );

			gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index, flatten(s) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index + sizeof['vec4'], flatten(s) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index + sizeof['vec4']*2, flatten(s) );
			index = index + 3;

			points[10] = points[0] - width*points[6];
			points[11] = points[1] - width*points[7];

			gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index, flatten(vec2(cabeza[0],cabeza[1])) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index + sizeof['vec2'], flatten(vec2(cola[0],cola[1])) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index + sizeof['vec2']*2, flatten(vec2(points[10],points[11])) );

			gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index, flatten(s) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index + sizeof['vec4'], flatten(s) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index + sizeof['vec4']*2, flatten(s) );
			index = index + 3;

			//Bside

			points[12] = points[2] + width*points[6];
			points[13] = points[3] + width*points[7];	

			gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index, flatten(vec2(cabeza[0],cabeza[1])) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index + sizeof['vec2'], flatten(vec2(points[8],points[9])) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index + sizeof['vec2']*2, flatten(vec2(points[12],points[13])) );

			gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index, flatten(s) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index + sizeof['vec4'], flatten(s) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index + sizeof['vec4']*2, flatten(s) );
			index = index + 3;

			points[14] = points[2] - width*points[6];
			points[15] = points[3] - width*points[7];

			gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index, flatten(vec2(cabeza[0],cabeza[1])) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index + sizeof['vec2'], flatten(vec2(points[10],points[11])));
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec2']*index + sizeof['vec2']*2, flatten(vec2(points[14],points[15])));

			gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index, flatten(s) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index + sizeof['vec4'], flatten(s) );
			gl.bufferSubData( gl.ARRAY_BUFFER, sizeof['vec4']*index + sizeof['vec4']*2, flatten(s) );
			index = index + 3;



			points[0] = points[2];
			points[1] = points[3];
		}
	});

	canvas.addEventListener( "mouseup", function(event){
			flag = false;
	});

	document.getElementById("numPixels").addEventListener( "change", function(event){
		var target = event.target || event.srcElement;
		numPixels = Number(target.value);
	});
	render();
};

function render(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	gl.drawArrays( gl.TRIANGLES, 0, index );
	requestAnimFrame(render);
}
