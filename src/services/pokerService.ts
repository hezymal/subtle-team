import { User } from "telegraf/types";
import { redisService } from "./redisService";
import { StoryPoint } from "../models/poker";

export interface PokerUserVote {
    user: User;
    storyPoint: StoryPoint;
}

export interface Poker {
    pokerName: string;
    usersVotes: PokerUserVote[];
}

export const getStoryPointLabel = (storyPoint: StoryPoint): string => {
    switch (storyPoint) {
        // case StoryPoint.ST05:
        //     return "0.5 😹";

        // case StoryPoint.ST1:
        //     return "1 😸";

        // case StoryPoint.ST2:
        //     return "2 😽";

        // case StoryPoint.ST3:
        //     return "3 😻";

        // case StoryPoint.ST5:
        //     return "5 😼";

        // case StoryPoint.ST8:
        //     return "8 😿";

        // case StoryPoint.ST13:
        //     return "13 🙀";

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

        case StoryPoint.ST40:
            return 13;

        case StoryPoint.unknown:
            return 0;
    }
};

const buildStorageKey = (chatId: number, messageId: number): string => {
    return `poker:${chatId}:${messageId}`;
};

class PokerService {
    constructor() {
        this.open = this.open.bind(this);
        this.restart = this.restart.bind(this);
        this.close = this.close.bind(this);
        this.setUserVote = this.setUserVote.bind(this);
        this.loadFromStorage = this.loadFromStorage.bind(this);
        this.saveToStorage = this.saveToStorage.bind(this);
        this.removeFromStorage = this.removeFromStorage.bind(this);
        this.getPokerTitle = this.getPokerTitle.bind(this);
        this.getOpenedPokerText = this.getOpenedPokerText.bind(this);
        this.getClosedPokerText = this.getClosedPokerText.bind(this);
    }

    public open(
        chatId: number,
        messageId: number,
        pokerName: string
    ): Promise<void> {
        const poker: Poker = {
            pokerName,
            usersVotes: [],
        };
        return this.saveToStorage(chatId, messageId, poker);
    }

    public async restart(chatId: number, messageId: number): Promise<void> {
        const poker = await this.loadFromStorage(chatId, messageId);
        poker.usersVotes = [];
        await this.saveToStorage(chatId, messageId, poker);
    }

    public close(chatId: number, messageId: number): Promise<void> {
        return this.removeFromStorage(chatId, messageId);
    }

    public async setUserVote(
        chatId: number,
        messageId: number,
        userVote: PokerUserVote
    ): Promise<boolean> {
        const poker = await this.loadFromStorage(chatId, messageId);
        const existsUserVote = poker.usersVotes.find(
            (v) => v.user.id === userVote.user.id
        );
        if (existsUserVote) {
            if (existsUserVote.storyPoint === userVote.storyPoint) {
                return false;
            }

            existsUserVote.storyPoint = userVote.storyPoint;
        } else {
            poker.usersVotes.push(userVote);
        }

        await this.saveToStorage(chatId, messageId, poker);
        return true;
    }

    public getPokerTitle(pokerName: string): string {
        return `<strong>Покер планирование: ${pokerName}</strong>`;
    }

    public async getOpenedPokerText(
        chatId: number,
        messageId: number
    ): Promise<string> {
        const poker = await this.loadFromStorage(chatId, messageId);

        const title = this.getPokerTitle(poker.pokerName);
        const votes = poker.usersVotes
            .map((v) => `${v.user.username}: 🃏`)
            .join("\n");
        const counter = `Всего голосов: ${poker.usersVotes.length}`;

        return `${title}\n\n${votes}\n\n${counter}`;
    }

    public async getClosedPokerText(
        chatId: number,
        messageId: number
    ): Promise<string> {
        const poker = await this.loadFromStorage(chatId, messageId);

        const votes: string[] = [];
        let pointsSum: number = 0;
        for (const userVote of poker.usersVotes) {
            const username = userVote.user.username;
            const point = getStoryPointLabel(userVote.storyPoint);
            votes.push(`${username}: ${point}`);
            pointsSum += getStoryPointValue(userVote.storyPoint);
        }

        const title = this.getPokerTitle(poker.pokerName);
        const counter = `Всего голосов: ${poker.usersVotes.length}`;
        const pointsMedium = pointsSum / poker.usersVotes.length;
        const medium = `В среднем: <strong>${pointsMedium.toFixed(2)}</strong>`;

        return `${title}\n\n${votes.join("\n")}\n\n${counter}\n${medium}`;
    }

    private async loadFromStorage(
        chatId: number,
        messageId: number
    ): Promise<Poker> {
        const key = buildStorageKey(chatId, messageId);
        const poker = await redisService.get<Poker>(key);
        if (!poker) {
            throw new Error(`Value with key: "${key}" not found in storage`);
        }

        return poker;
    }

    private saveToStorage(
        chatId: number,
        messageId: number,
        poker: Poker
    ): Promise<void> {
        const key = buildStorageKey(chatId, messageId);
        return redisService.set(key, poker);
    }

    private removeFromStorage(
        chatId: number,
        messageId: number
    ): Promise<void> {
        const key = buildStorageKey(chatId, messageId);
        return redisService.delete(key);
    }
}

export const pokerService = new PokerService();
