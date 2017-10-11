# glTF Renderer
This project aims to be a from-the-ground up implementation of a glTF model loader and renderer using PBR techniques.

## Usage

~~~~
> npm install
> npm run build
> npm run server
~~~~
Then navigate to http://localhost:8080/index.html.

Note that file watching has not been setup yet.

The model that is loaded is currently hard-coded at the bottom of main.ts.

## Credits

### [glMatrix](http://glmatrix.net/)
glMatrix is used for linear algebra within JavaScript thanks to @toji and @sinisterchipmunk.

### [The Khronos Group](https://www.khronos.org/)
All models referenced in this project have been published thanks to Khronos Group. A [large list of glTF models](https://github.com/KhronosGroup/glTF-Sample-Models) can be found on their GitHub account.

## TODO

### General
- [ ] Move rendering specific code out of Main.ts.
- [ ] Move shader code out of Main.ts.
- [ ] Re-architect rendering pipeline.
- [ ] Get Webpack watching and working properly.
- [ ] Support VR displays.

### Rendering
- [ ] Create cube-maps.
- [ ] Add proper diffuse lighting.
- [ ] Add reflectance.
- [ ] Obey metalness properties.