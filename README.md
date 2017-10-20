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
- [ ] Re-architect rendering pipeline.
- [ ] Get Webpack watching and working properly.
- [ ] Support VR displays.
- [ ] Use uniform and attribute setters.
- [x] Move rendering specific code out of Main.ts.
- [x] Move shader code out of Main.ts.

### Rendering
- [ ] Add screen space effects.
- [x] Create cube-maps.
- [x] Add proper diffuse lighting.
- [x] Add reflectance.
- [x] Obey metalness properties.

### UI
- [ ] Implement some sort of UI.
- [ ] Dynamically change model.
- [ ] Dynamically change skybox.
- [ ] Turn on and off various channels.