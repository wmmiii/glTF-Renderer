import {mat4} from 'gl-matrix';

import {CubeMap} from './CubeMap';
import GltfLoader from './GltfLoader';
import ModelRenderer from './ModelRenderer';
import {fetchImage} from './ResourceFetcher';
import {createSkyBox} from './SkyBoxCreator';
import SkyBoxShader from './SkyBoxShader';

let skyBoxShader: SkyBoxShader;
let modelRenderer: ModelRenderer;
let modelLoader: GltfLoader;

// TODO: Make functions more generic and refactor into modules.
// TODO: Add documentation comments on all functions, classes, and interfaces.

const FOV = 45 * Math.PI / 180;

var then = 0;
var squareRotation = 0.0;
let xRot: number = Math.PI;
let yRot: number = Math.PI / 2;
let xVel: number = 0;
let yVel: number = 0;

let xCurrent: number = 0;
let yCurrent: number = 0;
let xLastFrame: number = 0;
let yLastFrame: number = 0;

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
  if (dragging) {
    xVel = ((xCurrent - xLastFrame) / (gl.canvas.clientWidth / 2.0));
    yVel = ((yCurrent - yLastFrame) / (gl.canvas.clientHeight / 2.0));
    xLastFrame = xCurrent;
    yLastFrame = yCurrent;
  } else {
    xVel /= 1.1;
    yVel /= 1.1;
  };
  xRot -= xVel;
  yRot += yVel;

  if (yRot > Math.PI) {
    yRot = Math.PI;
  } else if (yRot < 0) {
    yRot = 0;
  }

  mat4.rotate(modelViewMatrix, viewMatrix, yRot, [1, 0, 0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, xRot, [0, 0, 1]);

  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.disable(gl.DEPTH_TEST);
  skyBoxShader.setFov(FOV);
  skyBoxShader.setAspect(aspectRatio);
  skyBoxShader.draw(viewMatrix);

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

  skyBoxShader =
      SkyBoxShader.create(gl, () => canvas.width, () => canvas.height);

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
        return fetchImage('images/Yokohama.jpg');
      })
      .then((data: HTMLImageElement) => {
        return createSkyBox(gl, data);
      })
      .then((cubeMap: CubeMap) => {
        skyBoxShader.bindSkyBoxTexture(cubeMap);
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
canvas.style.cursor = 'grab';
let dragging = false;
canvas.addEventListener('mousedown', (event: MouseEvent) => {
  dragging = true;
  xCurrent = event.x;
  xLastFrame = event.x;
  yCurrent = event.y;
  yLastFrame = event.y;
  canvas.style.cursor = 'grabbing';
});
let endDrag = () => {
  dragging = false;
  canvas.style.cursor = 'grab';
};
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mouseout', endDrag);

canvas.addEventListener('mousemove', (event: MouseEvent) => {
  if (dragging) {
    xCurrent = event.x;
    yCurrent = event.y;
  }
});

canvas.addEventListener('mousewheel', (event: WheelEvent) => {
  zoom -= event.wheelDeltaY / 1000;
});