import { ActionType } from 'enums/ActionType';
import { AppDataSource } from '../config/database';
import { Action } from '../models/Action';

export const ActionRepository = AppDataSource.getRepository(Action).extend({
    async createAction(content: string, type: ActionType): Promise<Action> {
        const action = this.create({ content, type, createdAt: new Date() });
        return await this.save(action);
    }
})
