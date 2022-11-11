const v3 = (u) => [u, u, u];

const materialTemplate = {
  name: "material",
  ambient: v3(0.2),
  diffuse: 1,
  src: "assets/textures/proto.png",
  specular: v3(0.5),
  gloss: 3,
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
  },
  {
    ...materialTemplate,
    name: "wood",
    src: "assets/textures/wood/diffuse.jpg",
  },
  {
    ...materialTemplate,
    name: "dark_wood",
    src: "assets/textures/wood/dark_wood.jpg",
  },
  {
    ...materialTemplate,
    name: "grass",
    src: "assets/textures/grass/diffuse.png",
  },
  {
    ...materialTemplate,
    name: "water",
    src: "assets/textures/water/diffuse.jpg",
    specular: v3(2),
    gloss: 60,
  },
  {
    ...materialTemplate,
    name: "castle",
    src: "assets/textures/castle/diffuse.jpeg",
  },
  {
    ...materialTemplate,
    name: "window",
    src: "assets/textures/window/diffuse.jpg",
    specular: v3(2),
    gloss: 20,
  },
  {
    ...materialTemplate,
    name: "roof",
    src: "assets/textures/roof/diffuse2.png",
    specular: v3(1),
    gloss: 30,
    diffuse: 1.5,
  },
  {
    ...materialTemplate,
    name: "stone",
    src: "assets/textures/stone/diffuse.jpg",
  },
  {
    ...materialTemplate,
    name: "fire",
    src: "assets/textures/wood/diffuse.jpg",
    ambient: [0.5 * 6, 0.4 * 6, 0.3 * 6],
    diffuse: 0,
    specular: [3, 0, 0],
    gloss: 6,
  },
];

export default materials;
