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
      baseSampler: WebGLUniformLocation; normalSampler: WebGLUniformLocation;
    };
  }
}