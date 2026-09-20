# Memory System

The memory system manages both short-term (conversation) and long-term (persistent) memory for the agent.

## Architecture

```
┌────────────────────────────────────┐
│           AgentMemory              │
│                                    │
│  ┌──────────────┐ ┌──────────────┐│
│  │ Short-Term   │ │ Long-Term    ││
│  │ Memory       │ │ Memory       ││
│  │ (conversation│ │ (persistent  ││
│  │  history)    │ │  knowledge)  ││
│  └──────┬───────┘ └──────┬───────┘│
│         │                │        │
│    Recent msgs      Vector Store │
│    (auto-trim)      + Indexing   │
└────────────────────────────────────┘
```

## Short-Term Memory

Stores the last N conversation messages. Automatically trims when exceeding the limit.

```typescript
const memory = agent.getMemory();

// Add messages (done automatically by Agent.process())
memory.addUserMessage('Hello');
memory.addAssistantMessage('Hi there!');

// Retrieve
const recent = memory.getRecentMessages(10);  // Last 10 exchanges
const all = memory.getAllMessages();           // All messages

// Clear when needed
memory.clearShortTerm();

// Check usage
const size = memory.getSize();  // { short: 5, long: 23 }
```

### Configuration

```typescript
// In config.ts
agent: {
  memoryLimit: 50,  // Max short-term messages (default: 50)
}
```

## Long-Term Memory

Stores persistent knowledge entries that can be retrieved via RAG queries.

```typescript
const memory = agent.getMemory();

// Add long-term entry
memory.addLongTerm({
  content: 'User prefers TypeScript over JavaScript',
  metadata: { source: 'preference', project: 'general' },
});

// Search
const results = memory.searchLongTerm('programming preferences', 5);

// Get all
const all = memory.getLongTerm();
```

## Conversation Logger

All conversations are logged to `data/conversation.log` in JSON format.

```typescript
import { ConversationLogger } from './core/conversation-logger.js';

const logger = ConversationLogger.getInstance();
logger.log('user', 'Hello agent');
logger.log('assistant', 'Hello user!');

// Retrieve history
const history = logger.getHistory();        // All logs
const recent = logger.getRecent(20);        // Last 20 entries
const all = logger.getRecent(50);           // Last 50 entries

// Clear
logger.clear();
```

## Auto-Learning

Every interaction automatically updates long-term memory:

1. Agent response is embedded and stored in vector store
2. Skills are extracted from the response
3. Experience is saved with project context

```typescript
// This happens automatically inside Agent.process()
await agent.process('Write a React hook');
// → Interaction stored in vector store
// → Skills: [code, react, javascript] detected
// → Long-term memory updated
```

## Storage

- **Short-term**: In-memory array (lost on restart)
- **Long-term**: Vector store at `data/vector-store` (persistent)
- **Conversation log**: `data/conversation.log` (JSONL format)
