////////////////LIBRERIA FIGURA////////////////////
	function Figura() {
    	this.look = this.creaLook( );
    	this.MV = mat4();
    	this.visible = true;
	}

	Figura.prototype.creaLook = function(){
		eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
		return lookAt(eye,at,up);
	};

	Figura.prototype.modelView = function(){
		var m = mat4();
		var s = scale(this.scale[0],this.scale[1],this.scale[2]);
		var t = translate(this.translate[0],this.translate[1],this.translate[2]);
		var rx = rotate(this.rotate[0],vec3(1,0,0));
		var ry = rotate(this.rotate[1],vec3(0,1,0));
		var rz = rotate(this.rotate[2],vec3(0,0,1));

		m = mult(this.look,mult(t,mult(rz,mult(ry,mult(rx,s)))));
		return m;
	};

	Figura.prototype.normalMatrix = function(modelView){
		return normalMatrix(modelView, true);
	};

//////////////CONO/////////////////////////////////
	function Cono(lados,largo,radio) {
		Figura.call(this, null);
    	this.radio = radio;
    	this.scale = [1,1,1];
    	this.rotate = [0,0,0];
    	this.translate = [0,0,0];
    	this.lados = lados;
    	this.largo = largo;
    	this.vertices = this.creaVertices(radio,largo,lados);
    	this.indices = this.creaIndices(lados);
		this.normales = this.creaNormales(this.vertices, this.indices);
    	this.colores = null;
	}

	Cono.prototype = Object.create(Figura.prototype);

	Cono.prototype.creaVertices = function(radio,largo,n){
		var vertices = [];
		var grados = 360 / n;
		var theta = 0;
		for(var i = 0; i < n; i++){
			theta = i * grados;
			rad = (theta * Math.PI)/180;
			vertices.push(vec4(radio*Math.sin(rad),-largo/2,radio*Math.cos(rad),1.0));
		}

		vertices.push(vec4(0.0,largo/2,0.0,1.0));
		return vertices;
	};

	Cono.prototype.creaIndices = function(n){
		var indices = [];
	    indices.push(0);

		for (var i = 1; i < Math.ceil(n/2); i++) {
			indices.push(i,n-i);
		}

		if ( n % 2 == 0 ) {
			indices.push( n/2 );
		}
		//Create pike
		for (var i = 0; i < Math.ceil(n/3.0);i++){
			if (i!=0){
				var aux = indices[indices.length-1];
				indices.push( aux );
				if (n%2==1){
					indices.push( aux, (aux+1)%n );
				}
				else{
					var aux2 = aux - 1;
					if (aux2 < 0)	aux2 = n + aux2;
					indices.push( aux, aux2 );
				}
			}
			aux = indices[indices.length-1];
			indices.push(n);
			if ( i*3 + 1 < n ){
				if (n%2==1){
					indices.push( (aux+1)%n );
					if ( i*3 + 2 < n ){
						indices.push( (aux+2)%n );
					}
				}
				else{
					var aux2 = aux - 1;
					if (aux2 < 0)	aux2 = n + aux2;
					indices.push( aux2 );
					if ( i*3 + 2 < n ){
						aux2 = aux - 2;
						if (aux2 < 0)	aux2 = n + aux2;
						indices.push( aux2 );
					}
				}
			}
		}
		return indices;
	};

	Cono.prototype.creaColores = function(indices, r, g, b){
		var colors = [];
	    for(var i = 0; i <indices.length; i++ ){
			colors.push(vec4(r/256,g/256,b/256,1.0));
		}
		return colors;
	};

	Cono.prototype.creaNormales = function( vertices, indices ){
		var normales = [];
		for (var i = 0; i <= indices.length - 3; i++){
			ver0 = vec3(vertices[indices[i]]);
			ver1 = vec3(vertices[indices[i+1]]);
			ver2 = vec3(vertices[indices[i+2]]);
			if (!((equal(ver0,ver1))||(equal(ver1,ver2)))){
				if (i % 2 == 0){
					normales.push(vec4(normalize(vec3(cross(subtract(ver2,ver0),subtract(ver1,ver0))),false),0.0));
				}
				else{
					normales.push(vec4(normalize(vec3(cross(subtract(ver2,ver1),subtract(ver0,ver1))),false),0.0));
				}
			}
			//else{
				//normales.push(vec3(0.0,0.0,0.0));
			//}
		}
		return normales;
	};



//////////////CILINDRO/////////////////////////////////
	function Cilindro(lados,largo,radio) {
		Figura.call(this, null);
    	this.radio = radio;
    	this.scale = [1,1,1];
    	this.rotate = [90,0,0];
    	this.translate = [0,0,0];
    	this.lados = lados;
    	this.largo = largo;
    	this.aux = this.creaVerInd(lados,radio,largo);
    	this.vertices =  this.aux.vertices;
    	this.indices =  this.aux.indices;
		this.normales = this.creaNormales(this.vertices,this.indices);
    	this.colores =  this.creaColores(this.indices);

	}

	Cilindro.prototype = Object.create(Figura.prototype);

	Cilindro.prototype.creaVerInd = function(n,radio,largo){
		var vertices = [];
		var indices = [];

		var grados = 360 / n;
		var theta = 0;
		for(var i = 0; i < n; i++){
			theta = i * grados;
			rad = (theta * Math.PI)/180;
			vertices.push(vec4(radio*Math.cos(rad),radio*Math.sin(rad),largo/2,1.0));
		}

		indices.push(0);

		for (var i = 1; i < Math.ceil(n/2); i++) {
			indices.push(i,n-i);
		}

		if ( n % 2 == 0 ) {
			indices.push( n/2 );
		}

		var lastInd = indices[n-1];

		vertices.push(vec4(vertices[lastInd][0],vertices[lastInd][1],-largo/2,1.0));
		indices.push(n);

		if ( n % 2 == 1 ) {

			for ( var i = 1; i < n; i++ ){
				vertices.push(vec4(vertices[ (lastInd+i)%n][0] , vertices[(lastInd+i)%n][1] , -largo/2,1.0));
				indices.push((lastInd+i)%n, n+i);
			}

		}else{

			for ( var i = 1; i < n; i++ ){
				var aux = lastInd - i;
				if (aux < 0)	aux = n + aux;
				vertices.push(vec4( vertices[aux][0] ,vertices[aux][1] , -largo/2,1.0));
				indices.push(aux, n+i);
			}
		}

		indices.push(n);

		//another face
		for (var i = 1; i <= n-2; i++){
			if ( i%2 == 1 ){
				indices.push(indices[indices.length-2] - 1);
			}
			else{
				indices.push(indices[indices.length-2] + 1);
			}
		}
		return {
                indices: indices,
                vertices: vertices
        };
	};

	Cilindro.prototype.creaColores = function(indices, r, g, b){
		var colors = [];
	    for(var i = 0; i <indices.length; i++ ){
			colors.push(vec4(r/256,g/256,b/256,1.0));
		}
		return colors;
	};

	Cilindro.prototype.creaNormales = function( vertices ,indices ){
		var normales = [];
		for (var i = 0; i <= indices.length - 3; i++){
			ver0 = vec3(vertices[indices[i]]);
			ver1 = vec3(vertices[indices[i+1]]);
			ver2 = vec3(vertices[indices[i+2]]);
			if (!((equal(ver0,ver1))||(equal(ver1,ver2)))){
				if (true){
					normales.push(vec4(normalize(vec3(cross(subtract(ver2,ver0),subtract(ver1,ver0))),false)),0.0);
				}
				else{
					normales.push(vec4(normalize(vec3(cross(subtract(ver2,ver1),subtract(ver0,ver1))),false)),0.0);
				}
			}
			else{
				normales.push(vec3(0.0,0.0,0.0));
			}
		}
		return normales;
	};

//////////////ESFERA/////////////////////////////////

	function Esfera(nLongitud,nLatitud,radio) {
		Figura.call(this, null);
    	this.nLongitud = nLongitud;
		this.textureCoordData = [];
		this.textureCoordData2 = [];
    	this.nLatitud = nLatitud;
    	this.radio = radio;
		this.aux = [];
    	this.scale = [1,1,1];
    	this.rotate = [0,0,0];
    	this.translate = [0,0,0];
		this.normales = [];
    	this.vertices = this.creaVertices(nLongitud,nLatitud,radio);
    	this.indices = this.creaIndices(nLongitud,nLatitud);
    	this.colores = [];
	}
    Esfera.prototype = Object.create(Figura.prototype);

	Esfera.prototype.creaVertices = function(nLongitud,nLatitud,radio){
		var vertices = [];
		for (var latNumber = 0; latNumber <= nLatitud; latNumber++) {
	      var theta = latNumber * Math.PI / nLatitud;
	      var sinTheta = Math.sin(theta);
	      var cosTheta = Math.cos(theta);

	      for (var longNumber = 0; longNumber <= nLongitud; longNumber++) {
	        var phi = longNumber * 2 * Math.PI / nLongitud;
	        var sinPhi = Math.sin(phi);
	        var cosPhi = Math.cos(phi);

	        var x = cosPhi * sinTheta;
	        var y = cosTheta;
	        var z = sinPhi * sinTheta;
	        var u = 1 - (longNumber / nLongitud);
	        var v = 1 - (latNumber / nLatitud);

	        this.normales.push(x);
	        this.normales.push(y);
	        this.normales.push(z);
			this.normales.push(0);
	        this.textureCoordData.push(x);
	        this.textureCoordData.push(y);
			this.textureCoordData2.push(u);
	        this.textureCoordData2.push(v);
	        vertices.push(radio * x);
	        vertices.push(radio * y);
	        vertices.push(radio * z);
			vertices.push(1);
	      }
	    }
		return vertices;
	};

	Esfera.prototype.creaIndices = function(nLongitud,nLatitud){
		var indices = [];

		for (var latNumber = 0; latNumber < nLatitud; latNumber++) {
	      for (var longNumber = 0; longNumber < nLongitud; longNumber++) {
	        var first = (latNumber * (nLongitud + 1)) + longNumber;
	        var second = first + nLongitud + 1;
	        indices.push(first);
	        indices.push(second);
	        indices.push(first + 1);

	        indices.push(second);
	        indices.push(second + 1);
	        indices.push(first + 1);
	      }
	    }

		return indices;
	};

	Esfera.prototype.creaColores = function(indices, r, g, b){
		var colors = [];
	    for(var i = 0; i <indices.length; i++ ){
			colors.push(vec4(r/256,g/256,b/256,1.0));
		}
		return colors;
	};
///////////////////////////PLANO/////////////////////////////////
	function Plano(step1,step2,perpendicular) {
		Figura.call(this, null);
		this.scale = [1,1,1];
    	this.rotate = [0,0,0];
    	this.translate = [0,0,0];
    	this.step1 = step1;
    	this.step2 = step2;
    	this.perpendicular = perpendicular;
    	this.vertices = this.creaVertices(step1,step2,perpendicular);
    	this.colores = this.creaColores(this.vertices);
	}

	Plano.prototype = Object.create(Figura.prototype);

	Plano.prototype.creaVertices = function(step1,step2,perpendicular){
		var vertices = [];
		stepA = 1.35/step1;
		stepB = 1.35/step2;

		switch(perpendicular){
			case 0:
				for (var i = -0.675; i <= 0.675; i += stepA){
					vertices.push( vec3( 0, i, -0.675) );
					vertices.push( vec3( 0, i,  0.675) );
				}
				for (var j = -0.675; j <= 0.675; j += stepB){
					vertices.push( vec3( 0,-0.675, j) );
					vertices.push( vec3( 0, 0.675, j) );
				}
			break;
			case 1:
				for (var i = -0.675; i <= 0.675; i += stepA){
					vertices.push( vec3( i, 0, -0.675) );
					vertices.push( vec3( i, 0,  0.675) );
				}
				for (var j = -0.675; j <= 0.675; j += stepB){
					vertices.push( vec3(-0.675, 0, j) );
					vertices.push( vec3( 0.675, 0, j) );
				}

			break;
			case 2:
				for (var i = -0.675; i <= 0.675; i += stepA){
					vertices.push( vec3( -0.675, i, 0) );
					vertices.push( vec3( 0.675,  i, 0) );
				}
				for (var j = -0.675; j <= 0.675; j += stepB){
					vertices.push( vec3( j,-0.675, 0) );
					vertices.push( vec3( j, 0.675, 0) );
				}
			break;

		}
		return vertices;
	};

	Plano.prototype.creaColores = function(indices){
		var colors = [];
	    for(var i = 0; i <indices.length; i++ ){
			colors.push(vec4(0.7,0.7,0.7,1.0));
		}
		return colors;
	};
///////////////////////////LUCES//////////////////////////////////
function Luz() {
	Esfera.call(this, 6, 4, 0.1);
	this.light_Position =  vec4(1.0, 1.0, 0.0, 0.0 );
	this.light_Ambient = vec4(0.2, 0.2, 0.2, 1.0 );
	this.light_Diffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
	this.light_Specular = vec4(1.0,1.0,1.0,1.0);
}

Luz.prototype = Object.create(Esfera.prototype);
