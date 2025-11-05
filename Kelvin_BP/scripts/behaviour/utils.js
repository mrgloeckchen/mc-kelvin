import { world, BlockPermutation } from "@minecraft/server";

const state = {
  ownerId: null,
  kelvinId: null,
  mode: "idle",
  taskData: null
};

export function getState() {
  return state;
}

export function getOwnerPlayer() {
  if (!state.ownerId) return null;
  for (const player of world.getPlayers()) {
    if (player.id === state.ownerId) {
      return player;
    }
  }
  return null;
}

export function getKelvinEntity() {
  if (!state.kelvinId) return null;
  try {
    const entity = world.getEntity(state.kelvinId);
    if (!entity) return null;
    return entity;
  } catch (err) {
    return null;
  }
}

export function setKelvinEntity(entity, owner) {
  state.kelvinId = entity.id;
  state.ownerId = owner.id;
  state.mode = "idle";
  state.taskData = null;
}

export function clearKelvin() {
  state.kelvinId = null;
  state.mode = "idle";
  state.taskData = null;
}

export function isOwner(player) {
  return !!player && player.id === state.ownerId;
}

export function setMode(mode, taskData = null) {
  state.mode = mode;
  state.taskData = taskData;
}

export function getMode() {
  return state.mode;
}

export function ensureKelvinValid() {
  const entity = getKelvinEntity();
  if (!entity || !entity.isValid) {
    clearKelvin();
    return false;
  }
  return true;
}

export function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

export function teleportNearOwner(maxDistance = 12) {
  const owner = getOwnerPlayer();
  const kelvin = getKelvinEntity();
  if (!owner || !kelvin) return;
  const dist = distanceSquared(owner.location, kelvin.location);
  if (dist > maxDistance * maxDistance) {
    const offset = owner.getViewDirection();
    const target = {
      x: owner.location.x - offset.x * 2,
      y: owner.location.y,
      z: owner.location.z - offset.z * 2
    };
    kelvin.teleport(target, { facingLocation: owner.location, keepVelocity: false });
  }
}

export function sendKelvinMessage(text) {
  const owner = getOwnerPlayer();
  if (owner) {
    owner.sendMessage(`Kelvin: ${text}`);
  } else {
    world.sendMessage(`Kelvin: ${text}`);
  }
}

export function lookAt(owner) {
  const kelvin = getKelvinEntity();
  if (!kelvin || !owner) return;
  kelvin.teleport(kelvin.location, { facingLocation: owner.location, keepVelocity: false });
}

export function getForwardPosition(player, distance = 4) {
  const dir = player.getViewDirection();
  return {
    x: player.location.x + dir.x * distance,
    y: Math.floor(player.location.y),
    z: player.location.z + dir.z * distance
  };
}

export function setBlock(dimension, location, blockId) {
  try {
    const block = dimension.getBlock(location);
    if (block) {
      block.setPermutation(BlockPermutation.resolve(blockId));
    }
  } catch (err) {
    // ignore
  }
}

export const TREE_BLOCKS = new Set([
  "minecraft:oak_log",
  "minecraft:birch_log",
  "minecraft:spruce_log",
  "minecraft:oak_wood",
  "minecraft:birch_wood",
  "minecraft:spruce_wood"
]);