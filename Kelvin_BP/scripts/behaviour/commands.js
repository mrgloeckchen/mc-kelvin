import { world } from "@minecraft/server";
import {
  getKelvinEntity,
  setKelvinEntity,
  getOwnerPlayer,
  isOwner,
  setMode,
  sendKelvinMessage,
  ensureKelvinValid,
  getForwardPosition
} from "./utils.js";
import { prepareBuildTask } from "./build_hut.js";

export function handleKelvinCommand(player, action, args) {
  if (!player) {
    world.sendMessage("Kelvin: Dieser Befehl muss von einem Spieler ausgeführt werden.");
    return;
  }

  if (action === "") {
    player.sendMessage("Kelvin: Verfügbare Aktionen: summon, follow, stay, chop, gather, build hut");
    return;
  }

  switch (action) {
    case "summon":
      handleSummon(player);
      break;
    case "follow":
      withKelvin(player, () => {
        setMode("follow");
        sendKelvinMessage("Ich folge dir.");
      });
      break;
    case "stay":
      withKelvin(player, (kelvin) => {
        setMode("stay", { location: { ...kelvin.location } });
        sendKelvinMessage("Ich bleibe hier.");
      });
      break;
    case "chop":
      withKelvin(player, () => {
        setMode("chop", { target: null });
        sendKelvinMessage("Finde Baum...");
      });
      break;
    case "gather":
      withKelvin(player, () => {
        setMode("gather");
        sendKelvinMessage("Sammle Items in der Umgebung.");
      });
      break;
    case "build":
      if ((args?.[0] ?? "").toLowerCase() === "hut") {
        withKelvin(player, () => {
          const task = prepareBuildTask(player);
          setMode("build_hut", task);
          sendKelvinMessage("Baue eine Hütte.");
        });
      } else {
        player.sendMessage("Kelvin: Unbekannter Build-Befehl. Nutze /kelvin build hut");
      }
      break;
    default:
      player.sendMessage("Kelvin: Unbekannte Aktion.");
      break;
  }
}

function handleSummon(player) {
  const dimension = player.dimension;
  let kelvin = getKelvinEntity();
  if (kelvin && !isOwner(player)) {
    player.sendMessage("Kelvin: Ich habe bereits einen Besitzer.");
    return;
  }

  const spawnPos = getForwardPosition(player, 2);
  if (!kelvin) {
    kelvin = dimension.spawnEntity("kelvin:kelvin", spawnPos);
  } else {
    kelvin.teleport(spawnPos, { keepVelocity: false, facingLocation: player.location });
  }

  setKelvinEntity(kelvin, player);
  sendKelvinMessage("Bereit für Aufträge.");
}

function withKelvin(player, callback) {
  if (!isOwner(player)) {
    const owner = getOwnerPlayer();
    if (owner && owner.id !== player.id) {
      player.sendMessage("Kelvin: Nur mein Besitzer kann mir Befehle geben.");
      return;
    }
  }

  if (!ensureKelvinValid()) {
    player.sendMessage("Kelvin: Ich bin derzeit nicht in der Welt. Nutze /kelvin summon.");
    return;
  }

  callback(getKelvinEntity());
}
