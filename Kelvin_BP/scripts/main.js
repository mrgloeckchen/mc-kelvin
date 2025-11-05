import { world, system } from "@minecraft/server";
import { handleKelvinCommand } from "./behaviour/commands.js";
import { ensureKelvinValid, teleportNearOwner, getMode } from "./behaviour/utils.js";
import { followTick } from "./behaviour/follow.js";
import { stayTick } from "./behaviour/stay.js";
import { chopTick } from "./behaviour/chop.js";
import { gatherTick } from "./behaviour/gather.js";
import { buildHutTick } from "./behaviour/build_hut.js";

console.info("[Scripting] Kelvin: main.js loaded (entry reached)");

// Welt-Init mit Fallback (ältere/stabile vs. beta Namespaces)
const initSub =
  world?.afterEvents?.worldInitialize?.subscribe?.(() => {
    console.info("[Scripting] Kelvin: worldInitialize (afterEvents)");
  }) ??
  world?.beforeEvents?.worldInitialize?.subscribe?.(() => {
    console.info("[Scripting] Kelvin: worldInitialize (beforeEvents)");
  });

try {
  if (world?.afterEvents?.chatSend?.subscribe) {
    world.afterEvents.chatSend.subscribe((ev) => {
      // nur zum Test – nicht produktiv spammen
      if (ev?.sender?.name) {
        console.info(`[Scripting] Kelvin: chatSend AFTER seen from ${ev.sender.name}`);
      } else {
        console.info("[Scripting] Kelvin: chatSend AFTER seen");
      }
    });
    console.info("[Scripting] Kelvin: subscribed to afterEvents.chatSend");
  } else if (world?.beforeEvents?.chatSend?.subscribe) {
    world.beforeEvents.chatSend.subscribe((ev) => {
      console.info("[Scripting] Kelvin: chatSend BEFORE seen");
    });
    console.info("[Scripting] Kelvin: subscribed to beforeEvents.chatSend");
  } else {
    console.warn("[Scripting] Kelvin: chatSend not available in this API build");
  }
} catch (e) {
  console.error("[Scripting] Kelvin: error subscribing chat events:", e?.message ?? e);
}

// Ein einfacher Tick, um zu prüfen, dass system läuft
system.runTimeout(() => {
  console.info("[Scripting] Kelvin: system.runTimeout tick OK");
}, 1);



// Subscribe to chat events.  Prefer the modern `beforeEvents.chatSend` event,
// but fall back to legacy `events.beforeChat` if running on an older API
// version.  The optional chaining guards ensure that the add‑on remains
// backwards compatible.
const chatBeforeEvent =
  world.beforeEvents?.chatSend ?? world.events?.beforeChat;
const chatAfterEvent = world.afterEvents?.chatSend;

if (chatBeforeEvent) {
  chatBeforeEvent.subscribe((event) => {
    const message = event.message?.trim();
    if (!message || !message.toLowerCase().startsWith("/kelvin")) {
      return;
    }
    // Cancel the event so that the command is not echoed in chat
    event.cancel = true;
    const sender = event.sender;
    const parts = message.split(/\s+/);
    const action = parts[1] ?? "";
    handleKelvinCommand(sender, action.toLowerCase(), parts.slice(2));
  });
} else if (chatAfterEvent) {
  // Legacy fallback: commands will still be visible in chat
  console.warn(
    "Kelvin Behaviour Pack: Falling back to after chat event; commands will be visible in chat."
  );
  chatAfterEvent.subscribe((event) => {
    const message = event.message?.trim();
    if (!message || !message.toLowerCase().startsWith("/kelvin")) {
      return;
    }
    const sender = event.sender;
    const parts = message.split(/\s+/);
    const action = parts[1] ?? "";
    handleKelvinCommand(sender, action.toLowerCase(), parts.slice(2));
  });
} else {
  console.warn(
    "Kelvin Behaviour Pack: Unable to subscribe to chat event; commands disabled."
  );
}

// Main update loop.  Runs every 5 ticks (approx 250 ms) and invokes the
// appropriate behaviour based on the current mode.  If Kelvin is not present
// or invalid, the tick is aborted early.
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