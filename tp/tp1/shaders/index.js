export const default_vertex = `precision highp float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform mat4 normalMatrix;

varying vec3 vNormal;
varying vec3 vPosWorld;

void main(void) {
  gl_Position = projMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);

  vPosWorld=(modelMatrix*vec4(aVertexPosition,1.0)).xyz;
  vNormal=(normalMatrix*vec4(aVertexNormal,1.0)).xyz;
}`;

export const default_fragment = `
precision highp float;
varying vec3 vNormal;
varying vec3 vPosWorld;

void main(void) {

  vec3 lightVec=normalize(vec3(0.0,3.0,5.0)-vPosWorld);
  vec3 diffColor=mix(vec3(0.7,0.7,0.7),vNormal,0.4);
  vec3 color=dot(lightVec,vNormal)*diffColor+vec3(0.2,0.2,0.2);

  vec3 normalColor = vec3(0.5, 0.5, 0.5) + 0.5 * vNormal;

  vec3 yColor = vec3(0.5, 0.5, 0.5) + vec3(0.0, 0.5, 0.0) * vNormal.y;

  gl_FragColor = vec4(normalColor,1.0);
}`;
