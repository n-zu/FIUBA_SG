export const vec3 = glMatrix.vec3;
export const mat4 = glMatrix.mat4;

export const mx = {
  translate: (matrix, vec) => {
    const mat = mat4.fromTranslation(mat4.create(), vec);
    return mat4.multiply(matrix, mat, matrix);
  },
  rotate: (matrix, angle, axis) => {
    const mat = mat4.fromRotation(mat4.create(), angle, axis);
    return mat4.multiply(matrix, mat, matrix);
  },
  apply: (matrix, transform) => mat4.multiply(matrix, transform, matrix),

  // No side-effects
  neg: (vec) => vec3.negate(vec3.create(), vec),
};
