import { WebGL } from "../scripts/webgl.js";
import {
  Spline,
  Surface,
  SweepSolid,
  Cube,
  Cylinder,
  Sphere,
} from "../scripts/geometry.js";
import { CameraControl } from "../scripts/camera.js";

const wgl = await new WebGL("#main").init(
  "./shaders/vertex.glsl",
  "./shaders/fragment.glsl"
);
const camera = new CameraControl([0, 0, 10]);

const getCurve = (z = -1) => {
  const points = [
    [-5, -2, z],
    [-3, 3, z],
    [3, 3, z],
    [5, -2, z],
  ];

  return Spline.rect(points, {
    normal: [0, 0, 1],
  });
};

const getSurface = (z) => {
  const points = [
    [-1, -1, z],
    [-1.3, 0, z],
    [-1, 1, z],
    [1, 1, z],
    [1, -1, z],
    [-1, -1, z],
  ];

  const shape = Spline.rect(points, {
    bi_normal: [0, 0, 1],
  });
  const surface = new Surface(shape);

  return surface;
};

const z = 0;
const curve = getCurve();

const surface = getSurface(z);

const solid = new SweepSolid(surface, curve);
solid.setupBuffers(wgl, 3 * curve.segNum, 50);

const cube = new Cube(25, 15);
cube.setupBuffers(wgl);

const cylinder = new Cylinder(1, 0.8);
cylinder.setupBuffers(wgl);

const sphere = new Sphere(10);
sphere.setupBuffers(wgl);

const drawScene = (t) => {
  const mode = wgl.gl.LINE_STRIP; // && undefined;

  //curve.webglDraw(wgl, 0.05, true);
  solid.draw(wgl);

  cube.draw(wgl);
  sphere.draw(wgl, wgl.gl.LINE_STRIP);
  cylinder.draw(wgl);
};

const tick = (t) => {
  requestAnimationFrame(tick);
  const viewMatrix = camera.getViewMatrix();
  wgl.setViewMatrix(viewMatrix);
  camera.update();
  drawScene(t, false, false, true);
};
tick();
