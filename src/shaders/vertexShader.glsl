attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uCubeRotateMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;
varying highp vec3 vFromCamera;
varying highp vec3 vLighting;
varying highp vec3 vNormal;

void main(void) {
  vTextureCoord = aTextureCoord;

  // Apply lighting effect
  highp vec3 ambientLight = vec3(0.2, 0.2, 0.4);
  highp vec3 directionalLightColor = vec3(1, 0.9, 0.8);
  highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

  highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  vLighting = ambientLight + (directionalLightColor * directional);

  highp vec4 vertexCamera = uModelViewMatrix * uCubeRotateMatrix * aVertexPosition;
  // highp vec4 vertexCamera = uModelViewMatrix * aVertexPosition;
  gl_Position = uProjectionMatrix * vertexCamera;
  vFromCamera = normalize(vec3(vertexCamera));

  vNormal = transformedNormal.xyz;
}