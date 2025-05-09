import { v4 as uuidv4 } from 'uuid';
import type {
  ChatMessage,
  Conversation,
  ChatServiceOptions,
  QuickPrompt,
  MessageRole
} from '../types/chat';
// Import the environment variables directly instead of using a non-exported function

// Environment configuration
const NODE_ENV = import.meta.env.NODE_ENV || 'development';
const USE_MOCK_CHAT = import.meta.env.VITE_USE_MOCK_OPENAI === 'true';

// OpenAI API configuration
// Get API key based on environment
const getApiKey = (): string => {
  // Use environment-specific API key
  switch (NODE_ENV) {
    case 'production':
      return import.meta.env.VITE_OPENAI_API_KEY_PROD;
    case 'staging':
      return import.meta.env.VITE_OPENAI_API_KEY_STAGING;
    case 'development':
    default:
      return import.meta.env.VITE_OPENAI_API_KEY_DEV;
  }
};

const OPENAI_API_KEY = getApiKey();
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo';
const OPENAI_TIMEOUT = parseInt(import.meta.env.VITE_OPENAI_TIMEOUT || '10000', 10);

// Default service options
const DEFAULT_SERVICE_OPTIONS: ChatServiceOptions = {
  useOpenAI: true,
  defaultModel: OPENAI_MODEL as 'gpt-3.5-turbo' | 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  useStreaming: false,
  saveHistory: true
};

// Storage keys
const STORAGE_KEYS = {
  CONVERSATIONS: 'lawnsync_conversations',
  CURRENT_CONVERSATION: 'lawnsync_current_conversation'
};

// System prompt that helps the assistant understand the context
const DEFAULT_SYSTEM_PROMPT = `You are LawnSync AI, an expert lawn care assistant that helps homeowners achieve healthier, more beautiful lawns.
You provide personalized guidance based on climate, grass type, and specific conditions. Your knowledge spans:
- Lawn care basics and maintenance schedules
- Grass types and their specific needs
- Weed identification and control strategies
- Pest management and disease diagnosis
- Seasonal lawn care tasks and timing
- Weather-adaptive recommendations
- Watering schedules and techniques
- Fertilization approaches and products
- Equipment selection and usage tips

Present your advice in a friendly, helpful tone. Format longer responses with markdown for readability.
When making specific product recommendations, focus on generic descriptions rather than specific brands.
Always tailor your advice to the user's location, lawn type, and current season when this information is available.`;

// Mock conversation data for development/testing
const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    userId: 'user123',
    messages: [
      {
        id: 'msg1',
        content: DEFAULT_SYSTEM_PROMPT,
        role: 'system',
        timestamp: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: 'msg2',
        content: "👋 Hello! I'm your LawnSync AI Assistant. How can I help with your lawn care today?",
        role: 'assistant',
        timestamp: new Date(Date.now() - 50000).toISOString()
      },
      {
        id: 'msg3',
        content: "I've noticed brown patches in my Bermuda grass lawn. What could be causing this?",
        role: 'user',
        timestamp: new Date(Date.now() - 40000).toISOString()
      },
      {
        id: 'msg4',
        content: "Brown patches in Bermuda grass can be caused by several factors:\n\n1. **Fungal diseases** - Brown patch fungus and dollar spot are common in warm, humid conditions\n2. **Insect damage** - Check for armyworms, grubs, or chinch bugs\n3. **Irrigation issues** - Both overwatering and underwatering can cause brown patches\n4. **Soil compaction** - Prevents proper root development\n5. **Improper mowing** - Cutting too short stresses the grass\n\nTo diagnose the issue better:\n- Do the patches have any specific pattern?\n- Have you noticed any insects in the area?\n- Has your watering schedule changed recently?\n- What's your current mowing height?",
        role: 'assistant',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        formattedContent: "Brown patches in Bermuda grass can be caused by several factors:\n\n1. **Fungal diseases** - Brown patch fungus and dollar spot are common in warm, humid conditions\n2. **Insect damage** - Check for armyworms, grubs, or chinch bugs\n3. **Irrigation issues** - Both overwatering and underwatering can cause brown patches\n4. **Soil compaction** - Prevents proper root development\n5. **Improper mowing** - Cutting too short stresses the grass\n\nTo diagnose the issue better:\n- Do the patches have any specific pattern?\n- Have you noticed any insects in the area?\n- Has your watering schedule changed recently?\n- What's your current mowing height?"
      }
    ],
    createdAt: new Date(Date.now() - 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30000).toISOString(),
    title: 'Brown patches in lawn'
  }
];

// Pre-defined quick prompts for common questions
export const quickPrompts: QuickPrompt[] = [
  {
    id: 'qp1',
    text: 'When should I fertilize my lawn?',
    category: 'seasonal'
  },
  {
    id: 'qp2',
    text: 'How do I get rid of dandelions?',
    category: 'problems'
  },
  {
    id: 'qp3',
    text: "What is the best mowing height for my grass?",
    category: 'maintenance'
  },
  {
    id: 'qp4',
    text: 'How often should I water my lawn?',
    category: 'maintenance'
  },
  {
    id: 'qp5',
    text: 'How do I prepare my lawn for winter?',
    category: 'seasonal'
  },
  {
    id: 'qp6',
    text: "What is causing yellow spots in my grass?",
    category: 'problems'
  },
  {
    id: 'qp7',
    text: 'How do I identify my grass type?',
    category: 'general'
  },
  {
    id: 'qp8',
    text: 'When should I aerate my lawn?',
    category: 'seasonal'
  }
];

/**
 * Loads conversations from localStorage
 */
const loadFromStorage = (userId: string): Conversation[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (storedData) {
      const allConversations = JSON.parse(storedData);
      // Filter conversations for the specific user
      return allConversations.filter((conv: Conversation) => conv.userId === userId);
    }
  } catch (error) {
    console.error('Error loading conversations from storage:', error);
  }
  return [];
};

/**
 * Saves conversations to localStorage
 */
const saveToStorage = (conversations: Conversation[]): void => {
  try {
    // First get all existing conversations
    const storedData = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    let allConversations: Conversation[] = [];
    
    if (storedData) {
      // Parse existing conversations
      allConversations = JSON.parse(storedData);
      
      // For each new conversation
      conversations.forEach(newConv => {
        // Find the index of the conversation with the same ID (if it exists)
        const existingIndex = allConversations.findIndex(conv => conv.id === newConv.id);
        
        if (existingIndex >= 0) {
          // Replace the existing conversation
          allConversations[existingIndex] = newConv;
        } else {
          // Add the new conversation
          allConversations.push(newConv);
        }
      });
    } else {
      // No existing conversations, use the new ones
      allConversations = conversations;
    }
    
    // Save all conversations back to localStorage
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(allConversations));
  } catch (error) {
    console.error('Error saving conversations to storage:', error);
  }
};

/**
 * Saves current conversation ID to localStorage
 */
const saveCurrentConversationId = (conversationId: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, conversationId);
  } catch (error) {
    console.error('Error saving current conversation ID:', error);
  }
};

/**
 * Gets current conversation ID from localStorage
 */
const getCurrentConversationId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
  } catch (error) {
    console.error('Error getting current conversation ID:', error);
    return null;
  }
};

/**
 * Creates a new conversation with initial system prompt
 */
export const createConversation = (
  userId: string,
  initialSystemPrompt: string = DEFAULT_SYSTEM_PROMPT
): Conversation => {
  const now = new Date().toISOString();
  
  // Create system message
  const systemMessage: ChatMessage = {
    id: uuidv4(),
    content: initialSystemPrompt,
    role: 'system',
    timestamp: now
  };
  
  // Create welcome message
  const welcomeMessage: ChatMessage = {
    id: uuidv4(),
    content: "👋 Hello! I'm your LawnSync AI Assistant. How can I help with your lawn care today?",
    role: 'assistant',
    timestamp: now
  };
  
  // Create new conversation
  const newConversation: Conversation = {
    id: uuidv4(),
    userId,
    messages: [systemMessage, welcomeMessage],
    createdAt: now,
    updatedAt: now
  };
  
  // Save to storage
  saveToStorage([newConversation]);
  saveCurrentConversationId(newConversation.id);
  
  return newConversation;
};

/**
 * Gets user's conversations
 */
export const getConversations = (userId: string): Conversation[] => {
  if (USE_MOCK_CHAT) {
    return mockConversations;
  }
  
  return loadFromStorage(userId);
};

/**
 * Gets a specific conversation by ID
 */
export const getConversationById = (
  conversationId: string,
  userId: string
): Conversation | null => {
  if (USE_MOCK_CHAT) {
    return mockConversations.find(c => c.id === conversationId) || null;
  }
  
  const conversations = loadFromStorage(userId);
  return conversations.find(c => c.id === conversationId) || null;
};

/**
 * Gets the current conversation or creates a new one
 */
export const getCurrentConversation = (userId: string): Conversation => {
  const currentId = getCurrentConversationId();
  
  if (currentId) {
    const conversation = getConversationById(currentId, userId);
    if (conversation) {
      return conversation;
    }
  }
  
  // No current conversation found, create a new one
  return createConversation(userId);
};

/**
 * Sends a user message and gets an AI response
 */
export const sendMessage = async (
  conversationId: string,
  userId: string,
  content: string,
  options: Partial<ChatServiceOptions> = {}
): Promise<ChatMessage> => {
  const serviceOptions = { ...DEFAULT_SERVICE_OPTIONS, ...options };
  const now = new Date().toISOString();
  
  // Get the conversation
  let conversation: Conversation | null;
  
  if (USE_MOCK_CHAT) {
    conversation = mockConversations.find(c => c.id === conversationId) || mockConversations[0];
  } else {
    conversation = getConversationById(conversationId, userId);
    
    if (!conversation) {
      conversation = createConversation(userId);
    }
  }
  
  // Create user message
  const userMessage: ChatMessage = {
    id: uuidv4(),
    content,
    role: 'user',
    timestamp: now
  };
  
  // Add user message to conversation
  conversation.messages.push(userMessage);
  conversation.updatedAt = now;
  
  // Create a temporary loading message for the assistant
  const loadingMessage: ChatMessage = {
    id: uuidv4(),
    content: '',
    role: 'assistant',
    timestamp: now,
    isLoading: true
  };
  
  // Add loading message to conversation
  conversation.messages.push(loadingMessage);
  
  // Save the updated conversation with the loading message
  if (!USE_MOCK_CHAT) {
    saveToStorage([conversation]);
  }
  
  try {
    let assistantResponse: string;
    
    if (USE_MOCK_CHAT) {
      // Simulate an API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock response based on the user's query
      if (content.toLowerCase().includes('brown patch') || content.toLowerCase().includes('brown spots')) {
        assistantResponse = "Brown patches in lawns are often caused by fungal diseases, particularly in humid conditions. Here are some steps to address the issue:\n\n1. **Proper watering** - Water deeply but infrequently, in the early morning\n2. **Improve drainage** - Aerate your lawn if the soil is compacted\n3. **Apply fungicide** - A fungicide labeled for brown patch can help control active infections\n4. **Reduce nitrogen** - Too much nitrogen fertilizer can make fungal problems worse\n5. **Proper mowing** - Keep your mower blades sharp and don't cut more than 1/3 of the grass height at once\n\nFungicides containing azoxystrobin, propiconazole, or myclobutanil are effective against brown patch. Would you like more specific recommendations based on your grass type and region?";
      } else if (content.toLowerCase().includes('water') || content.toLowerCase().includes('irrigation')) {
        assistantResponse = "The ideal watering schedule depends on your grass type, soil, climate, and season. However, here are some general guidelines:\n\n- **Watering depth**: Aim for 1-1.5 inches of water per week, including rainfall\n- **Frequency**: Water deeply 2-3 times per week rather than lightly every day\n- **Timing**: Early morning (4am-10am) is best to reduce evaporation and fungal growth\n- **Signs of underwatering**: Grass turns bluish-gray, footprints remain visible, blades fold/curl\n- **Signs of overwatering**: Soggy areas, runoff, fungal growth, shallow roots\n\nWould you like me to help you calculate a more specific watering schedule based on your lawn's specific needs?";
      } else if (content.toLowerCase().includes('fertiliz') || content.toLowerCase().includes('feed')) {
        assistantResponse = "Fertilizing schedules vary by grass type and region, but here's a general approach:\n\n**Cool-season grasses** (Kentucky Bluegrass, Fescue, Ryegrass):\n- Main applications: Early fall and spring\n- Lighter applications: Early summer and late fall\n\n**Warm-season grasses** (Bermuda, Zoysia, St. Augustine):\n- Main applications: Late spring and summer\n- Avoid fertilizing when dormant in winter\n\nFor most lawns, a slow-release fertilizer with an N-P-K ratio around 3-1-2 or 4-1-2 works well. Soil tests can help determine if you need to adjust phosphorus (P) or potassium (K) levels.\n\nWould you like more specific recommendations for your grass type and region?";
      } else {
        assistantResponse = "Thank you for your question! As your LawnSync AI Assistant, I'm here to help with all your lawn care needs. To provide you with the most accurate advice, could you share a few more details about your lawn?\n\n- What type of grass do you have?\n- Where are you located (region/climate)?\n- Are there any specific issues you're noticing?\n\nWith this information, I can give you personalized recommendations to help your lawn thrive.";
      }
    } else {
      // Prepare messages for OpenAI API
      const messages = conversation.messages
        .filter(m => !m.isLoading) // Remove any loading messages
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      // Call OpenAI API
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: serviceOptions.defaultModel,
          messages,
          temperature: serviceOptions.temperature,
          max_tokens: serviceOptions.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      assistantResponse = data.choices[0].message.content;
    }
    
    // Update the loading message with the actual response
    const assistantMessage: ChatMessage = {
      id: loadingMessage.id,
      content: assistantResponse,
      formattedContent: assistantResponse, // Simple copy for now, could be processed markdown
      role: 'assistant',
      timestamp: new Date().toISOString(),
      isLoading: false
    };
    
    // Replace the loading message with the actual response
    const messageIndex = conversation.messages.findIndex(m => m.id === loadingMessage.id);
    if (messageIndex !== -1) {
      conversation.messages[messageIndex] = assistantMessage;
    }
    
    // Update conversation timestamp
    conversation.updatedAt = new Date().toISOString();
    
    // Save the updated conversation
    if (!USE_MOCK_CHAT) {
      saveToStorage([conversation]);
    }
    
    return assistantMessage;
  } catch (error) {
    console.error('Error sending message to OpenAI:', error);
    
    // Update the loading message with an error
    const errorMessage: ChatMessage = {
      id: loadingMessage.id,
      content: "I'm sorry, I encountered an error processing your request. Please try again later.",
      role: 'assistant',
      timestamp: new Date().toISOString(),
      isLoading: false,
      error: error instanceof Error ? error.message : String(error)
    };
    
    // Replace the loading message with the error message
    const messageIndex = conversation.messages.findIndex(m => m.id === loadingMessage.id);
    if (messageIndex !== -1) {
      conversation.messages[messageIndex] = errorMessage;
    }
    
    // Update conversation timestamp
    conversation.updatedAt = new Date().toISOString();
    
    // Save the updated conversation
    if (!USE_MOCK_CHAT) {
      saveToStorage([conversation]);
    }
    
    return errorMessage;
  }
};

/**
 * Clears the chat history for a user
 */
export const clearChatHistory = (userId: string): void => {
  try {
    // Get all conversations from storage
    const storedData = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (storedData) {
      // Parse existing conversations
      const allConversations = JSON.parse(storedData);
      
      // Filter out conversations for this user
      const remainingConversations = allConversations.filter(
        (conv: Conversation) => conv.userId !== userId
      );
      
      // Save the remaining conversations back to localStorage
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(remainingConversations));
    }
    
    // Clear current conversation
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);
    
    // Create a new conversation
    const newConversation = createConversation(userId);
    
    // Set as current conversation
    saveCurrentConversationId(newConversation.id);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
};