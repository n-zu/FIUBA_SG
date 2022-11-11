export const vec3 = glMatrix.vec3;
export const mat4 = glMatrix.mat4;

export class Transform extends Array {
  static identity() {
    return new Transform(...mat4.create());
  }

  rot() {
    return [...this.slice(0, 4 * 3), 0, 0, 0, 1];
  }

  transforms({ p, t, n, b }) {
    const rot = this.rot();
    return {
      p: vec3.transformMat4(vec3.create(), p, this),
      t: vec3.transformMat4(vec3.create(), t, rot),
      n: vec3.transformMat4(vec3.create(), n, rot),
      b: vec3.transformMat4(vec3.create(), b, rot),
    };
  }
}

export const mx = {
  // Constructors
  vec: (x = 0, y = 0, z = 0) => vec3.fromValues(x, y, z),
  mat: () => mat4.create(),

  rotation: (angle, axis) => mat4.fromRotation(mat4.create(), angle, axis),
  translation: (v) => mat4.fromTranslation(mat4.create(), v),

  // Transformations
  translate: (matrix, vec) => {
    const mat = mat4.fromTranslation(mat4.create(), vec);
    return mat4.multiply(matrix, mat, matrix);
  },
  rotate: (matrix, angle, axis) => {
    const mat = mat4.fromRotation(mat4.create(), angle, axis);
    return mat4.multiply(matrix, mat, matrix);
  },
  scaleVec: (vec, scale) => {
    return vec3.scale(vec, vec, scale);
  },
  apply: (matrix, transform) => mat4.multiply(matrix, transform, matrix),
  transform: (vec, transform) => vec3.transformMat4(vec, vec, transform),

  // Functions

  /// Vec
  neg: (vec) => vec3.negate(vec3.create(), vec),
  norm: (vec) => vec3.normalize(vec3.create(), vec),
  len: (vec) => vec3.length(vec),

  scaled: (vec, scale) => vec3.scale(vec3.create(), vec, scale),
  transformed: (vec, transform) =>
    vec3.transformMat4(vec3.create(), vec, transform),

  add: (a, b) => vec3.add(vec3.create(), a, b),
  dist: (a, b) => vec3.dist(a, b),
  angle: (a, b) => vec3.angle(a, b),

  cross: (vec1, vec2) => vec3.cross(vec3.create(), vec1, vec2),
  dot: (vec1, vec2) => vec3.dot(vec1, vec2),

  /// Mat
  mul: (a, b) => mat4.multiply(mat4.create(), a, b),

  alignTransform(to) {
    // The element to be alined is always:
    // - Relative to (0,0,0)
    // - Tangent = (0,0,-1)
    // - Normal =  (0,1,0)
    return new Transform(
      ...[to.b[0], to.b[1], to.b[2], 0],
      ...[to.n[0], to.n[1], to.n[2], 0],
      ...[to.t[0], to.t[1], to.t[2], 0],
      ...[to.p[0], to.p[1], to.p[2], 1]
    );
  },

  // Other
  lerp: (start, end, amt) => (1 - amt) * start + amt * end,
};

export const loadImage = (path) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // to avoid CORS if used with Canvas
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
  });
};

export const expandVecVec = (vec) => vec.reduce((acc, v) => [...acc, ...v], []);
