import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IActionService } from '../interfaces/IActionService';
import { RabbitMQ } from '../rabbitmq/RabbitMQ';

@injectable()
export class ActionController {
    constructor(
        @inject('IActionService') private actionService: IActionService,
        @inject(RabbitMQ) private rabbitMQ: RabbitMQ
    ) { }


}
