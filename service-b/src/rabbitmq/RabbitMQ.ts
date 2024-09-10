import 'dotenv/config';
import amqp from 'amqplib';

export class RabbitMQ {
    private connection!: amqp.Connection;
    private channels: { [key: string]: amqp.Channel } = {};

    public constructor() { }

    async connect(): Promise<void> {
        if (this.connection) {
            console.log('RabbitMQ is already connected');
            return;
        }

        const rabbitMQUri: string = process.env.RABBITMQ_URI || 'amqp://localhost:5672';

        for (let attempt = 1; attempt <= 5; attempt++) {
            try {
                this.connection = await amqp.connect(rabbitMQUri, {
                    heartbeat: 60,
                    reconnect: true,
                    reconnectDelay: 1000
                });
                console.log('RabbitMQ connected');
                return;
            } catch (error) {
                console.error(`Failed to connect to RabbitMQ (attempt ${attempt}):`, error);
                if (attempt < 5) {
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // Exponential backoff
                } else {
                    process.exit(1);
                }
            }
        }
    }

    async close(): Promise<void> {
        if (this.connection) {
            try {
                for (const channel of Object.values(this.channels)) {
                    await channel.close();
                }
                await this.connection.close();
                console.log('RabbitMQ connection and channels closed');
            } catch (error) {
                console.error('Error closing RabbitMQ connection:', error);
            }
        } else {
            console.warn('No RabbitMQ connection to close');
        }
    }

    async getChannel(name: string): Promise<amqp.Channel> {
        if (!this.connection) {
            throw new Error('RabbitMQ connection not established');
        }

        if (!this.channels[name]) {
            try {
                this.channels[name] = await this.connection.createChannel();
                console.log(`Channel ${name} created`);
            } catch (error) {
                console.error(`Failed to create channel ${name}:`, error);
                throw error;
            }
        }
        return this.channels[name];
    }

    async sendToQueue(queue: string, message: Buffer, channelName: string = 'default') {
        const channel = await this.getChannel(channelName);
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, message);
    }

    async consumeQueue(queue: string, callback: (msg: amqp.ConsumeMessage | null) => Promise<void>, channelName: string = 'default') {
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
