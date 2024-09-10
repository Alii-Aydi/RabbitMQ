import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IMessageService } from '../interfaces/IMessageService';
import { RabbitMQ } from '../rabbitmq/RabbitMQ';

@injectable()
export class MessageController {
    constructor(
        @inject('IMessageService') private messageService: IMessageService,
        @inject(RabbitMQ) private rabbitMQ: RabbitMQ
    ) { }

    async sendMessage(req: Request, res: Response): Promise<void> {
        await this.messageService.createAndSendMessage(process.env.MAIN_QUEUE!, req.body.content);
        res.send('Message sent to Service-B');
    }
}
