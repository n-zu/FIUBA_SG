precision highp float;

uniform bool useTexture;

uniform vec3 ambient;
uniform float diffuseFactor;
uniform sampler2D texture;
uniform vec3 specular;
uniform float gloss;

uniform vec3 directionalLightDir;// reversed
uniform vec3 directionalLightColor;

const int MAX_POINT_LIGHTS = 4;
uniform vec3 pointLightPos[MAX_POINT_LIGHTS];
uniform vec3 pointLightColor[MAX_POINT_LIGHTS];

uniform vec3 cameraPosition;

varying vec3 vNormal;
varying vec3 vPosWorld;
varying vec2 vUV;


void main(void) {


  if ( useTexture ) {
    
    vec3 viewDir = normalize( cameraPosition - vPosWorld );

    vec3 tex1 = texture2D(texture, vUV*1.00).xyz;
    vec3 tex2 = texture2D(texture, vUV*0.64).xyz;
    vec3 tex3 = texture2D(texture, vUV*0.17).xyz;
    vec3 tex4 = mix(tex1, tex2, 0.3);
    vec3 tex5 = mix(tex4, tex3, 0.3) ;


    vec3 ambientColor = tex5 * ambient;
    vec3 diffuseColor = vec3(0.0, 0.0, 0.0);
    vec3 specularColor = vec3(0.0, 0.0, 0.0);

    {
      vec3 lightDir = normalize(directionalLightDir);
      float lambert = max(dot(vNormal, lightDir), 0.0);
      diffuseColor += lambert * directionalLightColor;
      
      vec3 halfDir = normalize(lightDir + viewDir);
      float specularFactor = pow(max(dot(vNormal, halfDir), 0.0), gloss);
      specularColor += specularFactor * directionalLightColor;
    }

    for ( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {
      vec3 _lightDir = pointLightPos[i] - vPosWorld;
      float lightDist = length(_lightDir);
      vec3 lightDir = normalize(_lightDir);
      float lambert = max(dot(vNormal, lightDir), 0.0);
      diffuseColor += pointLightColor[i] * lambert / lightDist;

      vec3 halfDir = normalize(lightDir + viewDir);
      float specularFactor = pow(max(dot(vNormal, halfDir), 0.0), gloss);
      specularColor += specularFactor * pointLightColor[i] / lightDist;
    }

    diffuseColor *= tex5 * diffuseFactor;
    specularColor *= specular;

    vec3 color = ambientColor + diffuseColor + specularColor;

    gl_FragColor = vec4(color, 1.0);

  } else {
  vec3 normalColor = vec3(0.5, 0.5, 0.5) + 0.5 * vNormal;
    gl_FragColor = vec4(normalColor, 1.0);
  }
}