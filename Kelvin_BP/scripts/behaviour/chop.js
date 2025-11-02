import { ItemStack, BlockPermutation } from "@minecraft/server";
import {
  getKelvinEntity,
  getOwnerPlayer,
  getState,
  setMode,
  sendKelvinMessage,
  TREE_BLOCKS,
  distanceSquared
} from "./utils.js";

const SEARCH_RADIUS = 10;

export function chopTick() {
  const kelvin = getKelvinEntity();
  const owner = getOwnerPlayer();
  if (!kelvin || !owner) return;
  const state = getState();
  let target = state.taskData?.target;

  if (!target) {
    target = findNearestLog(kelvin);
    if (!target) {
      sendKelvinMessage("Kein Baum in der Nähe gefunden.");
      setMode("idle");
      return;
    }
    state.taskData = { target };
    sendKelvinMessage("Fälle Baum...");
  }

  const dimension = kelvin.dimension;
  const block = dimension.getBlock(target);
  if (!block || !TREE_BLOCKS.has(block.typeId)) {
    state.taskData = null;
    sendKelvinMessage("Baum gefällt.");
    setMode("idle");
    return;
  }

  moveKelvinNear(kelvin, target);

  let currentY = target.y;
  while (true) {
    const check = dimension.getBlock({ x: target.x, y: currentY, z: target.z });
    if (!check || !TREE_BLOCKS.has(check.typeId)) {
      break;
    }
    dropAndBreak(check, dimension);
    currentY++;
  }

  state.taskData = null;
  sendKelvinMessage("Holz eingesammelt.");
  setMode("idle");
}

function moveKelvinNear(kelvin, location) {
  const target = {
    x: location.x + 0.5,
    y: location.y + 1,
    z: location.z + 0.5
  };
  kelvin.teleport(target, { keepVelocity: false });
}

function dropAndBreak(block, dimension) {
  try {
    const typeId = block.typeId;
    block.setPermutation(BlockPermutation.resolve("minecraft:air"));
    if (typeId) {
      const item = new ItemStack(typeId, 1);
      dimension.spawnItem(item, {
        x: block.location.x + 0.5,
        y: block.location.y + 0.5,
        z: block.location.z + 0.5
      });
    }
  } catch (err) {
    // ignore
  }
}

function findNearestLog(kelvin) {
  const dimension = kelvin.dimension;
  const origin = kelvin.location;
  let best = null;
  let bestDist = Number.MAX_VALUE;
  for (let dx = -SEARCH_RADIUS; dx <= SEARCH_RADIUS; dx++) {
    for (let dz = -SEARCH_RADIUS; dz <= SEARCH_RADIUS; dz++) {
      for (let dy = -2; dy <= 6; dy++) {
        const pos = {
          x: Math.floor(origin.x + dx),
          y: Math.floor(origin.y + dy),
          z: Math.floor(origin.z + dz)
        };
        const block = dimension.getBlock(pos);
        if (!block || !TREE_BLOCKS.has(block.typeId)) continue;
        const dist = distanceSquared(origin, pos);
        if (dist < bestDist) {
          bestDist = dist;
          best = { ...pos };
        }
      }
    }
  }
  return best;
}
