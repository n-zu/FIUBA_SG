import { WebGL } from "./webgl.js";
import { vec3, mat4, mx } from "./util.js";

const wgl = new WebGL("#main");
await wgl.init();

const drawLine = (p1, p2) => {
  wgl.draw([...p1, ...p2], [0, 0, 0, 0, 0, 0], [0, 1], wgl.gl.LINES);
};

const drawPlane = (z) => {
  const vertices = [-2.0, -2.0, z, 2.0, -2.0, z, -2.0, 2.0, z, 2.0, 2.0, z];
  const normals = Array(vertices.length).fill(0.6);
  const indices = [0, 1, 2, 3];

  wgl.draw(vertices, normals, indices, wgl.gl.TRIANGLE_STRIP);
};

const drawSup = (p, t, n, delta = 0.01) => {
  const z = -1;
  const puntos = [
    [0.0, 1.0, z],
    [1.0, 0.0, z],
    [1.0, -1.0, z],
    [0.0, -1.0, z],

    [-1.0, -1.0, z],
    [-1.0, 1.0, z],
    [0.0, 1.0, z],
  ];

  const config = {
    bi_normal: [0, 0, 1],
  };

  const sup = {
    p: vec3.fromValues(0, 0, z),
    n: vec3.fromValues(0, 1, 0),
    t: vec3.fromValues(0, 0, -1),
  };

  // ----------------

  const t_axis = vec3.cross(vec3.create(), t, sup.t);
  const t_angle = vec3.angle(t, sup.t);
  const t_Rot = mat4.fromRotation(mat4.create(), t_angle, t_axis);

  const n_alt = vec3.transformMat4(vec3.create(), sup.n, t_Rot);
  const n_angle = vec3.angle(n, n_alt);
  const n_Rot = mat4.fromRotation(mat4.create(), n_angle, t);

  const rot = mat4.multiply(mat4.create(), n_Rot, t_Rot);

  const matrix = mat4.create();
  mx.translate(matrix, mx.neg(sup.p));
  mx.apply(matrix, rot);
  mx.translate(matrix, p);

  const alt_puntos = puntos.map((p) =>
    vec3.transformMat4(vec3.create(), p, matrix)
  );
  const alt_config = {
    bi_normal: vec3.transformMat4(vec3.create(), config.bi_normal, rot),
  };

  console.log({
    curve_normal: [...n],
    sup_normal: [...sup.n],
    rotated_sup_normal: [...vec3.transformMat4(vec3.create(), sup.n, rot)],
  });
  console.log({
    curve_tangent: [...t],
    sup_tangent: [...sup.t],
    rotated_sup_tangent: [...vec3.transformMat4(vec3.create(), sup.t, rot)],
  });
  console.log({
    t_angle: (t_angle * 180) / Math.PI,
    n_angle: (n_angle * 180) / Math.PI,
    t_axis,
    n_axis: t,
  });

  // ----------------

  const spline = new Spline(puntos, config);
  spline.webglDraw(wgl, delta, 0.1);

  const alt_spline = new Spline(alt_puntos, alt_config);
  alt_spline.webglDraw(wgl, delta, 0.1);
};

const getCurve = (z) => {
  const puntos = [
    [-2.0, -2.0, z],
    [2.0, -2.0, z],
    [2.0, -2.0, z],
    [2.0, 1.0, z],

    [2.0, 2.0, z],
    [2.0, 2.0, z],
    [-2.0, 2.0, z],
  ];

  const config = {
    normal: [0, 0, 1],
  };

  return new Spline(puntos, config);
};

const curve = getCurve(-1);

const animationStep = (t) => {
  return;
  const num = 5;
  const dt = 500;
  const tf = (t / 1000) % num;
  const uf = (t / 5000) % 1;
  const min_z = -1;
  const max_z = 1;
  const animate = true;
  console.log("uf", uf);

  // In n seconds, z goes from min_z to max_z
  const z =
    tf < num / 2
      ? min_z * (1 - tf / (num / 2)) + max_z * (tf / (num / 2))
      : max_z * (1 - (tf - num / 2) / (num / 2)) +
        min_z * ((tf - num / 2) / (num / 2));

  //wgl.clear();

  //drawPlane(-1.1);
  curve.webglDraw(wgl, 0.01, 0.05);

  {
    const { p: _p, n: _n, t: _t } = curve.point(uf);
    drawSup(_p, _t, _n, 0.01);
  }

  if (animate) setTimeout(() => animationStep(t + dt), dt);
  else {
    const di = 0.2;
    for (let i = di; i < 1.001; i += di) {
      {
        const { p: _p, n: _n, t: _t } = curve.point(i);
        drawSup(_p, _t, _n, 0.01);
      }
    }
  }
};

{
  const uf = 0.7;
  curve.webglDraw(wgl, 0.01, 0.05);
  const { p: _p, n: _n, t: _t } = curve.point(uf);
  drawSup(_p, _t, _n, 0.01);
}

animationStep(0);
