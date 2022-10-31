var settings = {
  normals: false,
  lines: false,

  wall_number: 6,
  wall_height: 1.5,
  wall_angle: 15,

  camera_mode: "Center",

  castle_width: 6,
  castle_length: 4,
  castle_floors: 3,

  catapult_offset: -20,
  catapult_rotation: 0,
  catapult_arm_rotation: 25,
  catapult_ammo: true,
  catapult_str: 3,
  catapult_shoot: () => {},

  color: {
    wall: "stone_wall",
    stone: [0.5, 0.5, 0.5],
    wood: "wood",
    dark_wood: [0.4, 0.3, 0.1],
    grass: "grass",
    dark_grass: [0.5 * 0.88, 0.8 * 0.88, 0.5 * 0.88],
    water: "water",
    castle: "castle",
    window: "window",
    tower_tip: "roof",
  },

  textures: [
    {
      name: "default",
      src: "assets/textures/proto.png",
    },
    {
      name: "stone_wall",
      src: "assets/textures/stone_wall/diffuse.jpg",
    },
    {
      name: "wood",
      src: "assets/textures/wood/diffuse.jpg",
    },
    {
      name: "grass",
      src: "assets/textures/grass/diffuse.png",
    },
    {
      name: "water",
      src: "assets/textures/water/diffuse.jpg",
    },
    {
      name: "castle",
      src: "assets/textures/castle/diffuse.jpeg",
    },
    {
      name: "window",
      src: "assets/textures/window/diffuse.jpg",
    },
    {
      name: "roof",
      src: "assets/textures/roof/diffuse2.png",
    },
  ],
};
