import { world, system } from "@minecraft/server";
import { handleKelvinCommand } from "./behaviour/commands.js";
import { ensureKelvinValid, teleportNearOwner, getMode } from "./behaviour/utils.js";
import { followTick } from "./behaviour/follow.js";
import { stayTick } from "./behaviour/stay.js";
import { chopTick } from "./behaviour/chop.js";
import { gatherTick } from "./behaviour/gather.js";
import { buildHutTick } from "./behaviour/build_hut.js";

world.beforeEvents.chatSend.subscribe((event) => {
  const message = event.message?.trim();
  if (!message || !message.toLowerCase().startsWith("/kelvin")) {
    return;
  }
  event.cancel = true;
  const sender = event.sender;
  const parts = message.split(/\s+/);
  const action = parts[1] ?? "";
  handleKelvinCommand(sender, action.toLowerCase(), parts.slice(2));
});

system.runInterval(() => {
  if (!ensureKelvinValid()) {
    return;
  }
  teleportNearOwner();
  const mode = getMode();
  switch (mode) {
    case "follow":
      followTick();
      break;
    case "stay":
      stayTick();
      break;
    case "chop":
      chopTick();
      break;
    case "gather":
      gatherTick();
      break;
    case "build_hut":
      buildHutTick();
      break;
    default:
      // idle
      break;
  }
}, 5);
