/**
 * ShaderProgram wraps WebGL specific calls and objects and abstracts away
 * common actions such as creating and binding buffers. It should be extended
 * per program that draws to a buffer.
 */
export default abstract class ShaderProgram {
  protected gl: WebGLRenderingContext;

  protected shaderProgram: WebGLProgram;

  private width: () => number;
  private height: () => number;

  /*
   * Creates a WebGLProgram.
   */
  protected static createShaderProgram(
      gl: WebGLRenderingContext, vertexShaderSource: string,
      fragmentShaderSource: string): WebGLProgram|null {
    const vertexShader =
        this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader =
        this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      return null;
      }

    return shaderProgram;
  }

  /*
  * Creates a WebGLShader of the type specified.
  */
  protected static createShader(
      gl: WebGLRenderingContext, type: number, source: string): WebGLShader
      |null {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('Could not compile the shader: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
      }

    return shader;
  }

  constructor(
      gl: WebGLRenderingContext, shaderProgram: WebGLProgram,
      width: () => number, height: () => number) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.width = width;
    this.height = height;
  };

  protected abstract bindLocations(): void;

  activate(): void {
    this.gl.useProgram(this.shaderProgram);
    this.gl.viewport(0, 0, this.width(), this.height());
  }

  protected findAttributeOrThrow(symbol: string): number {
    let location = this.gl.getAttribLocation(this.shaderProgram, symbol);
    if (location < 0) {
      throw `Could not find attribute "${symbol}" in shader program!`;
      }
    return location;
  }

  protected findUniformOrThrow(symbol: string): WebGLUniformLocation {
    let location = this.gl.getUniformLocation(this.shaderProgram, symbol);
    if (location === null) {
      throw `Could not find uniform "${symbol}" in shader program!`;
      }
    return location;
  }

  protected bindAttribute(
      buffer: WebGLBuffer, attribute: number, numComponents: number,
      componentType: number, normalized: boolean, stride: number,
      offset: number): void {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(
        attribute, numComponents, componentType, normalized, stride, offset);
    gl.enableVertexAttribArray(attribute);
  }

  protected bindTexture(
      texture: WebGLTexture, uniform: WebGLUniformLocation,
      textureIndex: number): void {
    const gl = this.gl;
    gl.activeTexture(WebGLRenderingContext.TEXTURE0 + textureIndex);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniform, textureIndex);
  }

  protected bindCubeMap(
      texture: WebGLTexture, uniform: WebGLUniformLocation,
      textureIndex: number): void {
    const gl = this.gl;
    gl.activeTexture(WebGLRenderingContext.TEXTURE0 + textureIndex);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.uniform1i(uniform, textureIndex);
  }
}