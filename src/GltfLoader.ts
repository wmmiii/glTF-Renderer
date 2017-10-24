import {Model} from 'Model';

import {fetchResource, resolvePath} from './ResourceFetcher';

export default class GltfLoader {
  loadGltf(url: string, waitForTextures = true): Promise<Model> {
    return fetchResource(url).then((response: any) => {
      const modelResponse = JSON.parse(response);

      const model: Model = {
        accessors: modelResponse.accessors,
        asset: modelResponse.asset,
        bufferViews: modelResponse.bufferViews,
        buffers: [] as ArrayBuffer[],
        images: [] as HTMLImageElement[],
        materials: modelResponse.materials,
        meshes: modelResponse.meshes,
        nodes: modelResponse.nodes,
        samplers: modelResponse.samplers,
        scene: modelResponse.scene,
        scenes: modelResponse.scenes,
        textures: modelResponse.textures
      };

      let imagePromises: Array<Promise<any>> = [];
      if (modelResponse.images) {
        imagePromises = (modelResponse.images as Array<{uri: string}>)
                            .map((responseImage, index) => {
                              const image = new Image();
                              const imagePromise =
                                  new Promise<HTMLImageElement>((resolve) => {
                                    image.onload = () => resolve();
                                  });
                              image.crossOrigin = 'anonymous';
                              image.src = resolvePath(url, responseImage.uri);
                              model.images[index] = image;
                              return imagePromise;
                            });
      }

      const bufferPromises: Array<Promise<any>> =
          (modelResponse.buffers as Array<{byteLength: number, uri: string}>)
              .map((responseBuffer, index) => {
                return fetchResource(resolvePath(url, responseBuffer.uri),
                                     'arraybuffer')
                    .then((arrayBuffer) => {
                      model.buffers[index] = arrayBuffer;
                    });
              });

      let pendingPromises: Array<Promise<any>> = [];
      pendingPromises = pendingPromises.concat(bufferPromises);
      if (waitForTextures) {
        pendingPromises = pendingPromises.concat(imagePromises);
      }

      return Promise.all(pendingPromises).then(() => {
        return model;
      });
    });
  }
}
