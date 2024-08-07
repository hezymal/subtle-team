import { buildNewMessageDescription } from "../messages/poker/new";
import { pokerService } from "../../services/pokerService";
import { CommandHandlerContext } from "../../types";

export const handlePokerCommand = async (
    context: CommandHandlerContext
): Promise<void> => {
    const chatId = context.message.chat.id;
    const currentUser = context.from;

    const pokerName = context.args.length > 0 ? context.args.join(" ") : "";
    const messageDescription = buildNewMessageDescription(pokerName);
    const message = await context.sendMessage(
        messageDescription.text,
        messageDescription.extra
    );

    const messageId = message.message_id;
    await pokerService.create(chatId, currentUser, messageId, pokerName);
};
