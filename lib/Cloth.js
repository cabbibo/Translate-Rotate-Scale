
  function Cloth(leader){


    this.size = 32;
    this.sim = shaders.simulationShaders.jellySim;
    this.leader = leader;

    this.physicsRenderer = new PhysicsRenderer(
      this.size,
      this.sim,
      renderer
    );

    this.physicsRenderer.setUniform( 't_audio' , {
      type:"t",
      value:audioController.texture
    });


    this.physicsRenderer.setUniform( 'leader' , { 
      type:"v3" , 
      value:leader 
    });

    console.log( dT );
    this.physicsRenderer.setUniform( 'dT' , { 
      type:"f" , 
      value:dT
    });


    var path = "../img/skybox/";
    var format = '.jpg';
    var urls = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ];

    var tReflection = THREE.ImageUtils.loadTextureCube( urls );

    var tNoise  = THREE.ImageUtils.loadTexture( '../img/noiseLookup.jpg' ); 
    var tIri    = THREE.ImageUtils.loadTexture( '../img/iriLookup1.png' );
    var tNormal = THREE.ImageUtils.loadTexture( '../img/normals/sand.png' );
    var uniforms = {

      
      tReflection:{ type:"t" , value: tReflection },
      tNoise:{ type:"t" , value: tNoise }, 
      tIri:{ type:"t" , value: tIri },
      lightPos: { type:"v3" , value: new THREE.Vector3( 1 , 1 , 1 ) },
      tNormal:{type:"t",value:tNormal},
      t_pos:{ type:"t" , value:null },
      t_oPos:{ type:"t" , value:null },
      t_ooPos:{ type:"t" , value:null },
      time:timer

    }

    var material = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: shaders.vertexShaders.jelly,
      fragmentShader: shaders.fragmentShaders.jelly,
      side: THREE.DoubleSide

    });
    
    var geo = this.createGeo( this.size );

    var m = new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh( geo , material );
    scene.add( this.mesh );

    var pR = this.physicsRenderer;
    
    pR.addBoundTexture( this.mesh , 't_pos' , 'output' );
    pR.addBoundTexture( this.mesh , 't_oPos' , 'oOutput' );
    pR.addBoundTexture( this.mesh , 't_ooPos' , 'ooOutput' );

    var mesh = new THREE.Mesh( new THREE.CubeGeometry( 5 , 5 , 5) );
    var pTexture = this.createPosTexture( this.size );
    this.physicsRenderer.reset( pTexture );
   
    console.log( this );

 
  }

  Cloth.prototype.update = function(){

    this.physicsRenderer.update();
    this.physicsRenderer.update();
    this.physicsRenderer.update();
    this.physicsRenderer.update();
    this.physicsRenderer.update();
    this.physicsRenderer.update();

  }


  Cloth.prototype.createGeo = function( size ){

    var geo = new THREE.BufferGeometry();

    var subSize = (size) * (size-1);
    geo.addAttribute( 'position', new Float32Array( subSize * 6 * 3 ), 3 ); 
    geo.addAttribute( 'normal', new Float32Array( subSize * 6 * 3 ), 3 ); 
  
    var positions = geo.getAttribute( 'position' ).array;
    var normals = geo.getAttribute( 'normal' ).array;

    var uvArray = [];
    for( var i = 0; i < size; i++ ){
      for( var j = 0; j < size-1; j++ ){

        if( i == 0 ){
          var x = 1;
          var y = (j+.5) / size;

          uvArray.push( [ x , y ] );
        }else if( i == size -1 ){
          
          var x = (1+.5) / size;
          var y = (j+.5) / size;

          uvArray.push( [ x , y ] );



        }else{

          var x = (i+.5) / size;
          var y = (j+.5) / size;

          uvArray.push( [ x , y ] );



        }
      }
    }

    for( var i=0; i < uvArray.length; i++ ){

      var x = uvArray[i][0];
      var y = uvArray[i][1];


      // Tri 1

      var index = i * 6 * 3;
     // var i = //TODO: index

      positions[ index + 0 ] = x - (.5 / size); 
      positions[ index + 1 ] = y + (.5 / size); 
      positions[ index + 2 ] = 0; 

      positions[ index + 3 ] = x - ( .5 / size );
      positions[ index + 4 ] = y - ( .5 / size) ; 
      positions[ index + 5 ] = 0;

      positions[ index + 6 ] = x + (.5 / size); 
      positions[ index + 7 ] = y + (.5 / size); 
      positions[ index + 8 ] = 0; 

      positions[ index + 9 ] = x + (.5 / size); 
      positions[ index + 10 ] = y + (.5 / size); 
      positions[ index + 11 ] = 0; 

      positions[ index + 12 ] = x - ( .5 / size );
      positions[ index + 13 ] = y - ( .5 / size) ; 
      positions[ index + 14 ] = 0;

      positions[ index + 15 ] = x + (.5 / size); 
      positions[ index + 16 ] = y - (.5 / size); 
      positions[ index + 17 ] = 0;


      normals[ index + 0 ] = x - (.5 / size); 
      normals[ index + 1 ] = y + (.5 / size); 
      normals[ index + 2 ] = 0; 

      normals[ index + 3 ] = x - ( .5 / size );
      normals[ index + 4 ] = y - ( .5 / size) ; 
      normals[ index + 5 ] = 0;

      normals[ index + 6 ] = x + (.5 / size); 
      normals[ index + 7 ] = y + (.5 / size); 
      normals[ index + 8 ] = 0; 

      normals[ index + 9 ] = x + (.5 / size); 
      normals[ index + 10 ] = y + (.5 / size); 
      normals[ index + 11 ] = 0; 

      normals[ index + 12 ] = x - ( .5 / size );
      normals[ index + 13 ] = y - ( .5 / size) ; 
      normals[ index + 14 ] = 0;

      normals[ index + 15 ] = x + (.5 / size); 
      normals[ index + 16 ] = y - (.5 / size); 
      normals[ index + 17 ] = 0; 
      
      /*
      positions[ i + 3 ] = x + ( .5 / size );
      positions[ i + 4 ] = y - ( .5 / size) ; 
      positions[ i + 5 ] = 0;
      */

      // Tri 2

    }
 
    return geo;
  
  
  };


  Cloth.prototype.createPosTexture = function( size ){


    var data = new Float32Array( size * size * 4 );

    for ( var i = 0, l = data.length; i < l; i += 4 ) {

      var y = Math.floor( (i/4) / size );
      var x = (i/4)  - (y * size);


      var theta = 2 * Math.PI * ( x / size );

      var r =( .1 * Math.random() + .9) * 100;
      var posX = r * Math.cos( theta );
      var posZ = r * Math.sin( theta );

      /*var face = geometry.faces[ Math.floor( Math.random() * facesLength ) ];

      var vertex1 = geometry.vertices[ face.a ];
      var vertex2 = geometry.vertices[ Math.random() > 0.5 ? face.b : face.c ];

      point.subVectors( vertex2, vertex1 );
      point.multiplyScalar( Math.random() );
      point.add( vertex1 );*/

      data[ i ] = posX;
      data[ i + 1 ] = posZ;
      data[ i + 2 ] = -(1 - (y/size))*100;
      data[ i + 3 ] = 1;

    }

    var positionsTexture = new THREE.DataTexture(
      data, 
      size, 
      size, 
      THREE.RGBAFormat, 
      THREE.FloatType 
    );

    positionsTexture.minFilter = THREE.NearestFilter;
    positionsTexture.magFilter = THREE.NearestFilter;
    positionsTexture.generateMipmaps = false;
    positionsTexture.needsUpdate = true;

    return positionsTexture;

  };