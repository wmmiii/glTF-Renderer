import {mat4} from 'gl-matrix';

import {CubeMap} from './CubeMap';
import GltfLoader from './GltfLoader';
import ModelRenderer from './ModelRenderer';
import {fetchImage} from './ResourceFetcher';
import {createSkyBox} from './SkyBoxCreator';
import SkyBoxShader from './SkyBoxShader';
import * as App from './ui/App';
import {Author, ModelDetail, SkyBoxDetail} from './ui/Details';

let gl: WebGLRenderingContext;
let cubeMap: CubeMap;
let skyBoxShader: SkyBoxShader;
let modelRenderer: ModelRenderer;
let modelLoader: GltfLoader;

let currentModel: number;
let loadedModels: {[key: string]: number} = {};

// TODO: Make functions more generic and refactor into modules.
// TODO: Add documentation comments on all functions, classes, and interfaces.

const FOV = 45 * Math.PI / 180;

var then = 0;
let xRot: number = Math.PI;
let yRot: number = Math.PI / 2;
let xVel: number = 0;
let yVel: number = 0;

let xCurrent: number = 0;
let yCurrent: number = 0;
let xLastFrame: number = 0;
let yLastFrame: number = 0;

let zoom: number = 2;

function drawScene(gl: WebGLRenderingContext) {
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
  const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
  // Initialize the GL context
  const canvasContext = canvas.getContext('webgl');
  if (canvasContext === null) {
    console.error('Unable to initialize GL context!');
    return;
  }
  gl = canvasContext;

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
        loadedModels[helmet] = modelRenderer.registerModel(model);
      })
      .then(() => {
        return fetchImage('images/Yokohama.jpg');
      })
      .then((data: HTMLImageElement) => {
        return createSkyBox(gl, data);
      })
      .then((skyBox: CubeMap) => {
        cubeMap = skyBox;
        skyBoxShader.bindSkyBoxTexture(skyBox);
        let render = (now: number) => {
          now *= 0.001;
          then = now;

          drawScene(gl);
          requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
      });
};

const canvas = document.getElementsByTagName('canvas')[0];
canvas.style.cursor = 'grab';
let dragging = false;
canvas.addEventListener('mousedown', (event: MouseEvent) => {
  dragging = true;
  xCurrent = event.x;
  xLastFrame = event.x;
  yCurrent = event.y;
  yLastFrame = event.y;
  canvas.classList.add('grabbing');
});
let endDrag = () => {
  dragging = false;
  canvas.classList.remove('grabbing');
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

const models: ModelDetail[] = [{
  title: 'Damaged Helmet',
  url:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf',
  creator:
      {name: 'theblueturtle_', url: 'https://sketchfab.com/theblueturtle_'}
}];

const humus: Author = {
  name: 'Humus',
  url: 'http://www.humus.name/index.php?page=Textures&start=0'
};

const hipshot: Author = {
  name: 'Hipshot',
  url: '#'
};

const skyBoxes: SkyBoxDetail[] = [
  {title: 'Beach', url: 'images/NissiBeach.jpg', creator: humus},
  {title: 'Clouds', url: 'images/StormyDays.jpg', creator: hipshot},
  {title: 'Snowy', url: 'images/FootballField.jpg', creator: humus},
  {title: 'Yokohama', url: 'images/Yokohama.jpg', creator: humus}
];

App.initializeApp(
    models, 0,
    (modelUrl: string) => {
      if (loadedModels[modelUrl] !== undefined) {
        currentModel = loadedModels[modelUrl];
      } else {
        modelLoader.loadGltf(modelUrl).then((model) => {
          loadedModels[modelUrl] = modelRenderer.registerModel(model);
          currentModel = loadedModels[modelUrl];
        });
      }
    },
    skyBoxes, 3,
    (skyBoxUrl: string) => {
      return fetchImage(skyBoxUrl)
          .then((data: HTMLImageElement) => {
            return createSkyBox(gl, data);
          })
          .then((skyBox: CubeMap) => {
            cubeMap = skyBox;
            skyBoxShader.bindSkyBoxTexture(skyBox);
          });
    });

document.body.onload = main;