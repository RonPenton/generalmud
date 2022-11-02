import { installCommand } from "./base";

installCommand({
    type: 'look',
    keywords: ["look"],
    helptext: "Looks at your surroundings. Look at an exit, item, or person for more details.",
    executeMessage: ({ packet, player, world }) => {
        world.look(player, packet.message);
    }
});
