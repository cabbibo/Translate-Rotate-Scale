
  function ObjectControls( eye , controller ){

    var _controller   = controller;
    var _eye          = eye;
   
    var _objects      = [];
    var _size         = 100;

    var _intersected;
    var _selected;
    var _oFrame;
    var _frame;
    var _selectedFrame;
    var _dFromSelected;
    
    var _centerPoint  = new THREE.Vector3();
    var _oCenterPoint = _centerPoint.clone();

    var _eyePos       = _eye.position;

    var _raycaster    = new THREE.Raycaster();

    _raycaster.near   = _eye.near;
    _raycaster.far    = _eye.far;

    return{
      

      /*
      
         Events

      */

      hoverOut  : function( object ){

        _objectHovered = false;
        
        if( object.hoverOut ) object.hoverOut();
      
      },

      hoverOver : function( object ){
     
        _objectHovered = true;
        

        if( object.hoverOver ) object.hoverOver();
      
      },

      select    : function( object ){
      
        _selected       = object;
        _selectFrame    = _frame;
        _dFromSelected  = _centerPoint.clone().sub( _selected.position ).length();
       
        console.log( _dFromSelected );
        if( object.select ) object.select();

      },
      
      deselect  : function( object ){
     
        _selected = undefined;
        _selectFrame = undefined;
        _dFromSelected = undefined;

        console.log( object );
        if( object.deselect ) object.deselect();
      
      },




      /*

         Visual feedback

      */

      linkToCenter : function( object ){
        
        object.position = _centerPoint;

      },

      addIndicators : function( scene ){

        scene.add( _rayIndicator      );
        scene.add( _rayMeshIndicator  );

      },

      removeIndicators : function( scene ){
  
        scene.remove( _rayIndicator     );
        scene.remove( _rayMeshIndicator );

      },





      /*
      
        Changing what objects we are controlling 

      */

      add : function( object ){

        _objects.push( object );

      },

      remove : function( object ){

        for( var i = 0; i < _objects.length; i++ ){

          if( _objects[i] == object ){
        
            _objects.splice( i , 1 );

          }

        }

      },


      
      
      /*

         Update Loop

      */

      update : function(){

        _oFrame = _frame;
        _frame = _controller.frame();

        if( _frame.hands[0] && _oFrame.hands[0] ){
   
          this.updateCenterPoint( _frame.hands[0].palmPosition );
          this.checkForSelection( _frame.hands[0] , _oFrame.hands[0] );
          
          
          if( !_selected ){
        
            this.checkForIntersections();

          }else{

            this.updateSelected( _frame.hands[0] );

          }


        }

      },


      updateCenterPoint : function( position ){

        _oCenterPoint.copy( _centerPoint );

        var p = this.leapToCamera( _frame , position , _size );       
        _centerPoint.copy( p ); 


      },

      updateSelected : function( hand ){

        var frameQuat = new THREE.Quaternion();

        var axis = new THREE.Vector3().fromArray( _frame.rotationAxis( _selectFrame ) );
        var angle =  _frame.rotationAngle( _selectFrame );

        frameQuat.setFromAxisAngle( axis , angle );


        var dif = _centerPoint.clone().sub( eye.position ).normalize();

        console.log( _dFromSelected )

          
        var pos = _centerPoint.clone().add( dif.clone().multiplyScalar( _dFromSelected ) );

        _selected.position.copy( pos );


      },
      
      
      /*
       
        Checks 

      */

      checkForIntersections : function( position ){

          var origin    = _centerPoint;
          var direction = origin.clone()
         
          direction.sub( _eye.position );
          direction.normalize();

          _raycaster.set( origin , direction );

          var intersected =  _raycaster.intersectObjects( _objects );

          if( intersected.length > 0 ){
  
            this.objectIntersected( intersected );
            
          }else{
      
            this.noObjectIntersected();

          }




      },

      checkForSelection : function( hand , oHand ){

        if( _intersected ){

          if( hand.pinchStrength > .5 && oHand.pinchStrength <= .5 ){

            this.select( _intersected );

          }

        }

        if( _selected ){

          if( hand.pinchStrength <= .5 && oHand.pinchStrength > .5 ){

            this.deselect( _selected );

          }

        }

      },





      /*
       
         Raycast Events

      */
      objectIntersected : function( intersected ){

        // Assigning out first intersected object
        // so we don't get changes everytime we hit 
        // a new face
        var firstIntersection = intersected[0].object;

        if( !_intersected ){

          _intersected = firstIntersection;

          this.hoverOver( _intersected );

        }else{

          if( _intersected != firstIntersection ){

            this.hoverOut( _intersected );

            _intersected = firstIntersection;

            this.hoverOver( _intersected );

          }

        }

      },

      noObjectIntersected : function(){

        if( _intersected  ){

          this.hoverOut( _intersected );
          _intersected = undefined;

        }


      },





      /*

         Utils

      */

      leapToScene : function( frame , position , size ){

        var nPoint = frame.interactionBox.normalizePoint( position );
        
        nPoint[0] -= .5;
        nPoint[1] -= .5;
        nPoint[2] -= .5;

        var v = new THREE.Vector3().fromArray( nPoint );
        
        v.multiplyScalar( size );

        return v;

      },

      leapToCamera: function( frame , position , size ){

        var v = this.leapToScene( frame , position , size );

        v.z -= size;
        v.applyMatrix4( _eye.matrix );

        return v;

      }

    }

  }
