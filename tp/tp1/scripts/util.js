export const vec3 = glMatrix.vec3;
export const mat4 = glMatrix.mat4;

export const mx = {
  // Constructors
  vec: (x = 0, y = 0, z = 0) => vec3.fromValues(x, y, z),
  mat: () => mat4.create(),

  rotation: (angle, axis) => mat4.fromRotation(mat4.create(), angle, axis),

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
  alignMatrix: (vec, ref, rotation) => {
    const { p, t, n } = ref;
    const t_axis = mx.cross(t, vec.t);
    let t_angle = mx.angle(t, vec.t);
    let t_Rot = mx.rotation(t_angle, t_axis);
    {
      const alt_t = mx.transform([...vec.t], t_Rot);
      const dot = mx.dot(alt_t, t);
      if (dot < 0.5) {
        t_angle = 2 * Math.PI - t_angle;
        t_Rot = mx.rotation(t_angle, t_axis);
      }
    }

    const n_alt = mx.transform([...vec.n], t_Rot);
    let n_angle = mx.angle(n, n_alt);
    let n_Rot = mx.rotation(n_angle, t);
    {
      const alt_n = mx.transform([...n_alt], n_Rot);
      const dot = mx.dot(alt_n, n);
      if (dot < 0.5) {
        n_angle = 2 * Math.PI - n_angle;
        n_Rot = mx.rotation(n_angle, t);
      }
    }

    const rot = mx.mul(n_Rot, t_Rot);

    const matrix = mx.mat();
    mx.translate(matrix, mx.neg(vec.p));
    mx.apply(matrix, rot);
    mx.translate(matrix, p);

    return { matrix, rot };
  },
};
