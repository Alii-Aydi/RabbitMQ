import { Repository } from 'typeorm';
import { Message } from '../models/Message';

export class MessageRepository extends Repository<Message> {
    async createMessage(content: string): Promise<Message> {
        const message = this.create({ content, createdAt: new Date() });
        return await this.save(message);
    }
}
