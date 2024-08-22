export interface IMessageService {
    createAndSendMessage(queue: string, content: string, channelName?: string): Promise<void>;
    consumeAndSaveMessage(queue: string, channelName?: string): Promise<void>;
}
