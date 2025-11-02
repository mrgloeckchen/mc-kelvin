# Kelvin Bedrock NPC Add-on

Dieses Projekt liefert zwei serverfertige Minecraft Bedrock Packs, die einen NPC namens **Kelvin** hinzufügen. Kelvin verhält sich ähnlich wie sein Pendant aus *Sons of the Forest* und reagiert auf Chatbefehle des Besitzers, um zu folgen, stehenzubleiben, Holz zu fällen, Items zu sammeln oder eine kleine Hütte zu bauen.

## Inhalt

- `Kelvin_BP` – Behavior Pack mit KI-Logik, Chatsteuerung und Script-API-Einsatz
- `Kelvin_RP` – Resource Pack mit Modelldaten, Rendercontroller, Übersetzung und Textur-Referenzen (die eigentliche Skin-Datei musst du ergänzen)

Beide Packs nutzen die aktuelle Script API (`@minecraft/server`) und setzen aktivierte Experimente (Holiday Creator Features, Beta APIs, GameTest Framework) voraus.

## Installation auf dem Bedrock Dedicated Server (BDS)

1. **Packs kopieren** – Verschiebe `Kelvin_BP` in den Ordner `behavior_packs/` und `Kelvin_RP` in den Ordner `resource_packs/` deiner BDS-Installation.
2. **Welt verknüpfen** – Ergänze `world_behavior_packs.json` und `world_resource_packs.json` der gewünschten Welt jeweils um einen Eintrag mit der passenden `pack_id` (siehe `manifest.json`) und `version: [1, 0, 0]`.
3. **Experimente aktivieren** – Stelle sicher, dass in `level.dat` der Welt die Features *Holiday Creator Features*, *Beta APIs* sowie das *GameTest Framework* aktiviert sind.
4. **Cheats erlauben** – Setze in `server.properties` die Option `allow-cheats=true`, damit Chatbefehle akzeptiert werden.
5. **Server neu starten** – Starte den Dedicated Server neu, damit die neuen Packs geladen werden.
6. **Kelvin prüfen** – Verbinde dich mit der Welt und teste `/summon kelvin:kelvin` oder `/kelvin summon`, um Kelvin zu spawnen.

## Skin hinzufügen

Dem Resource Pack liegt keine Standard-Textur bei. Lege vor dem Serverstart deine gewünschte 64×64-Skin-Datei als `Kelvin_RP/textures/entity/kelvin_placeholder.png` ab. Die vorhandenen Referenzen (`texture.kelvin_placeholder`) greifen automatisch auf diese Datei zu – nur der Dateiname muss exakt passen.

## Befehle

- `/kelvin summon` – Spawnt Kelvin und setzt den ausführenden Spieler als Besitzer
- `/kelvin follow` – Kelvin folgt dem Besitzer in kurzem Abstand
- `/kelvin stay` – Kelvin verharrt an seiner aktuellen Position
- `/kelvin chop` – Kelvin sucht einen nahegelegenen Baum, fällt ihn und sammelt das Holz
- `/kelvin gather` – Kelvin sammelt herumliegende Items ein und bringt sie zum Besitzer
- `/kelvin build hut` – Kelvin baut vor dem Spieler eine 5×5-Holzhütte mit Türöffnung und Slab-Dach

## Troubleshooting

- **Kelvin erscheint nicht** – Prüfe, ob die Experimente aktiviert sind und die Packs in `world_behavior_packs.json` bzw. `world_resource_packs.json` eingetragen wurden.
- **UUID-Konflikt** – Vergewissere dich, dass keine anderen Packs dieselben UUIDs verwenden und dass die Einträge exakt mit den `manifest.json` Dateien übereinstimmen.
- **Befehle funktionieren nicht** – Kontrolliere, ob Cheats auf dem Server aktiviert sind und ob du der Besitzer des aktuellen Kelvin bist.
- **Fehlende Textur** – Stelle sicher, dass sich eine gültige `kelvin_placeholder.png` im Ordner `Kelvin_RP/textures/entity/` befindet, bevor du den Server startest.
