var gl;
var listaObjetos = [];
var listaNombres = {'-Select-': -1};
var actualObjeto = 1;
var seleccion = -1;
var conos = 0;
var cilindros = 0;
var esferas = 0;
var bufferId = [];
var vPosition = [];
var vPosition2 = [];
var vPositionAux = [];
var bufferColor = [];
var vColor = [];
var indexBuffer = [];


var FizzyText = function() {
  this.Status = 'Clean Scene';
  this.Element = '-Create Objects-';
  this.Figure = false;
  //parseInt(arr[1] + arr[2],16)
  this.Color = "#00aeff";
  this.ChangeColor = "#00aeff";
  this.speed = 0.8;
  this.sX = 0;
  this.sY = 0;
  this.sZ = 0;
  this.rX = 0;
  this.rY = 0;
  this.rZ = 0;
  this.tX = 0;
  this.tY = 0;
  this.tZ = 0;
  this.displayOutline = false;
  this.ClickHereToAdd = function() { };
  this.ClickToDelete = function() { };
  this.Objects = false;
  this.Wireframe = true;
  this.Chromaticity = false;
  this.DownloadJSON = function() { };
  this.Clear = function() { };
};

window.onload = function init(){
	text = new FizzyText();
  	gui = new dat.GUI();
  	var controlador = [];
  	controlador[0] = gui.add(text, 'Status');

  	var f1 = gui.addFolder('Create');
  	controlador[1] = f1.add(text, 'Figure', [ 'Cone', 'Cylinder', 'Sphere' ] );
  	controlador[2] = f1.addColor(text, 'Color');
  	controlador[3] = f1.add(text, 'ClickHereToAdd');
  	var f2 = gui.addFolder('Transformations');
  	controlador[4] = f2.add(text, 'Element');
  	var f2_1 = f2.addFolder('Scale');
  	controlador[5] = f2_1.add(text, 'sX', -5, 5);
  	controlador[6] = f2_1.add(text, 'sY', -5, 5);
  	controlador[7] = f2_1.add(text, 'sZ', -5, 5);
  	var f2_2 = f2.addFolder('Rotate');
  	controlador[8] = f2_2.add(text, 'rX', -360, 360);
  	controlador[9] = f2_2.add(text, 'rY', -360, 360);
  	controlador[10] = f2_2.add(text, 'rZ', -360, 360);
  	var f2_3 = f2.addFolder('Translate');
  	controlador[11] = f2_3.add(text, 'tX', -50, 50);
  	controlador[12] = f2_3.add(text, 'tY', -50, 50);
  	controlador[13] = f2_3.add(text, 'tZ', -50, 50);  	
  	var f3 = gui.addFolder('Select');
  	controlador[14] = f3.add(text, 'Objects', listaNombres );
  	controlador[15] = f3.addColor(text, 'ChangeColor');
  	controlador[16] = f3.add(text, 'ClickToDelete');
  	var f4 = gui.addFolder('Extras');
  	controlador[17] = f4.add(text, 'Wireframe');
  	controlador[18] = f4.add(text, 'Chromaticity');
  	controlador[19] = f4.add(text, 'DownloadJSON');
  	controlador[20] = f4.add(text, 'Clear');
  	
  	f1.open();
  	f2_1.open();
  	f2_2.open();
  	f2_3.open();

  	function updateController(){
  		
  		for (var i = 16; i >= 14; i--){
  			controlador[i].remove();
  		}
  		controlador[14] = f3.add(text, 'Objects', listaNombres );
  		controlador[15] = f3.addColor(text, 'ChangeColor');
  		controlador[16] = f3.add(text, 'ClickToDelete');

  		controlador[14].onChange(function(value) {
  			seleccion = value;
			if (listaObjetos.length > 0 && value != -1){
				controlador[4].setValue( listaObjetos[seleccion].nombre );
				setea(seleccion);
				controlador[15].setValue( listaObjetos[seleccion].colorID );
			}
		});

		controlador[15].onChange(function(value) {
			if (listaObjetos.length > 0 && value != listaObjetos[seleccion].colorID && seleccion >= 0 && !text.Chromaticity){
				listaObjetos[seleccion].colores = listaObjetos[seleccion].creaColores(listaObjetos[seleccion].indices,controlador[15].__color.r,controlador[15].__color.g,controlador[15].__color.b );
				gl.bindBuffer( gl.ARRAY_BUFFER, bufferColor[seleccion] );
				gl.bufferData( gl.ARRAY_BUFFER, flatten(listaObjetos[seleccion].colores), gl.STATIC_DRAW );
				var aux = controlador[15].__color.hex;
				aux = aux.toString(16);
				if ( aux.length == 4 )	aux = '00' + aux;
				if ( aux.length == 5 )	aux = '0' + aux;
				listaObjetos[seleccion].colorID = '#' + aux;
			}
		});

		controlador[16].onChange(function(value) {
			if (listaObjetos.length > 0 && controlador[14].__select.value != -1 && seleccion != -1){
				delete listaNombres[listaObjetos[seleccion].nombre];
				listaObjetos[seleccion].visible = false;
				listaObjetos[seleccion].indices = null;
				listaObjetos[seleccion].vertices = null;
				listaObjetos[seleccion].colores = null;
				if (listaObjetos[seleccion].nombre.indexOf("Cylinder") > -1){
					cilindros -= 1;
				}
				if (listaObjetos[seleccion].nombre.indexOf("Cone") > -1){
					conos -= 1;
				}
				if (listaObjetos[seleccion].nombre.indexOf("Sphere") > -1){
					esferas -= 1;
				}
				var total = conos + cilindros + esferas;
				if (total > 0){
					controlador[0].setValue(total + " Objects");
					var flag = true;
					var i = 0;
					while (flag){
						if (listaObjetos[i].visible){
							seleccion = i;
							flag = false;
						}
						else i++;
					}
					updateController();
					setea(seleccion);
					controlador[4].setValue( listaObjetos[seleccion].nombre );
				}
				else{
					seleccion = -1;
					updateController();
					controlador[0].setValue('Clean Scene');
					controlador[4].setValue( '-Create Objects-' );
					inicializa();
				}
			}
		});
  	}

  	function setea(indice){  
  		controlador[5].setValue(listaObjetos[indice].scale[0]);
  		controlador[6].setValue(listaObjetos[indice].scale[1]);
  		controlador[7].setValue(listaObjetos[indice].scale[2]);

  		if (listaObjetos[indice].nombre.indexOf("Cylinder") > -1){
  			controlador[8].setValue(listaObjetos[indice].rotate[0] - 90);
  		}
  		else controlador[8].setValue(listaObjetos[indice].rotate[0]);
  		
  		controlador[9].setValue(listaObjetos[indice].rotate[1]);
  		controlador[10].setValue(listaObjetos[indice].rotate[2]);

  		controlador[11].setValue(listaObjetos[indice].translate[0]*50/0.8);
  		controlador[12].setValue(listaObjetos[indice].translate[1]*50/0.8);
  		controlador[13].setValue(listaObjetos[indice].translate[2]*50/0.8);
  	}

  	function inicializa(){  
  		controlador[5].setValue(0);
  		controlador[6].setValue(0);
  		controlador[7].setValue(0);

  		controlador[8].setValue(0);  		
  		controlador[9].setValue(0);
  		controlador[10].setValue(0);

  		controlador[11].setValue(0);
  		controlador[12].setValue(0);
  		controlador[13].setValue(0);
  	}

	canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {alert("Couldn't run WebGL");};

	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.enable(gl.DEPTH_TEST);
	
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK)
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	program2 = initShaders( gl, "vertex-shader2", "fragment-shader2" );
	program3 = initShaders( gl, "vertex-shader3", "fragment-shader3" );
	gl.useProgram( program );

	uMVLoc = gl.getUniformLocation( program, "uModelView");
	uMVLoc2 = gl.getUniformLocation( program2, "uModelView");
	uMVLoc3 = gl.getUniformLocation( program3, "uModelView");
	uWidth2 = gl.getUniformLocation( program2, "uWidth");
	uHeight2 = gl.getUniformLocation( program2, "uHeight");

	controlador[1].onChange(function(value) {
		switch(value){
			case 'Cone':
				actualObjeto = 1;
			break;
			case 'Cylinder':
				actualObjeto = 2;
			break;
			case 'Sphere':
				actualObjeto = 3;
			break;
		}
	});

	function initBuffer(value) { 
		switch(actualObjeto){
			case 1:
				listaObjetos.push(new Cono(15,0.5,0.08));
				conos += 1;
				listaObjetos[listaObjetos.length-1].nombre = "Cone " + conos;
			break;
			case 2:
				listaObjetos.push(new Cilindro(19,0.4,0.08));
				cilindros += 1;
				listaObjetos[listaObjetos.length-1].nombre = "Cylinder " + cilindros;
			break;
			case 3:
				listaObjetos.push(new Esfera(20,24,0.1));
				esferas += 1;
				listaObjetos[listaObjetos.length-1].nombre = "Sphere " + esferas;
			break;
		}

		bufferId.push(gl.createBuffer());
		gl.bindBuffer( gl.ARRAY_BUFFER, bufferId[bufferId.length-1] );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(listaObjetos[listaObjetos.length-1].vertices), gl.STATIC_DRAW );

		vPosition.push(gl.getAttribLocation( program, "vPosition" ));
		gl.vertexAttribPointer( vPosition[vPosition.length-1], 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition[vPosition.length-1] );

		vPosition2.push(gl.getAttribLocation( program2, "vPosition" ));
		gl.vertexAttribPointer( vPosition2[vPosition2.length-1], 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition2[vPosition2.length-1] );

		vPositionAux.push(gl.getAttribLocation( program3, "vPosition" ));
		gl.vertexAttribPointer( vPositionAux[vPositionAux.length-1], 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPositionAux[vPositionAux.length-1] );

		listaObjetos[listaObjetos.length-1].colores = listaObjetos[listaObjetos.length-1].creaColores(listaObjetos[listaObjetos.length-1].indices,controlador[2].__color.r,controlador[2].__color.g,controlador[2].__color.b );
		var aux = controlador[2].__color.hex;
		aux = aux.toString(16);
		if ( aux.length == 4 )	aux = '00' + aux;
		if ( aux.length == 5 )	aux = '0' + aux;
		listaObjetos[listaObjetos.length-1].colorID = '#' + aux;

		bufferColor.push(gl.createBuffer());
		gl.bindBuffer( gl.ARRAY_BUFFER, bufferColor[bufferColor.length-1] );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(listaObjetos[listaObjetos.length-1].colores), gl.STATIC_DRAW );

		vColor.push(gl.getAttribLocation( program, "vColor" ));
		gl.vertexAttribPointer( vColor[vColor.length-1], 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColor[vColor.length-1] );

		indexBuffer.push(gl.createBuffer());
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer[indexBuffer.length-1] );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(listaObjetos[listaObjetos.length-1].indices), gl.STATIC_DRAW );

		var total = conos + cilindros + esferas;
		controlador[0].setValue(total + " Objects");
		controlador[4].setValue( listaObjetos[listaObjetos.length-1].nombre );
		listaNombres[listaObjetos[listaObjetos.length-1].nombre] = listaObjetos.length-1;

		updateController();
		seleccion = listaObjetos.length-1
		setea(seleccion);

		f2.open();
		f1.close();
	}

	controlador[3].onChange(function(value) { initBuffer(value);
	});

	controlador[5].onChange(function(value) {
		if (listaObjetos.length > 0 && seleccion >= 0){
			listaObjetos[seleccion].scale[0] = value;
		}
	});

	controlador[6].onChange(function(value) {
		if (listaObjetos.length > 0 && seleccion >= 0){
			listaObjetos[seleccion].scale[1] = value;
		}
	});

	controlador[7].onChange(function(value) {
		if (listaObjetos.length > 0 && seleccion >= 0){
			listaObjetos[seleccion].scale[2] = value;
		}
	});

	controlador[8].onChange(function(value) {
		if (listaObjetos.length > 0 && seleccion >= 0){
			if (listaObjetos[seleccion].nombre.indexOf("Cylinder") > -1){
				listaObjetos[seleccion].rotate[0] = value + 90;
			}
			else	listaObjetos[seleccion].rotate[0] = value;
		}
	});

	controlador[9].onChange(function(value) {
		if (listaObjetos.length > 0 && seleccion >= 0){
			listaObjetos[seleccion].rotate[1] = value;
		}
	});

	controlador[10].onChange(function(value) {
		if (listaObjetos.length > 0 && seleccion >= 0){
			listaObjetos[seleccion].rotate[2] = value;
		}
	});

	controlador[11].onChange(function(value) {
		if (listaObjetos.length > 0 && seleccion >= 0){
			listaObjetos[seleccion].translate[0] = value*0.8/50;
		}
	});

	controlador[12].onChange(function(value) {
		if (listaObjetos.length > 0 && seleccion >= 0){
			listaObjetos[seleccion].translate[1] = value*0.8/50;
		}
	});

	controlador[13].onChange(function(value) {
		if (listaObjetos.length > 0 && seleccion >= 0){
			listaObjetos[seleccion].translate[2] = value*0.8/50;
		}
	});

	controlador[17].onChange(function(value) {
		text.Wireframe = value;
	});

	controlador[18].onChange(function(value) {
		text.Chromaticity = value;
		if (value){
			gl.useProgram(program2);
		}
		else gl.useProgram(program);
	});

	controlador[19].onChange(function(value) {
		if (listaObjetos.length > 0 ){
			var data = {listaObjetos};
			var json = JSON.stringify(data);
			var blob = new Blob([json], {type: "application/json"});
			var url  = URL.createObjectURL(blob);

			var a = document.createElement('a');
			a.download    = "backup.json";
			a.href        = url;
			a.textContent = "Download backup.json";
			if(navigator.userAgent.indexOf("Chrome") != -1 ){
        		a.click();
    		}
    		else if(navigator.userAgent.indexOf("Firefox") != -1 ){
    			var evt = new MouseEvent("click", {
		        view: window,
		        bubbles: true,
		        cancelable: true,
		        clientX: 20,
			    });
	    		a.dispatchEvent(evt);
    		}
    		else if(navigator.userAgent.indexOf("Opera") != -1 )
		    {
		    	var evt = new MouseEvent("click", {
		        view: window,
		        bubbles: true,
		        cancelable: true,
		        clientX: 20,
			    });
	    		a.dispatchEvent(evt);
		    }
					
		}
	});
	
	controlador[20].onChange(function(value) {
			if (listaObjetos.length > 0 ){
				delete listaNombres;
				delete listaObjetos;
				listaObjetos = [];
				listaNombres = {'-Select-': -1};
				actualObjeto = 1;
				seleccion = -1;
				conos = 0;
				cilindros = 0;
				esferas = 0;
				bufferId = [];
				vPosition = [];
				vPosition2 = [];
				vPositionAux = [];
				bufferColor = [];
				vColor = [];
				indexBuffer = [];
				updateController();
				controlador[0].setValue('Clean Scene');
				controlador[4].setValue( '-Create Objects-' );
				inicializa();
				for (var i = 3; i >= 1; i--){
  					controlador[i].remove();
  				}
		  		controlador[1] = f1.add(text, 'Figure', [ 'Cone', 'Cylinder', 'Sphere' ] );
		  		controlador[1].setValue('Cone');
  				controlador[2] = f1.addColor(text, 'Color');
  				controlador[3] = f1.add(text, 'ClickHereToAdd');
  				controlador[1].onChange(function(value) {
					switch(value){
						case 'Cone':
							actualObjeto = 1;
						break;
						case 'Cylinder':
							actualObjeto = 2;
						break;
						case 'Sphere':
							actualObjeto = 3;
						break;
					}
				});
				controlador[3].onChange(function(value) { initBuffer(value);});	
			}
		});
	
	plan = new Plano(10,10,1);

	bufferPlan = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlan );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(plan.vertices), gl.STATIC_DRAW );

	vPosition3 = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition3, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition3 );

	vPosition4 = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition4, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition4 );

	bufferColor3 = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferColor3 );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(plan.colores), gl.STATIC_DRAW );

	vColor3 = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor3, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor3 );

	render();
};

function render(){
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );	
	resize();

	if (text.Chromaticity == false){
		gl.uniformMatrix4fv( uMVLoc, false, flatten(plan.modelView()) );
		gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlan);
		gl.vertexAttribPointer( vPosition3, 3, gl.FLOAT, false, 0, 0 );
		gl.bindBuffer( gl.ARRAY_BUFFER, bufferColor3 );
		gl.vertexAttribPointer( vColor3, 4, gl.FLOAT, false, 0, 0 );
		gl.drawArrays(gl.LINES,0,plan.vertices.length);
	}
	else{
		gl.uniformMatrix4fv( uMVLoc2, false, flatten(plan.modelView()) );
		gl.bindBuffer( gl.ARRAY_BUFFER, bufferPlan);
		gl.vertexAttribPointer( vPosition4, 3, gl.FLOAT, false, 0, 0 );
		gl.drawArrays(gl.LINES,0,plan.vertices.length);
	}
	
	
	for (var i = 0; i < listaObjetos.length; i++){
		if (listaObjetos[i].visible){
			if (text.Chromaticity == false){

				gl.uniformMatrix4fv( uMVLoc, false, flatten(listaObjetos[i].modelView()) );
				gl.bindBuffer( gl.ARRAY_BUFFER, bufferId[i] );
				gl.vertexAttribPointer( vPosition[i], 3, gl.FLOAT, false, 0, 0 );
				gl.bindBuffer( gl.ARRAY_BUFFER, bufferColor[i] );
				gl.vertexAttribPointer( vColor[i], 4, gl.FLOAT, false, 0, 0 );
				gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer[i] );
				gl.drawElements(gl.TRIANGLE_STRIP,listaObjetos[i].indices.length,gl.UNSIGNED_SHORT,0);
			}
			else{
				gl.uniform1f( uWidth2, canvas.clientWidth );
				gl.uniform1f( uHeight2, canvas.clientHeight );
				gl.uniformMatrix4fv( uMVLoc2, false, flatten(listaObjetos[i].modelView()) );
				gl.bindBuffer( gl.ARRAY_BUFFER, bufferId[i] );
				gl.vertexAttribPointer( vPosition2[i], 3, gl.FLOAT, false, 0, 0 );
				gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer[i] );
				gl.drawElements(gl.TRIANGLE_STRIP,listaObjetos[i].indices.length,gl.UNSIGNED_SHORT,0);
			}
			if (text.Wireframe == true){
				gl.useProgram(program3);
				gl.uniformMatrix4fv( uMVLoc3, false, flatten(listaObjetos[i].modelView()) );
				gl.bindBuffer( gl.ARRAY_BUFFER, bufferId[i] );
				gl.vertexAttribPointer( vPositionAux[i], 3, gl.FLOAT, false, 0, 0 );
				gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer[i] );
				gl.drawElements(gl.LINE_STRIP,listaObjetos[i].indices.length,gl.UNSIGNED_SHORT,0);
				if (text.Chromaticity) gl.useProgram(program2);
				else gl.useProgram(program);
			}
		}
	}	
	
	requestAnimFrame(render);
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
