/*
 * Creates a shader program.
 */
export function createShaderProgram(gl: WebGLRenderingContext, vsSource: string,
                                    fsSource: string): WebGLProgram|null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Could not initialize the shader program: ' +
          gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

/*
 * Creates a shader of the given type, uploads the source and
 * compiles it.
 */
function createShader(gl: WebGLRenderingContext, type: number,
                      source: string): WebGLShader|null {
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

export function createTexture(gl: WebGLRenderingContext,
                              image: HTMLImageElement,
                              defaultValue: number[] = [0, 0, 0, 0],
                              mipMap: boolean = false): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error(`Could not create texture!`);
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array(defaultValue));

  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    if (mipMap && (isPowerOf2(image.width) && isPowerOf2(image.height))) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };

  return texture;
}

function isPowerOf2(value: number): boolean {
  // tslint:disable-next-line:no-bitwise
  return (value & (value - 1)) === 0;
}
