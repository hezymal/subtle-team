import { buildCloseMessageDescription } from "../messages/poker/close";
import { buildNewMessageDescription } from "../messages/poker/new";
import { buildVoteMessageDescription } from "../messages/poker/vote";
import { QueryData } from "../../models/queryData";
import { pokerService } from "../../services/pokerService";
import { CommandCallbackQueryContext } from "../../types";

export const handleVoteQuery = async (
    context: CommandCallbackQueryContext,
    data: QueryData.Vote
): Promise<void> => {
    if (!context.chat || !context.msgId) {
        return;
    }

    const chatId = context.chat.id;
    const messageId = context.msgId;
    const currentUser = context.from;

    const isPokerExists = await pokerService.exists(chatId, messageId);
    if (!isPokerExists) {
        return;
    }

    const voteResult = await pokerService.vote(
        chatId,
        messageId,
        currentUser,
        data.payload
    );
    if (!voteResult) {
        return;
    }

    const poker = await pokerService.get(chatId, messageId);
    const messageDescription = buildVoteMessageDescription(poker);
    await context.editMessageText(
        messageDescription.text,
        messageDescription.extra
    );
};

export const handleCloseQuery = async (
    context: CommandCallbackQueryContext
): Promise<void> => {
    if (!context.chat || !context.msgId) {
        return;
    }

    const chatId = context.chat.id;
    const messageId = context.msgId;
    const currentUser = context.from;

    const isPokerExists = await pokerService.exists(chatId, messageId);
    if (!isPokerExists) {
        return;
    }

    const poker = await pokerService.get(chatId, messageId);
    if (poker.author.id !== currentUser.id) {
        return;
    }

    const messageDescription = buildCloseMessageDescription(poker);
    await context.editMessageText(
        messageDescription.text,
        messageDescription.extra
    );
    await pokerService.close(chatId, messageId);
};

export const handleRestartQuery = async (
    context: CommandCallbackQueryContext
): Promise<void> => {
    if (!context.chat || !context.msgId) {
        return;
    }

    const chatId = context.chat.id;
    const messageId = context.msgId;
    const currentUser = context.from;

    const isPokerExists = await pokerService.exists(chatId, messageId);
    if (!isPokerExists) {
        return;
    }

    const poker = await pokerService.get(chatId, messageId);
    const newMessageDescription = buildNewMessageDescription(poker.pokerName);
    const newMessage = await context.sendMessage(
        newMessageDescription.text,
        newMessageDescription.extra
    );

    await pokerService.create(
        chatId,
        currentUser,
        newMessage.message_id,
        poker.pokerName
    );
};
