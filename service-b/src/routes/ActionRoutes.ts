import { Router } from 'express';
import { container } from 'tsyringe';
import { ActionController } from '../controllers/ActionController';

const router = Router();

console.log('Resolving ActionController...'); // Add this log

// Dependency injection handled by the container
const actionController = container.resolve(ActionController);


export default router;
