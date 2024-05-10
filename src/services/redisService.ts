import { RedisClientType, createClient } from "redis";

class RedisService {
    private client: RedisClientType;

    constructor() {
        this.dispose = this.dispose.bind(this);
        this.getClient = this.getClient.bind(this);
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
        this.delete = this.delete.bind(this);

        this.client = createClient();
    }

    async dispose() {
        if (this.client.isOpen) {
            await this.client.disconnect();
        }
    }

    async getClient(): Promise<RedisClientType> {
        if (!this.client.isOpen) {
            await this.client.connect();
        }

        return this.client;
    }

    async get<T>(key: string): Promise<T | null> {
        const client = await this.getClient();
        const value = await client.get(key);
        if (value === null) {
            return null;
        }

        return JSON.parse(value) as T;
    }

    async set<T>(key: string, value: T): Promise<void> {
        const client = await this.getClient();
        await client.set(key, JSON.stringify(value));
    }

    async delete(key: string): Promise<void> {
        const client = await this.getClient();
        await client.del(key);
    }
}

export const redisService = new RedisService();
