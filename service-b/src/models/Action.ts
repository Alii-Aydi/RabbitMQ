import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, BaseEntity } from 'typeorm';
import { IsNotEmpty, Length, IsEnum } from 'class-validator';
import { ActionType } from '../enums/ActionType';

@Entity("Actions")
export class Action extends BaseEntity {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    @IsNotEmpty({ message: 'Content must not be empty' })
    @Length(1, 500, { message: 'Content must be between 1 and 500 characters' })
    content!: string;

    @Column({
        type: 'enum',
        enum: ActionType,
        default: ActionType.INTERN
    })
    @IsEnum(ActionType, { message: 'Type must be either "extern" or "intern"' })
    type!: ActionType;

    @CreateDateColumn()
    createdAt: Date = new Date();
}
