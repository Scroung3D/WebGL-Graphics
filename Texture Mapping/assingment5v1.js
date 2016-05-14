var gl;
var listaObjetos = [];
var bufferId = [];
var bufferIdN = [];
var vNormal = [];
var indexBuffer = [];
var vPositionSha = [];
var tex;
var tex2;
var texSize = 64;
var numChecks = 8;

var flag = false;
var flag2 = true;
var flag3 = true;
var projectionMatrix;
var projectionMatrixLoc;

var moonVertexTextureCoordBuffer;

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -5.5;
var right = 5.5;
var ytop =3.0;
var bottom = -3.0;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var FizzyText = function() {
  this.Assingment5 = 'Clean Scene';
  this.rX = 0;
  this.rY = 0;
  this.rZ = 0;
  this.Method1_Spherical = function() { };
  this.Method2_Planar = function() { };
  this.SelectT = false;
  this.SelectP = false;
};

window.onload = function init(){
	text = new FizzyText();
  	gui = new dat.GUI();
  	var controlador = [];
  	controlador[0] = gui.add(text, 'Assingment5');
    var f0 = gui.addFolder('Mapping');
    controlador[1] = f0.add(text, 'Method1_Spherical');
    controlador[2] = f0.add(text, 'Method2_Planar');
    var f1 = gui.addFolder('Texture');
  	controlador[3] = f1.add(text, 'SelectT', [ 'Checkerboard', 'Pony', 'Sun' ] );
    var f2 = gui.addFolder('Pattern');
  	controlador[4] = f2.add(text, 'SelectP', [ 'Sine', 'Checkerboard' ] );
  	var f3 = gui.addFolder('Rotate');
  	controlador[5] = f3.add(text, 'rX', -360, 360);
  	controlador[6] = f3.add(text, 'rY', -360, 360);
  	controlador[7] = f3.add(text, 'rZ', -360, 360);

    f0.open();
  	f1.open();
    f2.open();
    f3.open();

    controlador[1].onChange(function(value) {
		flag = false;
	});

    controlador[2].onChange(function(value) {
		flag = true;
	});

    controlador[3].onChange(function(value) {
        flag2 = true;
        switch (value){
            case 'Checkerboard':
                load('texture.gif');
            break;

            case 'Pony':
                load('pony2.jpg');
            break;

            case 'Sun':
                load('sun.jpg');
            break;
        }
	});

    controlador[4].onFinishChange(function(value) {

        switch (value){

            case 'Checkerboard':
                flag3 = false;
                load(checkerboard());
            break;

            case 'Sine':
                flag3 = false;
                load(checkerboard());
            break;
        }
	});

	controlador[5].onChange(function(value) {
		if (listaObjetos.length > 0){
            listaObjetos[0].rotate[0] = value;
		}
	});

	controlador[6].onChange(function(value) {
		if (listaObjetos.length > 0){
			listaObjetos[0].rotate[1] = value;
		}
	});

	controlador[7].onChange(function(value) {
		if (listaObjetos.length > 0){
			listaObjetos[0].rotate[2] = value;
		}

	});

	canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {alert("Couldn't run WebGL");};

	gl.clearColor(0.95,0.95,0.95,1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

    uMVLoc4 = gl.getUniformLocation( program, "modelViewMatrix");
    uAmbientProduct = gl.getUniformLocation( program, "ambientProduct");
    uDiffuseProduct = gl.getUniformLocation( program, "diffuseProduct");
    uSpecularProduct = gl.getUniformLocation( program, "specularProduct");
    uLightPosition = gl.getUniformLocation( program, "lightPosition");
    uShininess = gl.getUniformLocation( program, "shininess");
    uNormalMatrix = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    samplerUniform = gl.getUniformLocation(program, "uSampler");

    listaObjetos.push(new Esfera(50,50,2.0));

    moonVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(listaObjetos[0].textureCoordData), gl.STATIC_DRAW);

    moonVertexTextureCoordBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(listaObjetos[0].textureCoordData2), gl.STATIC_DRAW);

    textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoordAttribute);


    bufferIdN.push(gl.createBuffer());
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdN[0] );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(listaObjetos[0].normales), gl.STATIC_DRAW );

    vNormal.push(gl.getAttribLocation( program, "vNormal" ));
    gl.vertexAttribPointer( vNormal[0], 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal[0] );

    bufferId.push(gl.createBuffer());
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId[0] );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(listaObjetos[0].vertices), gl.STATIC_DRAW );

    vPositionSha.push(gl.getAttribLocation( program, "vPosition" ));
    gl.vertexAttribPointer( vPositionSha[0], 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPositionSha[0] );

    indexBuffer.push(gl.createBuffer());
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer[0] );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(listaObjetos[0].indices), gl.STATIC_DRAW );


    controlador[0].setValue("Texture Mapping");

    luz = new Luz();
    gl.useProgram(program);

    materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
    materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    materialShininess = 200;
    ambientProduct = mult(vec4(luz.light_Ambient),materialAmbient);
    diffuseProduct = mult(vec4(luz.light_Diffuse),materialDiffuse);
    specularProduct = mult(vec4(luz.light_Specular),materialSpecular);
    gl.uniform4fv(uAmbientProduct,flatten(ambientProduct));
    gl.uniform4fv(uDiffuseProduct,flatten(diffuseProduct));
    gl.uniform4fv(uSpecularProduct,flatten(specularProduct));
    gl.uniform4fv(uLightPosition,flatten(vec4(luz.light_Position)));
    gl.uniform1f(uShininess,materialShininess);

    load('texture.gif');

	render();
};
var load = function(path) {
  image = new Image();
  image.onload = function() {
      tex = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, tex );


      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      if (flag3)    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
      else    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, path);
      gl.generateMipmap( gl.TEXTURE_2D );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
      gl.uniform1i(gl.getUniformLocation(program, 'uSampler'), 0);
  };
  if (flag3) image.src = path;
};

function render(){
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	resize();

    if (listaObjetos.length > 0){
        projectionMatrix = ortho(left, right, bottom, ytop, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
        gl.uniformMatrix4fv(uMVLoc4, false, flatten(listaObjetos[0].modelView()) );
        gl.uniformMatrix3fv(uNormalMatrix, false, flatten(normalMatrix(listaObjetos[0].modelView(),true)) );

        if (flag) {
            gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
        }
        else {
            gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer2);
        }

        gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.drawElements(gl.TRIANGLES, listaObjetos[0].indices.length, gl.UNSIGNED_SHORT, 0);
    }

	requestAnimFrame(render);
}

function checkerboard(){
    var image1 = new Uint8Array(4*texSize*texSize);
    c = 0;
    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
        var patchx = Math.floor(i/(texSize/numChecks));
        var patchy = Math.floor(j/(texSize/numChecks));
        if(patchx%2 ^ patchy%2) c = 255;
        else c = 0;
        image1[4*i*texSize+4*j] = c;
        image1[4*i*texSize+4*j+1] = c;
        image1[4*i*texSize+4*j+2] = c;
        image1[4*i*texSize+4*j+3] = 255;
        }
    }
    return image1;
}

function resize() {
	var canvas = gl.canvas;

	var displayWidth  = canvas.clientWidth;
	var displayHeight = canvas.clientHeight;

	if (canvas.width  != displayWidth ||
		   canvas.height != displayHeight) {

		   canvas.width  = displayWidth;
		   canvas.height = displayHeight;

		   gl.viewport(0, 0, canvas.width, canvas.height);
	}
}
