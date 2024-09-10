import { inject, injectable } from 'tsyringe';
import { ActionRepository } from '../repositories/ActionRepository';
import { RabbitMQ } from '../rabbitmq/RabbitMQ';
import { IActionService } from '../interfaces/IActionService';
import { ActionType } from '../enums/ActionType';

@injectable()
export class ActionService implements IActionService {
    private actionRepository = ActionRepository;
    constructor(
        @inject(RabbitMQ) private rabbitMQ: RabbitMQ
    ) { }

    async consumeAndSaveAction(queue: string, channelName: string = 'default'): Promise<void> {
        await this.rabbitMQ.consumeQueue(queue, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    const action = await this.actionRepository.createAction(content.content, ActionType.EXTERN);
                    console.log('Message saved:', action);
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
