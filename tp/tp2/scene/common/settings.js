var settings = {
  normals: false,
  lines: false,

  wall_number: 6,
  wall_height: 1.5,
  wall_angle: 0,

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
    stone: "stone",
    wood: "wood",
    dark_wood: "dark_wood",
    grass: "grass",
    dark_grass: [0.5 * 0.88, 0.8 * 0.88, 0.5 * 0.88],
    water: "water",
    castle: "castle",
    window: "window",
    tower_tip: "roof",
    ammo: "fire",
    lamp: "fire",
  },

  lightColor: {
    sun: [0.26, 0.23, 0.2],
    fire: [0.5, 0.4, 0.3],
    lamp: [0.5, 0.4, 0.3],
  },
};
