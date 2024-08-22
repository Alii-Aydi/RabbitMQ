import './di/container'; // Ensure this import is at the top

import express, { Request, Response } from 'express';
import { AppDataSource } from './config/database';
import { RabbitMQ } from './rabbitmq/RabbitMQ';
import messageRoutes from './routes/messageRoutes';

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response): void => {
    res.json("Hello You");
});

app.use('/api/messages', messageRoutes);

AppDataSource.initialize().then(() => {
    app.listen(3000, async () => {
        console.log('Service-A running on port 3000');
        await RabbitMQ.connect();
    });
    process.on('SIGINT', async () => {
        await RabbitMQ.close();
    });
}).catch((error: Error) => {
    console.error('Error initializing AppDataSource:', error);
});
