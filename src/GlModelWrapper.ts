import {Model} from './Model';

export default class GlModelWrapper {
  model: Model;

  buffers: {array: WebGLBuffer, element: WebGLBuffer}[];
  buffersInitialized: boolean;

  textures: WebGLTexture[];
  texturesInitialized: boolean;

  tangents: Array<Array<WebGLBuffer>>;
  biTangents: Array<Array<WebGLBuffer>>;
  tangentsInitialized: boolean;

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