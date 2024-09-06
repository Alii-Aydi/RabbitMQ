import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { Message } from '../models/Message';
const glob = require('glob');

// Use glob to find all entity files in the models directory
const entities = glob.sync(join(__dirname, '../models/*.ts')).map((file: string) => require(file).default);
console.log(entities)

export const AppDataSource = new DataSource({
    type: 'mongodb',
    database: 'rabbitmq',
    url: process.env.MONGO_URI,
    useUnifiedTopology: true,
    synchronize: true,
    logging: true,
    entities: [Message], // Dynamically include all entities
});
