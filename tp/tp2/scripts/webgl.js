import { loadImage, mat4, mx } from "./util.js";
import { default_vertex, default_fragment } from "../shaders/index.js";

const defaultTextures = [
  {
    name: "default",
    src: "https://raw.githubusercontent.com/gsimone/gridbox-prototype-materials/main/prototype_512x512_grey1.png",
  },
];

export const setup = (gl, canvas) => {
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
};

export const setupMatrices = (gl, canvas, glProgram) => {
  let modelMatrix = mx.mat();
  let viewMatrix = mx.mat();
  let projMatrix = mx.mat();
  let normalMatrix = mx.mat();

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

const handleFetch = (res) => {
  if (!res.ok || !res.status == 200) throw new Error("Error fetching resource");
  return res.text();
};

export const initShaders = async (
  gl,
  vertex_file = "../shaders/vertex.glsl",
  shader_file = "../shaders/fragment.glsl"
) => {
  const [vertexSrc, fragmentSrc] = await Promise.all([
    fetch(vertex_file)
      .then(handleFetch)
      .catch(() => default_vertex),
    fetch(shader_file)
      .then(handleFetch)
      .catch(() => default_fragment),
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

    this.drawSurfaces = true;

    this.clear();
  }

  async clear() {
    setup(this.gl, this.canvas);
  }

  async init(vertex_file, shader_file, textures) {
    this.glProgram = await initShaders(this.gl, vertex_file, shader_file);
    setupMatrices(this.gl, this.canvas, this.glProgram);
    this.clear();
    await this.initTextures(this.gl, textures);
    return this;
  }

  setMatrix(name, matrix) {
    const matrixUniform = this.gl.getUniformLocation(this.glProgram, name);
    this.gl.uniformMatrix4fv(matrixUniform, false, matrix);
  }

  setViewMatrix(viewMatrix) {
    this.setMatrix("viewMatrix", viewMatrix);
    return this;
  }

  setModelMatrix(modelMatrix) {
    this.setMatrix("modelMatrix", modelMatrix);

    // FIXME:
    // Translations are removed
    // But scalings are not
    // I think normalizing this in the shader is ok
    // But I'm not sure
    // Check the class / asks prof
    const normalMatrix = [...modelMatrix.slice(0, 4 * 3), 0, 0, 0, 1];
    this.setMatrix("normalMatrix", normalMatrix);

    return this;
  }

  setColor(color) {
    this.color = color;
    this._setColor(color);

    return this;
  }
  _setColor(color) {
    const modelColor = color ?? [1.0, 0, 1.0];

    const colorUniform = this.gl.getUniformLocation(
      this.glProgram,
      "modelColor"
    );
    this.gl.uniform3fv(colorUniform, modelColor);
  }

  _setTexture(gl, name = "default") {
    /* FIXME
    const textureUniform = this.gl.getUniformLocation(this.glProgram, "texture");
    this.gl.uniform1i(textureUniform, this.textures[name]);
    */
    const texture =
      this.textures.find((t) => t.name === name) || this.textures[0];
    const img = texture.image;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  async initTextures(gl, textures = defaultTextures) {
    this.textures = await Promise.all(
      textures.map(async (texture) => {
        const image = await loadImage(texture.src);
        return {
          ...texture,
          image,
        };
      })
    );

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    this._setTexture(gl);
  }

  setUseTexture(bool) {
    const useTextureUniform = this.gl.getUniformLocation(
      this.glProgram,
      "useTexture"
    );
    this.gl.uniform1i(useTextureUniform, bool);
    return this;
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
    const nvp = indicesBuffer.number_vertex_point;

    this.setWglAtt("aVertexPosition", verticesBuffer, 3);
    this.setWglAtt("aVertexNormal", normalsBuffer, 3);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

    if (this.drawSurfaces) gl.drawElements(mode, nvp, gl.UNSIGNED_SHORT, 0);

    if (this.drawLines) {
      this._setColor([0.4, 0.4, 0.4]);
      gl.drawElements(this.gl.LINE_STRIP, nvp, gl.UNSIGNED_SHORT, 0);
      this._setColor(this.color);
    }
  };

  drawFromBuffersObject = (buffers, mode) => {
    const { pointsBuffer, normalsBuffer, idxBuffer, uvBuffer } = buffers;

    if (!uvBuffer) console.log("no uv buffer");

    const gl = this.gl;
    const nvp = idxBuffer.number_vertex_point;

    this.setWglAtt("aVertexPosition", pointsBuffer, 3);
    this.setWglAtt("aVertexNormal", normalsBuffer, 3);
    this.setWglAtt("aVertexUV", uvBuffer, 2);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);

    if (this.drawSurfaces) gl.drawElements(mode, nvp, gl.UNSIGNED_SHORT, 0);

    if (this.drawLines) {
      this._setColor([0.4, 0.4, 0.4]);
      gl.drawElements(this.gl.LINE_STRIP, nvp, gl.UNSIGNED_SHORT, 0);
      this._setColor(this.color);
    }
  };

  setDrawLines = (bool) => {
    this.drawLines = bool;
    return this;
  };
  setDrawSurfaces = (bool) => {
    this.drawSurfaces = bool;
    return this;
  };

  draw(vertices, normals, indices, mode) {
    // Buffers
    const verticesBuffer = this.createBuffer(vertices);
    const normalsBuffer = this.createBuffer(normals);
    const indicesBuffer = this.createIndexBuffer(indices);

    this.drawFromBuffers(verticesBuffer, normalsBuffer, indicesBuffer, mode);
  }

  drawLine = (p1, p2, normals = [0, 0, 0, 0, 0, 0]) => {
    this.draw([...p1, ...p2], normals, [0, 1], this.gl.LINES);
  };

  drawVec = (p, dir, len = 1, normals = [0, 0, 0, 0, 0, 0]) => {
    const dir2 = mx.norm(dir);
    mx.scaleVec(dir2, len);
    const p2 = mx.add(p, dir2);
    this.drawLine(p, p2, normals);
  };
}