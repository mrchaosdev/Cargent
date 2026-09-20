# Learning System (RAG)

The learning system enables CAgent to learn from interactions, documents, and experiences using Retrieval-Augmented Generation (RAG).

## How It Works

```
User Input ──► Agent Response ──► Embed ──► Store in Vector DB
                                              │
Future Query ──► Embed ──► Search Vector DB ──► Retrieve relevant context
                                                         │
                                                    Inject into LLM prompt
```

1. Every interaction is embedded and stored in a vector store
2. Future queries embed the question and search for similar past interactions
3. Relevant past interactions are injected as context into the LLM prompt
4. Agent also ingests documents for reference

## LearningSystem Class

```typescript
import { Agent } from './agent/agent.js';

const agent = new Agent();
await agent.initialize();

// Learning happens automatically during Agent.process()
// But you can also trigger it manually or ingest content directly:

// Ingest a document
await agent.getKnowledgeBase().ingestDocument(
  'React is a JavaScript library for building user interfaces...',
  { source: 'docs', project: 'web-app' }
);

// Ingest a conversation (also done automatically)
await agent.getKnowledgeBase().ingestConversation(
  'What is TypeScript?',
  'TypeScript is a typed superset of JavaScript...'
);

// Query knowledge base
const knowledge = await agent.getKnowledgeBase().ask('React components');
console.log(knowledge);  // Relevant passages from stored content

// Save skill/experience from a task
await agent.getKnowledgeBase().saveSkill(
  'Build a web scraper',
  'Successfully built a web scraper using Node.js',
  ['code', 'web', 'javascript'],
  'project-x'
);
```

## What Gets Learned

| Type | Storage | Trigger |
|------|---------|---------|
| Interaction Q&A | Vector store | Every `process()` call |
| Document content | Vector store | `ingestDocument()` |
| Skills | Counter map | Auto-extracted from responses |
| Experience | Vector store | `saveExperience()` |

## Skill Extraction

The system automatically detects skills from agent responses using pattern matching:

- **Code**: "code", "program", "develop", "implement", "build"
- **Search**: "search", "find", "lookup", "research"
- **Writing**: "write", "create", "generate", "draft"
- **Analysis**: "analyze", "examine", "inspect", "review"
- **Debugging**: "fix", "repair", "debug", "resolve"
- **Planning**: "plan", "design", "architecture", "structure"
- **Learning**: "learn", "study", "understand", "explain"
- **Execution**: "execute", "run", "operate", "perform"

## Vector Store

Custom in-memory vector store with cosine similarity search.

```typescript
import { VectorStore } from './learning/vec-store.js';

const store = new VectorStore('./data/vector-store', 384);

// Add vectors
await store.add({
  id: 'uuid-1',
  content: 'React is a UI library',
  embedding: [0.1, -0.2, ...],  // 384-dim vector
  metadata: { type: 'document' },
});

// Search by similarity
const results = await store.search([0.1, -0.2, ...], 5);
// Returns top 5 most similar entries sorted by cosine similarity
```

## Embedder

Text embedding converts text to numerical vectors for similarity search.

```typescript
import { Embedder } from './learning/embedder.js';

const embedder = new Embedder();

// Single text
const vector = await embedder.embed('Hello world');  // 384-dim vector

// Batch
const vectors = await embedder.embedBatch(['text1', 'text2']);
```

> **⚠️ Current Implementation**: Uses hash-based pseudo-embeddings for demonstration. For production, replace with a real embedding model (e.g., `xenova/all-MiniLM-L6-v2` via `@huggingface/transformers` or ONNX runtime).

## Knowledge Base API

```typescript
const kb = agent.getKnowledgeBase();

// Document ingestion
await kb.ingestDocument(content, metadata?);

// Conversation ingestion (auto-triggered)
await kb.ingestConversation(query, response);

// Query knowledge
const relevant = await kb.ask('What is TypeScript?');

// Save skills/experience
await kb.saveSkill(task, result, skills, project?);

// Get learned skills
const skills = kb.getSkills();              // Map<skill, count>
const suggestions = kb.getSkillSuggestions(); // Top 10 skills

// Access raw experiences
const experiences = kb.getExperiences();

// Serialization
const data = kb.toSerializable();
```

## Storage Paths

| Data | Path |
|------|------|
| Vector store | `data/vector-store` |
| Conversation log | `data/conversation.log` |

## Improving Embeddings

For better RAG performance, replace `src/learning/embedder.ts` with a real embedding model:

```typescript
// Proposed improvement using ONNX or Transformers.js
import { pipeline } from '@huggingface/transformers';

export class RealEmbedder {
  private model: any;
  async init() {
    this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  async embed(text: string): Promise<number[]> {
    const output = await this.model(text);
    return output.data as number[];
  }
}
```
