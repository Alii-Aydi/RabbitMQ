import { AppDataSource } from '../config/database';
import { Message } from '../models/Message';

export const MessageRepository = AppDataSource.getRepository(Message).extend({
    async createMessage(content: string): Promise<Message> {
        const message = this.create({ content, createdAt: new Date() });
        return await this.save(message);
    }
})
