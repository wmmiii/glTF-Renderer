varying highp vec2 vTextureCoord;
varying highp vec3 vFromCamera;
varying highp vec3 vLighting;
varying highp vec3 vNormal;

uniform sampler2D uBaseSampler;

void main(void) {
  highp vec3 lighting = vec3(0.2, 0.2, 0.4);
  highp vec4 baseColor = texture2D(uBaseSampler, vTextureCoord);

  highp vec3 vReflection = vFromCamera - 2.0 * (vNormal * dot(vFromCamera, vNormal));
  
  highp float directional = mix(0.4, 1.0, dot(vReflection, normalize(vec3(0.85, 0.8, 0.75))));

  lighting += directional * vec3(1, 0.9, 0.8);

  gl_FragColor = vec4(lighting, 1.0);// * baseColor;
}