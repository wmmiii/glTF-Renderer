import {mat4} from 'gl-matrix';

import ShaderProgram from './ShaderProgram';

const VERTEX_SHADER = `
attribute vec2 aVertexPosition;

uniform mat4 uItModelViewMatrix;
uniform float uZDepth;
uniform float uAspectRatio;

varying highp vec3 vFromCamera;

void main(void) {
  highp vec4 position = vec4(aVertexPosition, 0.5, 1.0);
  vFromCamera = vec3(aVertexPosition * vec2(uAspectRatio, 1.0), uZDepth);
  vFromCamera = (uItModelViewMatrix * vec4(vFromCamera, 1.0)).xyz;
  gl_Position = position;
}
`;

const FRAGMENT_SHADER = `
varying highp vec3 vFromCamera;

uniform samplerCube uSkyBoxSampler;

void main(void) {
  gl_FragColor = textureCube(uSkyBoxSampler, normalize(vFromCamera));
}
`;

export default class SkyBoxShader extends ShaderProgram {
  static create(
      gl: WebGLRenderingContext, width: () => number, height: () => number) {
    const shaderProgram =
        ShaderProgram.createShaderProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (shaderProgram === null) {
      throw new Error(
          'Could not create shader program for model shader program!');
    }
    const shader = new SkyBoxShader(gl, shaderProgram, width, height);
    shader.bindLocations();
    shader.init();
    return shader;
  }

  private indicesBuffer: WebGLBuffer;
  private positionsBuffer: WebGLBuffer;
  private skyBoxTexture: WebGLTexture;

  private vertexPosition: number;

  private itModelViewMatrix: WebGLUniformLocation;
  private zDepthLocation: WebGLUniformLocation;
  private aspectLocation: WebGLUniformLocation;
  private skyBoxSampler: WebGLUniformLocation;

  private zDepth: number;
  private aspectRatio: number;

  draw(modelViewMatrix: mat4) {
    const gl = this.gl;
    this.activate();

    const itModelViewMatrix = mat4.create();
    mat4.invert(itModelViewMatrix, modelViewMatrix);
    mat4.transpose(itModelViewMatrix, itModelViewMatrix);
    gl.uniformMatrix4fv(this.itModelViewMatrix, false, itModelViewMatrix);

    gl.uniform1f(this.zDepthLocation, this.zDepth);

    gl.uniform1f(this.aspectLocation, this.aspectRatio);

    this.bindCubeMap(this.skyBoxTexture, this.skyBoxSampler, 0);
    this.bindAttribute(
        this.positionsBuffer, this.vertexPosition, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

    gl.clearDepth(1.0);
  }

  bindSkyBoxTexture(texture: WebGLTexture) {
    this.skyBoxTexture = texture;
  }

  setFov(fov: number) {
    this.zDepth = 1.0 / Math.sin(fov / 2.0);
  }

  setAspect(ratio: number) {
    this.aspectRatio = ratio;
  }

  protected bindLocations(): void {
    this.vertexPosition = this.findAttributeOrThrow('aVertexPosition');

    this.itModelViewMatrix = this.findUniformOrThrow('uItModelViewMatrix');
    this.zDepthLocation = this.findUniformOrThrow('uZDepth');
    this.aspectLocation = this.findUniformOrThrow('uAspectRatio');
    this.skyBoxSampler = this.findUniformOrThrow('uSkyBoxSampler');
  }

  private init() {
    const gl = this.gl;
    this.activate();

    const vertexPosition = gl.createBuffer();
    if (vertexPosition === null) {
      throw new Error('Could not create buffer for sky box renderer!');
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosition);
    gl.bufferData(gl.ARRAY_BUFFER, POSITIONS, gl.STATIC_DRAW);
    this.positionsBuffer = vertexPosition;

    const indicesBuffer = gl.createBuffer();
    if (indicesBuffer === null) {
      throw new Error('Could not create index buffer for sky box renderer!');
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, INDICES, gl.STATIC_DRAW);
    this.indicesBuffer = indicesBuffer;
  }
}

const INDICES = new Uint8Array([0, 1, 2, 0, 2, 3]);

const POSITIONS = new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]);
