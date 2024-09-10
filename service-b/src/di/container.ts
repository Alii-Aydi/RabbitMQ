import 'reflect-metadata';
import { container } from 'tsyringe';
import { ActionService } from '../services/ActionService';
import { IActionService } from '../interfaces/IActionService';
import { ActionController } from '../controllers/ActionController';
import { RabbitMQ } from '../rabbitmq/RabbitMQ';

console.log('Registering dependencies...'); // Add this log

// Register the service with the interface
container.register<IActionService>('IActionService', {
    useClass: ActionService,
});

// Register the controller
container.registerSingleton(ActionController);

container.registerSingleton<RabbitMQ>(RabbitMQ);
