import {mat4} from 'gl-matrix';

import ShaderProgram from './ShaderProgram';
import {createTexture} from './util/ShaderUtils';

const VERTEX_SHADER = `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexTan;
attribute vec3 aVertexBiTan;
attribute vec2 aTextureCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uItModelViewMatrix;

varying highp vec2 vTextureCoord;
varying highp vec3 vFromCamera;
varying highp vec3 vNormal;
varying highp vec3 vTangent;
varying highp vec3 vBiTangent;

void main(void) {
  vTextureCoord = aTextureCoord;

  // Apply lighting effect
  highp vec3 ambientLight = vec3(0.2, 0.2, 0.4);
  highp vec3 directionalLightColor = vec3(1, 0.9, 0.8);
  highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  highp mat4 temp = uItModelViewMatrix * uItModelViewMatrix;
  vNormal = (uModelViewMatrix * vec4(aVertexNormal, 0)).xyz;
  vTangent = (uModelViewMatrix * vec4(aVertexTan, 0)).xyz;
  vBiTangent = (uModelViewMatrix * vec4(aVertexBiTan, 0)).xyz;

  // highp vec3 whatever = aTextureTan * aTextureBiTan;

  highp vec4 position = vec4(aVertexPosition, 1.0);
  highp vec4 vertexCamera = uModelViewMatrix * position;
  // highp vec4 vertexCamera = uCameraSpaceMatrix * position;
  gl_Position = uProjectionMatrix * vertexCamera;
  vFromCamera = normalize(vec3(vertexCamera));
}
`;

/** Fragment shader program */
const FRAGMENT_SHADER = `
highp vec3 dielectricSpecular = vec3(0.04, 0.04, 0.04);
highp vec3 black = vec3(0.0, 0.0, 0.0);

varying highp vec2 vTextureCoord;
varying highp vec3 vFromCamera;
varying highp vec3 vNormal;
varying highp vec3 vTangent;
varying highp vec3 vBiTangent;

uniform sampler2D uBaseSampler;
uniform sampler2D uEmissiveSampler;
uniform sampler2D uNormalSampler;
uniform sampler2D uMetallicRoughnessSampler;

uniform samplerCube uEnvironmentSampler;
uniform sampler2D uBrdfSampler;

uniform highp vec3 uEmissiveFactor;

void main(void) {
  highp vec4 normalOriginal =
      vec4(normalize(texture2D(uNormalSampler, vTextureCoord).xyz * 2.0
      - vec3(1.0, 1.0, 1.0)), 1.0);
  highp mat4 normalTransform =
      mat4(vec4(normalize(vTangent), 0), vec4(normalize(vBiTangent), 0),
           vec4(normalize(vNormal), 0), vec4(0, 0, 0, 1));
  highp vec3 normal = normalize(vec3(normalTransform * normalOriginal));

  highp vec4 metallicRoughness =
      texture2D(uMetallicRoughnessSampler, vTextureCoord);
  highp float metallic = metallicRoughness.b;
  highp float roughness = metallicRoughness.g;

  highp vec4 brdf =
      texture2D(uBrdfSampler, vec2(dot(-vFromCamera, normal), 1.0 - roughness));

  highp vec3 refVec = vFromCamera - 2.0 * (normal * dot(vFromCamera, normal));
  refVec *= vec3(1.0, 1.0, -1.0);
  highp vec3 diffLight =
      textureCube(uEnvironmentSampler, normalize(refVec), 10.0).rgb;
  highp vec3 specLight =
      textureCube(uEnvironmentSampler, normalize(refVec), 0.0).rgb;

  highp vec4 baseCol = texture2D(uBaseSampler, vTextureCoord);

  highp vec3 diffCol =
      mix(baseCol.rgb * (1.0 - dielectricSpecular.r), black, metallic);
  highp vec3 specCol = mix(dielectricSpecular, baseCol.rgb, metallic);

  highp vec3 emissiveCol = texture2D(uEmissiveSampler, vTextureCoord).rgb;
  emissiveCol *= uEmissiveFactor;

  highp vec3 finalColor = (diffCol * diffLight) +
      (specLight * (specCol * brdf.x + brdf.y)) + emissiveCol;
  finalColor *= 1.2;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default class ModelShader extends ShaderProgram {
  static create(
      gl: WebGLRenderingContext, width: () => number, height: () => number) {
    const shaderProgram =
        ShaderProgram.createShaderProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (shaderProgram === null) {
      throw new Error(
          'Could not create shader program for model shader program!');
    }
    const shader = new ModelShader(gl, shaderProgram, width, height);
    shader.bindLocations();

    const brdfImage = new Image();
    brdfImage.src = 'images/brdf.png';
    shader.brdfTexture =
        createTexture(gl, brdfImage, [1.0, 0.0, 0.0, 1.0], false);
    return shader;
  }

  private indexType: number;
  private indexOffset: number;
  private indexCount: number;

  private vertexPosition: number;
  private vertexNormal: number;
  private vertexTangent: number;
  private vertexBiTangent: number;
  private vertexTexCoord: number;

  private projectionMatrix: WebGLUniformLocation;
  private modelViewMatrix: WebGLUniformLocation;
  private itModelViewMatrix: WebGLUniformLocation;

  private baseSampler: WebGLUniformLocation;
  private emissiveSampler: WebGLUniformLocation;
  private normalSampler: WebGLUniformLocation;
  private metallicRoughnessSampler: WebGLUniformLocation;

  private environmentSampler: WebGLUniformLocation;
  private emissiveFactor: WebGLUniformLocation;

  private brdfTexture: WebGLTexture;
  private brdfSampler: WebGLUniformLocation;

  draw(mode = WebGLRenderingContext.TRIANGLES): void {
    this.bindBrdfTexture();
    this.gl.drawElements(
        mode, this.indexCount, this.indexType, this.indexOffset);
  }

  setIndices(buffer: WebGLBuffer, type: number, count: number, offset: number) {
    const gl = this.gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);

    this.indexType = type;
    this.indexCount = count;
    this.indexOffset = offset;
  }

  bindVertexPosition(
      buffer: WebGLBuffer, componentType: number, byteStride: number,
      byteOffset: number): void {
    this.bindAttribute(
        buffer, this.vertexPosition, 3, componentType, false, byteStride,
        byteOffset);
  }

  bindVertexNormal(
      buffer: WebGLBuffer, componentType: number, byteStride: number,
      byteOffset: number): void {
    this.bindAttribute(
        buffer, this.vertexNormal, 3, componentType, true, byteStride,
        byteOffset);
  }

  bindVertexTangent(
      buffer: WebGLBuffer, componentType: number, byteStride: number,
      byteOffset: number): void {
    this.bindAttribute(
        buffer, this.vertexTangent, 3, componentType, true, byteStride,
        byteOffset);
  }

  bindVertexBiTangent(
      buffer: WebGLBuffer, componentType: number, byteStride: number,
      byteOffset: number): void {
    this.bindAttribute(
        buffer, this.vertexBiTangent, 3, componentType, true, byteStride,
        byteOffset);
  }

  bindVertexTexCoord(
      buffer: WebGLBuffer, componentType: number, byteStride: number,
      byteOffset: number): void {
    this.bindAttribute(
        buffer, this.vertexTexCoord, 2, componentType, false, byteStride,
        byteOffset);
  }

  setProjectionMatrix(projectionMatrix: mat4) {
    this.gl.uniformMatrix4fv(this.projectionMatrix, false, projectionMatrix);
  }

  setModelViewMatrix(modelViewMatrix: mat4) {
    this.gl.uniformMatrix4fv(this.modelViewMatrix, false, modelViewMatrix);

    const itModelViewMatrix = mat4.create();
    mat4.invert(itModelViewMatrix, modelViewMatrix);
    mat4.transpose(itModelViewMatrix, itModelViewMatrix);
    this.gl.uniformMatrix4fv(this.itModelViewMatrix, false, itModelViewMatrix);
  }

  bindBaseTexture(texture: WebGLTexture) {
    this.bindTexture(texture, this.baseSampler, 0);
  }

  bindMetallicRoughnessTexture(texture: WebGLTexture) {
    this.bindTexture(texture, this.metallicRoughnessSampler, 1);
  }

  bindEmissiveTexture(texture: WebGLTexture) {
    this.bindTexture(texture, this.emissiveSampler, 2);
  }

  setEmissiveFactor(factor: number[]) {
    this.gl.uniform3fv(this.emissiveFactor, factor);
  }

  bindNormalTexture(texture: WebGLTexture) {
    this.bindTexture(texture, this.normalSampler, 3);
  }

  bindEnvironmentTexture(texture: WebGLTexture) {
    this.bindCubeMap(texture, this.environmentSampler, 4);
  }

  protected bindLocations(): void {
    this.vertexPosition = this.findAttributeOrThrow('aVertexPosition');
    this.vertexNormal = this.findAttributeOrThrow('aVertexNormal');
    this.vertexTangent = this.findAttributeOrThrow('aVertexTan');
    this.vertexBiTangent = this.findAttributeOrThrow('aVertexBiTan');
    this.vertexTexCoord = this.findAttributeOrThrow('aTextureCoord');

    this.projectionMatrix = this.findUniformOrThrow('uProjectionMatrix');

    this.modelViewMatrix = this.findUniformOrThrow('uModelViewMatrix');
    this.itModelViewMatrix = this.findUniformOrThrow('uItModelViewMatrix');

    this.baseSampler = this.findUniformOrThrow('uBaseSampler');
    this.emissiveSampler = this.findUniformOrThrow('uEmissiveSampler');
    this.normalSampler = this.findUniformOrThrow('uNormalSampler');
    this.metallicRoughnessSampler =
        this.findUniformOrThrow('uMetallicRoughnessSampler');

    this.emissiveFactor = this.findUniformOrThrow('uEmissiveFactor');

    this.environmentSampler = this.findUniformOrThrow('uEnvironmentSampler');
    this.brdfSampler = this.findUniformOrThrow('uBrdfSampler');
  }

  private bindBrdfTexture() {
    this.bindTexture(this.brdfTexture, this.brdfSampler, 5);
  }
}
