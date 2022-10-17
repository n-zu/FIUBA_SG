import { Mesh, Transform } from "../../scripts/mesh.js";
import {
  Spline,
  Surface,
  Cube,
  Cylinder,
  Sphere,
  Revolution,
  SweepSolid,
} from "../../scripts/geometry.js";

const color = settings.color;
var glob_geometry = {};

const base_width = 1;
const base_length = 2.5;
const base_height = 1.1;
const base_offset = -0.25;

const getWheels = (wgl) => {
  const wheel = new Cylinder(0.225).setupBuffers(wgl);
  const wheel1 = new Mesh(
    ["wheel1", wheel, color.wood],
    [
      Transform.scale([1, 1, 0.05]),
      Transform.rotate([Math.PI / 2, [0, 1, 0]]),
      Transform.translate([
        base_width / 2 + 0.035,
        0.225,
        base_length / 2 - 0.4,
      ]),
    ]
  );
  const wheel2 = new Mesh(
    ["wheel2", wheel, color.wood],
    [
      Transform.scale([1, 1, 0.05]),
      Transform.rotate([Math.PI / 2, [0, 1, 0]]),
      Transform.translate([
        base_width / 2 + 0.035,
        0.225,
        -base_length / 2 + 0.4,
      ]),
    ]
  );
  const wheel3 = new Mesh(
    ["wheel3", wheel, color.wood],
    [
      Transform.scale([1, 1, 0.05]),
      Transform.rotate([Math.PI / 2, [0, 1, 0]]),
      Transform.translate([
        -base_width / 2 - 0.035,
        0.225,
        base_length / 2 - 0.4,
      ]),
    ]
  );
  const wheel4 = new Mesh(
    ["wheel4", wheel, color.wood],
    [
      Transform.scale([1, 1, 0.05]),
      Transform.rotate([Math.PI / 2, [0, 1, 0]]),
      Transform.translate([
        -base_width / 2 - 0.035,
        0.225,
        -base_length / 2 + 0.4,
      ]),
    ]
  );
  return [wheel1, wheel2, wheel3, wheel4];
};

const getShafts = (wgl) => {
  const shaft = new Cylinder(0.025).setupBuffers(wgl);
  const shaft1 = new Mesh(
    ["shaft1", shaft, color.dark_wood],
    [
      Transform.scale([1, 1, base_width + 0.15]),
      Transform.rotate([Math.PI / 2, [0, 1, 0]]),
      Transform.translate([0, 0.225, base_length / 2 - 0.4]),
    ]
  );
  const shaft2 = new Mesh(
    ["shaft2", shaft, color.dark_wood],
    [
      Transform.scale([1, 1, base_width + 0.15]),
      Transform.rotate([Math.PI / 2, [0, 1, 0]]),
      Transform.translate([0, 0.225, -base_length / 2 + 0.4]),
    ]
  );
  return [shaft1, shaft2];
};
const getSides = (wgl) => {
  const side = 0.05;
  const w = [0.7, 0.3];
  const h = base_height - 0.1;
  const path = Spline.rect(
    [
      [-side / 2, 0, 0],
      [side / 2, 0, 0],
    ],
    { normal: [0, 1, 0] }
  );

  const shape = Spline.rect(
    [
      [-w[0] / 2, 0, 0],
      [-w[1] / 2, h, 0],
      [w[1] / 2, h, 0],
      [w[0] / 2, 0, 0],
      [-w[0] / 2, 0, 0],
    ],
    {
      bi_normal: [0, 0, 1],
    }
  );
  const surface = new Surface(shape);
  const geo = new SweepSolid(surface, path).setupBuffers(wgl, 2, 4 * 3);

  const side1 = new Mesh(
    ["side1", geo, color.wood],
    [Transform.translate([base_width / 2 - 0.075, 0.25, base_offset])]
  );
  const side2 = new Mesh(
    ["side2", geo, color.wood],
    [Transform.translate([-base_width / 2 + 0.075, 0.25, base_offset])]
  );

  return [side1, side2];
};
const getCrossbar = (wgl) => {
  const cyl = new Cylinder(0.075).setupBuffers(wgl);
  const crossbar = new Mesh(
    ["crossbar", cyl, color.dark_wood],
    [
      Transform.scale([1, 1, base_width]),
      Transform.rotate([Math.PI / 2, [0, 1, 0]]),
      Transform.translate([0, base_height, base_offset]),
    ]
  );
  return crossbar;
};

const initiate = (wgl) => {
  if (glob_geometry.initiated) return;
  glob_geometry.initiated = true;

  const cube = new Cube();
  const floor = new Mesh(
    ["floor", cube, color.wood],
    [
      Transform.scale([base_width, 0.05, base_length]),
      Transform.translate([0, 0.225, 0]),
    ]
  );

  const wheels = getWheels(wgl);
  const shafts = getShafts(wgl);
  const sides = getSides(wgl);
  const crossbar = getCrossbar(wgl);

  glob_geometry.base = new Mesh(["base"], null, [
    floor,
    ...wheels,
    ...shafts,
    ...sides,
    crossbar,
  ]);
};

const Catapult = (wgl, rotation) => {
  initiate(wgl);
  const base = glob_geometry.base;

  return new Mesh(["catapult"], [Transform.translate([0, 0, 8])], [base]);
};

export default Catapult;
