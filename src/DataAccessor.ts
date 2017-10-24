import {mat3, mat4, vec2, vec3} from 'gl-matrix';
// TODO: Document and make this more generic.
abstract class DataAccessor<T> {
  count: number;

  protected dataView: DataView;

  protected getter: (index: number, littleEndian: boolean) => number;

  protected setter:
      (index: number, value: number, littleEndian: boolean) => void;

  protected stride: number;

  constructor(data: ArrayBuffer, type: number, count: number, byteOffset = 0) {
    this.dataView = new DataView(data, byteOffset);
    const dataView = this.dataView;

    switch (type) {
      case WebGLRenderingContext.BYTE:
        this.getter = dataView.getInt8.bind(dataView);
        this.setter = dataView.setInt8.bind(dataView);
        this.stride = 1;
        break;
      case WebGLRenderingContext.UNSIGNED_BYTE:
        this.getter = dataView.getUint8.bind(dataView);
        this.setter = dataView.setUint8.bind(dataView);
        this.stride = 1;
        break;
      case WebGLRenderingContext.SHORT:
        this.getter = dataView.getInt16.bind(dataView);
        this.setter = dataView.setInt16.bind(dataView);
        this.stride = 2;
        break;
      case WebGLRenderingContext.UNSIGNED_SHORT:
        this.getter = dataView.getUint16.bind(dataView);
        this.setter = dataView.setUint16.bind(dataView);
        this.stride = 2;
        break;
      case WebGLRenderingContext.INT:
        this.getter = dataView.getInt32.bind(dataView);
        this.setter = dataView.setInt32.bind(dataView);
        this.stride = 4;
        break;
      case WebGLRenderingContext.UNSIGNED_INT:
        this.getter = dataView.getUint32.bind(dataView);
        this.setter = dataView.setUint32.bind(dataView);
        this.stride = 4;
        break;
      case WebGLRenderingContext.FLOAT:
        this.getter = dataView.getFloat32.bind(dataView);
        this.setter = dataView.setFloat32.bind(dataView);
        this.stride = 4;
        break;
    }

    this.count = count;
  }

  abstract get(index: number): T;
  abstract set(index: number, value: T): void;
}

export class Mat3Accessor extends DataAccessor<mat3> {
  get(index: number): mat3 {
    const baseIndex = index * this.stride * 3;
    return mat3.fromValues(this.getter(baseIndex, true),
                           this.getter(baseIndex + this.stride, true),
                           this.getter(baseIndex + this.stride * 2, true),
                           this.getter(baseIndex + this.stride * 3, true),
                           this.getter(baseIndex + this.stride * 4, true),
                           this.getter(baseIndex + this.stride * 5, true),
                           this.getter(baseIndex + this.stride * 6, true),
                           this.getter(baseIndex + this.stride * 7, true),
                           this.getter(baseIndex + this.stride * 8, true));
  }

  set(index: number, value: mat3): void {
    const baseIndex = index * this.stride * 3;
    this.setter(baseIndex, value[0], true);
    this.setter(baseIndex + this.stride, value[1], true);
    this.setter(baseIndex + this.stride * 2, value[2], true);
    this.setter(baseIndex + this.stride * 3, value[3], true);
    this.setter(baseIndex + this.stride * 4, value[4], true);
    this.setter(baseIndex + this.stride * 5, value[5], true);
    this.setter(baseIndex + this.stride * 6, value[6], true);
    this.setter(baseIndex + this.stride * 7, value[7], true);
    this.setter(baseIndex + this.stride * 8, value[8], true);
  }
}

export class Mat4Accessor extends DataAccessor<mat4> {
  get(index: number): mat4 {
    const baseIndex = index * this.stride * 3;
    return mat4.fromValues(this.getter(baseIndex, true),
                           this.getter(baseIndex + this.stride, true),
                           this.getter(baseIndex + this.stride * 2, true),
                           this.getter(baseIndex + this.stride * 3, true),
                           this.getter(baseIndex + this.stride * 4, true),
                           this.getter(baseIndex + this.stride * 5, true),
                           this.getter(baseIndex + this.stride * 6, true),
                           this.getter(baseIndex + this.stride * 7, true),
                           this.getter(baseIndex + this.stride * 8, true),
                           this.getter(baseIndex + this.stride * 9, true),
                           this.getter(baseIndex + this.stride * 10, true),
                           this.getter(baseIndex + this.stride * 11, true),
                           this.getter(baseIndex + this.stride * 12, true),
                           this.getter(baseIndex + this.stride * 13, true),
                           this.getter(baseIndex + this.stride * 14, true),
                           this.getter(baseIndex + this.stride * 15, true));
  }

  set(index: number, value: mat4): void {
    const baseIndex = index * this.stride * 3;
    this.setter(baseIndex, value[0], true);
    this.setter(baseIndex + this.stride, value[1], true);
    this.setter(baseIndex + this.stride * 2, value[2], true);
    this.setter(baseIndex + this.stride * 3, value[3], true);
    this.setter(baseIndex + this.stride * 4, value[4], true);
    this.setter(baseIndex + this.stride * 5, value[5], true);
    this.setter(baseIndex + this.stride * 6, value[6], true);
    this.setter(baseIndex + this.stride * 7, value[7], true);
    this.setter(baseIndex + this.stride * 8, value[8], true);
    this.setter(baseIndex + this.stride * 9, value[8], true);
    this.setter(baseIndex + this.stride * 10, value[8], true);
    this.setter(baseIndex + this.stride * 11, value[8], true);
    this.setter(baseIndex + this.stride * 12, value[8], true);
    this.setter(baseIndex + this.stride * 13, value[8], true);
    this.setter(baseIndex + this.stride * 14, value[8], true);
    this.setter(baseIndex + this.stride * 15, value[8], true);
  }
}

export class ScalarAccessor extends DataAccessor<number> {
  get(index: number): number {
    return this.getter(index * this.stride, true);
  }

  set(index: number, value: number): void {
    this.setter(index * this.stride, value, true);
  }
}

export class Vec2Accessor extends DataAccessor<vec2> {
  get(index: number): vec2 {
    const baseIndex = index * this.stride * 2;
    return vec2.fromValues(this.getter(baseIndex, true),
                           this.getter(baseIndex + this.stride, true));
  }

  set(index: number, value: vec2): void {
    const baseIndex = index * this.stride * 2;
    this.setter(baseIndex, value[0], true);
    this.setter(baseIndex + this.stride, value[1], true);
  }
}

export class Vec3Accessor extends DataAccessor<vec3> {
  get(index: number): vec3 {
    const baseIndex = index * this.stride * 3;
    return vec3.fromValues(
        this.getter(baseIndex, true),
        this.getter(baseIndex + this.stride, true),
        this.getter(baseIndex + this.stride * 2, true),
    );
  }

  set(index: number, value: vec3): void {
    const baseIndex = index * this.stride * 3;
    this.setter(baseIndex, value[0], true);
    this.setter(baseIndex + this.stride, value[1], true);
    this.setter(baseIndex + this.stride * 2, value[2], true);
  }
}
