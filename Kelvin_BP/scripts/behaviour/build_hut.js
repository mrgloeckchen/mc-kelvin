import { getKelvinEntity, getOwnerPlayer, getState, sendKelvinMessage, setMode, setBlock, getForwardPosition } from "./utils.js";

export function prepareBuildTask(player) {
  const forwardDir = player.getViewDirection();
  let forward = { x: 0, z: 1 };
  if (Math.abs(forwardDir.x) > Math.abs(forwardDir.z)) {
    forward = { x: Math.sign(forwardDir.x) || 1, z: 0 };
  } else {
    forward = { x: 0, z: Math.sign(forwardDir.z) || 1 };
  }
  const right = { x: -forward.z, z: forward.x };
  const originPos = getForwardPosition(player, 4);
  const baseY = Math.floor(player.location.y - 1);
  const placements = [];

  // Floor
  for (let dx = 0; dx < 5; dx++) {
    for (let dz = 0; dz < 5; dz++) {
      const pos = translate(originPos, baseY, forward, right, dx, dz, 0);
      placements.push({ ...pos, blockId: "minecraft:oak_planks" });
    }
  }

  // Walls and door opening
  for (let dx = 0; dx < 5; dx++) {
    for (let dz = 0; dz < 5; dz++) {
      const isEdge = dx === 0 || dx === 4 || dz === 0 || dz === 4;
      if (!isEdge) continue;
      const isCorner = (dx === 0 || dx === 4) && (dz === 0 || dz === 4);
      const blockId = isCorner ? "minecraft:oak_log" : "minecraft:oak_planks";
      for (let dy = 1; dy <= 3; dy++) {
        if (dz === 0 && dx === 2 && dy <= 2) {
          // Door opening
          const airPos = translate(originPos, baseY, forward, right, dx, dz, dy);
          placements.push({ ...airPos, blockId: "minecraft:air" });
          continue;
        }
        const pos = translate(originPos, baseY, forward, right, dx, dz, dy);
        placements.push({ ...pos, blockId });
      }
    }
  }

  // Roof slabs (layer above walls)
  for (let dx = 0; dx < 5; dx++) {
    for (let dz = 0; dz < 5; dz++) {
      const pos = translate(originPos, baseY, forward, right, dx, dz, 4);
      placements.push({ ...pos, blockId: "minecraft:oak_slab" });
    }
  }

  return {
    placements,
    index: 0,
    workSpot: translate(originPos, baseY, forward, right, 2, -1, 1)
  };
}

export function buildHutTick() {
  const kelvin = getKelvinEntity();
  const owner = getOwnerPlayer();
  if (!kelvin || !owner) return;
  const state = getState();
  const task = state.taskData;
  if (!task?.placements?.length) {
    sendKelvinMessage("Hütte bereits fertiggestellt.");
    setMode("idle");
    return;
  }

  const dimension = kelvin.dimension;
  if (task.workSpot) {
    kelvin.teleport({ ...task.workSpot, y: task.workSpot.y + 1 }, { keepVelocity: false });
  }
  for (let i = 0; i < 8 && task.index < task.placements.length; i++, task.index++) {
    const placement = task.placements[task.index];
    setBlock(dimension, placement, placement.blockId);
  }

  if (task.index >= task.placements.length) {
    state.taskData = null;
    sendKelvinMessage("Hütte fertig!");
    setMode("idle");
  }
}

function translate(origin, baseY, forward, right, dx, dz, dy) {
  return {
    x: Math.floor(origin.x + forward.x * dz + right.x * dx),
    y: baseY + dy,
    z: Math.floor(origin.z + forward.z * dz + right.z * dx)
  };
}
