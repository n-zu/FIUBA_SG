import { Mesh, Transform } from "../../scripts/mesh.js";
import {
  Spline,
  Surface,
  Cube,
  Cylinder,
  Revolution,
  SweepSolid,
} from "../../scripts/geometry.js";

const getSurface = () => {
  const x1 = 15;
  const x2 = 30;
  const points = [
    [0, -4, 0],
    [x1 * 0.9, -4, 0],
    [x1, 0, 0],
    [x2, 0, 0],
    [x2, -4, 0],
  ];

  const shape = Spline.rect(points, {
    bi_normal: [0, 0, 1],
  });
  const surface = new Surface(shape);

  return surface;
};
const getFloorGeometry = (wgl) => {
  const rev = new Revolution();
  const surface = getSurface();
  return new SweepSolid(surface, rev).setupBuffers(
    wgl,
    8,
    3 * surface.shape.segNum,
    false
  );
};

const Terrain = (wgl) => {
  const cube = new Cube(1).setupBuffers(wgl);
  const cyl = new Cylinder(10, 8).setupBuffers(wgl, 30);
  const color = {
    grass: [0.5, 0.8, 0.5],
    water: [0.5, 0.5, 0.8],
  };

  const center = new Mesh(
    ["center", cyl, color.grass],
    [
      Transform.rotate([-Math.PI / 2, [1, 0, 0]]),
      Transform.translate([0, -0.5, 0]),
      Transform.scale([1, 3, 1]),
    ]
  );
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

  return terrain;
};

export default Terrain;
