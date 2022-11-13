const gui = new dat.GUI();

// General

const general = gui.addFolder("General");

const setNormals = (v) => settings.wgl.setUseTexture(!v);
const setLines = (v) => settings.wgl.setDrawLines(v);

general.add(settings, "normals").name("Color normals").onChange(setNormals);
general.add(settings, "lines").name("Draw lines").onChange(setLines);
general
  .add(settings, "camera_mode", ["Free", "Center", "Catapult"])
  .name("Camera mode")
  .listen();

// Wall
const wall = gui.addFolder("Wall");

wall.add(settings, "wall_number", 4, 12, 1).name("Number of walls");
wall.add(settings, "wall_height", 1, 5, 0.5).name("Height of walls");
wall.add(settings, "wall_angle", 0, 90, 1).name("Angle of the gate");

// Castle
const castle = gui.addFolder("Castle");

castle.add(settings, "castle_width", 2, 8, 0.5).name("Width");
castle.add(settings, "castle_length", 2, 8, 0.5).name("Length");
castle.add(settings, "castle_floors", 1, 10, 1).name("Floors");

//Catapult
const catapult = gui.addFolder("Catapult");
catapult.add(settings, "catapult_offset", -200, 200, 1).name("Offset");
catapult.add(settings, "catapult_rotation", -30, 30, 1).name("Rotation");
catapult.add(settings, "catapult_str", 1, 5, 1).name("Strength");
catapult.add(settings, "catapult_shoot").name("Shoot");

// Light
const light = gui.addFolder("Light");

const vecToHex = (v) => {
  const r = Math.floor(v[0] * 255);
  const g = Math.floor(v[1] * 255);
  const b = Math.floor(v[2] * 255);

  return (r << 16) + (g << 8) + b;
};
const hexToVec = (h) => {
  const r = (h >> 16) & 0xff;
  const g = (h >> 8) & 0xff;
  const b = h & 0xff;

  return [r / 255, g / 255, b / 255];
};

const lights = {
  sun: vecToHex(settings.light.sun.color),
  fire: vecToHex(settings.light.fire.color),
  lamp: vecToHex(settings.light.lamp.color),
};
const updateLight = (name) => (color) => {
  settings.light[name].color = hexToVec(color);
};

light.addColor(lights, "sun").name("Sun").onChange(updateLight("sun"));
light.addColor(lights, "fire").name("Fire").onChange(updateLight("fire"));
light.addColor(lights, "lamp").name("Lamp").onChange(updateLight("lamp"));
