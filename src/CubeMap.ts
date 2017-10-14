export interface CubemapData { images: HTMLImageElement[] }

export type CubeMap = WebGLTexture;

export function loadCubemapData(
    gl: WebGLRenderingContext, faceUrls: string[]): Promise<CubemapData> {
  let images: HTMLImageElement[] = [];
  let imagePromises: Promise<any>[] = faceUrls.map((url, index) => {
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
    const newTexture = gl.createTexture();
    if (!newTexture) {
      throw `Could not create texture for cubemap!`;
    }

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, newTexture);
    images.forEach((image, index) => {
      gl.texImage2D(
          gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, gl.RGBA,
          gl.UNSIGNED_BYTE, image);
    });
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameterf(
        gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

    return {texture: newTexture, images: images};
  });
};