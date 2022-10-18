var settings = {
  normals: false,
  lines: false,

  wall_number: 6,
  wall_height: 1.5,
  wall_angle: 15,

  castle_width: 6,
  castle_length: 4,
  castle_floors: 3,

  catapult_offset: -20,
  catapult_rotation: 0,
  catapult_arm_rotation: 25,
  catapult_ammo: true,
  catapult_shoot: () => {},

  color: {
    wall: [0.5, 0.5, 0.5],
    stone: [0.5, 0.5, 0.5],
    wood: [0.7, 0.5, 0.1],
    dark_wood: [0.4, 0.3, 0.1],
    grass: [0.5, 0.8, 0.5],
    water: [0.5, 0.5, 0.8],
    castle: [0.9, 0.9, 0.6],
    window: [0.2, 0.2, 0.2],
    tower_tip: [0.2, 0.2, 0.5],
  },
};
