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
  "./assets/cubemaps/sky",
  materials
);
wgl
  .setUseTexture(!settings.normals)
  .setDrawLines(settings.lines)
  .setDrawSurfaces(true);

wgl.gl.depthRange(0, 3);
wgl.lightColors = settings.light;

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

const setLights = (lights) => {
  wgl.setLights({
    ambient: settings.light.ambient.name,
    directional: {
      dir: [1, 1, 1],
      color: settings.light.sun.name,
    },
    points: lights,
  });
};

const drawScene = (t) => {
  const scene = getScene(t / 1000);
  const lights = [];
  scene.setup(wgl, lights);
  setLights(lights);
  scene._draw(wgl);
};

const tick = (t) => {
  requestAnimationFrame(tick);
  updateCamera(wgl);
  update_anim(t);
  drawScene(t);
};
tick();
