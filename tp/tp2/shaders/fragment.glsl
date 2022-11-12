precision highp float;

uniform bool useTexture;

uniform vec3 ambient;
uniform float diffuseFactor;
uniform sampler2D texture;
uniform vec3 specular;
uniform float gloss;

uniform vec3 directionalLightDir;// reversed
uniform vec3 directionalLightColor;

const int MAX_POINT_LIGHTS = 15; // max towers (12) + max ammo (~3)
uniform int numPointLights;
uniform vec3 pointLightPos[MAX_POINT_LIGHTS];
uniform vec3 pointLightColor[MAX_POINT_LIGHTS];

const float linealDecay = 1.0;
const float quadraticDecay = 0.5;

uniform vec3 cameraPosition;

varying vec3 vNormal;
varying vec3 vPosWorld;
varying vec2 vUV;

float lambert( vec3 normal, vec3 lightDir ){
    return max( dot( normal, lightDir ), 0.0 );
}

float specularFactor( vec3 normal, vec3 lightDir, vec3 viewDir ){
    vec3 halfDir = normalize( lightDir + viewDir );
    return pow( max( dot( normal, halfDir ), 0.0 ), gloss );
}

float decay( float dist ){
    return 1.0/( dist * linealDecay + dist * dist * quadraticDecay );
}

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
      float lambert = lambert( vNormal, lightDir );
      diffuseColor += lambert * directionalLightColor;
      
      float specularFactor = specularFactor( vNormal, lightDir, viewDir );
      specularColor += specularFactor * directionalLightColor;
    }

    for ( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {
      if ( i >= numPointLights ) break;
      vec3 lightDir = pointLightPos[i] - vPosWorld;
      float decay = decay( length( lightDir ) );
      float lambert = lambert( vNormal,  normalize(lightDir) );
      diffuseColor += pointLightColor[i] * lambert * decay;

      float specularFactor = specularFactor( vNormal, normalize(lightDir), viewDir );
      specularColor += specularFactor * pointLightColor[i] * decay;
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