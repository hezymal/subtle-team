import { User } from "telegraf/types";

export enum StoryPoint {
    ST05 = "ST05",
    ST1 = "ST1",
    ST2 = "ST2",
    ST3 = "ST3",
    ST5 = "ST5",
    ST8 = "ST8",
    ST13 = "ST13",
    ST20 = "ST20",
    ST40 = "ST40",
    unknown = "unknown",
}

export enum PokerState {
    open = "open",
    closed = "closed",
}

export interface PokerUserVote {
    user: User;
    storyPoint: StoryPoint;
}

export interface Poker {
    pokerName: string;
    state: PokerState;
    usersVotes: PokerUserVote[];
    created: string;
}

export const getStoryPointTitle = (storyPoint: StoryPoint): string => {
    switch (storyPoint) {
        case StoryPoint.ST05:
            return "0.5";

        case StoryPoint.ST1:
            return "1";

        case StoryPoint.ST2:
            return "2";

        case StoryPoint.ST3:
            return "3";

        case StoryPoint.ST5:
            return "5";

        case StoryPoint.ST8:
            return "8";

        case StoryPoint.ST13:
            return "13";

        case StoryPoint.ST20:
            return "20";

        case StoryPoint.ST40:
            return "40";

        case StoryPoint.unknown:
            return "?";
    }
};

export const getStoryPointValue = (storyPoint: StoryPoint): number => {
    switch (storyPoint) {
        case StoryPoint.ST05:
            return 0.5;

        case StoryPoint.ST1:
            return 1;

        case StoryPoint.ST2:
            return 2;

        case StoryPoint.ST3:
            return 3;

        case StoryPoint.ST5:
            return 5;

        case StoryPoint.ST8:
            return 8;

        case StoryPoint.ST13:
            return 13;

        case StoryPoint.ST20:
            return 20;

        case StoryPoint.ST40:
            return 40;

        case StoryPoint.unknown:
            return 0;
    }
};
