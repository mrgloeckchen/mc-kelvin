import { getKelvinEntity, getOwnerPlayer, getState, setMode, sendKelvinMessage } from "./utils.js";

const SEARCH_RADIUS = 12;

export function gatherTick() {
  const kelvin = getKelvinEntity();
  const owner = getOwnerPlayer();
  if (!kelvin || !owner) return;
  const dimension = kelvin.dimension;
  const state = getState();
  const task = state.taskData ?? { idleTicks: 0, collected: 0 };
  state.taskData = task;

  const items = dimension.getEntities({
    type: "minecraft:item",
    location: kelvin.location,
    maxDistance: SEARCH_RADIUS
  });

  if (!items.length) {
    task.idleTicks++;
    if (task.idleTicks > 10) {
      sendKelvinMessage("Keine Items mehr zu sammeln.");
      state.taskData = null;
      setMode("idle");
    }
    return;
  }

  task.idleTicks = 0;
  let collectedNow = 0;
  for (const entity of items) {
    try {
      const stack = entity.itemStack;
      if (!stack) continue;
      dimension.spawnItem(stack, {
        x: owner.location.x,
        y: owner.location.y,
        z: owner.location.z
      });
      entity.kill();
      task.collected += stack.amount;
      collectedNow += stack.amount;
    } catch (err) {
      // ignore failing entity
    }
  }
  if (collectedNow > 0) {
    sendKelvinMessage(`Übergebe ${collectedNow} Items (${task.collected} gesamt).`);
  }
}
