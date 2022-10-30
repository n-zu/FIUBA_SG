precision highp float;

uniform bool useTexture;
uniform vec3 modelColor;
uniform sampler2D texture;

varying vec3 vNormal;
varying vec3 vPosWorld;
varying vec2 vUV;
 

void main(void) {

/*
  vec3 lightVec=normalize(vec3(0.0,3.0,5.0)-vPosWorld);
  vec3 diffColor=mix(vec3(0.7,0.7,0.7),vNormal,0.4);
  vec3 color=dot(lightVec,vNormal)*diffColor+vec3(0.2,0.2,0.2);
*/

  vec3 normalColor = vec3(0.5, 0.5, 0.5) + 0.5 * vNormal;
  float lightFactor = 0.6 + 0.15*vNormal.y + 0.05 * vNormal.z + 0.05 * vNormal.x; 

  if ( useTexture ) {
    gl_FragColor = texture2D(texture, vUV);
    // gl_FragColor = vec4(modelColor*lightFactor, 1.0);
  } else {
    gl_FragColor = vec4(normalColor, 1.0);
  }
}