import { InlineKeyboardMarkup, User } from "telegraf/types";

import {
    Poker,
    StoryPoint,
    getStoryPointLabel,
    getStoryPointValue,
} from "../models/poker";
import {
    CallbackDataType,
    VoteCallbackData,
    packCallbackData,
} from "../models/callbackData";
import { pokerService } from "../services/pokerService";
import { CommandCallbackQueryContext, CommandHandlerContext } from "../types";

const getUserName = (user: User): string => {
    const firstName = user.first_name;
    const lastName = user.last_name ?? "";
    const username = user.username ?? "";

    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    return username ? `${fullName} (${username})` : fullName;
};

const getPokerTitle = (pokerName: string): string => {
    return `<strong>Покер: ${pokerName}</strong>`;
};

const getNewPokerMessage = (pokerName: string): string => {
    const title = getPokerTitle(pokerName);
    return title;
};

const getVotedPokerMessage = (poker: Poker): string => {
    const title = getPokerTitle(poker.pokerName);

    if (poker.usersVotes.length === 0) {
        return title;
    }

    const votes = poker.usersVotes.map(
        (userVote) => `💘 - ${getUserName(userVote.user)}`
    );
    const total = `Всего голосов: ${poker.usersVotes.length}`;

    return `${title}\n\n${votes.join("\n")}\n\n${total}`;
};

const getNearestStoryPoint = (average: number): StoryPoint => {
    const points = Object.values(StoryPoint);
    const values = points.map(getStoryPointValue);
    let nearestIndex = 0;

    for (let index = 1; index < values.length; index++) {
        if (
            Math.abs(values[nearestIndex] - average) >
            Math.abs(values[index] - average)
        ) {
            nearestIndex = index;
        }
    }

    return points[nearestIndex];
};

const getClosedPokerMessage = (poker: Poker): string => {
    const title = getPokerTitle(poker.pokerName);

    if (poker.usersVotes.length === 0) {
        return `${title}\n\nОтменен!`;
    }

    const votes: string[] = [];
    let pointsSum = 0;
    let pointsCount = 0;

    const sortedUsersVotes = [...poker.usersVotes].sort((vote1, vote2) => {
        const value1 = getStoryPointValue(vote1.storyPoint);
        const value2 = getStoryPointValue(vote2.storyPoint);
        return value1 - value2;
    });

    for (const userVote of sortedUsersVotes) {
        const userName = getUserName(userVote.user);
        const pointLabel = getStoryPointLabel(userVote.storyPoint);
        const pointValue = getStoryPointValue(userVote.storyPoint);
        if (pointValue > 0) {
            pointsCount++;
        }

        votes.push(`${pointLabel} - ${userName}`);
        pointsSum += pointValue;
    }

    const pointsAverage = pointsCount > 0 ? pointsSum / pointsCount : 0;

    const total = `Всего голосов: ${poker.usersVotes.length}`;
    const medium = `В среднем: <strong>${pointsAverage.toFixed(2)}</strong>`;
    const nearest = `Ближайшее: <strong>${getStoryPointValue(
        getNearestStoryPoint(pointsAverage)
    )}</strong>`;

    return `${title}\n\n${votes.join("\n")}\n\n${total}\n${medium}\n${nearest}`;
};

const getOpenPokerKeyboardMarkup = (): InlineKeyboardMarkup => {
    const storyPoints = Object.values(StoryPoint);
    const amountInRow = Math.ceil(storyPoints.length / 2);

    return {
        inline_keyboard: [
            storyPoints.slice(0, amountInRow).map((storyPoint) => ({
                text: getStoryPointLabel(storyPoint),
                callback_data: packCallbackData({
                    type: CallbackDataType.vote,
                    payload: storyPoint,
                }),
            })),
            storyPoints.slice(amountInRow).map((storyPoint) => ({
                text: getStoryPointLabel(storyPoint),
                callback_data: packCallbackData({
                    type: CallbackDataType.vote,
                    payload: storyPoint,
                }),
            })),
            [
                {
                    text: "Завершить",
                    callback_data: packCallbackData({
                        type: CallbackDataType.close,
                    }),
                },
            ],
        ],
    };
};

const getClosedPokerKeyboardMarkup = (): InlineKeyboardMarkup => {
    return {
        inline_keyboard: [
            [
                {
                    text: "Повторить",
                    callback_data: packCallbackData({
                        type: CallbackDataType.repeat,
                    }),
                },
            ],
        ],
    };
};

export const handlePokerCommand = async (
    context: CommandHandlerContext
): Promise<void> => {
    const chatId = context.message.chat.id;
    const pokerName = context.args.length > 0 ? context.args.join(" ") : "";
    const messageText = getNewPokerMessage(pokerName);
    const message = await context.telegram.sendMessage(chatId, messageText, {
        parse_mode: "HTML",
        reply_markup: getOpenPokerKeyboardMarkup(),
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

    const isPokerExists = await pokerService.exists(chatId, messageId);
    if (!isPokerExists) {
        return;
    }

    const voteResult = await pokerService.vote(
        chatId,
        messageId,
        context.from,
        data.payload
    );
    if (!voteResult) {
        return;
    }

    const poker = await pokerService.get(chatId, messageId);
    const messageText = getVotedPokerMessage(poker);
    await context.editMessageText(messageText, {
        parse_mode: "HTML",
        reply_markup: getOpenPokerKeyboardMarkup(),
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

    const isPokerExists = await pokerService.exists(chatId, messageId);
    if (!isPokerExists) {
        return;
    }

    const poker = await pokerService.get(chatId, messageId);
    const messageText = getClosedPokerMessage(poker);
    await context.editMessageText(messageText, {
        parse_mode: "HTML",
        reply_markup: getClosedPokerKeyboardMarkup(),
    });

    await pokerService.close(chatId, messageId);
};

export const handleRestartCallbackQuery = async (
    context: CommandCallbackQueryContext
): Promise<void> => {
    if (!context.chat || !context.msgId) {
        return;
    }

    const chatId = context.chat.id;
    const messageId = context.msgId;

    const isPokerExists = await pokerService.exists(chatId, messageId);
    if (!isPokerExists) {
        return;
    }

    const poker = await pokerService.get(chatId, messageId);
    const newMessageText = getNewPokerMessage(poker.pokerName);
    const newMessage = await context.telegram.sendMessage(
        chatId,
        newMessageText,
        {
            parse_mode: "HTML",
            reply_markup: getOpenPokerKeyboardMarkup(),
        }
    );

    const newMessageId = newMessage.message_id;
    await pokerService.create(chatId, newMessageId, poker.pokerName);
};
