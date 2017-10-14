import {mat4} from 'gl-matrix';

import {CubeMap} from './CubeMap';
import GltfLoader from './GltfLoader';
import ModelRenderer from './ModelRenderer';
import {fetchImage} from './ResourceFetcher';
import {createSkyBox} from './SkyBoxCreator';
import SkyBoxRenderer from './SkyBoxRenderer';

let skyBoxRenderer: SkyBoxRenderer;
let modelRenderer: ModelRenderer;
let modelLoader: GltfLoader;

// TODO: Make functions more generic and refactor into modules.
// TODO: Add documentation comments on all functions, classes, and interfaces.

const FOV = 45 * Math.PI / 180;

var then = 0;
var squareRotation = 0.0;
let xRot: number|undefined = undefined;
let yRot: number|undefined = undefined;
let zoom: number = 2;

function drawScene(gl: WebGLRenderingContext, cubeMap: CubeMap) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

  const projectionMatrix = mat4.create();
  mat4.perspective(
      projectionMatrix,
      FOV,          // FOV
      aspectRatio,  // Aspect
      0.1,          // Z-Near
      100.0);       // Z-Far


  const viewMatrix = mat4.create();
  mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -Math.pow(2, zoom)]);

  const modelViewMatrix = mat4.create();
  if (xRot === undefined || yRot === undefined) {
    mat4.rotate(modelViewMatrix, viewMatrix, squareRotation, [0, 0, 1]);

    mat4.rotate(
        modelViewMatrix, modelViewMatrix, squareRotation * 0.7, [0, 1, 0]);
  } else {
    mat4.rotate(modelViewMatrix, viewMatrix, yRot, [0, 1, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, xRot, [1, 0, 0]);
  };

  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.disable(gl.DEPTH_TEST);
  skyBoxRenderer.setFov(FOV);
  skyBoxRenderer.setAspect(aspectRatio);
  skyBoxRenderer.renderSkyBox(viewMatrix);

  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  modelRenderer.renderModel(0, projectionMatrix, modelViewMatrix, cubeMap);
};

/** Does what it says on the tin. */
function main() {
  const canvas = <HTMLCanvasElement>document.getElementById('glCanvas');
  // Initialize the GL context
  const gl = canvas.getContext('webgl');
  if (gl === null) {
    console.error('Unable to initialize GL context!');
    return;
  };

  modelLoader = new GltfLoader();
  modelRenderer =
      ModelRenderer.create(gl, () => canvas.width, () => canvas.height);

  skyBoxRenderer =
      SkyBoxRenderer.create(gl, () => canvas.width, () => canvas.height);

  // const normalTest =
  // 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/NormalTangentTest/glTF/NormalTangentTest.gltf';
  const helmet =
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf';
  // const fish =
  // 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BarramundiFish/glTF/BarramundiFish.gltf';
  // const corset =
  // 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Corset/glTF/Corset.gltf';

  modelLoader.loadGltf(helmet)
      .then((model) => {
        modelRenderer.registerModel(model);
      })
      .then(() => {
        return fetchImage('dist/SkyBox.jpg');
      })
      .then((data: HTMLImageElement) => {
        return createSkyBox(gl, data);
      })
      .then((cubeMap: CubeMap) => {
        skyBoxRenderer.setCubeMap(cubeMap);
        let render = (now: number) => {
          now *= 0.001;
          const deltaTime = now - then;
          then = now;

          squareRotation += deltaTime;

          drawScene(gl, cubeMap);
          requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
      });
};

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

canvas.addEventListener('mousewheel', (event: WheelEvent) => {
  zoom -= event.wheelDeltaY / 1000;
});