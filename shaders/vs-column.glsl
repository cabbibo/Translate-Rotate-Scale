
uniform sampler2D lookup;
varying vec2 vUv;

void main(){

  vec4 p = texture2D( lookup , position.xy );

  vUv = position.xy;
  gl_PointSize = 10.;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( p.xyz , 1. );


}
