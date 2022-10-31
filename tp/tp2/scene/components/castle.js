import { Mesh, Transform } from "../../scripts/mesh.js";
import {
  Spline,
  Surface,
  Cube,
  Revolution,
  SweepSolid,
} from "../../scripts/geometry.js";

const color = settings.color;
var glob_geometry = {};

const floor_height = 1.0;
const floor_division = 0.1;

const tower_head = 1;
const tower_head_slope = 0.5;
const tower_foot = -0.6;

const window_depth = 0.1;
const window_height = 0.4;
const window_width = 0.3;

const getWindows = (width, length) => {
  let windows = [];

  const with_windows = parseInt((width - 1) / 2 / window_width);
  const length_windows = parseInt((length - 1) / 2 / window_width);

  let w, l;
  {
    const w_window = () => {
      w += window_width * 2;
      return new Mesh(
        ["window", glob_geometry.window, color.window],
        [Transform.translate([w, floor_height / 2, l])]
      );
    };
    w = -with_windows * window_width - window_width;
    l = length / 2;
    windows.push(...Array(with_windows).fill().map(w_window));
    w = -with_windows * window_width - window_width;
    l = -length / 2;
    windows.push(...Array(with_windows).fill().map(w_window));
  }
  {
    const l_window = () => {
      l += window_width * 2;
      return new Mesh(
        ["window", glob_geometry.window, color.window],
        [
          Transform.rotate([Math.PI / 2, [0, 1, 0]]),
          Transform.translate([w, floor_height / 2, l]),
        ]
      );
    };
    w = width / 2;
    l = -length_windows * window_width - window_width;
    windows.push(...Array(length_windows).fill().map(l_window));
    w = -width / 2;
    l = -length_windows * window_width - window_width;
    windows.push(...Array(length_windows).fill().map(l_window));
  }

  return new Mesh(["windows"], null, [...windows]);
};

const getBuilding = (width, length, floors) => {
  const windows = getWindows(width, length);
  const structure = new Mesh(
    ["structure", glob_geometry.cube, color.castle],
    [
      Transform.scale([width, floor_height, length]),
      Transform.translate([0, floor_height / 2, 0]),
    ]
  );
  const fd = floor_division * 2;
  const divisor = new Mesh(
    ["structure", glob_geometry.thin_cube, color.castle],
    [Transform.scale([width + fd, fd / 2, length + fd])]
  );

  const getFloor = (i) =>
    new Mesh(
      ["floor"],
      [Transform.translate([0, floor_height * i, 0])],
      [structure, windows, i ? divisor : null]
    );

  const building = new Mesh(["building"], null, [
    ...Array(floors)
      .fill()
      .map((_, i) => getFloor(i)),
  ]);

  return building;
};

const getTowerSurface = (height) => {
  const d = 0.05;
  const r1 = 0.6;
  const r2 = 0.4;
  const th = tower_head;
  const ts = tower_head_slope;

  const points = [
    [0, height + d, 0],
    [r1 / 2, height + d, 0],

    [r1 / 2, height + d, 0],
    [r1, height, 0],
    [r1, height - th, 0],

    [r1, height, 0],
    [r1, height - th, 0],
    [r1, height - th - ts / 2, 0],

    [r2, height - th - ts / 2, 0],
    [r2, height - th - ts, 0],
    [r2, d, 0],

    [r2, d, 0],
    [r2, 0, 0],
  ];

  const shape = new Spline(points, {
    bi_normal: [0, 0, 1],
    //uniformLength: true,
  });
  const surface = new Surface(shape);

  return surface;
};
const getTowerGeometry = (wgl, height) => {
  const rev = new Revolution();
  const surface = getTowerSurface(height);
  const geometry = new SweepSolid(surface, rev).setupBuffers(
    wgl,
    20,
    parseInt(20 * height),
    false,
    [8, parseInt(8 * height)]
  );
  return geometry;
};
const getTower = (point) => {
  const geometry = glob_geometry.tower;
  const geometry_tip = glob_geometry.tower_tip;

  const tip = new Mesh(
    ["tower_tip", geometry_tip, color.tower_tip],
    [Transform.translate([0, glob_geometry.tower_height - 0.1, 0])]
  );

  return new Mesh(
    ["Tower", geometry, color.castle],
    [Transform.translate(point)],
    [tip]
  );
};
const getTowers = (width, length) => {
  const points = [
    [width / 2, 0, length / 2],
    [width / 2, 0, -length / 2],
    [-width / 2, 0, length / 2],
    [-width / 2, 0, -length / 2],
  ];
  return new Mesh(["Towers"], null, [...points.map((p) => getTower(p))]);
};

const getTowerTipSurface = (height = 1.5) => {
  const d = 0.05;
  const r = 0.85;

  const points = [
    [0, height, 0],
    [2 * d, height - 4 * d, 0],

    [r / 2, r / 2, 0],
    [r, 0, 0],
    [r / 2, d, 0],

    [d, 0, 0],
    [0, 0, 0],
  ];

  const shape = new Spline(points, {
    bi_normal: [0, 0, 1],
    //uniformLength: true,
  });
  const surface = new Surface(shape);

  return surface;
};
const getTowerTipGeometry = (wgl, height) => {
  const rev = new Revolution();
  const surface = getTowerTipSurface(height);
  const geometry = new SweepSolid(surface, rev).setupBuffers(
    wgl,
    20,
    20,
    false
  );
  return geometry;
};

const getWindowSurface = (width = window_width, height = window_height) => {
  const points = [
    [-width / 2, -height / 2, 0],
    [-width / 2, 0, 0],

    [-width / 2, height / 2, 0],
    [0, height / 2, 0],
    [width / 2, height / 2, 0],

    [width / 2, 0, 0],
    [width / 2, -height / 2, 0],
    [-width / 2, -height / 2, 0],

    [width / 2, -height / 2, 0],
    [-width / 2, -height / 2, 0],
  ];

  const shape = new Spline(points, {
    bi_normal: [0, 0, 1],
    uniformLength: true,
  });
  const surface = new Surface(shape);

  return surface;
};
const getWindowGeometry = (wgl, width, height, depth = window_depth) => {
  const path = Spline.rect(
    [
      [0, 0, -depth / 2],
      [0, 0, depth / 2],
    ],
    { normal: [0, 1, 0] }
  );
  const surface = getWindowSurface(width, height);
  const geometry = new SweepSolid(surface, path).setupBuffers(
    wgl,
    2,
    30,
    true,
    [1, 1],
    [0.2, 0.2]
  );
  return geometry;
};

const initiate = (wgl, width, length, floors) => {
  const _floors = parseInt(floors);
  const w_dif = Math.abs(width - glob_geometry.width ?? 0);
  const l_dif = Math.abs(length - glob_geometry.length ?? 0);
  const f_dif = Math.abs(_floors - glob_geometry.floors ?? 0);

  if (!glob_geometry.initiated) {
    glob_geometry.cube = new Cube().setupBuffers(wgl, [5, 100], [4, 4]);
    glob_geometry.thin_cube = new Cube().setupBuffers(wgl, [0.5, 100], [4, 4]);
    glob_geometry.window = getWindowGeometry(wgl);
  }

  if (!glob_geometry.initiated || f_dif > 0) {
    glob_geometry.floors = _floors;
    glob_geometry.tower_height =
      _floors * floor_height + tower_head + tower_head_slope + tower_foot;
    glob_geometry.tower = getTowerGeometry(wgl, glob_geometry.tower_height);
    glob_geometry.tower_tip = getTowerTipGeometry(wgl);
  }

  if (!glob_geometry.initiated || w_dif > 0 || l_dif > 0) {
    glob_geometry.width = width;
    glob_geometry.length = length;
  }

  if (!glob_geometry.initiated || f_dif > 0 || w_dif > 0 || l_dif > 0) {
    glob_geometry.initiated = true;
    return true;
  }

  return false;
};

let cache = undefined;
const Castle = (wgl, width = 6, length = 4, floors = 3) => {
  if (!initiate(wgl, width, length, floors)) return cache;

  const geo = glob_geometry;
  const building = getBuilding(geo.width, geo.length, geo.floors);
  const towers = getTowers(geo.width, geo.length);

  //const window = new Mesh(["Window", geo.window, color.window]);

  const castle = new Mesh(["castle"], null, [building, towers]);
  cache = castle;

  return castle;
};

export default Castle;
