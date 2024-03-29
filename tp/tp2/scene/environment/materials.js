const v3 = (u) => [u, u, u];

const materialTemplate = {
  name: "material",
  diffuse: 1,
  src: "assets/textures/proto.png",
  specular: v3(0.5),
  gloss: 3,
  texScale: [0.64, 0.17],
  texWeight: [0.4, 0.2],
};

const cubeMapMode = {
  none: 0,
  exterior: 1,
  // interior: 2, // TODO: implement
};

const materials = [
  {
    ...materialTemplate,
    name: "default",
    src: "assets/textures/proto.png",
  },
  {
    ...materialTemplate,
    name: "stone_wall",
    src: "assets/textures/stone_wall/diffuse.jpg",
    normalSrc: "assets/textures/stone_wall/normals.jpg",
  },
  {
    ...materialTemplate,
    name: "wood",
    src: "assets/textures/wood/diffuse.jpg",
    normalSrc: "assets/textures/wood/normals.jpg",
  },
  {
    ...materialTemplate,
    name: "dark_wood",
    src: "assets/textures/wood/dark_wood.jpg",
    normalSrc: "assets/textures/wood/dark_normals.jpg",
  },
  {
    ...materialTemplate,
    name: "grass",
    src: "assets/textures/grass/diffuse.png",
    normalSrc: "assets/textures/grass/normals.png",
  },
  {
    ...materialTemplate,
    name: "water",
    src: "assets/textures/water/diffuse.jpg",
    normalSrc: "assets/textures/water/normals.jpg",
    cubeMapSettings: {
      src: "assets/cubemaps/env",
      size: 1024,
      mode: cubeMapMode.exterior,
      str: 1,
      normalCorrection: 0.9,
      baseColor: [0.61, 0.69, 0.78],
    },
    diffuse: 1.2,
    specular: v3(1),
    gloss: 60,
  },
  {
    ...materialTemplate,
    name: "castle",
    src: "assets/textures/castle/diffuse.jpg",
    normalSrc: "assets/textures/castle/normals.jpg",
  },
  {
    ...materialTemplate,
    name: "window",
    src: "assets/textures/window/diffuse.jpg",
    cubeMapSettings: {
      src: "assets/cubemaps/env",
      size: 1024,
      mode: cubeMapMode.exterior,
      str: 0.5,
      baseColor: [0.61, 0.69, 0.78],
    },
    specular: v3(0),
    gloss: 10,
  },
  {
    ...materialTemplate,
    name: "roof",
    src: "assets/textures/roof/diffuse.png",
    normalSrc: "assets/textures/roof/normals.jpg",
    specular: v3(1),
    gloss: 30,
    diffuse: 1.5,
  },
  {
    ...materialTemplate,
    name: "fire",
    src: "assets/textures/wood/diffuse.jpg",
    diffuse: 0,
  },
  {
    ...materialTemplate,
    name: "sky",
    src: "assets/sky.jpg",
    diffuse: 0,
    texScale: [5, 11],
    texWeight: [0.5, 0.3],
  },
];

export default materials;
