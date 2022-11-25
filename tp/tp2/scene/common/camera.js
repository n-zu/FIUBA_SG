import { FreeCamera, OrbitalCamera } from "../../scripts/camera.js";

settings.camera = new OrbitalCamera(settings.wgl);
setControlsClass("not_free");

let _mode = settings.camera_mode;

const setCameraMode = (mode) => {
  _mode = mode;
  settings.camera_mode = mode;
  settings.camera.cleanup();
  switch (mode) {
    case "Free":
      settings.camera = new FreeCamera(settings.wgl, [-4, 1, 22]);
      setControlsClass("free");
      break;
    case "Center":
      settings.camera = new OrbitalCamera(settings.wgl);
      setControlsClass("not_free");
      break;
    case "Catapult":
      settings.camera = new OrbitalCamera(
        settings.wgl,
        settings.getCatapultPosition(),
        [0, 1, 5]
      );
      setControlsClass("not_free");
      break;
  }
};

function setControlsClass(className) {
  const controls = document.querySelector("#controls");
  controls.classList.remove("free", "not_free");
  controls.classList.add(className);
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "1":
      setCameraMode("Free");
      break;
    case "2":
      setCameraMode("Center");
      break;
    case "3":
      setCameraMode("Catapult");
      break;
  }
});

export const updateCamera = (wgl) => {
  if (_mode != settings.camera_mode) setCameraMode(settings.camera_mode);

  if (settings.camera_mode == "Catapult")
    settings.camera.setTarget(settings.getCatapultPosition());

  settings.camera.update(wgl);
};
