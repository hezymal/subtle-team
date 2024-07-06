import { describe, expect, test } from "@jest/globals";
import { User } from "telegraf/types";

import { getNearestStoryPoint, buildText } from "./close";
import { Poker, PokerState, StoryPoint } from "../../../models/poker";

describe("getNearestStoryPoint()", () => {
    test("should return nearest points", () => {
        expect(getNearestStoryPoint(0.74)).toBe(StoryPoint.ST05);
        expect(getNearestStoryPoint(0.76)).toBe(StoryPoint.ST1);
    });

    test("should return biggest point if difference between average value and nearest points is equal", () => {
        expect(getNearestStoryPoint(0.75)).toBe(StoryPoint.ST1);
    });

    test("should return 0.5 points if average value less than 0.5", () => {
        expect(getNearestStoryPoint(0.4)).toBe(StoryPoint.ST05);
    });
});

describe("buildText()", () => {
    test("should build text", () => {
        const currentUser: User = {
            id: 1,
            first_name: "Текущий пользователь",
            is_bot: false,
        };

        const poker: Poker = {
            pokerName: "STGFRONT-0001",
            state: PokerState.open,
            usersVotes: [
                {
                    storyPoint: StoryPoint.ST05,
                    user: {
                        id: 2,
                        first_name: "Пользователь #1",
                        is_bot: false,
                    },
                },
                {
                    storyPoint: StoryPoint.ST1,
                    user: currentUser,
                },
                {
                    storyPoint: StoryPoint.ST2,
                    user: {
                        id: 3,
                        first_name: "Пользователь #2",
                        is_bot: false,
                    },
                },
            ],
            author: currentUser,
            created: "2024-07-06",
        };

        const expectedText =
            "<strong>Покер: STGFRONT-0001</strong>\n\n0.5 - Пользователь #1\n1 - Текущий пользователь\n2 - Пользователь #2\n\nВсего голосов: 3\nВ среднем: <strong>1.17</strong>\nБлижайшее: <strong>1</strong>";

        expect(buildText(poker)).toBe(expectedText);
    });
});
