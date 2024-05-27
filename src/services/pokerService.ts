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

const buildStorageKey = (chatId: number, messageId: number): string => {
    return `poker:${chatId}:${messageId}`;
};

class PokerService {
    constructor() {
        this.create = this.create.bind(this);
        this.restart = this.restart.bind(this);
        this.exists = this.exists.bind(this);
        this.close = this.close.bind(this);
        this.get = this.get.bind(this);
        this.setUserVote = this.setUserVote.bind(this);
        this.getFromStorage = this.getFromStorage.bind(this);
        this.existsInStorage = this.existsInStorage.bind(this);
        this.setInStorage = this.setInStorage.bind(this);
        this.removeFromStorage = this.removeFromStorage.bind(this);
    }

    public create(
        chatId: number,
        messageId: number,
        pokerName: string
    ): Promise<void> {
        const poker: Poker = {
            pokerName,
            usersVotes: [],
        };

        return this.setInStorage(chatId, messageId, poker);
    }

    public get(chatId: number, messageId: number): Promise<Poker> {
        return this.getFromStorage(chatId, messageId);
    }

    public exists(chatId: number, messageId: number): Promise<boolean> {
        return this.existsInStorage(chatId, messageId);
    }

    public async setUserVote(
        chatId: number,
        messageId: number,
        userVote: PokerUserVote
    ): Promise<boolean> {
        const poker = await this.getFromStorage(chatId, messageId);
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

        await this.setInStorage(chatId, messageId, poker);
        return true;
    }

    public async restart(chatId: number, messageId: number): Promise<void> {
        const poker = await this.getFromStorage(chatId, messageId);
        poker.usersVotes = [];
        await this.setInStorage(chatId, messageId, poker);
    }

    public close(chatId: number, messageId: number): Promise<void> {
        return this.removeFromStorage(chatId, messageId);
    }

    private async getFromStorage(
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

    private async existsInStorage(
        chatId: number,
        messageId: number
    ): Promise<boolean> {
        const key = buildStorageKey(chatId, messageId);
        const poker = await redisService.get<Poker>(key);
        return poker !== null;
    }

    private setInStorage(
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
