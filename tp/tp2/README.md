# Web Graphic Engine

[See demo](https://n-zu.github.io/FIUBA_SG/tp/tp2/)

![image](https://github.com/n-zu/FIUBA_SG/assets/66538092/fbde1752-80c5-4ca5-bd49-9156fa16e080)

Set of modules for defining 3D bodies and scenes, as well as camera and lighting functionalities. Built
from scratch using WebGL, Js and Glsl. Implements Blinn-Phong model for lighting. Includes interactive
demo scene, showcasing engine for dynamic and responsive use-cases.

Dependencies: `glMatrix`

## Scripts

- `util.js`: Defines utility functions for transformations, wrapping some glMatrix functions, aswell as loading images.
- `webgl.js`: Wraps Webgl logic and boilerplate. Such as: loading shaders, loading textures, setting up buffers, initializing lights.
- `camera.js`: Defines clases to instatiate interactive cameras.
  - `FreeCamera`: Can move freely in space, using wasd and mouse.
  - `OrbitalCamera`: Can move and zoom around a fixed point
- `geometry.js`: Defines geometry primitives. Such as: Segment, Spline, Revolution, SweepSolid. Aswell as primitive shapes as: Cube, Cylinder, Sphere.
- `mesh.js`: Defines 3D objects and their hierarchies. A 3D object can have:
  - Name: Used for logging and debugging
  - Geometry: A shape that can be drawn in 3D. Built from one of the geometry primitives.
  - Material: Which define how the geometry should be rendered. They can have:
    - Name: For name resolution.
    - Diffuse map: The color of pixels on the surface.
    - Normal map: The direction of normals on the surface.
    - Cubemap: The environment that is reflected  on the surface.
    - Physical setting: Diffuse, Gloss and Specular. Parameters of the Phong Model.
  - Light color and strength: Parameters for objects that emmit light
  - Children: A list of other 3D objects, that are positioned relative to this one. This allows us to create a root-scene object, that all other objects are child of; aswell as complex objects or systems, which are composed of multiple parts.
 
## Shaders

- `vertex.glsl`: Sets buffer vertices in the world, appliying camera transformations. Sets position, normal, tangent, binormal and UV.
- `fragment.glsl`: Implements Blinn-Phong model. Defines lights, colors and textures.
