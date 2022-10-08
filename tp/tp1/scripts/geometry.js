import { mx } from "./util.js";

// Bases
const B0 = (u) => (1 - u) * (1 - u) * (1 - u);
const B1 = (u) => 3 * (1 - u) * (1 - u) * u;
const B2 = (u) => 3 * (1 - u) * u * u;
const B3 = (u) => u * u * u;

const dB0 = (u) => -3 * u * u + 6 * u - 3;
const dB1 = (u) => 9 * u * u - 12 * u + 3;
const dB2 = (u) => -9 * u * u + 6 * u;
const dB3 = (u) => 3 * u * u;

// Config
const debug = true;
const default_convexity = 1; // 1: Convex, -1: Concave
const n_delta = 0.01;

// Util
const arrayOf = (n) => [...Array(n).keys()];
const repeat = (elem, n) => Array(n).fill(elem);

class SegCon {
  static default = () => (u) => default_convexity;
  static convex = () => (u) => 1;
  static concave = () => (u) => -1;
  static convexFrom = (v) => (u) => v >= u ? 1 : -1;
  static concaveFrom = (v) => (u) => v >= u ? -1 : 1;
  static convexUpTo = (v) => (u) => u <= v ? 1 : -1;
  static concaveUpTo = (v) => (u) => u <= v ? -1 : 1;
}

/* Config: {
  convexity: SegCon,
  bi_normal: vec,
  normal: vec,
}*/
class Segment {
  constructor(controlPoints, config = {}) {
    this.controlPoints = controlPoints;
    this.convexity = config.convexity ?? SegCon.default();

    this.normal = config.normal;
    this.bi_normal = config.bi_normal ?? config.normal;
    // the only use of bi_normal is to get the normal, so we set it to skip calculation
  }

  length(delta = 0.1) {
    if (this._len) return this._len;

    let length = 0;
    for (let u = 0; u < 1 - delta; u += delta) {
      const p = this.point(u, false);
      const next_p = this.point(u + delta, false);
      length += mx.dist(p, next_p);
    }

    this._len = length;
    return length;
  }

  point(u, complete = true) {
    const [p0, p1, p2, p3] = this.controlPoints;

    // Point
    const p = [
      B0(u) * p0[0] + B1(u) * p1[0] + B2(u) * p2[0] + B3(u) * p3[0],
      B0(u) * p0[1] + B1(u) * p1[1] + B2(u) * p2[1] + B3(u) * p3[1],
      B0(u) * p0[2] + B1(u) * p1[2] + B2(u) * p2[2] + B3(u) * p3[2],
    ];

    if (!complete) return p;

    // Tangent

    const dp = [
      dB0(u) * p0[0] + dB1(u) * p1[0] + dB2(u) * p2[0] + dB3(u) * p3[0],
      dB0(u) * p0[1] + dB1(u) * p1[1] + dB2(u) * p2[1] + dB3(u) * p3[1],
      dB0(u) * p0[2] + dB1(u) * p1[2] + dB2(u) * p2[2] + dB3(u) * p3[2],
    ];

    const mod_dp = Math.sqrt(dp[0] * dp[0] + dp[1] * dp[1] + dp[2] * dp[2]);

    const tangent = [dp[0] / mod_dp, dp[1] / mod_dp, dp[2] / mod_dp];

    // Normal
    let bi_normal;
    if (this.bi_normal) {
      bi_normal = this.bi_normal;
    } else {
      const convexity = this.convexity(u);
      const next_p = this.point(u + n_delta, false);
      const dv = [0, 1, 2].map((n) => convexity * (p[n] - next_p[n]));
      bi_normal = mx.norm(mx.cross(tangent, dv));
    }
    const normal = this.normal ?? mx.norm(mx.cross(bi_normal, tangent));

    if ((debug && mx.len(bi_normal) < 0.1) || mx.len(normal) < 0.1)
      console.warn("NORMAL ERROR");

    return { p, t: tangent, n: normal, b: bi_normal };
  }

  canvasDraw(
    ctx,
    showControlQuad = false,
    vectorDelta = undefined,
    delta = 0.01,
    lineWidth = 2
  ) {
    const [p0, p1, p2, p3] = this.controlPoints;
    ctx.lineWidth = lineWidth;

    if (showControlQuad) {
      ctx.beginPath();
      ctx.strokeStyle = "#999";

      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);

      ctx.stroke();
    }

    if (vectorDelta) {
      const drawVec = (p, v, c) => {
        ctx.beginPath();
        ctx.strokeStyle = c;
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(p[0] + v[0] * 20, p[1] + v[1] * 20);
        ctx.stroke();
      };
      for (let u = 0; u < 1; u += vectorDelta) {
        const { p, t, n, b } = this.point(u);
        drawVec(p, t, "#F00");
        drawVec(p, n, "#0F0");
        drawVec(p, b, "#00F");
      }
    }

    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.moveTo(p0[0], p0[1]);

    for (let u = 0; u <= 1.001; u = u + delta) {
      const p = this.point(u, false);
      ctx.lineTo(p[0], p[1]);
    }

    ctx.stroke();
  }
}

/* Config: {
  convexity: [SegCon],
  bi_normal: vec,
  normal: vec,
}*/
class Spline {
  constructor(controlPoints, config = {}) {
    if (controlPoints.length < 4) throw new Error("Not enough control points");
    if (controlPoints.length % 3 !== 1)
      throw new Error("Invalid number of control points");

    this.controlPoints = controlPoints;
    this.segNum = (controlPoints.length - 1) / 3;

    if (config.convexity && config.convexity.length !== this.segNum)
      throw new Error("Invalid convexity array");

    this.config = config;

    let lengths = [];
    let totalLength = 0;

    const segment = (i) => new Segment(controlPoints.slice(i * 3, i * 3 + 4));

    for (let s = 0; s < this.segNum; s++) {
      const segLength = segment(s).length();
      lengths.push(segLength);
      totalLength += segLength;
    }

    this.lengths = lengths.map((l) => l / totalLength);
    this.length = totalLength;
    this.transform = { matrix: mx.mat(), rot: mx.mat() };
  }

  setTransform(transform) {
    this.transform = transform;
    return this;
  }

  segment(i) {
    const controlPoints = this.controlPoints.slice(i * 3, i * 3 + 4);
    const convexity = this.config.convexity?.[i];
    return new Segment(controlPoints, { ...this.config, convexity });
  }

  mapU(u) {
    let s = 0;
    // TODO: binary search
    while (u > this.lengths[s]) {
      u -= this.lengths[s];
      s++;
    }

    if (s >= this.segNum) return [this.segNum - 1, 1];

    return [s, u / this.lengths[s]];
  }

  point(u) {
    if (u < 0) u = 0;
    if (u > 1) u = 1;

    const [s, su] = this.mapU(u);
    const { p, t, n } = this.segment(s).point(su);
    const { matrix, rot } = this.transform;

    return {
      p: mx.transform(p, matrix),
      t: mx.transform(t, rot),
      n: mx.transform(n, rot),
    };
  }

  canvasDraw(ctx, showControlQuad = false, vectorDelta) {
    for (let s = 0; s < this.segNum; s++) {
      this.segment(s).canvasDraw(ctx, showControlQuad, vectorDelta);
    }
  }

  webglDraw(wgl, delta = 0.01, normalsDelta = undefined) {
    // Draw Spline
    {
      let points = [];
      let normals = [];

      for (let u = 0; u <= 1.001; u = u + delta) {
        const { p, n } = this.point(u);
        points.push(...p);
        normals.push(...n);
      }
      const idx = arrayOf(points.length / 3);

      wgl.draw(points, normals, idx, wgl.gl.LINE_STRIP);
    }

    // Draw Normals
    if (normalsDelta) {
      for (let u = 0; u <= 1.001; u = u + normalsDelta) {
        const { p, n } = this.point(u);
        const sn = mx.scaled(n, 0.2);
        const dn = mx.add(sn, p);

        const points = [...p, ...dn];
        const normals = [...mx.vec(), ...mx.vec()];

        wgl.draw(points, normals, [0, 1], wgl.gl.LINES);
      }
    }
  }
}

/*
Shape: Spline
Orientation: {
  p: vec,
  t: vec,
  n: vec,
}
Transform: mat
*/
class Surface {
  constructor(shape, orientation) {
    this.shape = shape;
    this.orientation = orientation ?? {
      p: [0, 0, 0],
      t: [0, 0, -1],
      n: [0, 1, 0],
    };
    this.transform = { matrix: mx.mat(), rot: mx.mat() };
  }
  setTransform(transform) {
    this.shape.setTransform(transform);
    this.transform = transform;
    return this;
  }
  alignTo(orientation) {
    const transform = mx.alignMatrix(this.orientation, orientation);
    return this.setTransform(transform);
  }
  getOrientation() {
    const { p, t, n } = this.orientation;
    const { matrix, rot } = this.transform;

    return {
      p: mx.transformed(p, matrix),
      t: mx.transformed(t, rot),
      n: mx.transformed(n, rot),
    };
  }
  shapePoint(u) {
    return this.shape.point(u);
  }

  /*Config: {
    fill: bool (t),
    stroke: bool (f),
    reverse: bool (f),
    normalsDelta: float,
  }*/
  webglDraw(wgl, delta = 0.01, config = {}) {
    const fill = config.fill ?? true;
    const stroke = config.stroke ?? false;
    const reverse = config.reverse ?? false;
    const showNormals = config.showNormals ?? undefined;

    const { p: center, t: _t } = this.getOrientation();
    const t = reverse ? mx.neg(_t) : _t;

    if (stroke) this.shape.webglDraw(wgl, delta, showNormals && delta);
    if (fill) {
      let points = [...center];
      let normals = [...t];

      for (let u = 0; u <= 1.001; u = u + delta) {
        const { p } = this.shape.point(u);
        points.push(...p);
        normals.push(...t);
      }

      const n_points = points.length / 3;
      const idx = arrayOf(n_points);

      wgl.draw(points, normals, idx, wgl.gl.TRIANGLE_FAN);
      if (showNormals) {
        for (let i = 0; i < n_points; i++) {
          const p = points.slice(i * 3, i * 3 + 3);
          wgl.drawVec(p, t, 0.2);
        }
      }
    }
  }

  getBuffers(wgl, delta = 0.01, reverse = false) {
    const { p: center, t: _t } = this.getOrientation();
    const t = reverse ? mx.neg(_t) : _t;

    let points = [...center];
    let normals = [...t];

    for (let u = 0; u <= 1.001; u = u + delta) {
      const { p } = this.shape.point(u);
      points.push(...p);
      normals.push(...t);
    }

    const n_points = points.length / 3;
    const idx = arrayOf(n_points);

    return {
      points: wgl.createBuffer(points),
      normals: wgl.createBuffer(normals),
      idx: wgl.createIndexBuffer(idx),
    };
  }
}

class SweepSolid {
  constructor(shape, path) {
    this.shape = shape;
    this.path = path;
    this.transform = { matrix: mx.mat(), rot: mx.mat() };
  }

  setTransform(transform) {
    this.shape.setTransform(transform);
    this.path.setTransform(transform);
    this.transform = transform;
    return this;
  }

  point(u, v) {
    const curvePoint = this.path.point(u);
    this.shape.alignTo(curvePoint);
    const shapePoint = this.shape.shapePoint(v);

    return shapePoint;
  }

  // DEPRECATED
  webglDraw(wgl, rows = 50, cols = 50, config = {}) {
    const points = [];
    const normals = [];

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const u = r / rows;
        const v = c / cols;
        const { p, n } = this.point(u, v);

        if (config.showNormals) wgl.drawVec(p, n, 0.2);

        points.push(...p);
        normals.push(...n);
      }
    }

    const idx = [];

    const getN = (i, j) => j + (cols + 1) * i;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j <= cols; j++) idx.push(getN(i, j), getN(i + 1, j));
      // idx.push(getN(i + 1, cols), getN(i + 1, 0)); // No es necesario en la ultima fila // ???
    }

    wgl.draw(points, normals, idx, wgl.gl.TRIANGLE_STRIP);
  }

  setupBuffers(wgl, rows = 50, cols = 50, useCovers = true) {
    const points = [];
    const normals = [];

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const u = r / rows;
        const v = c / cols;
        const { p, n } = this.point(u, v);

        points.push(...p);
        normals.push(...n);
      }
    }

    const idx = [];

    const getN = (i, j) => j + (cols + 1) * i;

    for (let i = 0; i < rows; i++)
      for (let j = 0; j <= cols; j++) idx.push(getN(i, j), getN(i + 1, j));

    const pointsBuffer = wgl.createBuffer(points);
    const normalsBuffer = wgl.createBuffer(normals);
    const idxBuffer = wgl.createIndexBuffer(idx);

    this.buffers = { pointsBuffer, normalsBuffer, idxBuffer };
    this.rows = rows;
    this.cols = cols;

    let covers = undefined;
    if (useCovers) {
      const start = this.path.point(0);
      const end = this.path.point(1);
      const startBuffers = this.shape
        .alignTo(start)
        .getBuffers(wgl, 1 / cols, true);
      const endBuffers = this.shape
        .alignTo(end)
        .getBuffers(wgl, 1 / cols, false);
      covers = [startBuffers, endBuffers];
    }
    this.buffers.covers = covers;

    return this;
  }

  draw(wgl) {
    if (!this.buffers) this.setupBuffers(wgl);
    const { pointsBuffer, normalsBuffer, idxBuffer } = this.buffers;
    wgl.drawFromBuffers(
      pointsBuffer,
      normalsBuffer,
      idxBuffer,
      wgl.gl.TRIANGLE_STRIP
    );

    this.drawCovers(wgl);
  }

  drawCovers(wgl) {
    const coverBuffers = this.buffers.covers;
    if (!coverBuffers) return;

    this.buffers.covers.forEach((buf) => {
      wgl.drawFromBuffers(
        buf.points,
        buf.normals,
        buf.idx,
        wgl.gl.TRIANGLE_FAN
      );
    });
  }
}

export { SegCon, Segment, Spline, Surface, SweepSolid };
