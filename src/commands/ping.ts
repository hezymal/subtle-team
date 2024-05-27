import { CommandHandlerContext } from "../types";

export const handlePingCommand = (context: CommandHandlerContext) => {
    // context.from.username

    return context.telegram.sendMessage(context.message.chat.id, `pong`);
};
