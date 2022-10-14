const gui = new dat.GUI();

// General

const general = gui.addFolder("General");

const setNormals = (v) => settings.wgl.setUseTexture(!v);
const setLines = (v) => settings.wgl.setDrawLines(v);

general.add(settings, "normals").name("Color normals").onChange(setNormals);
general.add(settings, "lines").name("Draw lines").onChange(setLines);

general.open();
// Wall
const wall = gui.addFolder("Wall");

wall.add(settings, "wall_number", 4, 12, 1).name("Number of walls");
wall.add(settings, "wall_height", 1, 5, 0.5).name("Height of walls");
wall.add(settings, "wall_angle", 0, 90, 1).name("Angle of the gate");

wall.open();
/*
var f3 = gui.addFolder("Parametros Especiales ");
f3.add(app, "umbral", 0.0, 200.0).name("umbral");
f3.add(app, "samples", 0, 30)
.name("samples")
.onChange(function (v) {
  console.log(" cambio el valor de app.samples a " + v);
});

f2.open();
f3.open();*/
