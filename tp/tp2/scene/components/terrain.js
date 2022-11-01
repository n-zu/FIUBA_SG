import { Mesh, Transform } from "../../scripts/mesh.js";
import {
  Spline,
  Surface,
  Cube,
  Revolution,
  SweepSolid,
} from "../../scripts/geometry.js";

const depth = -4;
const color = settings.color;
var glob_geometry = {};

const getCenterSurface = () => {
  const x1 = 8;
  const x2 = 12;
  const points = [
    [0, 0, 0],
    [x1, 0, 0],
    [x2, depth, 0],
    [0, depth, 0],
  ];

  const shape = Spline.rect(points, {
    bi_normal: [0, 0, 1],
  });
  const surface = new Surface(shape);

  return surface;
};
const getCenterGeometry = (wgl) => {
  const rev = new Revolution();
  const surface = getCenterSurface();
  return new SweepSolid(surface, rev).setupBuffers(
    wgl,
    40,
    3 * surface.shape.segNum,
    false,
    [40, 50]
  );
};
const getFloorSurface = () => {
  const x1 = 15;
  const x2 = 30;
  const points = [
    [0, depth, 0],
    [x1 * 0.9, depth, 0],
    [x1, 0, 0],
    [x2, 0, 0],
    [x2, depth, 0],
    [0, depth - 0.1, 0],
  ];

  const shape = Spline.rect(points, {
    bi_normal: [0, 0, 1],
  });
  const surface = new Surface(shape);

  return surface;
};
const getFloorGeometry = (wgl) => {
  const rev = new Revolution();
  const surface = getFloorSurface();
  return new SweepSolid(surface, rev).setupBuffers(
    wgl,
    8,
    3 * surface.shape.segNum,
    false,
    [8 * 10, 140]
  );
};

const getWater = (t) =>
  new Mesh(
    ["bridge", glob_geometry.water_cube, color.water],
    [
      Transform.translate([0, -0.5, 0]),
      Transform.scale([30, 3, 30]),
      Transform.translate([0, -0.5, 0]),
      Transform.rotate([t / 5, [0, 1, 0]]),
    ]
  );

let initiated = false;
const initiate = (wgl) => {
  if (initiated) return;
  initiated = true;

  const cube = new Cube(1).setupBuffers(wgl, [5, 100], [1, 4]);
  glob_geometry.water_cube = new Cube(1).setupBuffers(wgl, [1, 1], [3, 3]);

  glob_geometry.center = new Mesh([
    "center",
    getCenterGeometry(wgl),
    color.grass,
  ]);
  glob_geometry.bridge = new Mesh(
    ["bridge", cube, color.grass],
    [
      Transform.translate([0, 0, 0.5]),
      Transform.scale([2, 3, 12]),
      Transform.translate([0, -1.7, 8]),
    ]
  );
  glob_geometry.floor = new Mesh(["floor", getFloorGeometry(wgl), color.grass]);
};

const Terrain = (wgl, t) => {
  initiate(wgl);

  const { center, bridge, floor } = glob_geometry;
  const water = getWater(t);

  const terrain = new Mesh(["Terrain"], null, [center, bridge, floor, water]);

  return terrain;
};

export default Terrain;
