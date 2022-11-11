import { mx } from "../../scripts/util.js";
import { Mesh, Transform } from "../../scripts/mesh.js";
import {
  Spline,
  Surface,
  Cube,
  Cylinder,
  Sphere,
  SweepSolid,
} from "../../scripts/geometry.js";

const color = settings.color;
const fireLight = settings.lightColor.fire;
var glob_geometry = {};

const rad = (deg) => (deg * Math.PI) / 180;

const base_width = 1;
const base_length = 2.5;
const base_height = 1.1;
const base_offset = -0.25;

const getWheels = (wgl) => {
  const wheel = new Cylinder(0.225).setupBuffers(wgl, 50, [5, 0.5], [0.5, 0.5]);
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
  const geo = new SweepSolid(surface, path).setupBuffers(
    wgl,
    2,
    4 * 3,
    true,
    [0.1, 10],
    [0.5, 1],
    [2, 1]
  );

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

const setupArm = (wgl) => {
  const path = Spline.rect(
    [
      [-0.1, 0, 0],
      [0.1, 0, 0],
    ],
    { normal: [0, 1, 0] }
  );

  const shape = Spline.rect(
    [
      [-0.75, 0.1, 0],
      [2, 0.1, 0],
      [2, 0, 0],
      [-0.75, -0.05, 0],
      [-0.75, 0.1, 0],
    ],
    {
      bi_normal: [0, 0, 1],
    }
  );
  const surface = new Surface(shape);
  const geo = new SweepSolid(surface, path).setupBuffers(
    wgl,
    2,
    4 * 3,
    true,
    [0.5, 30],
    [0.1, 2],
    [1, 2]
  );

  glob_geometry.arm = geo;

  const cube = new Cube().setupBuffers(wgl, [0.1, 10], [0.2, 0.4]);
  glob_geometry.shovel = new Mesh(
    ["shovel", cube, color.wood],
    [Transform.scale([0.5, 0.075, 0.7]), Transform.translate([0, 0.1, 2])]
  );

  const cyl = new Cylinder(0.025).setupBuffers(wgl);
  glob_geometry.arm_shaft = new Mesh(
    ["arm_shaft", cyl, color.dark_wood],
    [
      Transform.scale([1, 1, 0.4]),
      Transform.rotate([Math.PI / 2, [0, 1, 0]]),
      Transform.translate([0, 0.025, -0.65]),
    ]
  );

  const sphere = new Sphere(0.2).setupBuffers(wgl);
  glob_geometry.ammo = new Mesh(
    ["ammo", sphere, color.ammo, fireLight],
    [Transform.translate([0, 0.3 + 0.075 / 2, 2])]
  );
};

const setupWeight = (wgl) => {
  const side = 0.05;
  const w = [0.2, 0.08];
  const h = [-0.15, 0.05];
  const path = Spline.rect(
    [
      [-side / 2, 0, 0],
      [side / 2, 0, 0],
    ],
    { normal: [0, 1, 0] }
  );

  const shape = Spline.rect(
    [
      [-w[0] / 2, h[0], 0],
      [-w[1] / 2, h[1], 0],
      [w[1] / 2, h[1], 0],
      [w[0] / 2, h[0], 0],
      [-w[0] / 2, h[0], 0],
    ],
    {
      bi_normal: [0, 0, 1],
    }
  );
  const surface = new Surface(shape);
  const geo = new SweepSolid(surface, path).setupBuffers(
    wgl,
    2,
    4 * 3,
    true,
    [0.1, 5],
    [0.2, 0.2],
    [2, 1]
  );

  const side1 = new Mesh(
    ["side1", geo, color.wood],
    [Transform.translate([0.15, 0, 0])]
  );
  const side2 = new Mesh(
    ["side1", geo, color.wood],
    [Transform.translate([-0.15, 0, 0])]
  );

  const cube = new Cube().setupBuffers(wgl, [1, 10], [0.5, 0.5]);
  const weight = new Mesh(
    ["weight", cube, color.stone],
    [
      Transform.scale([0.5, 0.3, 0.35]),
      Transform.translate([0, -0.15 - 0.15, 0]),
    ]
  );

  glob_geometry.weight_children = [side1, side2, weight];
};
const getWeight = (rotation = 0) => {
  return new Mesh(
    ["weight"],
    [
      Transform.rotate([rad(-rotation), [1, 0, 0]]),
      Transform.translate([0, 0.025, -0.65]),
    ],
    glob_geometry.weight_children
  );
};

const getArm = (rotation = 0, ammo = true) => {
  return new Mesh(
    ["arm", glob_geometry.arm, color.wood],
    [
      Transform.rotate([rad(rotation), [1, 0, 0]]),
      Transform.translate([0, base_height, base_offset]),
    ],
    [
      glob_geometry.shovel,
      glob_geometry.arm_shaft,
      getWeight(rotation),
      ammo ? glob_geometry.ammo : null,
    ]
  );
};

const initiate = (wgl) => {
  if (glob_geometry.initiated) return;
  glob_geometry.initiated = true;

  const cube = new Cube().setupBuffers(wgl, [0.1, 20], [0.5, 1], [0, 2]);
  const floor = new Mesh(
    ["floor", cube, color.wood],
    [
      Transform.scale([base_width, 0.05, base_length]),
      Transform.translate([0, 0.225, 0]),
    ]
  );
  const shadow = new Mesh(
    ["shadow", cube, color.dark_grass],
    [Transform.scale([base_width * 1.2, 0.001, base_length * 1.05])]
  );

  const wheels = getWheels(wgl);
  const shafts = getShafts(wgl);
  const sides = getSides(wgl);
  const crossbar = getCrossbar(wgl);

  glob_geometry.base = new Mesh(["base"], null, [
    floor,
    shadow.h,
    ...wheels,
    ...shafts,
    ...sides,
    crossbar,
  ]);

  setupArm(wgl);
  setupWeight(wgl);
};

const getAmmoTransform = (catapult) => () => {
  const arm = catapult.children[1];
  const ammo = arm.children[3];

  if (!ammo) return undefined;

  const transforms = [ammo.transform, arm.transform, catapult.transform];
  const transform = transforms.reduce((acc, t) => mx.apply(acc, t), mx.mat());
  return transform;
};

const getCatapultPosition = (catapult) => () => {
  const transform = catapult.transform;
  const position = mx.transform(mx.vec(), transform);
  return position;
};

const Catapult = (wgl, offset, rotation, arm_rotation, ammo) => {
  initiate(wgl);
  const base = glob_geometry.base;
  const arm = getArm(arm_rotation, ammo);

  const catapult = new Mesh(
    ["arm_rotation"],
    [
      Transform.rotate([rad(rotation), [0, 1, 0]]),
      Transform.translate([0, 0, 17]),
      Transform.rotate([rad(offset), [0, 1, 0]]),
    ],
    [base, arm]
  );
  catapult.getAmmoTransform = getAmmoTransform(catapult);
  catapult.getPosition = getCatapultPosition(catapult);
  return catapult;
};

export default Catapult;
