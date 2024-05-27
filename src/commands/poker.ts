import { InlineKeyboardMarkup } from "telegraf/types";

import {
    StoryPoint,
    getStoryPointLabel,
    getStoryPointValue,
} from "../models/poker";
import {
    CallbackDataType,
    VoteCallbackData,
    mapCallbackDataToString,
} from "../models/callbackData";
import { Poker, PokerUserVote, pokerService } from "../services/pokerService";
import { CommandCallbackQueryContext, CommandHandlerContext } from "../types";

const getPokerTitle = (pokerName: string): string => {
    return `<strong>Покер планирование: ${pokerName}</strong>`;
};

const getNewPokerText = (pokerName: string): string => {
    const title = getPokerTitle(pokerName);
    return title;
};

const getVotedPokerText = (poker: Poker): string => {
    const title = getPokerTitle(poker.pokerName);
    const votes = poker.usersVotes
        .map((v) => `${v.user.username}: 🃏`)
        .join("\n");
    const counter = `Всего голосов: ${poker.usersVotes.length}`;
    return `${title}\n\n${votes}\n\n${counter}`;
};

const getPokerResultText = (poker: Poker): string => {
    const votes: string[] = [];
    let pointsSum: number = 0;
    for (const userVote of poker.usersVotes) {
        const username = userVote.user.username;
        const point = getStoryPointLabel(userVote.storyPoint);
        votes.push(`${username}: ${point}`);
        pointsSum += getStoryPointValue(userVote.storyPoint);
    }

    const title = getPokerTitle(poker.pokerName);
    const counter = `Всего голосов: ${poker.usersVotes.length}`;
    const pointsMedium = pointsSum / poker.usersVotes.length;
    const medium = `В среднем: <strong>${pointsMedium.toFixed(2)}</strong>`;

    return `${title}\n\n${votes.join("\n")}\n\n${counter}\n${medium}`;
};

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
    const messageText = getNewPokerText(pokerName);
    const message = await context.telegram.sendMessage(chatId, messageText, {
        parse_mode: "HTML",
        reply_markup: buildInlineKeyboardMarkup(),
    });

    const messageId = message.message_id;
    await pokerService.create(chatId, messageId, pokerName);
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

    const poker = await pokerService.get(chatId, messageId);
    const messageText = getVotedPokerText(poker);
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

    const poker = await pokerService.get(chatId, messageId);
    const messageText = getNewPokerText(poker.pokerName);
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

    const poker = await pokerService.get(chatId, messageId);
    const messageText = getPokerResultText(poker);
    await context.editMessageText(messageText, {
        parse_mode: "HTML",
    });

    await pokerService.close(chatId, messageId);
};
