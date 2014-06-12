varying vec2 vUv;
uniform vec3 leader;

uniform sampler2D t_pos;
uniform sampler2D t_oPos;


const float size = 1. / 8. ;
const float sL = 10.;
const float maxVel = 5.;

vec3 springForce( vec3 toPos , vec3 fromPos , float staticLength ){

  vec3 dif = fromPos - toPos;
  vec3 nDif = normalize( dif );
  vec3 balance = nDif * staticLength;

  vec3 springDif = balance - dif;

  return springDif;

}



void main(){

  vec4 pos = texture2D( t_pos , vUv.xy );
  vec4 oPos = texture2D( t_oPos , vUv.xy );

  vec3 vel = oPos.xyz - pos.xyz;

  vec3 force = vec3( 0. );


  if( vUv.x < size ){
    if( vUv.y < size ){

       force += springForce( leader , pos.xyz , sL );

    }else{

      vec3 upPos = texture2D( t_pos , vec2( vUv.x , vUv.y - size ) ).xyz;
  
      force += springForce( upPos , pos.xyz , sL );

    }

  }

  force *= .5;

  
  if( length( force ) > maxVel ){

    force = normalize( force ) * maxVel;

  }


  vec3 p = pos.xyz + force; //* dT ; 

  gl_FragColor = vec4( p , 1. );



}
