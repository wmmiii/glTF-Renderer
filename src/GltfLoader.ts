import {Model} from 'Model';

import {fetchResource, resolvePath} from './ResourceFetcher';

export default class GltfLoader {
  loadGltf(url: string, waitForTextures = true): Promise<Model> {
    return fetchResource(url).then((response: any) => {
      const modelResponse = JSON.parse(response);

      let model: Model = {
        accessors: modelResponse['accessors'],
        asset: modelResponse['asset'],
        bufferViews: modelResponse['bufferViews'],
        buffers: <ArrayBuffer[]>[],
        images: <HTMLImageElement[]>[],
        materials: modelResponse['materials'],
        meshes: modelResponse['meshes'],
        nodes: modelResponse['nodes'],
        samplers: modelResponse['samplers'],
        scene: modelResponse['scene'],
        scenes: modelResponse['scenes'],
        textures: modelResponse['textures']
      };

      let imagePromises: Promise<any>[] = [];
      if (modelResponse['images']) {
        imagePromises = (<{uri: string}[]>modelResponse['images'])
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

      const bufferPromises: Promise<any>[] =
          (<{byteLength: number, uri: string}[]>modelResponse['buffers'])
              .map((responseBuffer, index) => {
                return fetchResource(
                           resolvePath(url, responseBuffer.uri), 'arraybuffer')
                    .then((arrayBuffer) => {
                      model.buffers[index] = arrayBuffer;
                    });
              });

      let pendingPromises: Promise<any>[] = [];
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
