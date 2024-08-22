import { Router } from 'express';
import { container } from 'tsyringe';
import { MessageController } from '../controllers/messageController';

const router = Router();

console.log('Resolving MessageController...'); // Add this log

// Dependency injection handled by the container
const messageController = container.resolve(MessageController);

router.post('/send', (req, res) => messageController.sendMessage(req, res));

export default router;
