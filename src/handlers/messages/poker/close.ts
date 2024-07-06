import { InlineKeyboardMarkup } from "telegraf/types";

import { MessageDescription } from "../../../models/message";
import {
    getStoryPointLabel,
    getStoryPointValue,
    Poker,
    StoryPoint,
} from "../../../models/poker";
import { getPokerTitle } from "./title";
import { getUserName } from "./user";
import { QueryData, packQueryData } from "../../../models/queryData";

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

const buildText = (poker: Poker): string => {
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
