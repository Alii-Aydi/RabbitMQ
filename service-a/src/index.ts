import 'reflect-metadata'; // Ensure reflect-metadata is imported
import './di/container'; // Ensure this import is at the top

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { AppDataSource } from './config/database';
import { RabbitMQ } from './rabbitmq/RabbitMQ';
import messageRoutes from './routes/messageRoutes';
import { container } from 'tsyringe'; // Import tsyringe container
import { IMessageService } from 'interfaces/IMessageService';

const app = express();

// Injections
const rabbitMQ = container.resolve(RabbitMQ);
const messageService = container.resolve<IMessageService>('IMessageService');

// Middleware
app.use(express.json());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Routes
app.get("/", (req: Request, res: Response): void => {
    res.json("Hello You");
});

app.use('/api/messages', messageRoutes);

AppDataSource.initialize().then(async () => {
    console.log("AppDataSource initialized");

    // Connect to RabbitMQ
    rabbitMQ.connect().then(() => {
        console.log('Connected to RabbitMQ');
        messageService.consumeAndSaveMessage(process.env.SERVICE_A_QUEUE!);
    }).catch((error: Error) => {
        console.error('Failed to connect to RabbitMQ:', error);
    });

    const port = process.env.PORT || 3000;

    // Start the server
    app.listen(port, () => {
        console.log('Service-A running on port 3000');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
        await rabbitMQ.close();
        process.exit(0);
    });
}).catch((error: Error) => {
    console.error('Error initializing AppDataSource:', error);
});
