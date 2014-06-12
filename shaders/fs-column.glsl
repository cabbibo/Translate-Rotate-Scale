
varying vec2 vUv;
void main(){

  if( vUv.x > ( 1. / 10. )){

      discard;

  }
  gl_FragColor = vec4( 1.0 );

}
