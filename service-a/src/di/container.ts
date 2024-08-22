import 'reflect-metadata';
import { container } from 'tsyringe';
import { MessageService } from '../services/messageService';
import { IMessageService } from '../interfaces/IMessageService';
import { MessageRepository } from '../repositories/MessageRepository';
import { MessageController } from '../controllers/messageController';
import { RabbitMQ } from '../rabbitmq/RabbitMQ';

console.log('Registering dependencies...'); // Add this log

// Register the service with the interface
container.register<IMessageService>('IMessageService', {
    useClass: MessageService,
});

// Register the repository
container.registerSingleton<MessageRepository>(MessageRepository);

// Register the controller
container.registerSingleton(MessageController);

container.registerSingleton<RabbitMQ>(RabbitMQ);
