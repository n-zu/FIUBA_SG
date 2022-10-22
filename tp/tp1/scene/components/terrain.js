import { Mesh, Transform } from "../../scripts/mesh.js";
import {
  Spline,
  Surface,
  Cube,
  Revolution,
  SweepSolid,
} from "../../scripts/geometry.js";

const color = settings.color;
const depth = -4;

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
    false
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
    false
  );
};

let cache = undefined;
const Terrain = (wgl) => {
  if (cache) return cache;

  const cube = new Cube(1).setupBuffers(wgl);

  const center = new Mesh(["center", getCenterGeometry(wgl), color.grass]);
  const bridge = new Mesh(
    ["bridge", cube, color.grass],
    [
      Transform.translate([0, 0, 0.5]),
      Transform.scale([2, 3, 12]),
      Transform.translate([0, -1.7, 8]),
    ]
  );
  const floor = new Mesh(["floor", getFloorGeometry(wgl), color.grass]);
  const water = new Mesh(
    ["bridge", cube, color.water],
    [
      Transform.translate([0, -0.5, 0]),
      Transform.scale([30, 3, 30]),
      Transform.translate([0, -0.5, 0]),
    ]
  );

  const terrain = new Mesh(["Terrain"], null, [center, bridge, floor, water]);
  cache = terrain;

  return terrain;
};

export default Terrain;
