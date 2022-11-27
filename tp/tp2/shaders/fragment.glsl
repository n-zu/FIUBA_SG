precision highp float;

uniform bool useTexture;

uniform float texScale[2];
uniform float texWeight[2];

uniform vec3 ambient;
uniform float diffuseFactor;
uniform vec3 specular;
uniform float gloss;
uniform vec3 emissive;

uniform sampler2D texture;
uniform bool useNormalMap;
uniform sampler2D normalMap;

uniform int cubeMapMode;
uniform float cubeMapStr;
uniform float cubeMapNormalCorrection;
uniform samplerCube cubeMap;

uniform vec3 directionalLightDir;// reversed
uniform vec3 directionalLightColor;

const int MAX_POINT_LIGHTS = 15; // max towers (12) + max ammo (~3)
uniform int numPointLights;
uniform vec3 pointLightPos[MAX_POINT_LIGHTS];
uniform vec3 pointLightColor[MAX_POINT_LIGHTS];

const float linealDecay = 1.0;
const float quadraticDecay = 0.5;

uniform vec3 cameraPosition;

varying vec3 vPosWorld;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBiNormal;
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

float emissiveFactor( vec3 normal, vec3 viewDir ){
    return max( dot( normal, viewDir ), 0.0 ) +0.5;
}

vec3 texPoint( sampler2D tex) {
  vec3 tex1 = texture2D(tex, vUV*1.00).xyz;
    vec3 tex2 = texture2D(tex, vUV*texScale[0]).xyz;
    vec3 tex3 = texture2D(tex, vUV*texScale[1]).xyz;
    vec3 tex4 = mix(tex1, tex2, texWeight[0]);
    vec3 tex5 = mix(tex4, tex3, texWeight[1]) ;
    return tex5;
}

vec3 getNormal(){
  if (useNormalMap) {
    vec3 normal = texPoint(normalMap);
    normal = normalize(normal * 2.0 - 1.0);
    normal = normalize(normal.x * vTangent + normal.y * vBiNormal + normal.z * vNormal);
    return normal;
  } else {
    return vNormal;
  }
}

vec3 cubeMapInput( vec3 normal ){

  if( cubeMapMode == 0 ){
    return vec3( 0.0, 0.0, 0.0 );
  }

  vec3 eyeToSurfaceDir = normalize(vPosWorld - cameraPosition);
  vec3 adjustedNormal = mix( normal, vNormal, cubeMapNormalCorrection );

  if(cubeMapMode == 1){ // Exterior
    vec3 direction = reflect(eyeToSurfaceDir,adjustedNormal);
    return textureCube(cubeMap, direction).xyz;
  }

  if(cubeMapMode == 2){ // Interior
    // FIXME: This is harder to implement than i thought it'd be
    // It wont be implemented for now
    // https://www.proun-game.com/Oogst3D/CODING/InteriorMapping/InteriorMapping.pdf
    return vec3( 0.0, 0.0, 0.0 );
  }

}

void main(void) {


  if ( useTexture ) {
    
    vec3 viewDir = normalize( cameraPosition - vPosWorld );

    vec3 tex = texPoint(texture);
    vec3 normalVec = getNormal();

    vec3 ambientColor = tex * ambient;
    vec3 diffuseColor = vec3(0.0, 0.0, 0.0);
    vec3 specularColor = vec3(0.0, 0.0, 0.0);

    // directional light
    {
      vec3 lightDir = normalize(directionalLightDir);
      float lambert = lambert( normalVec, lightDir );
      diffuseColor += lambert * directionalLightColor;
      
      float specularFactor = specularFactor( normalVec, lightDir, viewDir );
      specularColor += specularFactor * directionalLightColor;
    }

    // point lights
    for ( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {
      if ( i >= numPointLights ) break;
      vec3 lightDir = pointLightPos[i] - vPosWorld;
      float decay = decay( length( lightDir ) );
      float lambert = lambert( normalVec,  normalize(lightDir) );
      diffuseColor += pointLightColor[i] * lambert * decay;

      float specularFactor = specularFactor( normalVec, normalize(lightDir), viewDir );
      specularColor += specularFactor * pointLightColor[i] * decay;
    }

    diffuseColor *= tex * diffuseFactor;
    specularColor *= specular;

    vec3 emissiveColor = emissive * emissiveFactor( normalVec, viewDir );

    vec3 color = ambientColor + diffuseColor + specularColor + emissiveColor;
    color += cubeMapInput(normalVec)*cubeMapStr*ambient;

    gl_FragColor = vec4(color, 1.0);

  } else {
  vec3 normalColor = vec3(0.5, 0.5, 0.5) + 0.5 * vNormal;
    gl_FragColor = vec4(normalColor, 1.0);
  }
}