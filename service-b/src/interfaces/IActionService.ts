export interface IActionService {
    consumeAndSaveAction(queue: string, channelName?: string): Promise<void>;
}
