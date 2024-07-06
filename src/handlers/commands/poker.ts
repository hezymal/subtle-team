import { buildNewMessageDescription } from "../messages/poker/new";
import { pokerService } from "../../services/pokerService";
import { CommandHandlerContext } from "../../types";

export const handlePokerCommand = async (
    context: CommandHandlerContext
): Promise<void> => {
    const chatId = context.message.chat.id;
    const pokerName = context.args.length > 0 ? context.args.join(" ") : "";
    const messageDescription = buildNewMessageDescription(pokerName);
    const message = await context.telegram.sendMessage(
        chatId,
        messageDescription.text,
        messageDescription.extra
    );

    const sentMessageId = message.message_id;
    await pokerService.create(chatId, sentMessageId, pokerName);
};
