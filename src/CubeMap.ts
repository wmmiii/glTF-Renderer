export type CubeMap = WebGLTexture;

export function loadCubemapData(gl: WebGLRenderingContext,
                                faceUrls: string[]): Promise<CubeMap> {
  const images: HTMLImageElement[] = [];
  const imagePromises: Array<Promise<any>> = faceUrls.map((url, index) => {
    const image = new Image();
    const imagePromise = new Promise<HTMLImageElement>((resolve) => {
      image.onload = () => resolve();
    });
    image.crossOrigin = 'anonymous';
    image.src = url;
    images[index] = image;
    return imagePromise;
  });

  return Promise.all(imagePromises).then(() => {
    const cubeMap = gl.createTexture();
    if (!cubeMap) {
      throw new Error('Could not create texture for cubemap!');
    }

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    images.forEach((image, index) => {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, gl.RGBA,
                    gl.UNSIGNED_BYTE, image);
    });
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,
                     gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

    return cubeMap;
  });
}
