import { inject, injectable } from 'tsyringe';
import { MessageRepository } from '../repositories/MessageRepository';
import { RabbitMQ } from '../rabbitmq/RabbitMQ';
import { IMessageService } from '../interfaces/IMessageService';

@injectable()
export class MessageService implements IMessageService {
    constructor(
        @inject(MessageRepository) private messageRepository: MessageRepository,
        @inject(RabbitMQ) private rabbitMQ: RabbitMQ
    ) { }

    async createAndSendMessage(queue: string, content: string, channelName: string = 'default'): Promise<void> {
        const message = await this.messageRepository.createMessage(content);
        this.rabbitMQ.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    }

    async consumeAndSaveMessage(queue: string, channelName: string = 'default'): Promise<void> {
        await this.rabbitMQ.consumeQueue(queue, async (msg) => {
            if (msg) {
                try {
                    const content = msg.content.toString();
                    await this.messageRepository.createMessage(content);
                    console.log('Message saved:', content);
                } catch (error) {
                    if (error instanceof Error) {
                        console.error('Error processing message:', error.message);
                    } else {
                        console.error('Unknown error processing message:', error);
                    }

                    // Error handling is done in the consumeQueue callback
                }
            } else {
                console.warn('Received an empty message');
            }
        });
    }
}
