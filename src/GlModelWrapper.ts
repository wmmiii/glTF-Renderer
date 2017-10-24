import {vec3} from 'gl-matrix';

import {Model} from './Model';

export default class GlModelWrapper {
  model: Model;

  buffers: Array<{array: WebGLBuffer, element: WebGLBuffer}>;
  buffersInitialized: boolean;

  textures: WebGLTexture[];
  texturesInitialized: boolean;

  tangents: WebGLBuffer[][];
  biTangents: WebGLBuffer[][];
  tangentsInitialized: boolean;

  center: vec3;

  constructor(model: Model) {
    this.model = model;
    this.buffers = [];
    this.buffersInitialized = false;
    this.textures = [];
    this.texturesInitialized = false;
    this.tangents = [];
    this.biTangents = [];
    this.tangentsInitialized = false;
  }
}
