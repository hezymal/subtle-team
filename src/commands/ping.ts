import { CommandHandlerContext } from "../types";

export const handlePingCommand = (context: CommandHandlerContext) => {
    return context.telegram.sendMessage(context.message.chat.id, `pong`);
};
