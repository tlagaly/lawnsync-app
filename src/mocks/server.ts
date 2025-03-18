import { setupServer } from 'msw/node';
import { claudeHandlers } from './handlers/claude';

// Set up MSW server with all handlers
export const server = setupServer(
  ...claudeHandlers,
  // Add other handlers here as needed
);

// Export handlers for individual test usage
export const handlers = {
  claude: claudeHandlers,
  // Add other handler groups here as needed
};