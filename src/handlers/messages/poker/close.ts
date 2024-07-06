import { InlineKeyboardMarkup, User } from "telegraf/types";

import { MessageDescription } from "../../../models/message";
import {
    getStoryPointTitle,
    getStoryPointValue,
    Poker,
    PokerUserVote,
    StoryPoint,
} from "../../../models/poker";
import { getPokerTitle } from "./common/poker";
import { getUserName } from "./common/user";
import { QueryData, packQueryData } from "../../../models/queryData";

export const getNearestStoryPoint = (average: number): StoryPoint => {
    const points = Object.values(StoryPoint).filter(
        (p) => p !== StoryPoint.unknown
    );
    const values = points.map(getStoryPointValue);

    let nearestIndex = 0;
    for (let index = 1; index < values.length; index++) {
        if (
            Math.abs(values[nearestIndex] - average) >=
            Math.abs(values[index] - average)
        ) {
            nearestIndex = index;
        }
    }

    return points[nearestIndex];
};

const sortUsersVotes = (usersVotes: PokerUserVote[]): PokerUserVote[] => {
    return [...usersVotes].sort((vote1, vote2) => {
        const value1 = getStoryPointValue(vote1.storyPoint);
        const value2 = getStoryPointValue(vote2.storyPoint);
        return value1 - value2;
    });
};

const buildCancelledText = (poker: Poker): string => {
    return `
${getPokerTitle(poker.pokerName)}

Отменен!
    `.trim();
};

export const buildText = (poker: Poker): string => {
    if (poker.usersVotes.length === 0) {
        return buildCancelledText(poker);
    }

    const votes: string[] = [];
    let totalValue = 0;
    let significantValues = 0;

    for (const userVote of sortUsersVotes(poker.usersVotes)) {
        const user = userVote.user;
        const userName = getUserName(user);
        const point = userVote.storyPoint;
        const pointTitle = getStoryPointTitle(point);
        const pointValue = getStoryPointValue(point);

        if (point !== StoryPoint.unknown) {
            totalValue += pointValue;
            significantValues++;
        }

        votes.push(`${pointTitle} - ${userName}`);
    }

    const title = getPokerTitle(poker.pokerName);
    const totalVotes = poker.usersVotes.length;
    const averageValue = significantValues && totalValue / significantValues;
    const nearestValue = getStoryPointValue(getNearestStoryPoint(averageValue));

    return `
${title}

${votes.join("\n")}

Всего голосов: ${totalVotes}
В среднем: <strong>${averageValue.toFixed(2)}</strong>
Ближайшее: <strong>${nearestValue}</strong>
    `.trim();
};

const buildKeyboardMarkup = (): InlineKeyboardMarkup => {
    return {
        inline_keyboard: [
            [
                {
                    text: "Повторить",
                    callback_data: packQueryData({
                        type: QueryData.Type.repeat,
                    }),
                },
            ],
        ],
    };
};

export const buildCloseMessageDescription = (
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
