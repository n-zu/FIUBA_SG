import { loadImage, mat4, mx, expandVecVec } from "./util.js";
import { default_vertex, default_fragment } from "../shaders/index.js";

const defaultMaterials = [
  {
    name: "default",
    src: "https://raw.githubusercontent.com/gsimone/gridbox-prototype-materials/main/prototype_512x512_grey1.png",
  },
];

const defaultLights = {
  directional: {
    dir: [1, 1, 1],
    color: [0.5, 0.5, 0.5],
  },
  points: [
    {
      pos: [0, 0, 0],
      color: [1, 1, 1],
    },
  ],
};

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

  mat4.perspective(projMatrix, 45, canvas.width / canvas.height, 0.1, 200.0);

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

  async init(vertex_file, shader_file, materials, lights) {
    this.glProgram = await initShaders(this.gl, vertex_file, shader_file);
    setupMatrices(this.gl, this.canvas, this.glProgram);
    this.clear();
    this.initMaterials(this.gl, materials);
    this.setLights(lights);
    return this;
  }

  setInt(name, value) {
    const uniform = this.gl.getUniformLocation(this.glProgram, name);
    this.gl.uniform1i(uniform, value);
  }

  setFloat(name, value) {
    const loc = this.gl.getUniformLocation(this.glProgram, name);
    this.gl.uniform1f(loc, value);
  }

  setFloatArray(name, array) {
    const loc = this.gl.getUniformLocation(this.glProgram, name);
    this.gl.uniform1fv(loc, array);
  }

  setVector(name, vector) {
    const loc = this.gl.getUniformLocation(this.glProgram, name);
    this.gl.uniform3fv(loc, vector);
  }

  setVectorArray(name, array) {
    const loc = this.gl.getUniformLocation(this.glProgram, name);
    this.gl.uniform3fv(loc, expandVecVec(array));
  }

  setMatrix(name, matrix) {
    const matrixUniform = this.gl.getUniformLocation(this.glProgram, name);
    this.gl.uniformMatrix4fv(matrixUniform, false, matrix);
  }

  setCamera(position, viewMatrix) {
    this.setVector("cameraPosition", position);
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

  _setMaterialTextures(material) {
    const gl = this.gl;

    const { texture, normalMap } = material;

    if (!texture) return;

    // Bind texture to texture unit 0

    gl.uniform1i(gl.getUniformLocation(this.glProgram, "texture"), 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    if (normalMap) {
      gl.uniform1i(gl.getUniformLocation(this.glProgram, "normalMap"), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, normalMap);

      this.setInt("useNormalMap", 1);
    } else {
      this.setInt("useNormalMap", 0);
    }
  }

  _setMaterialLightProps(material, light = "default", lightStr = 1) {
    this.setFloat("diffuseFactor", material.diffuse);
    this.setVector("specular", material.specular);
    this.setFloat("gloss", material.gloss);
    this.setFloatArray("texScale", material.texScale);
    this.setFloatArray("texWeight", material.texWeight);
    this.setVector("emissive", this.getLightColorStr(light, lightStr));
  }

  _setMaterial(name = "default", light = "default", lightStr = 1) {
    if (this._current_material == name) return;

    const material =
      this.materials.find((t) => t.name === name) || this.materials[0];

    this._setMaterialTextures(material);
    this._setMaterialLightProps(material, light, lightStr);

    this._current_material = name;
  }
  setMaterial(name, light, lightStr) {
    this.current_material = name;
    this._setMaterial(name, light, lightStr);
  }

  async loadTexture(gl, material) {
    if (!material.src || !material.texture) return;
    const image = await loadImage(material.src);
    gl.bindTexture(gl.TEXTURE_2D, material.texture);
    gl.texImage2D(
      ...[gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA],
      gl.UNSIGNED_BYTE,
      image
    );
    gl.generateMipmap(gl.TEXTURE_2D);

    if (!material.normalSrc) return;
    const normalImage = await loadImage(material.normalSrc);
    material.normalMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, material.normalMap);
    gl.texImage2D(
      ...[gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA],
      gl.UNSIGNED_BYTE,
      normalImage
    );
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  initMaterials(gl, materials = defaultMaterials) {
    this.materials = materials.map((material) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        ...[gl.TEXTURE_2D, 0, gl.RGBA],
        ...[1, 1, 0, gl.RGBA],
        gl.UNSIGNED_BYTE,
        new Uint8Array([255, 255, 255, 255])
      );
      return {
        ...material,
        texture,
      };
    });

    this.materials.forEach((material) => this.loadTexture(gl, material));

    this.setMaterial();
  }

  getLightColor(nameOrVec) {
    if (!nameOrVec) return [0, 0, 0];
    if (typeof nameOrVec === "string") {
      const light = this.lightColors?.[nameOrVec];
      if (!light) return [0, 0, 0];
      return light.color;
    }

    return nameOrVec;
  }

  getLightColorStr(nameOrVec, str = 1) {
    const vec = this.getLightColor(nameOrVec);
    return vec.map((v) => v * str);
  }

  setLights(lights = defaultLights) {
    const glc = this.getLightColor.bind(this);

    this.setVector("ambient", glc(lights.ambient));

    this.setVector("directionalLightDir", lights.directional.dir);
    this.setVector("directionalLightColor", glc(lights.directional.color));

    this.setInt("numPointLights", lights.points.length);
    this.setVectorArray(
      "pointLightPos",
      lights.points.map((p) => p.pos)
    );
    this.setVectorArray(
      "pointLightColor",
      lights.points.map((p) => glc(p.color))
    );
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
      gl.drawElements(this.gl.LINE_STRIP, nvp, gl.UNSIGNED_SHORT, 0);
    }
  };

  drawFromBuffersObject = (buffers, mode) => {
    const {
      pointsBuffer,
      normalsBuffer,
      tangentsBuffer,
      biNormalsBuffer,
      idxBuffer,
      uvBuffer,
    } = buffers;

    const gl = this.gl;
    const nvp = idxBuffer.number_vertex_point;

    this.setWglAtt("aVertexPosition", pointsBuffer, 3);
    this.setWglAtt("aVertexNormal", normalsBuffer, 3);
    this.setWglAtt("aVertexTangent", tangentsBuffer, 3);
    this.setWglAtt("aVertexBiNormal", biNormalsBuffer, 3);
    this.setWglAtt("aVertexUV", uvBuffer, 2);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);

    if (this.drawSurfaces) gl.drawElements(mode, nvp, gl.UNSIGNED_SHORT, 0);

    if (this.drawLines) {
      this._setMaterial("window");
      gl.drawElements(this.gl.LINE_STRIP, nvp, gl.UNSIGNED_SHORT, 0);
      this._setMaterial(this.current_material);
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
