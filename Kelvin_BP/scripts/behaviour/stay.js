import { getKelvinEntity, getState } from "./utils.js";

export function stayTick() {
  const kelvin = getKelvinEntity();
  if (!kelvin) return;
  const data = getState().taskData;
  if (!data?.location) return;
  kelvin.teleport(data.location, { keepVelocity: false });
}