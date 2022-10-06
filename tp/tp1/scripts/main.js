import { WebGL } from "./webgl.js";
import { mx } from "./util.js";
import { Spline, Surface } from "./geometry.js";

const wgl = await new WebGL("#main").init();

const drawSup = (p, t, n, delta = 0.01) => {
  const z = -1;
  const puntos = [
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

  const sup = {
    p: mx.vec(0, 0, z),
    n: mx.vec(0, 1, 0),
    t: mx.vec(0, 0, -1),
  };

  // ----------------

  const { matrix, rot } = mx.alignMatrix(sup, { p, t, n });

  const alt_puntos = puntos.map((p) => mx.transform([...p], matrix));
  const alt_config = {
    bi_normal: mx.transform([...config.bi_normal], rot),
  };

  // ----------------

  const spline = new Spline(puntos, config);
  const surface = new Surface(spline, sup, matrix);
  surface.setTransform({ matrix, rot });
  surface.webglDraw(wgl, delta, {
    showNormals: true,
    reverse: true,
  });
};

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

const curve = getCurve(-1);

const animationStep = (t) => {
  const dt = 500;
  const uf = (t / 5000) % 1;
  const animate = false;

  curve.webglDraw(wgl, 0.01, 0.05);

  {
    const { p: _p, n: _n, t: _t } = curve.point(uf);
    drawSup(_p, _t, _n, 0.01);
  }

  if (animate) setTimeout(() => animationStep(t + dt), dt);
  else {
    const di = 1 / 4;
    for (let i = 0; i < 1 + di; i += di) {
      console.log("i", i);
      const { p: _p, n: _n, t: _t } = curve.point(i);
      drawSup(_p, _t, _n, 0.01);
    }
  }
};

animationStep(0);
