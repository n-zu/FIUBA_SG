import { WebGL } from "../scripts/webgl.js";
import { Mesh } from "../scripts/mesh.js";
import { updateCamera } from "./common/camera.js";

import { Terrain, Walls, Castle, Catapult } from "./components/index.js";
import {
  update as update_anim,
  animation_meshes,
} from "./environment/animation.js";
import materials from "./environment/materials.js";

const wgl = await new WebGL("#main").init(
  "./shaders/vertex.glsl",
  "./shaders/fragment.glsl",
  materials
);
wgl
  .setUseTexture(!settings.normals)
  .setDrawLines(settings.lines)
  .setDrawSurfaces(true);

settings.wgl = wgl;

const getTerrain = (t) => Terrain(wgl, t);
const getWalls = () =>
  Walls(wgl, settings.wall_number, settings.wall_height, settings.wall_angle);
const getCastle = () =>
  Castle(
    wgl,
    settings.castle_width,
    settings.castle_length,
    settings.castle_floors
  );
const getCatapult = () => {
  const catapult = Catapult(
    wgl,
    settings.catapult_offset,
    settings.catapult_rotation,
    settings.catapult_arm_rotation,
    settings.catapult_ammo
  );
  settings.getAmmoTransform = catapult.getAmmoTransform;
  settings.getCatapultPosition = catapult.getPosition;
  return catapult;
};

const getScene = (t) =>
  new Mesh(["root"], null, [
    getTerrain(t),
    getWalls(),
    getCastle(),
    getCatapult(),
    ...animation_meshes,
  ]);

const drawScene = (t) => {
  getScene(t / 1000).draw(wgl);
};

const tick = (t) => {
  requestAnimationFrame(tick);
  updateCamera(wgl);
  update_anim(t);
  drawScene(t);
};
tick();
