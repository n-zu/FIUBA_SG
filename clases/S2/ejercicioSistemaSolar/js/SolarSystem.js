let dias_x_año = 360;
let lunas_x_año = dias_x_año / 30;
let iss_x_año = dias_x_año / 30;
let dist_sol_tierra = 120;
let dist_tierra_luna = 60;
let dist_tierra_iss = 20;

const degrees = (degrees) => degrees * (Math.PI/180);

function drawSolarSystem(_time) {
  let time = _time;
  const scene = new ObjectModel(["Sistema Solar"], null, [
    new ObjectModel(
      ["Sistema Tierra"],
      [
        Transform.translate([dist_sol_tierra, 0, 0]),
        Transform.rotate([time, [0, 1, 0]]),
      ],
      [
        new ObjectModel(
          ["Tierra", tierra],
          [
            Transform.rotate([time*dias_x_año, [0, 1, 0]]),
            Transform.rotate([degrees(23), [0, 0, 1]]),
            Transform.rotate([-time, [0, 1, 0]]),
          ]
        ),
        new ObjectModel(
          ["ISS",iss],
          [
            Transform.rotate([degrees(-90), [0, 1, 0]]),
            Transform.translate([dist_tierra_iss, 0, 0]),
            Transform.rotate([time*iss_x_año, [0, 0, 1]]),
          ]
        ),
        new ObjectModel(
          ["Luna", luna],
          [
            Transform.translate([dist_tierra_luna, 0, 0]),
            Transform.rotate([time*lunas_x_año, [0, 1, 0]]),
          ],
          [
            new ObjectModel(
              ["Apollo", apollo],
              [
                Transform.translate([0, 2.05, 0]),
                Transform.rotate([-degrees(45), [0, 0, 1]]),
              ]
            )
          ]
        ),
      ]
    ),
  ]);
  scene.draw();
}
