import { getKelvinEntity, getOwnerPlayer, distanceSquared } from "./utils.js";

export function followTick() {
  const owner = getOwnerPlayer();
  const kelvin = getKelvinEntity();
  if (!owner || !kelvin) return;

  const dist = Math.sqrt(distanceSquared(owner.location, kelvin.location));
  if (dist > 3) {
    const dir = {
      x: owner.location.x - kelvin.location.x,
      y: 0,
      z: owner.location.z - kelvin.location.z
    };
    const len = Math.sqrt(dir.x * dir.x + dir.z * dir.z) || 1;
    const target = {
      x: owner.location.x - (dir.x / len) * 1.5,
      y: owner.location.y,
      z: owner.location.z - (dir.z / len) * 1.5
    };
    kelvin.teleport(target, { keepVelocity: false, facingLocation: owner.location });
  } else {
    kelvin.teleport(kelvin.location, { keepVelocity: false, facingLocation: owner.location });
  }
}
