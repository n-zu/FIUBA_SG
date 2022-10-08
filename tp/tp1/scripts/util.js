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

  /// Align
  _alignMatrix: (vec, ref) => {
    const matrix = this.mat();
    this.translate(matrix, this.neg(vec.p));
    this.apply(matrix, rot);
    this.translate(matrix, p);

    return { matrix, rot };
  },
  alignVecRot(r, v, _axis = undefined) {
    const axis = _axis ?? this.cross(r, v);
    const angle = this.angle(r, v);
    if (!angle) return this.mat();

    let rot = this.rotation(angle, axis);

    let _v = this.transformed(v, rot);
    if (this.dot(_v, r) < 0.5) rot = this.rotation(-angle, axis);

    return rot;
  },
  alignRot(vec, ref) {
    const t_rot = this.alignVecRot(ref.t, vec.t);

    const n_tr = this.transformed(vec.n, t_rot);
    const n_rot = this.alignVecRot(ref.n, n_tr, ref.t);

    const rot = this.mul(n_rot, t_rot);

    return rot;
  },
  alignMatrix(vec, ref) {
    const rot = this.alignRot(vec, ref);

    const matrix = this.mat();
    this.translate(matrix, this.neg(vec.p));
    this.apply(matrix, rot);
    this.translate(matrix, ref.p);

    return { matrix, rot };
  },
};

export const dmx = {
  ...mx,
  validateAlignRot(vec, ref, rot, maxIter = 3) {
    const n = this.transformed(vec.n, rot);
    const dist = this.dist(n, ref.n);

    if (dist > 0.5) {
      const t = this.transformed(vec.t, rot);
      const rot2 = this.alignRot({ t, n }, ref, maxIter - 1);
      return this.mul(rot2, rot);
    }

    return rot;
  },
  alignRot(vec, ref, maxIter = 3) {
    const t_rot = this.alignVecRot(ref.t, vec.t);

    const n_tr = this.transformed(vec.n, t_rot);
    const n_rot = this.alignVecRot(ref.n, n_tr, ref.t);

    const rot = this.mul(n_rot, t_rot);

    if (maxIter) return this.validateAlignRot(vec, ref, rot, maxIter);
    return rot;
  },
};
