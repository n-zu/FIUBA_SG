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
const n_delta = 0.01;

const segmentPoint = (u, controlPoints, complete = true) => {
  const [p0, p1, p2, p3] = controlPoints;

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

  let dv;
  if (u < 0.5) {
    const next_p = segmentPoint(u + n_delta, controlPoints, false);
    dv = [next_p[0] - p[0], next_p[1] - p[1], next_p[2] - p[2]];
  } else {
    const prev_p = segmentPoint(u - n_delta, controlPoints, false);
    dv = [p[0] - prev_p[0], p[1] - prev_p[1], p[2] - prev_p[2]];
  }

  const bi_normal = vec.normalize(newVec(), vec.cross(newVec, tangent, dv));
  const normal = vec.normalize(newVec(), vec.cross(newVec, bi_normal, tangent));
  // FIXME: if tg and dv are parallel, normal is undefined

  if (
    (debug && vec.dist(newVec(), bi_normal) < 0.1) ||
    vec.dist(newVec(), normal) < 0.1
  )
    console.warn("NORMAL ERROR");

  return { p, t: tangent, n: normal, b: bi_normal };
};

const drawSegment = (
  ctx,
  controlPoints,
  showControlQuad = false,
  delta = 0.01,
  lineWidth = 2
) => {
  const [p0, p1, p2, p3] = controlPoints;
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

  ctx.beginPath();
  ctx.strokeStyle = "#000";
  ctx.moveTo(p0[0], p0[1]);

  for (let u = 0; u <= 1.001; u = u + delta) {
    const p = segmentPoint(u, controlPoints, false);
    ctx.lineTo(p[0], p[1]);
  }

  ctx.stroke();
};
