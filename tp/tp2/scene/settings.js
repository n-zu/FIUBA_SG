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
    grass: [0.5, 0.8, 0.5],
    dark_grass: [0.5 * 0.88, 0.8 * 0.88, 0.5 * 0.88],
    water: [0.5, 0.5, 0.8],
    castle: [0.9, 0.9, 0.6],
    window: [0.2, 0.2, 0.2],
    tower_tip: [0.2, 0.2, 0.5],
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
  ],
};
