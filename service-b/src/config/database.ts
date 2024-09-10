import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Action } from '../models/Action';

export const AppDataSource = new DataSource({
    type: 'mongodb',
    database: 'rabbitmq',
    url: process.env.MONGO_URI,
    useUnifiedTopology: true,
    synchronize: true,
    logging: true,
    entities: [Action],
});
