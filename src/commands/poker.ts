import { InlineKeyboardMarkup } from "telegraf/types";

import { StoryPoint, getStoryPointLabel } from "../models/poker";
import {
    CallbackDataType,
    VoteCallbackData,
    mapCallbackDataToString,
} from "../models/callbackData";
import { PokerUserVote, pokerService } from "../services/pokerService";
import { CommandCallbackQueryContext, CommandHandlerContext } from "../types";

const buildInlineKeyboardMarkup = (): InlineKeyboardMarkup => {
    const storyPoints = Object.values(StoryPoint);
    const storyPointsAmountInRow = Math.ceil(storyPoints.length / 2);

    return {
        inline_keyboard: [
            storyPoints.slice(0, storyPointsAmountInRow).map((storyPoint) => ({
                text: getStoryPointLabel(storyPoint),
                callback_data: mapCallbackDataToString({
                    type: CallbackDataType.vote,
                    payload: storyPoint,
                }),
            })),
            storyPoints.slice(storyPointsAmountInRow).map((storyPoint) => ({
                text: getStoryPointLabel(storyPoint),
                callback_data: mapCallbackDataToString({
                    type: CallbackDataType.vote,
                    payload: storyPoint,
                }),
            })),
            [
                {
                    text: "Перезапустить",
                    callback_data: mapCallbackDataToString({
                        type: CallbackDataType.restart,
                    }),
                },
                {
                    text: "Завершить",
                    callback_data: mapCallbackDataToString({
                        type: CallbackDataType.close,
                    }),
                },
            ],
        ],
    };
};

export const handlePokerCommand = async (context: CommandHandlerContext) => {
    const chatId = context.message.chat.id;
    const pokerName = context.args[0] || "";
    const messageText = pokerService.getPokerTitle(pokerName);
    const message = await context.telegram.sendMessage(chatId, messageText, {
        parse_mode: "HTML",
        reply_markup: buildInlineKeyboardMarkup(),
    });

    const messageId = message.message_id;
    await pokerService.open(chatId, messageId, pokerName);
};

export const handleVoteCallbackQuery = async (
    context: CommandCallbackQueryContext,
    data: VoteCallbackData
): Promise<void> => {
    if (!context.chat || !context.msgId) {
        return;
    }

    const chatId = context.chat.id;
    const messageId = context.msgId;

    if (!(await pokerService.exists(chatId, messageId))) {
        return;
    }

    const userVote: PokerUserVote = {
        user: context.from,
        storyPoint: data.payload,
    };
    await pokerService.setUserVote(chatId, messageId, userVote);

    const messageText = await pokerService.getOpenedPokerText(
        chatId,
        messageId
    );
    await context.editMessageText(messageText, {
        parse_mode: "HTML",
        reply_markup: buildInlineKeyboardMarkup(),
    });
};

export const handleRestartCallbackQuery = async (
    context: CommandCallbackQueryContext
): Promise<void> => {
    if (!context.chat || !context.msgId) {
        return;
    }

    const chatId = context.chat.id;
    const messageId = context.msgId;

    if (!(await pokerService.exists(chatId, messageId))) {
        return;
    }

    await pokerService.restart(chatId, messageId);

    const messageText = await pokerService.getOpenedPokerText(
        chatId,
        messageId
    );
    await context.editMessageText(messageText, {
        parse_mode: "HTML",
        reply_markup: buildInlineKeyboardMarkup(),
    });
};

export const handleCloseCallbackQuery = async (
    context: CommandCallbackQueryContext
): Promise<void> => {
    if (!context.chat || !context.msgId) {
        return;
    }

    const chatId = context.chat.id;
    const messageId = context.msgId;

    if (!(await pokerService.exists(chatId, messageId))) {
        return;
    }

    const messageText = await pokerService.getClosedPokerText(
        chatId,
        messageId
    );
    await context.editMessageText(messageText, {
        parse_mode: "HTML",
    });

    await pokerService.close(chatId, messageId);
};
