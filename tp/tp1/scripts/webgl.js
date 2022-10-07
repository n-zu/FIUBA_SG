import { mat4, mx } from "./util.js";

export const setup = (gl, canvas) => {
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
};

export const setupMatrices = (gl, canvas, glProgram) => {
  let modelMatrix = mat4.create();
  let viewMatrix = mat4.create();
  let projMatrix = mat4.create();
  let normalMatrix = mat4.create();

  mat4.perspective(projMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);
  mat4.identity(modelMatrix);
  mat4.rotate(modelMatrix, modelMatrix, -1.57078, [1.0, 0.0, 0.0]);
  mat4.identity(viewMatrix);
  mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -5.0]);

  const modelMatrixUniform = gl.getUniformLocation(glProgram, "modelMatrix");
  const viewMatrixUniform = gl.getUniformLocation(glProgram, "viewMatrix");
  const projMatrixUniform = gl.getUniformLocation(glProgram, "projMatrix");
  const normalMatrixUniform = gl.getUniformLocation(glProgram, "normalMatrix");

  gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);
  gl.uniformMatrix4fv(viewMatrixUniform, false, viewMatrix);
  gl.uniformMatrix4fv(projMatrixUniform, false, projMatrix);
  gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);
};

const makeShader = (gl, src, type) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new Error("Error compiling shader: " + gl.getShaderInfoLog(shader));

  return shader;
};

export const initShaders = async (gl) => {
  const [vertexSrc, fragmentSrc] = await Promise.all([
    fetch("../shaders/vertex.glsl").then((res) => res.text()),
    fetch("../shaders/fragment.glsl").then((res) => res.text()),
  ]);

  const vertexShader = makeShader(gl, vertexSrc, gl.VERTEX_SHADER);
  const fragmentShader = makeShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);

  const glProgram = gl.createProgram();
  gl.attachShader(glProgram, vertexShader);
  gl.attachShader(glProgram, fragmentShader);
  gl.linkProgram(glProgram);

  if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS))
    throw new Error("Could not initialize shaders");

  gl.useProgram(glProgram);

  return glProgram;
};

export const draw = (gl, glProgram, vertices, normals, indices, mode) => {
  // Buffers
  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  const indicesBuffer = gl.createBuffer();
  indicesBuffer.number_vertex_point = indices.length; // ??
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  /// WebGL Attributes
  const vertexPositionAttribute = gl.getAttribLocation(
    glProgram,
    "aVertexPosition"
  );
  gl.enableVertexAttribArray(vertexPositionAttribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  const vertexNormalAttribute = gl.getAttribLocation(
    glProgram,
    "aVertexNormal"
  );
  gl.enableVertexAttribArray(vertexNormalAttribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.drawElements(
    mode,
    indicesBuffer.number_vertex_point,
    gl.UNSIGNED_SHORT,
    0
  );
};

export class WebGL {
  constructor(canvasSelector) {
    this.canvas = document.querySelector(canvasSelector);
    if (!this.canvas) throw new Error("No canvas found");

    this.gl = this.canvas.getContext("webgl");
    if (!this.gl) throw new Error("WebGL not supported");

    this.clear();
  }

  async clear() {
    setup(this.gl, this.canvas);
  }

  async init() {
    this.glProgram = await initShaders(this.gl);
    setupMatrices(this.gl, this.canvas, this.glProgram);
    this.clear();
    return this;
  }

  setViewMatrix(viewMatrix) {
    const viewMatrixUniform = this.gl.getUniformLocation(
      this.glProgram,
      "viewMatrix"
    );
    this.gl.uniformMatrix4fv(viewMatrixUniform, false, viewMatrix);
  }

  draw(vertices, normals, indices, mode) {
    draw(this.gl, this.glProgram, vertices, normals, indices, mode);
  }

  drawLine = (p1, p2) => {
    this.draw([...p1, ...p2], [0, 0, 0, 0, 0, 0], [0, 1], this.gl.LINES);
  };

  drawVec = (p, dir, len = 1) => {
    const dir2 = mx.norm(dir);
    mx.scaleVec(dir2, len);
    const p2 = mx.add(p, dir2);
    this.drawLine(p, p2);
  };
}
