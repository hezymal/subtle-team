import { InlineKeyboardMarkup, User } from "telegraf/types";

import { QueryData, packQueryData } from "../../../models/queryData";
import { MessageDescription } from "../../../models/message";
import { Poker, StoryPoint, getStoryPointLabel } from "../../../models/poker";
import { getPokerTitle } from "./title";
import { getUserName } from "./user";

const buildText = (currentUser: User, poker: Poker): string => {
    const title = getPokerTitle(poker.pokerName);

    if (poker.usersVotes.length === 0) {
        return title;
    }

    const votes = poker.usersVotes.map((userVote) => {
        if (userVote.user.id === currentUser.id) {
            return `💙 - <strong>${getUserName(userVote.user)}</strong>`;
        }

        return `💘 - ${getUserName(userVote.user)}`;
    });
    const total = `Всего голосов: ${poker.usersVotes.length}`;

    return `${title}\n\n${votes.join("\n")}\n\n${total}`;
};

const buildKeyboardMarkup = (): InlineKeyboardMarkup => {
    const storyPoints = Object.values(StoryPoint);
    const amountInRow = Math.ceil(storyPoints.length / 2);

    return {
        inline_keyboard: [
            storyPoints.slice(0, amountInRow).map((storyPoint) => ({
                text: getStoryPointLabel(storyPoint),
                callback_data: packQueryData({
                    type: QueryData.Type.vote,
                    payload: storyPoint,
                }),
            })),
            storyPoints.slice(amountInRow).map((storyPoint) => ({
                text: getStoryPointLabel(storyPoint),
                callback_data: packQueryData({
                    type: QueryData.Type.vote,
                    payload: storyPoint,
                }),
            })),
            [
                {
                    text: "Завершить",
                    callback_data: packQueryData({
                        type: QueryData.Type.close,
                    }),
                },
            ],
        ],
    };
};

export const buildVoteMessageDescription = (
    currentUser: User,
    poker: Poker
): MessageDescription => {
    return {
        text: buildText(currentUser, poker),
        extra: {
            parse_mode: "HTML",
            reply_markup: buildKeyboardMarkup(),
        },
    };
};
