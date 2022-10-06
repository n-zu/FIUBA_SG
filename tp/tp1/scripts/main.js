import { WebGL } from "./webgl.js";
import { mx } from "./util.js";
import { Spline, Surface, SweepSolid } from "./geometry.js";

const wgl = await new WebGL("#main").init();

const getCurve = (z) => {
  const _puntos = [
    [-2.0, -2.0, z],
    [2.0, -2.0, z],
    [2.0, -2.0, z],
    [2.0, 1.0, z],

    [2.0, 2.0, z],
    [2.0, 2.0, z],
    [-2.0, 2.0, z],
  ];

  const puntos = _puntos; //.reverse();

  const config = {
    normal: [0, 0, 1],
  };

  return new Spline(puntos, config);
};

const getSurface = (z) => {
  const points = [
    [0.0, 1.0, z],
    [0.0, 0.0, z],
    [1.0, -1.0, z],
    [0.0, -1.0, z],

    [-1.0, -1.0, z],
    [-1.0, 1.0, z],
    [0.0, 1.0, z],
  ];

  const config = {
    bi_normal: [0, 0, 1],
  };

  const orientation = {
    p: mx.vec(0, 0, z),
    n: mx.vec(0, 1, 0),
    t: mx.vec(0, 0, -1),
  };

  const shape = new Spline(points, config);
  const surface = new Surface(shape, orientation);

  return surface;
};

const drawSurfaceAt = (surface, orientation, delta = 0.01) => {
  surface.alignTo(orientation);
  surface.webglDraw(wgl, delta, {});
};

const drawSurfaceAtCurve = (surface, curve, u, delta = 0.01) =>
  drawSurfaceAt(surface, curve.point(u), delta);

const curve = getCurve(-1);
const surface = getSurface(-1);

const solid = new SweepSolid(surface, curve);

curve.webglDraw(wgl, 0.01, 0.05);

const di = 1 / 4;
for (let i = 0; i < 1 + di; i += di) {
  drawSurfaceAtCurve(surface, curve, i);
}

solid.webglDraw(wgl, 20, 20, { showNormals: true });

const animationStep = (t) => {
  const dt = 200;
  const uf = (t / 10000) % 1;

  curve.webglDraw(wgl, 0.01, 0.05);
  drawSurfaceAtCurve(surface, curve, uf);
  setTimeout(() => animationStep(t + dt), dt);
};
// animationStep(0);
