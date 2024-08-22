import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn } from 'typeorm';
import { IsNotEmpty, Length, IsDate } from 'class-validator';

@Entity()
export class Message {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    @IsNotEmpty({ message: 'Content must not be empty' })
    @Length(1, 500, { message: 'Content must be between 1 and 500 characters' })
    content!: string;

    @CreateDateColumn()
    createdAt: Date = new Date();;
}
