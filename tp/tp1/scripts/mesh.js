import { mat4 } from "./util.js";

class Mesh {
  name = "3D Object";
  geometry = null;
  color = [1.0, 0, 1.0];
  transform = mat4.create();
  children = [];

  constructor(attributes, transformations, children) {
    if (attributes?.[0]) this.name = attributes?.[0];
    if (attributes?.[1]) this.geometry = attributes?.[1];
    if (attributes?.[2]) this.color = attributes?.[2];

    transformations?.[0] &&
      transformations.reverse().forEach(({ pos, rot, scale }) => {
        pos && mat4.translate(this.transform, this.transform, pos);
        rot && mat4.rotate(this.transform, this.transform, rot[0], rot[1]);
        scale && mat4.scale(this.transform, this.transform, scale);
      });
    if (children) this.children = children;
  }

  draw(wgl, _transform = mat4.create()) {
    let transform = mat4.clone(_transform);
    mat4.multiply(transform, transform, this.transform);

    if (this.geometry) {
      wgl.setModelMatrix(transform);
      wgl.setColor(this.color);
      this.geometry.draw(wgl);
    }

    this.children.forEach((child) => child.draw(wgl, transform));
  }
}

class Transform {
  static translate = (pos) => ({ pos });
  static rotate = (rot) => ({ rot });
  static scale = (scale) => ({ scale });
}

export { Mesh, Transform };
