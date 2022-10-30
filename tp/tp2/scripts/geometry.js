import { mx, Transform } from "./util.js";

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

// Object

export const setup3DBuffers = (obj, wgl, rows, cols, uvScale = [1, 1]) => {
  const points = [];
  const normals = [];
  const uv = [];

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const r = row / rows;
      const c = col / cols;
      const { p, n, u, v } = obj.point(r, c);

      points.push(...p);
      normals.push(...n);
      uv.push(u * uvScale[0], v * uvScale[1]);
    }
  }

  const idx = [];

  const getN = (i, j) => j + (cols + 1) * i;

  for (let i = 0; i < rows; i++)
    for (let j = 0; j <= cols; j++) idx.push(getN(i, j), getN(i + 1, j));

  const pointsBuffer = wgl.createBuffer(points);
  const normalsBuffer = wgl.createBuffer(normals);
  const idxBuffer = wgl.createIndexBuffer(idx);
  const uvBuffer = wgl.createBuffer(uv);

  obj.buffers = { pointsBuffer, normalsBuffer, idxBuffer, uvBuffer };
  obj.rows = rows;
  obj.cols = cols;
};

export const setup2DBuffers = (
  wgl,
  point,
  shape,
  divisions,
  reverse = false,
  uvScale,
  axis
) =>
  shape.alignTo(point).getBuffers(wgl, 1 / divisions, reverse, uvScale, axis);

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

    const tangent = mx.norm(dp);

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

    if (this.config.uniformLength || this.config.rect) {
      lengths = repeat(1, this.segNum);
      totalLength = this.segNum;
    } else {
      const segment = (i) => new Segment(controlPoints.slice(i * 3, i * 3 + 4));

      for (let s = 0; s < this.segNum; s++) {
        const segLength = segment(s).length();
        lengths.push(segLength);
        totalLength += segLength;
      }
    }

    this.lengths = lengths.map((l) => l / totalLength);
    this.length = totalLength;
    this.transform = Transform.identity();
  }

  static rect(points, config = {}) {
    let _points = [points[0], points[1]];
    for (let i = 1; i < points.length - 1; i++)
      _points.push(points[i - 1], points[i], points[i + 1]);
    _points.push(points[points.length - 2], points[points.length - 1]);

    return new Spline(_points, { ...config, rect: true });
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
    let su = u / this.lengths[s];

    if (this.config.rect) su = su > 0.5 ? 1 : 0;

    return [s, su];
  }

  point(u) {
    if (u < 0) u = 0;
    if (u > 1) u = 1;

    const [s, su] = this.mapU(u);
    const { p, t, n } = this.segment(s).point(su);
    const b = mx.cross(t, n);

    return this.transform.transforms({ p, t, n, b });
  }

  canvasDraw(ctx, showControlQuad = false, vectorDelta) {
    for (let s = 0; s < this.segNum; s++) {
      this.segment(s).canvasDraw(ctx, showControlQuad, vectorDelta);
    }
  }

  webglDraw(wgl, delta = 0.01, controlPoints = undefined) {
    // Draw Spline
    let points = [];
    let normals = [];

    for (let u = 0; u <= 1.001; u = u + delta) {
      const { p, t, n, b } = this.point(u);
      points.push(...p);
      normals.push(...n);

      if (controlPoints) {
        wgl.drawVec(p, t, 0.2, [1, 0, 0, 1, 0, 0]);
        wgl.drawVec(p, n, 0.2, [0, 1, 0, 0, 1, 0]);
        wgl.drawVec(p, b, 0.2, [0, 0, 1, 0, 0, 1]);
      }
    }
    const idx = arrayOf(points.length / 3);

    wgl.draw(points, normals, idx, wgl.gl.LINE_STRIP);
  }
}

// TODO: Circle Path
class Circle {
  constructor(radius) {}
  point(u) {}
}

class Revolution {
  constructor(orientation, angle = 2 * Math.PI) {
    this.orientation = orientation ?? {
      p: [0, 0, 0],
      n: [0, 1, 0],
      t: [1, 0, 0],
    };
    this.angle = angle;
  }
  point(u) {
    const { p, t: _t, n } = this.orientation; //this.getOrientation();

    const angle = this.angle * u;
    const rot = mx.rotation(angle, n);
    const t = mx.transformed(_t, rot);

    return { p, t, n };
  }
  webglDraw(wgl, delta = 1 / 8) {
    [0, 1].forEach((u) => {
      const { p, t } = this.point(u);
      wgl.drawVec(mx.add(p, mx.scaleVec(t, 0.3)), t, 0.1);
    });
    for (let u = 0; u <= 1.001; u = u + delta) {
      const { p, t, n } = this.point(u);
      wgl.drawVec(p, t, 0.2);
      wgl.drawVec(p, n, 0.4);
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
    this.transform = Transform.identity();
  }
  setTransform(transform) {
    this.shape.setTransform(transform);
    this.transform = transform;
    return this;
  }
  alignTo(orientation) {
    if (!orientation.b) orientation.b = mx.cross(orientation.t, orientation.n);
    const transform = mx.alignTransform(orientation);
    return this.setTransform(transform);
  }
  getOrientation() {
    const { p, t, n } = this.orientation;
    const b = mx.cross(t, n);

    return this.transform.transforms({ p, t, n, b });
  }
  shapePoint(u) {
    return this.shape.point(u);
  }

  /*Config: {
    fill: bool (t),
    stroke: bool (f),
    reverse: bool (f),
    normalsDelta: float,
    control: bool (f),
  }*/
  webglDraw(wgl, delta = 0.01, config = {}) {
    const fill = config.fill ?? true;
    const stroke = config.stroke ?? false;
    const reverse = config.reverse ?? false;
    const showNormals = config.showNormals ?? undefined;
    const control = config.control ?? false;

    const { p: center, t: _t, n, b } = this.getOrientation();
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
    if (control) {
      wgl.drawVec(center, t, 0.2, [1, 0, 0, 1, 0, 0]);
      wgl.drawVec(center, n, 0.2, [0, 1, 0, 0, 1, 0]);
      wgl.drawVec(center, b, 0.2, [0, 0, 1, 0, 0, 1]);
    }
  }

  getBuffers(wgl, delta = 0.01, reverse = false, uvScale = [1, 1], axis = 1) {
    const { p: center, t: _t } = this.getOrientation();
    const t = reverse ? mx.neg(_t) : _t;

    let points = [...center];
    let normals = [...t];
    let uv = [0, 0],
      _u = [],
      _v = [];

    for (let u = 0; u <= 1.001; u = u + delta) {
      const { p } = this.shape.point(u);
      points.push(...p);
      normals.push(...t);
      // Surface must be defined in 1: x,y, 2:x,z
      _u.push(p[0]);
      _v.push(p[axis]);
    }

    const n_points = points.length / 3;
    const idx = arrayOf(n_points);

    //FIXME: negative values
    const max_u = Math.max(..._u);
    const max_v = Math.max(..._v);
    for (let i = 0; i < n_points; i++) {
      const u = _u[i] / max_u;
      const v = _v[i] / max_v;
      uv.push(u * uvScale[0], v * uvScale[1]);
    }

    return {
      pointsBuffer: wgl.createBuffer(points),
      normalsBuffer: wgl.createBuffer(normals),
      idxBuffer: wgl.createIndexBuffer(idx),
      uvBuffer: wgl.createBuffer(uv),
    };
  }
}

class SweepSolid {
  constructor(shape, path) {
    this.shape = shape;
    this.path = path;
    this.transform = Transform.identity();
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
    shapePoint.u = u;
    shapePoint.v = v;

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

  setupBuffers(
    wgl,
    rows = 50,
    cols = 50,
    useCovers = true,
    uvScale,
    coversUvScale,
    coversAxis
  ) {
    setup3DBuffers(this, wgl, rows, cols, uvScale);

    this.buffers.covers = undefined;
    if (useCovers) {
      const start = this.path.point(0);
      const end = this.path.point(1);
      const startBuff = setup2DBuffers(wgl, start, this.shape, cols, 0, coversUvScale,coversAxis);
      const endBuffers = setup2DBuffers(wgl, end, this.shape, cols, 1, coversUvScale,coversAxis);
      this.buffers.covers = [startBuff, endBuffers];
    }

    return this;
  }

  draw(wgl, mode = wgl.gl.TRIANGLE_STRIP) {
    if (!this.buffers) this.setupBuffers(wgl);
    wgl.drawFromBuffersObject(this.buffers, mode);

    this.drawCovers(wgl);
  }

  drawCovers(wgl) {
    const coverBuffers = this.buffers.covers;
    if (!coverBuffers) return;

    this.buffers.covers.forEach((buf) => {
      wgl.drawFromBuffersObject(buf, wgl.gl.TRIANGLE_FAN);
    });
  }
}

class Cube {
  constructor(side = 1, top = side) {
    this.side = side;

    const path = Spline.rect(
      [
        [0, -side / 2, 0],
        [0, side / 2, 0],
      ],
      { normal: [0, 0, 1] }
    );

    const shape = Spline.rect(
      [
        [-side / 2, -side / 2, 0],
        [-top / 2, side / 2, 0],
        [top / 2, side / 2, 0],
        [side / 2, -side / 2, 0],
        [-side / 2, -side / 2, 0],
      ],
      {
        bi_normal: [0, 0, 1],
      }
    );
    const surface = new Surface(shape);

    this.solid = new SweepSolid(surface, path);
  }

  setupBuffers(wgl, uvScale, coversUvScale) {
    this.solid.setupBuffers(wgl, 2, 4 * 3, true, uvScale, coversUvScale,2);
    return this;
  }

  draw(wgl, mode = wgl.gl.TRIANGLE_STRIP) {
    this.solid.draw(wgl, mode);
  }
}
class Cylinder {
  constructor(r1 = 1, r2 = r1) {
    this.r = [r1, r2];
  }

  point(u, v) {
    const _v = v > 0.5 ? 1 : 0;
    const radius = this.r[_v];
    const rot = mx.rotation(2 * Math.PI * u, [0, 0, 1]);

    const p = [radius, 0, _v - 0.5];
    mx.transform(p, rot);

    let n = mx.norm([1, 0, this.r[0] - this.r[1]]);
    mx.transform(n, rot);

    return { p, n, u, v };
  }

  setupCoverBuffers(wgl, divisions = 50) {
    this.buffers.covers = [];
    [0, 1].forEach((v) => {
      const n = [0, 0, 2 * v - 1];

      let points = [...[0, 0, v - 0.5]];
      let normals = [...n];
      let uv = [0, 0];

      for (let i = 0; i <= divisions; i++) {
        const u = i / divisions;
        const { p } = this.point(u, v);

        points.push(...p);
        normals.push(...n);
        uv.push(u, 1);
      }
      const idx = arrayOf(points.length / 3);

      const pointsBuffer = wgl.createBuffer(points);
      const normalsBuffer = wgl.createBuffer(normals);
      const idxBuffer = wgl.createIndexBuffer(idx);
      const uvBuffer = wgl.createBuffer(uv);

      this.buffers.covers.push({
        v,
        pointsBuffer,
        normalsBuffer,
        idxBuffer,
        uvBuffer,
      });
    });
  }

  setupBuffers(wgl, divisions = 50) {
    setup3DBuffers(this, wgl, divisions, 1);
    this.setupCoverBuffers(wgl, divisions);
    return this;
  }

  draw(wgl, mode = wgl.gl.TRIANGLE_STRIP) {
    if (!this.buffers) this.setupBuffers(wgl);
    wgl.drawFromBuffersObject(this.buffers, mode);
    this.drawCovers(wgl);
  }
  drawCovers(wgl) {
    const coverBuffers = this.buffers.covers;
    if (!coverBuffers) return;

    this.buffers.covers.forEach((buf) => {
      wgl.drawFromBuffersObject(buf, wgl.gl.TRIANGLE_FAN);
    });
  }
}
class Sphere {
  constructor(radius = 1) {
    this.radius = radius;
  }

  point(u, v) {
    let mat = mx.mat();

    mx.translate(mat, [this.radius, 0, 0]);
    mx.rotate(mat, Math.PI * (0.5 - v), [0, 0, 1]);
    mx.rotate(mat, 2 * Math.PI * u, [0, 1, 0]);

    const p = mx.vec();
    mx.transform(p, mat);

    return { p, n: mx.norm(p), u, v };
  }

  setupBuffers(wgl, rows = 50, cols = 50) {
    setup3DBuffers(this, wgl, rows, cols);
    return this;
  }

  draw(wgl, mode = wgl.gl.TRIANGLE_STRIP) {
    if (!this.buffers) this.setupBuffers(wgl);
    wgl.drawFromBuffersObject(this.buffers, mode);
  }
}

// Paths
export { SegCon, Segment, Spline, Revolution };

// Shapes
export { Surface, SweepSolid };

// Prefabs
export { Cube, Cylinder, Sphere };
