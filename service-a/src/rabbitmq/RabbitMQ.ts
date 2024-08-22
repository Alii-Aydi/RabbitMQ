import 'dotenv/config';
import amqp from 'amqplib';

export class RabbitMQ {
    private static instance: RabbitMQ;
    private connection!: amqp.Connection;
    private channels: { [key: string]: amqp.Channel } = {};

    public constructor() { }

    static getInstance(): RabbitMQ {
        if (!RabbitMQ.instance) {
            RabbitMQ.instance = new RabbitMQ();
        }
        return RabbitMQ.instance;
    }

    static async connect(): Promise<void> {
        const instance = RabbitMQ.getInstance();
        if (instance.connection) {
            console.log('RabbitMQ is already connected');
            return;
        }

        const rabbitMQUri: string = process.env.RABBITMQ_URI || 'amqp://localhost:5672';

        try {
            instance.connection = await amqp.connect(rabbitMQUri,
                {
                    heartbeat: 60, // Heartbeat interval for connection monitoring
                    reconnect: true, // Enables reconnection
                    reconnectDelay: 1000 // Delay between reconnection attempts
                }
            );
            console.log('RabbitMQ connected');
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            process.exit(1);
        }
    }

    static async close(): Promise<void> {
        const instance = RabbitMQ.getInstance();
        if (instance.connection) {
            for (const channel of Object.values(instance.channels)) {
                await channel.close();
            }
            await instance.connection.close();
            console.log('RabbitMQ connection and channels closed');
        }
    }

    async getChannel(name: string): Promise<amqp.Channel> {
        const instance = RabbitMQ.getInstance();
        if (!this.channels[name]) {
            this.channels[name] = await instance.connection.createChannel();
            console.log(`Channel ${name} created`);
        }
        return this.channels[name];
    }

    async sendToQueue(queue: string, message: Buffer, channelName: string = 'default') {
        const channel = await this.getChannel(channelName);
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, message);
    }

    async consumeQueue(queue: string, callback: (msg: amqp.ConsumeMessage | null) => void, channelName: string = 'default') {
        const channel = await this.getChannel(channelName);
        await channel.assertQueue(queue, { durable: true });

        channel.consume(queue, async (msg) => {
            if (msg) {
                try {
                    await callback(msg); // Process the message
                    channel.ack(msg);   // Acknowledge the message
                } catch (error) {
                    if (error instanceof Error) {
                        console.error('Error processing message:', error.message);
                    } else {
                        console.error('Unknown error processing message:', error);
                    }
                    channel.nack(msg, false, false); // Negative acknowledgment
                }
            } else {
                console.warn('Received an empty message');
            }
        }, { noAck: false });
    }

    async assertExchange(exchange: string, type: string, channelName: string = 'default') {
        const channel = await this.getChannel(channelName);
        await channel.assertExchange(exchange, type, { durable: true });
    }

    async bindQueueToExchange(queue: string, exchange: string, routingKey: string, type: string = 'direct', channelName: string = 'default') {
        const channel = await this.getChannel(channelName);
        await this.assertExchange(exchange, type, channelName);
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);
    }

    async publishToExchange(exchange: string, routingKey: string, message: Buffer, type: string = 'direct', channelName: string = 'default') {
        const channel = await this.getChannel(channelName);
        await this.assertExchange(exchange, type, channelName);
        channel.publish(exchange, routingKey, message);
    }

    async setupDLX(queue: string, dlxExchange: string, dlxRoutingKey: string, dlxQueue: string, type: string = 'direct', delay: number = 0, channelName: string = 'default') {
        const channel = await this.getChannel(channelName);
        await this.assertExchange(dlxExchange, type, channelName);
        await channel.assertQueue(queue, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': dlxExchange,
                'x-dead-letter-routing-key': dlxRoutingKey,
                'x-message-ttl': delay,
            }
        });

        // Optionally, setup the DLX queue itself
        await channel.assertQueue(dlxQueue, { durable: true });
        await channel.bindQueue(dlxQueue, dlxExchange, dlxRoutingKey);
    }

}
