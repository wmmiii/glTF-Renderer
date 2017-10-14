export function fetchResource(
    url: string, responseType?: XMLHttpRequestResponseType): Promise<any> {
  return new Promise(
      (resolve: (resource: any) => void, reject: (error: any) => void) => {
        const resourceRequest = new XMLHttpRequest();
        resourceRequest.open('GET', url);
        if (responseType) {
          resourceRequest.responseType = responseType;
        };
        resourceRequest.addEventListener('load', () => {
          resolve(resourceRequest.response);
        });
        resourceRequest.onerror = reject;
        resourceRequest.onabort = reject;
        resourceRequest.send();
      });
};

export function fetchImage(url: string): Promise<HTMLImageElement> {
  return new Promise(
      (resolve: (image: HTMLImageElement) => void,
       reject: (error: any) => void) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (error: ErrorEvent) => reject(error);
        image.src = url;
      });
  }

export function resolvePath(basePath: string, relativePath: string): string {
  const regex = /(.*\/)[^\/]*/;
  const match = basePath.match(regex);
  if (match) {
    return match[1] + relativePath;
  } else {
    return relativePath;
  };
};