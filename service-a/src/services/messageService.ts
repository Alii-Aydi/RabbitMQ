import { inject, injectable } from 'tsyringe';
import { MessageRepository } from '../repositories/MessageRepository';
import { RabbitMQ } from '../rabbitmq/RabbitMQ';
import { IMessageService } from '../interfaces/IMessageService';

@injectable()
export class MessageService implements IMessageService {
    private messageRepository = MessageRepository;
    constructor(
        @inject(RabbitMQ) private rabbitMQ: RabbitMQ
    ) { }

    async createAndSendMessage(queue: string, content: string, channelName: string = 'default'): Promise<void> {
        const message = await this.messageRepository.createMessage(content);
        this.rabbitMQ.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        console.log('Message sent:', message);
    }

    async consumeAndSaveMessage(queue: string, channelName: string = 'default'): Promise<void> {
        await this.rabbitMQ.consumeQueue(queue, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    await this.messageRepository.createMessage(content.content);
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

    async setupDLXQueuesAndExchanges() {
        await this.rabbitMQ.setupDLX(process.env.MAIN_QUEUE!, process.env.DLX_EXCHANGE!, process.env.MAIN_ROUTING_KEY!, process.env.DLX_QUEUE!, 'direct', 5000);
    }
}
