import {mat4} from 'gl-matrix';

import GltfLoader from './GltfLoader';
import ModelRenderer from './ModelRenderer';
import ProgramInfo from './ProgramInfo';

let modelRenderer: ModelRenderer;
let modelLoader: GltfLoader;

// TODO: Make functions more generic and refactor into modules.
// TODO: Add documentation comments on all functions, classes, and interfaces.

/** Vertex shader program */
const vsSource = `
attribute vec4 aVertexPosition;
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

  highp vec4 vertexCamera = uModelViewMatrix * aVertexPosition;
  // highp vec4 vertexCamera = uCameraSpaceMatrix * aVertexPosition;
  gl_Position = uProjectionMatrix * vertexCamera;
  vFromCamera = normalize(vec3(vertexCamera));
}
`;

/** Fragment shader program */
const fsSource = `
varying highp vec2 vTextureCoord;
varying highp vec3 vFromCamera;
varying highp vec3 vNormal;
varying highp vec3 vTangent;
varying highp vec3 vBiTangent;

uniform sampler2D uBaseSampler;
uniform sampler2D uNormalSampler;

void main(void) {
  
  highp vec4 normalOriginal = vec4(normalize(texture2D(uNormalSampler, vTextureCoord).xyz * 2.0 - vec3(1.0, 1.0, 1.0)), 1.0);
  highp mat4 normalTransform = mat4(vec4(normalize(vTangent), 0), vec4(normalize(vBiTangent), 0), vec4(normalize(vNormal), 0), vec4(0, 0, 0, 1));
  highp vec3 normal = normalize(vec3(normalTransform * normalOriginal));
  
  highp vec3 lighting = vec3(0.2, 0.2, 0.4);
  highp vec4 baseColor = texture2D(uBaseSampler, vTextureCoord);

  highp vec3 vReflection = vFromCamera - 2.0 * (normal * dot(vFromCamera, normal));
  
  highp float directional = mix(0.4, 1.0, dot(vReflection, normalize(vec3(0.8, 0, 1))));

  lighting += directional * vec3(1, 0.9, 0.8);

  gl_FragColor = vec4(lighting, 1.0) * baseColor;
}
`;

var then = 0;
var squareRotation = 0.0;
let xRot: number|undefined = undefined;
let yRot: number|undefined = undefined;

/*
 * Initializes a shader program;
 */
function initShaderProgram(
    gl: WebGLRenderingContext, vsSource: string,
    fsSource: string): WebGLProgram|null {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
        'Unable to initialize the shader program: ' +
        gl.getProgramInfoLog(shaderProgram));
    return null;
    }

  return shaderProgram;
  }

/*
* Creates a shader of the given type, uploads the source and
* compiles it.
*/
function loadShader(
    gl: WebGLRenderingContext, type: number, source: string): WebGLShader|null {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
        'An error occurred compiling the shaders: ' +
        gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
    }

  return shader;
  }

function drawScene(gl: WebGLRenderingContext, programInfo: ProgramInfo) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  const projectionMatrix = mat4.create();
  mat4.perspective(
      projectionMatrix,
      45 * Math.PI / 180,                              // FOV
      gl.canvas.clientWidth / gl.canvas.clientHeight,  // Aspect
      0.1,                                             // Z-Near
      100.0);                                          // Z-Far


  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -3.0]);

  if (xRot === undefined || yRot === undefined) {
    mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation, [0, 0, 1]);

    mat4.rotate(
        modelViewMatrix, modelViewMatrix, squareRotation * 0.7, [0, 1, 0]);
  } else {
    mat4.rotate(modelViewMatrix, modelViewMatrix, xRot, [1, 0, 0]);

    mat4.rotate(modelViewMatrix, modelViewMatrix, yRot, [0, 1, 0]);
    }

  const itModelViewMatrix = mat4.create();
  mat4.invert(itModelViewMatrix, modelViewMatrix);
  mat4.transpose(itModelViewMatrix, itModelViewMatrix);


  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniforms.matrices.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniforms.matrices.modelViewMatrix, false, modelViewMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniforms.matrices.itModelViewMatrix, false,
      itModelViewMatrix);

  modelRenderer.renderModel(0, programInfo);
  }

/** Does what it says on the tin. */
function main() {
  const canvas = <HTMLCanvasElement>document.getElementById('glCanvas');
  // Initialize the GL context
  const gl = canvas.getContext('webgl');
  if (gl === null) {
    console.error('Unable to initialize GL context!');
    return;
  }

  modelLoader = new GltfLoader();
  modelRenderer = new ModelRenderer(gl);

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  const vertexNormal = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
  const vertexTan = gl.getAttribLocation(shaderProgram, 'aVertexTan');
  const vertexBiTan = gl.getAttribLocation(shaderProgram, 'aVertexBiTan');
  const textureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');

  const projectionMatrix =
      gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
  const modelViewMatrix =
      gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
  const itModelViewMatrix =
      gl.getUniformLocation(shaderProgram, 'uItModelViewMatrix');

  const baseSampler = gl.getUniformLocation(shaderProgram, 'uBaseSampler');
  const normalSampler = gl.getUniformLocation(shaderProgram, 'uNormalSampler');

  if (shaderProgram === null || vertexPosition === null ||
      vertexNormal === null || vertexTan === null || vertexBiTan === null ||
      textureCoord === null || projectionMatrix === null ||
      modelViewMatrix === null || itModelViewMatrix === null ||
      baseSampler === null || normalSampler === null) {
    console.error('Unable to bind one of the attributes or uniforms!');
    return;
    }

  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attributes: {
      vertexPosition: vertexPosition,
      vertexNormal: vertexNormal,
      vertexTangent: vertexTan,
      vertexBiTangent: vertexBiTan,
      textureCoord: textureCoord,
    },
    uniforms: {
      matrices: {
        projectionMatrix: projectionMatrix,
        modelViewMatrix: modelViewMatrix,
        itModelViewMatrix: itModelViewMatrix
      },
      samplers: {baseSampler: baseSampler, normalSampler: normalSampler}
    },
  };

  // const normalTest =
  // 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/NormalTangentTest/glTF/NormalTangentTest.gltf';
  const helmet =
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf';
  // const fish =
  // 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BarramundiFish/glTF/BarramundiFish.gltf';
  // const corset =
  // 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Corset/glTF/Corset.gltf';

  modelLoader.loadGltf(helmet).then((model) => {
    modelRenderer.registerModel(model);
    let render = (now: number) => {
      now *= 0.001;
      const deltaTime = now - then;
      then = now;

      squareRotation += deltaTime;

      drawScene(gl, programInfo);
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  });
}

document.body.onload = main;

const canvas = document.getElementsByTagName('canvas')[0];
canvas.addEventListener('mousemove', (event: MouseEvent) => {
  xRot = (event.x / canvas.width - 1.0) * 4.0;
  yRot = (event.y / canvas.height - 1.0) * 4.0;
});

canvas.addEventListener('mouseout', () => {
  xRot = undefined;
  yRot = undefined;
});