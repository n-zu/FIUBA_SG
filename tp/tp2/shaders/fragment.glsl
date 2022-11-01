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
  float lightFactor = 0.6 + 0.3*vNormal.y + 0.05 * vNormal.z + 0.05 * vNormal.x; 


  if ( useTexture ) {

    vec3 tex1 = texture2D(texture, vUV*1.00).xyz;
    vec3 tex2 = texture2D(texture, vUV*0.64).xyz;
    vec3 tex3 = texture2D(texture, vUV*0.17).xyz;

    vec3 col1 = mix(tex1, tex2, 0.3);
    vec3 col2 = mix(col1, tex3, 0.3);

    gl_FragColor = vec4(col2*lightFactor, 1.0);
  } else {
    gl_FragColor = vec4(normalColor, 1.0);
  }
}