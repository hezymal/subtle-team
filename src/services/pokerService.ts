import { User } from "telegraf/types";

import { redisService } from "./redisService";
import { Poker, PokerState, StoryPoint } from "../models/poker";

const buildStorageKey = (chatId: number, messageId: number): string => {
    return `poker:${chatId}:${messageId}`;
};

class PokerService {
    constructor() {
        this.create = this.create.bind(this);
        this.exists = this.exists.bind(this);
        this.close = this.close.bind(this);
        this.get = this.get.bind(this);
        this.vote = this.vote.bind(this);
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
            state: PokerState.open,
            created: new Date().toISOString(),
        };

        return this.setInStorage(chatId, messageId, poker);
    }

    public get(chatId: number, messageId: number): Promise<Poker> {
        return this.getFromStorage(chatId, messageId);
    }

    public exists(chatId: number, messageId: number): Promise<boolean> {
        return this.existsInStorage(chatId, messageId);
    }

    public async vote(
        chatId: number,
        messageId: number,
        user: User,
        storyPoint: StoryPoint
    ): Promise<boolean> {
        const poker = await this.getFromStorage(chatId, messageId);
        const existsUserVote = poker.usersVotes.find(
            (v) => v.user.id === user.id
        );
        if (existsUserVote) {
            if (existsUserVote.storyPoint === storyPoint) {
                return false;
            }

            existsUserVote.storyPoint = storyPoint;
        } else {
            poker.usersVotes.push({ user, storyPoint });
        }

        await this.setInStorage(chatId, messageId, poker);
        return true;
    }

    public async close(chatId: number, messageId: number): Promise<void> {
        const poker = await this.getFromStorage(chatId, messageId);
        poker.state = PokerState.closed;
        await this.setInStorage(chatId, messageId, poker);
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
