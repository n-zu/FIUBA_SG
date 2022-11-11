const v3 = (u) => [u, u, u];

const materialTemplate = {
  name: "material",
  ambient: v3(0.2),
  diffuse: 1,
  src: "assets/textures/proto.png",
  specular: v3(0.5),
  gloss: 0.5,
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
  },
  {
    ...materialTemplate,
    name: "roof",
    src: "assets/textures/roof/diffuse2.png",
  },
  {
    ...materialTemplate,
    name: "stone",
    src: "assets/textures/stone/diffuse.jpg",
  },
];

export default materials;
