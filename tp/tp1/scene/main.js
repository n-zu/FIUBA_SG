import { WebGL } from "../scripts/webgl.js";
import { Mesh, Transform } from "../scripts/mesh.js";
import { Cube, Cylinder, Sphere } from "../scripts/geometry.js";
import { CameraControl } from "../scripts/camera.js";
import { Terrain, Walls } from "./components/index.js";

const wgl = await new WebGL("#main").init(
  "./shaders/vertex.glsl",
  "./shaders/fragment.glsl"
);
wgl
  .setUseTexture(!settings.normals)
  .setDrawLines(settings.lines)
  .setDrawSurfaces(true);

settings.wgl = wgl;
const camera = new CameraControl([0, 0, 10]);

const cube = new Cube(1).setupBuffers(wgl);
const cylinder = new Cylinder().setupBuffers(wgl);
const sphere = new Sphere().setupBuffers(wgl);

const terrain = Terrain(wgl);
const getWalls = () =>
  Walls(wgl, settings.wall_number, settings.wall_height, settings.wall_angle);

// ----------------------------------------
const center = new Mesh(["center", cube], [Transform.scale([0.1, 1, 0.1])]);
const state = {};
function getRotatingArm(t) {
  if (!state.arm)
    state.arm = new Mesh(
      ["arm", cylinder, [0.5, 0.5, 0.6]],
      [Transform.scale([0.1, 0.1, 5]), Transform.translate([0, 0, -2.5])]
    );
  if (!state.ball)
    state.ball = new Mesh(
      ["ball", sphere, [0.3, 0.3, 0.3]],
      [Transform.scale([0.25, 0.25, 0.1]), Transform.translate([0, 0, -4.5])]
    );

  return new Mesh(
    ["rotating arm"],
    [
      Transform.translate([0, 0.3, 0]),
      Transform.rotate([1, [1, 0, 0]]),
      Transform.rotate([5 * t, [0, 1, 0]]),
    ],
    [state.arm, state.ball]
  );
}
// ----------------------------------------

const getScene = (t) =>
  new Mesh(["root"], null, [center, terrain, getWalls(), getRotatingArm(t)]);

const drawScene = (t) => {
  getScene(t / 1000).draw(wgl);
  //cube.draw(wgl);
};

const tick = (t) => {
  requestAnimationFrame(tick);
  camera.update(wgl);
  drawScene(t);
};
tick();
