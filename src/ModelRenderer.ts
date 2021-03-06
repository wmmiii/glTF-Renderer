import {mat2, mat4, vec2, vec3} from 'gl-matrix';

import {CubeMap} from './CubeMap';
import {ScalarAccessor, Vec2Accessor, Vec3Accessor} from './DataAccessor';
import GlModelWrapper from './GlModelWrapper';
import {Model, VertexSizes} from './Model';
import ModelShader from './ModelShader';

export default class ModelRenderer {
  static create(gl: WebGLRenderingContext,
                width: () => number,
                height: () => number) {
    const renderer = new ModelRenderer(gl);
    renderer.shader = ModelShader.create(gl, width, height);
    return renderer;
  }

  private gl: WebGLRenderingContext;
  private shader: ModelShader;
  private modelWrappers: GlModelWrapper[];

  private emissiveDefault: WebGLTexture;
  private emissiveFactorDefault: number[];
  private normalDefault: WebGLTexture;

  private constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.modelWrappers = [];

    const emissiveDefault = gl.createTexture();
    if (emissiveDefault === null) {
      throw new Error('Could not create default emissive texture!');
    }
    this.emissiveDefault = emissiveDefault;
    gl.bindTexture(gl.TEXTURE_2D, this.emissiveDefault);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 0, 1]));

    this.emissiveFactorDefault = [0, 0, 0];

    const normalDefault = gl.createTexture();
    if (normalDefault === null) {
      throw new Error('Could not create default emissive texture!');
    }
    this.normalDefault = normalDefault;
    gl.bindTexture(gl.TEXTURE_2D, this.normalDefault);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0.5, 0.5, 1, 1]));
  }

  registerModel(model: Model): number {
    return this.modelWrappers.push(new GlModelWrapper(model)) - 1;
  }

  renderModel(id: number,
              projectionMatrix: mat4,
              modelViewMatrix: mat4,
              cubeMap: CubeMap) {
    const modelWrapper = this.modelWrappers[id];
    this.initBuffers(modelWrapper);
    this.initTextures(modelWrapper);
    this.initTangents(modelWrapper);

    if (modelWrapper.buffersInitialized) {
      const shader = this.shader;
      shader.activate();

      shader.setProjectionMatrix(projectionMatrix);

      const model = modelWrapper.model;

      model.nodes.forEach((node) => {
        const meshIndex = node.mesh;
        const mesh = model.meshes[meshIndex];

        /*
        This code allows primitives to orient themselves to a scene. It does not
        seem useful yet so I'm commenting it out in favor of using the raw model
        view matrix.
        */
        let primitiveViewMatrix: mat4;
        primitiveViewMatrix = mat4.create();
        const shift = vec3.create();
        vec3.negate(shift, modelWrapper.center);
        mat4.translate(primitiveViewMatrix, primitiveViewMatrix, shift);

        if (node.rotation) {
          const identity = mat4.create();
          mat4.identity(identity);
          mat4.rotate(primitiveViewMatrix, identity, node.rotation[3],
                      node.rotation);
        }
        mat4.mul(primitiveViewMatrix, modelViewMatrix, primitiveViewMatrix);

        shader.setModelViewMatrix(primitiveViewMatrix);

        mesh.primitives.forEach((primitive, primitiveIndex) => {
          // Position
          this.bindModelVertexAttribute(shader.bindVertexPosition.bind(shader),
                                        primitive.attributes.POSITION,
                                        modelWrapper);

          // Normal
          this.bindModelVertexAttribute(shader.bindVertexNormal.bind(shader),
                                        primitive.attributes.NORMAL,
                                        modelWrapper);

          // Texture
          this.bindModelVertexAttribute(shader.bindVertexTexCoord.bind(shader),
                                        primitive.attributes.TEXCOORD_0,
                                        modelWrapper);

          // Texture Tangents
          const tangents = modelWrapper.tangents[meshIndex][primitiveIndex];
          shader.bindVertexTangent(tangents, WebGLRenderingContext.FLOAT, 0, 0);

          // Texture BiTangents
          const biTangents = modelWrapper.biTangents[meshIndex][primitiveIndex];
          shader.bindVertexBiTangent(biTangents, WebGLRenderingContext.FLOAT, 0,
                                     0);

          // Textures
          const material = model.materials[primitive.material];
          shader.bindBaseTexture(
              modelWrapper.textures[material.pbrMetallicRoughness
                                        .baseColorTexture.index]);
          shader.bindMetallicRoughnessTexture(
              modelWrapper.textures[material.pbrMetallicRoughness
                                        .metallicRoughnessTexture.index]);

          if (material.normalTexture !== undefined) {
            shader.bindNormalTexture(
                modelWrapper.textures[material.normalTexture.index]);
          } else {
            shader.bindNormalTexture(this.normalDefault);
          }

          if (material.emissiveTexture !== undefined) {
            shader.bindEmissiveTexture(
                modelWrapper.textures[material.emissiveTexture.index]);
          } else {
            shader.bindEmissiveTexture(this.emissiveDefault);
          }

          if (material.emissiveFactor !== undefined) {
            shader.setEmissiveFactor(material.emissiveFactor);
          } else {
            shader.setEmissiveFactor(this.emissiveFactorDefault);
          }

          // Cubemap
          shader.bindEnvironmentTexture(cubeMap);

          // Indices
          const indicesAccessor = model.accessors[primitive.indices];
          const indicesBufferView =
              model.bufferViews[indicesAccessor.bufferView];
          shader.setIndices(
              modelWrapper.buffers[indicesBufferView.buffer].element,
              indicesAccessor.componentType, indicesAccessor.count,
              (indicesAccessor.byteOffset || 0) +
                  (indicesBufferView.byteOffset || 0));

          shader.draw(primitive.mode || WebGLRenderingContext.TRIANGLES);
        });
      });
    }
  }

  private initBuffers(modelWrapper: GlModelWrapper) {
    if (!modelWrapper.buffersInitialized) {
      const gl = this.gl;
      const model = modelWrapper.model;

      model.buffers.forEach((buffer, index) => {
        const newArray = gl.createBuffer();

        if (!newArray) {
          throw new Error(`Could not create array buffer ${index} for model ${
              modelWrapper.model.asset.name}!`);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, newArray);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

        const newElement = gl.createBuffer();

        if (!newElement) {
          throw new Error(`Could not create element buffer ${index} for model ${
              modelWrapper.model.asset.name}!`);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, newElement);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

        modelWrapper.buffers[index] = {array: newArray, element: newElement};
      });

      modelWrapper.buffersInitialized = true;
    }
  }

  private initTextures(modelWrapper: GlModelWrapper) {
    if (!modelWrapper.texturesInitialized) {
      const gl = this.gl;
      const model = modelWrapper.model;

      model.images.forEach((image, index) => {
        const newTexture = gl.createTexture();
        if (!newTexture) {
          throw new Error(`Could not create texture ${index} for model ${
              modelWrapper.model.asset.name}!`);
        }

        gl.bindTexture(gl.TEXTURE_2D, newTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                      image);
        if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
          gl.generateMipmap(gl.TEXTURE_2D);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        modelWrapper.textures[index] = newTexture;
      });

      modelWrapper.texturesInitialized = true;
    }
  }

  private isPowerOf2(value: number) {
    // tslint:disable-next-line:no-bitwise
    return (value & (value - 1)) === 0;
  }

  // TODO: Move this functionality into a model initializer.
  private initTangents(modelWrapper: GlModelWrapper) {
    if (!modelWrapper.tangentsInitialized) {
      const model = modelWrapper.model;

      let maxX = Number.MIN_VALUE;
      let minX = Number.MAX_VALUE;
      let maxY = Number.MIN_VALUE;
      let minY = Number.MAX_VALUE;
      let maxZ = Number.MIN_VALUE;
      let minZ = Number.MAX_VALUE;

      model.meshes.forEach((mesh, meshIndex) => {
        mesh.primitives.forEach((primitive, primitiveIndex) => {
          if (model.materials[primitive.material].normalTexture !== undefined) {
            const indices = getScalarAccessor(model, primitive.indices);
            const positions =
                getVec3Accessor(model, primitive.attributes.POSITION);
            const uvs = getVec2Accessor(model, primitive.attributes.TEXCOORD_0);

            const vertexCount = positions.count;

            const tangents = new Float32Array(vertexCount * 3);
            const tangentAccessor = new Vec3Accessor(
                tangents.buffer, WebGLRenderingContext.FLOAT, vertexCount);

            const biTangents = new Float32Array(vertexCount * 3);
            const biTangentAccessor = new Vec3Accessor(
                biTangents.buffer, WebGLRenderingContext.FLOAT, vertexCount);

            for (let i = 0; i < indices.count; i += 3) {
              const i1 = indices.get(i);
              const i2 = indices.get(i + 1);
              const i3 = indices.get(i + 2);

              // Get UV coordinates of triangle.
              const uv1 = uvs.get(i1);
              const uv2 = uvs.get(i2);
              const uv3 = uvs.get(i3);

              // Find two edges of the triangle; A and B.
              const aUv = vec2.create();
              vec2.sub(aUv, uv2, uv1);
              const bUv = vec2.create();
              vec2.sub(bUv, uv3, uv1);

              // Find U and V as represented by A and B.
              const triSpace = mat2.fromValues(aUv[0], aUv[1], bUv[0], bUv[1]);
              mat2.invert(triSpace, triSpace);
              const xTri = vec2.fromValues(1, 0);
              vec2.transformMat2(xTri, xTri, triSpace);
              const yTri = vec2.fromValues(0, 1);
              vec2.transformMat2(yTri, yTri, triSpace);

              // Get model coordinates of triangle.
              const m1 = positions.get(i1);
              const m2 = positions.get(i2);
              const m3 = positions.get(i3);

              maxX = Math.max(m1[0], m2[0], m3[0], maxX);
              maxY = Math.max(m1[1], m2[1], m3[1], maxY);
              maxZ = Math.max(m1[2], m2[2], m3[2], maxZ);
              minX = Math.min(m1[0], m2[0], m3[0], minX);
              minY = Math.min(m1[1], m2[1], m3[1], minY);
              minZ = Math.min(m1[2], m2[2], m3[2], minZ);

              // Find A and B in model space.
              const aM = vec3.create();
              vec3.sub(aM, m2, m1);
              const bM = vec3.create();
              vec3.sub(bM, m3, m1);

              // Find T and B in model space.
              // T = xTri.x * aM + xTri.y * bM
              const tFirst = vec3.create();
              vec3.scale(tFirst, aM, xTri[0]);
              const tSecond = vec3.create();
              vec3.scale(tSecond, bM, xTri[1]);
              const tangent = vec3.create();
              vec3.add(tangent, tFirst, tSecond);

              // B = yTri.x * aM + yTri.y * bM
              const bFirst = vec3.create();
              vec3.scale(bFirst, aM, yTri[0]);
              const bSecond = vec3.create();
              vec3.scale(bSecond, bM, yTri[1]);
              const biTangent = vec3.create();
              vec3.add(biTangent, bFirst, bSecond);

              addVec3(tangentAccessor, i1, tangent);
              addVec3(tangentAccessor, i2, tangent);
              addVec3(tangentAccessor, i3, tangent);

              addVec3(biTangentAccessor, i1, biTangent);
              addVec3(biTangentAccessor, i2, biTangent);
              addVec3(biTangentAccessor, i3, biTangent);
            }

            const tangentBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tangentBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, tangents,
                               this.gl.STATIC_DRAW);
            if (!tangentBuffer) {
              throw new Error(`Could not create tangent buffer (mesh ${
                  meshIndex}, primitive ${primitiveIndex}) for model ${
                  modelWrapper.model.asset.name}!`);
            }

            const biTangentBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, biTangentBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, biTangents,
                               this.gl.STATIC_DRAW);
            if (!biTangentBuffer) {
              throw new Error(`Could not create bitangent buffer (mesh ${
                  meshIndex}, primitive ${primitiveIndex}) for model ${
                  modelWrapper.model.asset.name}!`);
            }

            if (!modelWrapper.tangents[meshIndex]) {
              modelWrapper.tangents[meshIndex] = [];
            }
            modelWrapper.tangents[meshIndex][primitiveIndex] = tangentBuffer;

            if (!modelWrapper.biTangents[meshIndex]) {
              modelWrapper.biTangents[meshIndex] = [];
            }
            modelWrapper.biTangents[meshIndex][primitiveIndex] =
                biTangentBuffer;
          }
        });
      });

      modelWrapper.center = vec3.fromValues(
          maxX + minX / 2.0, maxY + minY / 2.0, maxZ + minZ / 2.0);
      console.log(modelWrapper.center);

      modelWrapper.tangentsInitialized = true;
    }
  }

  private bindModelVertexAttribute(bindFunction: (buffer: WebGLBuffer,
                                                  componentType: number,
                                                  byteStride: number,
                                                  byteOffset: number) => void,
                                   accessorIndex: number,
                                   modelWrapper: GlModelWrapper) {
    const accessor = modelWrapper.model.accessors[accessorIndex];
    const bufferView = modelWrapper.model.bufferViews[accessor.bufferView];
    const size = VertexSizes.get(accessor.type);

    if (!size) {
      throw new Error('Tried to bind non vertex to vertex attribute!');
    }

    bindFunction(modelWrapper.buffers[bufferView.buffer].array,
                 accessor.componentType, bufferView.byteStride || 0,
                 (accessor.byteOffset || 0) + (bufferView.byteOffset || 0));
  }
}

function getScalarAccessor(model: Model, accessorIndex: number) {
  const details = getAccessorDetails(model, accessorIndex);
  return new ScalarAccessor(details.buffer, details.componentType,
                            details.count, details.offset);
}

function getVec2Accessor(model: Model, accessorIndex: number) {
  const details = getAccessorDetails(model, accessorIndex);
  return new Vec2Accessor(details.buffer, details.componentType, details.count,
                          details.offset);
}

function getVec3Accessor(model: Model, accessorIndex: number) {
  const details = getAccessorDetails(model, accessorIndex);
  return new Vec3Accessor(details.buffer, details.componentType, details.count,
                          details.offset);
}

function getAccessorDetails(model: Model, accessorIndex: number) {
  const accessor = model.accessors[accessorIndex];
  const view = model.bufferViews[accessor.bufferView];
  const buffer = model.buffers[view.buffer];
  return {
    buffer,
    componentType: accessor.componentType,
    count: accessor.count,
    offset: (accessor.byteOffset || 0) + (view.byteOffset || 0)
  };
}

function addVec3(accessor: Vec3Accessor, index: number, value: vec3): void {
  const existingValue = accessor.get(index);
  vec3.add(existingValue, existingValue, value);
  accessor.set(index, existingValue);
}
