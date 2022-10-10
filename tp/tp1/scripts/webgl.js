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

  //mat4.rotate(modelMatrix, modelMatrix, -Math.PI / 2, [1.0, 0.0, 0.0]);
  mat4.perspective(projMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);

  const modelMatrixUniform = gl.getUniformLocation(glProgram, "modelMatrix");
  const viewMatrixUniform = gl.getUniformLocation(glProgram, "viewMatrix");
  const projMatrixUniform = gl.getUniformLocation(glProgram, "projMatrix");
  const normalMatrixUniform = gl.getUniformLocation(glProgram, "normalMatrix");

  gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);
  gl.uniformMatrix4fv(viewMatrixUniform, false, viewMatrix);
  gl.uniformMatrix4fv(projMatrixUniform, false, projMatrix);
  gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);
};

export const makeShader = (gl, src, type) => {
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

  createBuffer = (array) => {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
    return buffer;
  };

  createIndexBuffer = (array) => {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    buffer.number_vertex_point = array.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(array),
      gl.STATIC_DRAW
    );
    return buffer;
  };

  setWglAtt = (name, buffer, size) => {
    const gl = this.gl;
    const attribute = gl.getAttribLocation(this.glProgram, name);
    gl.enableVertexAttribArray(attribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0);
  };

  drawFromBuffers = (verticesBuffer, normalsBuffer, indicesBuffer, mode) => {
    const gl = this.gl;

    this.setWglAtt("aVertexPosition", verticesBuffer, 3);
    this.setWglAtt("aVertexNormal", normalsBuffer, 3);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.drawElements(
      mode,
      indicesBuffer.number_vertex_point,
      gl.UNSIGNED_SHORT,
      0
    );
  };

  draw(vertices, normals, indices, mode) {
    // Buffers
    const verticesBuffer = this.createBuffer(vertices);
    const normalsBuffer = this.createBuffer(normals);
    const indicesBuffer = this.createIndexBuffer(indices);

    this.drawFromBuffers(verticesBuffer, normalsBuffer, indicesBuffer, mode);
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
