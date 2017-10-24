import {CubeMap} from './CubeMap';
import {createShaderProgram} from './util/ShaderUtils';

const SKYBOX_SIZE = 2048;

export function createSkyBox(
    gl: WebGLRenderingContext, image: HTMLImageElement): CubeMap {
  const newShaderProgram = getShaderProgram(gl);
  gl.useProgram(newShaderProgram);

  const vertexPosition =
      gl.getAttribLocation(newShaderProgram, 'aVertexPosition');
  const textureCoord = gl.getAttribLocation(newShaderProgram, 'aTextureCoord');
  const skyboxSampler =
      gl.getUniformLocation(newShaderProgram, 'uSkyboxSampler');

  const skyBoxTexture = gl.createTexture();
  if (!skyBoxTexture) {
    throw new Error(`Could not create texture for sky map!`);
  }
  gl.bindTexture(gl.TEXTURE_2D, skyBoxTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, skyBoxTexture);
  gl.uniform1i(skyboxSampler, 0);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, POSITIONS, gl.STATIC_DRAW);
  gl.vertexAttribPointer(
      vertexPosition, 2, WebGLRenderingContext.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, UVS, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(textureCoord);

  const indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, INDICES, gl.STATIC_DRAW);

  const cubeTexture = gl.createTexture();
  if (!cubeTexture) {
    throw new Error('Could not create texture for sky box!');
  }
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameterf(
      gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  for (let i = 0; i < 6; ++i) {
    gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, SKYBOX_SIZE,
        SKYBOX_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }

  const frameBuffer = gl.createFramebuffer();
  if (frameBuffer === null) {
    throw new Error('Could not create frame buffer for sky box!');
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

  gl.viewport(0, 0, SKYBOX_SIZE, SKYBOX_SIZE);
  for (let i = 0; i < 6; ++i) {
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, cubeTexture, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(
        textureCoord, 2, WebGLRenderingContext.FLOAT, false, 0, i * 4 * 4 * 2);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // tslint:disable-next-line:no-bitwise
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
  }
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.disableVertexAttribArray(vertexPosition);
  gl.disableVertexAttribArray(textureCoord);

  gl.deleteFramebuffer(frameBuffer);
  gl.deleteBuffer(texCoordBuffer);
  gl.deleteBuffer(positionBuffer);
  gl.deleteTexture(skyBoxTexture);

  return cubeTexture;
}

let shaderProgram: WebGLProgram;
function getShaderProgram(gl: WebGLRenderingContext): WebGLProgram {
  if (!shaderProgram) {
    const program = createShaderProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (!program) {
      throw new Error('Could not create shader program!');
    }
    shaderProgram = program;
  }
  return shaderProgram;
}

const VERTEX_SHADER = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

varying highp vec2 vTextureCoord;

void main(void) {
  gl_Position = vec4(aVertexPosition, 0.5, 1.0);
  vTextureCoord = aTextureCoord;
}
`;

const FRAGMENT_SHADER = `
varying highp vec2 vTextureCoord;

uniform sampler2D uSkyBoxSampler;

void main(void) {
  gl_FragColor = texture2D(uSkyBoxSampler, vTextureCoord);
}
`;

/*
   ┌──┐
   │+z│
┌──┼──┼──┬──┐
│-x│-y│+x│+y│
└──┼──┼──┴──┘
   │-z│
   └──┘
  */

const INDICES = new Uint8Array([0, 1, 2, 0, 2, 3]);

const POSITIONS = new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]);

const UVS = new Float32Array([
  // +x
  1 / 2,
  2 / 3,
  1 / 2,
  1 / 3,
  3 / 4,
  1 / 3,
  3 / 4,
  2 / 3,

  // -x
  0,
  2 / 3,
  0,
  1 / 3,
  1 / 4,
  1 / 3,
  1 / 4,
  2 / 3,

  // -z
  1 / 4,
  1 / 3,
  1 / 4,
  0,
  1 / 2,
  0,
  1 / 2,
  1 / 3,

  // +z
  1 / 4,
  1,
  1 / 4,
  2 / 3,
  1 / 2,
  2 / 3,
  1 / 2,
  1,

  // -y
  1 / 4,
  2 / 3,
  1 / 4,
  1 / 3,
  1 / 2,
  1 / 3,
  1 / 2,
  2 / 3,

  // +y
  3 / 4,
  2 / 3,
  3 / 4,
  1 / 3,
  1,
  1 / 3,
  1,
  2 / 3,

]);
