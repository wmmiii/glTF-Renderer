// TODO: Use glTF official types (look into NPM modules that will do it for
// you).

type DataType = 'SCALAR'|'VEC2'|'VEC3'|'VEC4'|'MAT2'|'MAT3'|'MAT4';

export interface Model {
  accessors: Accessor[];
  asset: any;
  bufferViews: BufferView[];
  buffers: ArrayBuffer[];
  images: HTMLImageElement[];
  materials: Material[];
  meshes: Mesh[];
  nodes: Node[];
  samplers: Sampler[];
  scene: number;
  scenes: Scene[];
  textures: Texture[];
  }

export interface Accessor {
  bufferView: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  max: number[];
  min?: number[];
  type: DataType;
  }

export interface BufferView {
  buffer: number;
  byteLength: number;
  byteOffset?: number;
  byteStride?: number;
  target: number;
  }

export interface Buffer {
  byteLength: number;
  uri: string;
  }

export interface Material {
  emissiveFactor: [number, number, number];
  emissiveTexture: TextureReference;
  name: string;
  normalTexture: TextureReference;
  occlusionTexture: TextureReference;
  pbrMetallicRoughness: {
    baseColorTexture: TextureReference;
    metallicRoughnessTexture: TextureReference;
  };
  }

export interface TextureReference { index: number; }

export interface Mesh {
  name: string;
  primitives: Primitive[];
  }

export interface Primitive {
  mode: number;
  attributes: {NORMAL: number; POSITION: number; TEXCOORD_0: number;},
      indices: number;
  material: number;
  }

export interface Node {
  mesh: number;
  name: string;
  rotation: [number, number, number, number];
  }

export interface Sampler {}

export interface Scene {
  name: string;
  nodes: number[];
  }

export interface Texture {
  sampler: number;
  source: number;
  }

export const VertexSizes: Map<DataType, number> = new Map();
VertexSizes.set('SCALAR', 1);
VertexSizes.set('VEC2', 2);
VertexSizes.set('VEC3', 3);
VertexSizes.set('VEC4', 4);