import { CommandHandlerContext } from "../types";

export const pingCommandHandler = (context: CommandHandlerContext) => {
    // context.from.username

    return context.telegram.sendMessage(context.message.chat.id, `pong`);
};
