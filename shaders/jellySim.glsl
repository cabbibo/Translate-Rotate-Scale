uniform sampler2D t_oPos;
uniform sampler2D t_pos;
uniform sampler2D t_audio;
uniform sampler2D t_column;

uniform vec3 leader;
uniform float dT;

varying vec2 vUv;

const float maxVel = 2.;

const float size = 1. / 32.;
const float hSize = size / 2.;
const float interpolation = .5;
const float springLength = .1;


vec3 springForce( vec3 toPos , vec3 fromPos , float staticLength ){

  vec3 dif = fromPos - toPos;
  vec3 nDif = normalize( dif );
  vec3 balance = nDif * staticLength;

  vec3 springDif = balance - dif;

  return springDif;

}

vec3 cubicCurve( float t , vec3  c0 , vec3 c1 , vec3 c2 , vec3 c3 ){
  
  float s  = 1. - t; 

  vec3 v1 = c0 * ( s * s * s );
  vec3 v2 = 3. * c1 * ( s * s ) * t;
  vec3 v3 = 3. * c2 * s * ( t * t );
  vec3 v4 = c3 * ( t * t * t );

  vec3 value = v1 + v2 + v3 + v4;

  return value;

}


void main(){


  vec4 pos = texture2D( t_pos , vUv.xy );
  vec4 oPos = texture2D( t_oPos , vUv.xy );

  vec3 vel = oPos.xyz - pos.xyz;

  vec3 totalForce = vec3( 0. );



  vec3 forceLeft = vec3( 0. );
  vec3 forceRight = vec3( 0. );
  vec3 forceUp = vec3( 0. );
  vec3 forceDown = vec3( 0. );
  vec3 forceVel = vec3( 0. );
  vec3 forceOut = vec3( 0. );

  float sLY = springLength * 1.;
  float sLX = springLength * 100. * (vUv.y * vUv.y ) +.3;


  vec2 index = vec2( floor( vUv.x / size) , floor(vUv.y / size) );
  // Repel from all
  for( int i = 0; i < 32; i++ ){
    for( int j = 0; j <32; j++ ){

      if( int( index.x ) == i && int( index.y ) == j ){


      }else{

        vec2 lookup = vec2( float( i ) * size +hSize , float( j ) * size + hSize );
        vec4 posRepel = texture2D( t_pos , lookup );

        vec3 dif = pos.xyz - posRepel.xyz;

        if( length( dif ) < .5 ){
          //totalForce += normalize(dif) * 1.;
        }else{
          totalForce += .01*( 1.-vUv.y) *  normalize(dif) / ( length( dif ) * length( dif ));// * .00001 ;
        }

      }

    }
  }




  if( vUv.x > size ){

    vec4 posL = texture2D( t_pos , vec2( vUv.x - size , vUv.y ) ); 
    forceLeft = springForce(  posL.xyz , pos.xyz , sLX );

  }else{

    vec4 posL = texture2D( t_pos , vec2( 1. - hSize , vUv.y ) ); 
    forceLeft = springForce(  posL.xyz , pos.xyz , sLX );

  }

  if( vUv.x < 1. - size ){

    vec4 posR = texture2D( t_pos , vec2( vUv.x + size , vUv.y ) ); 
    forceRight = springForce(  posR.xyz , pos.xyz , sLX  );

  }else{
    
    vec4 posR = texture2D( t_pos , vec2( hSize , vUv.y ) ); 
    forceRight = springForce(  posR.xyz , pos.xyz , sLX  );

  }


  if( vUv.y > size ){

    vec4 posU = texture2D( t_pos , vec2( vUv.x , vUv.y  - size) ); 
    forceUp = springForce(  posU.xyz , pos.xyz , sLY );

  }else{

    //vec4 posU = texture2D( t_pos , vec2( vUv.x , vUv.y  - size) ); 
    forceUp = springForce(  leader , pos.xyz , sLY ) * 1.;


  }

  if( vUv.y < 1. - size ){

    vec4 posD = texture2D( t_pos , vec2( vUv.x , vUv.y + size ) ); 
    forceDown = springForce(  posD.xyz , pos.xyz , sLY );

  }




  totalForce += forceLeft   * interpolation;
  totalForce += forceRight  * interpolation;
  totalForce += forceUp     * interpolation;
  totalForce += forceDown   * interpolation;
  totalForce += forceVel    * interpolation;
  //totalForce -= forceVel    * interpolation;
  //totalForce += vec3( 0. , 0. , -.01 );



  // Column Repulsion forces

  // vec3 columnPos = texture2D( t_column , vec2( 0. , vUv.y ) ).xyz;
  vec3 pointAbove = leader;

  /*float distAlong = 0.;

  if( vUv.y > 0. / 8. ){

    float base = ceil(vUv.y * 8.);
    float baseAbove = ( base - 1. ) / 8.;
    pointAbove = texture2D( t_column , vec2( 0. , baseAbove ).xyz;

  }*/


  float base      = vUv.y  * 8.;
  float baseUp    = floor( base );
  float baseDown  = ceil( base );
  float amount    = base - baseUp;

  vec3 pUp    = texture2D( t_column , vec2( 0. , baseUp   / 8. ) ).xyz;
  vec3 pDown  = texture2D( t_column , vec2( 0. , baseDown / 8. ) ).xyz;

  vec3 direction = pUp - pDown;
  vec3 dirNorm  = normalize( direction );

  vec3 columnPos = pDown + (direction * (1.-amount));
  
  vec3 columnToPos = pos.xyz - columnPos;


  vec3 p0 = vec3(0.);
  vec3 v0 = vec3(0.);
  vec3 p1 = vec3(0.);
  vec3 v1 = vec3(0.);
 
  vec3 p2 = vec3(0.);
  if( baseUp == 0. ){

    p0 = texture2D( t_column , vec2( 0. , baseUp    / 8. ) ).xyz;
    p1 = texture2D( t_column , vec2( 0. , baseDown  / 8. ) ).xyz;

    // v0 = 0;

    p2 = texture2D( t_column , vec2( 0. , (baseDown + 1. ) / 8. )).xyz;
    v1 = .5 * ( p2 - p0 );

  }else if( baseDown == 8. ){

    p0 = texture2D( t_column , vec2( 0. , baseUp    / 8. ) ).xyz;
    p1 = texture2D( t_column , vec2( 0. , baseDown  / 8. ) ).xyz;

    // v1 = 0;

    p2 = texture2D( t_column , vec2( 0. , (baseUp - 1. ) / 8. )).xyz;
    v0 = .5 * ( p1 - p2 );

  }else{

    p0 = texture2D( t_column , vec2( 0. , baseUp    / 8. ) ).xyz;
    p1 = texture2D( t_column , vec2( 0. , baseDown  / 8. ) ).xyz;

    // v0 = 0;

    vec3 pMinus = texture2D( t_column , vec2( 0. , (baseUp -1.)    / 8. ) ).xyz;
    p2 = texture2D( t_column , vec2( 0. , (baseDown + 1. ) / 8. )).xyz;
    v1 = .5 * ( p2 - p0 );
    v0 = .5 * ( p1 - pMinus );

  }


  vec3 c0 = p0;
  vec3 c1 = p0 + v0/3.;
  vec3 c2 = p1 - v1/3.;
  vec3 c3 = p1;

  vec3 centerOfCircle = cubicCurve( amount , c0 , c1 , c2 , c3 );
  vec3 forNormal      = cubicCurve( amount - .1 , c0 , c1 , c2 , c3 );

  dirNorm = normalize(forNormal - centerOfCircle);

  columnPos = centerOfCircle ;
  
  columnToPos = pos.xyz - columnPos;


  // Closest Point Method
  float scalarProj = dot( columnToPos , dirNorm );
  vec3 parallelComponent = scalarProj * dirNorm;
  vec3 perpComponent = columnToPos - parallelComponent;

  vec3 normPerpComponent = normalize( perpComponent );
  vec3 pointToAttractTo = normPerpComponent * 3. + columnPos;


  vec3 p = vec3( 0. );

  // Exact rotation Method

  vec3 upVector = vec3( 0. , 0. , 1. );
  float upVectorProj = dot( upVector , dirNorm );
  vec3 upVectorPara = upVectorProj * dirNorm;
  vec3 upVectorPerp = upVector - upVectorPara;

  vec3 basisX = normalize( upVectorPerp );
  vec3 basisY = cross( dirNorm , basisX );

  float theta = vUv.x * 2. * 3.14195;
 
  float x = cos( theta );
  float y = sin( theta );

  float r = 300.* sqrt(vUv.y) * (1./( (5. * vUv.y) +.4)) * (vUv.y*vUv.y*vUv.y  + .1);
  pointToAttractTo = columnPos + ( r * x * basisX ) + ( r * y * basisY );

  //vel += normalize((pointToAttractTo - pos.xyz)) * .1;

  vec3 distToPoint = pointToAttractTo - pos.xyz;

  
    if( length( totalForce ) > maxVel ){

      totalForce = normalize( totalForce ) * maxVel;

    }

    vec3 pointPower = distToPoint ;

  if( vUv.y + size > 1. ){
    pointPower = vec3( 0. );
  }
    p = pos.xyz + vel * .3 + pointPower * .1 * ((1.-vUv.y)) + totalForce * .5; //* dT ; 


   // gl_FragColor = vec4( p , 1. );



  gl_FragColor = vec4( p , 1. );
  


}
