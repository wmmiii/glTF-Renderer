// TODO: Make a generic ProgramInfo and make one per shader program.
export default interface ProgramInfo {
  program: WebGLProgram;
  attributes: {
    vertexPosition: number; vertexNormal: number; vertexTangent: number;
    vertexBiTangent: number;
    textureCoord: number;
  };
  uniforms: {
    matrices: {
      projectionMatrix: WebGLUniformLocation;
      modelViewMatrix: WebGLUniformLocation;
      itModelViewMatrix: WebGLUniformLocation;
    };
    samplers: {
      baseSampler: WebGLUniformLocation; emissiveSampler: WebGLUniformLocation;
      normalSampler: WebGLUniformLocation;
      reflectionSampler: WebGLUniformLocation;
    };
    values: {emissiveFactor: WebGLUniformLocation;}
  };
}