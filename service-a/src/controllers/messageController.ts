import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IMessageService } from '../interfaces/IMessageService';
import { RabbitMQ } from '../rabbitmq/RabbitMQ';

@injectable()
export class MessageController {
    private main_queue: string = 'main_queue';
    private dlxExchange: string = 'dlx_exchange';
    private dlxQueue: string = 'dlx_queue';
    private main_routingKey: string = 'main_routing_key';

    constructor(
        @inject('IMessageService') private messageService: IMessageService,
        @inject(RabbitMQ) private rabbitMQ: RabbitMQ
    ) {
        this.setupQueuesAndExchanges().catch(error => {
            console.error('Error setting up queues and exchanges:', error);
        });
    }

    async setupQueuesAndExchanges() {
        await this.rabbitMQ.setupDLX(this.main_queue, this.dlxExchange, this.main_routingKey, this.dlxQueue, 'direct', 5000);
    }

    async sendMessage(req: Request, res: Response): Promise<void> {
        await this.messageService.createAndSendMessage(this.main_queue, req.body.content);
        res.send('Message sent to Service-B');
    }
}
