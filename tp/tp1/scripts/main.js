import { WebGL } from "./webgl.js";

const wgl = new WebGL("#main");
await wgl.init();

const drawPlane = (z) => {
  const vertices = [-2.0, -2.0, z, 2.0, -2.0, z, -2.0, 2.0, z, 2.0, 2.0, z];
  const normals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0];
  const indices = [0, 1, 2, 3];

  wgl.draw(vertices, normals, indices, wgl.gl.TRIANGLE_STRIP);
};

const drawCurve = (z0, z1, delta = 0.01) => {
  const puntos = [
    [-2.0, -2.0, z0],
    [2.0, -2.0, z0],
    [2.0, -2.0, z1],
    [2.0, 1.0, z1],

    [2.0, 2.0, z1],
    [2.0, 2.0, z0],
    [-2.0, 2.0, z0],
  ];

  const spline = new Spline(puntos);

  spline.webglDraw(wgl, 0.01);
};

drawPlane(-1);
drawPlane(1);
drawCurve(-1, 1);

const animationStep = (t) => {
  const n = 5;
  const tf = (t / 1000) % n;
  const min_z = -1;
  const max_z = 1;

  // In n seconds, z goes from min_z to max_z
  const z =
    tf < n / 2
      ? min_z * (1 - tf / (n / 2)) + max_z * (tf / (n / 2))
      : max_z * (1 - (tf - n / 2) / (n / 2)) + min_z * ((tf - n / 2) / (n / 2));

  //wgl.clear();
  drawPlane(-1.5);
  drawCurve((z - 1) / 2, z * 2);
  drawCurve((z - 1) / 2 + 0.1, z * 2 + 0.2);
  drawCurve((z - 1) / 2 + 0.2, z * 2 + 0.4);
  setTimeout(() => animationStep(t + 100), 100);
};

animationStep(0);
