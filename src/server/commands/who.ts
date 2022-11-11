import { getPlayerReference } from "../models/actor";
import { installCommand } from "./base";

installCommand({
    type: "generic",
    keywords: ["who"],
    helptext: "Gives you a list of everyone who is currently logged into the realm.",
    executeText: ({ player, world }) => {
        const players = world.getActivePlayers();
        world.sendToPlayer(player, 'active-players', { list: Array.from(players).map(getPlayerReference) });
    }
});