import { mat4, mx } from "./util.js";

class Mesh {
  name = "3D Object";
  geometry = null;
  transform = mx.mat();
  //modelMatrix = mx.mat(); /// draw is not working so no need for this
  children = [];

  constructor(attributes, transformations, children) {
    if (attributes?.[0]) this.name = attributes?.[0];
    if (attributes?.[1]) this.geometry = attributes?.[1];
    if (attributes?.[2]) this.material = attributes?.[2];
    if (attributes?.[3]) this.lightColor = attributes?.[3];

    transformations?.[0] &&
      transformations.reverse().forEach(({ pos, rot, scale }) => {
        pos && mat4.translate(this.transform, this.transform, pos);
        rot && mat4.rotate(this.transform, this.transform, rot[0], rot[1]);
        scale && mat4.scale(this.transform, this.transform, scale);
      });
    if (children) this.children = children;
  }

  _draw(wgl, _transform = mat4.create()) {
    let transform = mat4.clone(_transform);
    mat4.multiply(transform, transform, this.transform);

    if (this.geometry) {
      wgl.setModelMatrix(transform);
      wgl.setMaterial(this.material);
      this.geometry.draw(wgl);
    }

    this.children.forEach((child) => child?._draw(wgl, transform));
  }

  addLight(lights, transform) {
    if (!this.lightColor) return;

    lights.push({
      pos: mx.transformed([0, 0, 0], transform),
      color: this.lightColor,
    });
  }

  setup(wgl, lights, _transform = mat4.create()) {
    let transform = mat4.clone(_transform);
    mat4.multiply(transform, transform, this.transform);

    if (this.geometry) {
      //this.modelMatrix = transform;
      this.addLight(lights, transform);
    }

    this.children.forEach((child) => {
      try {
        child?.setup(wgl, lights, transform);
      } catch (e) {
        console.log(child);
      }
    });
  }

  // FIXME: For some reason, this is not working
  // Only the last castle floor is being drawn
  /*draw(wgl) {
    if (this.geometry) {
      wgl.setModelMatrix(this.modelMatrix);
      wgl.setMaterial(this.material);
      this.geometry.draw(wgl);
    }

    this.children.forEach((child) => child?.draw(wgl));
  }*/
}

class Transform {
  static translate = (pos) => ({ pos });
  static rotate = (rot) => ({ rot });
  static scale = (scale) => ({ scale });
}

export { Mesh, Transform };
