class ObjectModel {
  name = "Objeto3D";
  object = null;
  transform = mat4.create();
  children = [];

  constructor(attributes, transformations, children) {
    if (attributes?.[0]) this.name = attributes?.[0];
    if (attributes?.[1]) this.object = attributes?.[1];
    transformations?.[0] &&
      transformations.reverse().forEach(({ pos, rot, scale }) => {
        pos && mat4.translate(this.transform, this.transform, pos);
        rot && mat4.rotate(this.transform, this.transform, rot[0], rot[1]);
        scale && mat4.scale(this.transform, this.transform, scale);
      });
    if (children) this.children = children;
  }

  draw(_transform = mat4.create()) {
    let transform = mat4.clone(_transform);
    mat4.multiply(transform, transform, this.transform);

    if (this.object) setTransform(this.object, transform);

    this.children.forEach((child) => child.draw(transform));
  }
}

class Transform {
  static translate = (pos) => ({ pos });
  static rotate = (rot) => ({ rot });
  static scale = (scale) => ({ scale });
}
