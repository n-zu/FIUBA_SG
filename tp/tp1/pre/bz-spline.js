const vec = glMatrix.vec3;
const newVec = () => vec.fromValues(0, 0, 0);

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
  bi_normal: vec3,
}*/
class Segment {
  constructor(controlPoints, config = {}) {
    this.controlPoints = controlPoints;
    this.convexity = config.convexity ?? SegCon.default();
    this.bi_normal = config.bi_normal;
  }

  length(delta = 0.1) {
    if (this._len) return this._len;

    let length = 0;
    for (let u = 0; u < 1 - delta; u += delta) {
      const p = this.point(u, false);
      const next_p = this.point(u + delta, false);
      length += vec.dist(p, next_p);
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
      bi_normal = vec.normalize(newVec(), vec.cross(newVec, tangent, dv));
    }
    const normal = vec.normalize(
      newVec(),
      vec.cross(newVec, bi_normal, tangent)
    );

    if (
      (debug && vec.dist(newVec(), bi_normal) < 0.1) ||
      vec.dist(newVec(), normal) < 0.1
    )
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
  bi_normal: vec3,
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
  }

  segment(i) {
    const controlPoints = this.controlPoints.slice(i * 3, i * 3 + 4);
    const convexity = this.config.convexity?.[i];
    const bi_normal = this.config.bi_normal;
    return new Segment(controlPoints, { convexity, bi_normal });
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
    return this.segment(s).point(su);
  }

  canvasDraw(ctx, showControlQuad = false, vectorDelta) {
    for (let s = 0; s < this.segNum; s++) {
      this.segment(s).canvasDraw(ctx, showControlQuad, vectorDelta);
    }
  }

  webglDraw(wgl, delta = 0.01, normalsDelta = undefined) {
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

    if (normalsDelta) {
      for (let u = 0; u <= 1.001; u = u + normalsDelta) {
        const { p, n } = this.point(u);
        const sn = vec.scale(newVec(), n, 0.2);
        const dn = vec.add(newVec(), sn, p);

        const points = [...p, ...dn];
        const normals = [...newVec(), ...newVec()];

        wgl.draw(points, normals, [0, 1], wgl.gl.LINES);
      }
    }
  }
}
