export interface ModelDetail {
  title: string;
  url: string;
  creator?: Author;
  }

export interface SkyBoxDetail {
  title: string;
  url: string;
  creator?: Author;
  }

export interface Author {
  name: string;
  url: string;
}