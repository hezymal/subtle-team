import { InlineKeyboardMarkup, User } from "telegraf/types";

import { QueryData, packQueryData } from "../../../models/queryData";
import { MessageDescription } from "../../../models/message";
import { Poker, StoryPoint, getStoryPointTitle } from "../../../models/poker";
import { getPokerTitle } from "./common/poker";
import { getUserName } from "./common/user";

const buildText = (poker: Poker): string => {
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

const buildKeyboardMarkup = (): InlineKeyboardMarkup => {
    const storyPoints = Object.values(StoryPoint);
    const amountInRow = Math.ceil(storyPoints.length / 2);

    return {
        inline_keyboard: [
            storyPoints.slice(0, amountInRow).map((storyPoint) => ({
                text: getStoryPointTitle(storyPoint),
                callback_data: packQueryData({
                    type: QueryData.Type.vote,
                    payload: storyPoint,
                }),
            })),
            storyPoints.slice(amountInRow).map((storyPoint) => ({
                text: getStoryPointTitle(storyPoint),
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
    poker: Poker
): MessageDescription => {
    return {
        text: buildText(poker),
        extra: {
            parse_mode: "HTML",
            reply_markup: buildKeyboardMarkup(),
        },
    };
};
