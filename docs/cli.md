# CLI Usage

## Starting the Agent

```bash
# Using batch script (recommended)
run.bat

# Manual start
ollama serve          # Terminal 1 (keep running)
npm run dev           # Terminal 2 (interactive)

# Production build
npm run build
npm start
```

## Interactive Commands

While the agent is running, type commands:

### Regular Messages

Any text input is sent to the agent for processing:

```
> Explain TypeScript interfaces in 3 sentences
```

### Built-in Commands

| Command | Description |
|---------|-------------|
| `skills` | Show all learned skills with usage counts |
| `projects` | List registered projects |
| `memories` | Show memory usage (short/long term) |
| `quit` / `exit` | Shut down the agent |

### Examples

```
> Write a React useEffect hook
[Agent response with code...]
[Skills detected: code, react, typescript]

> skills
Learned skills: code (23), react (8), typescript (7), javascript (5)

> projects
Projects: web-app (3 skills), api-server (2 skills)

> memories
Memory - Short: 12 messages, Long: 45 entries

> quit
Shutting down...
```

## Programmatic Usage

### Standalone Script

```typescript
// example.ts (in project root)
import { Agent } from './agent/agent.js';

async function main() {
  const agent = new Agent();
  await agent.initialize();

  const response = await agent.process('Your task here');
  console.log(response.text);
  console.log('Skills:', response.skills);
}

main();
```

Run with:
```bash
npx ts-node src/example.ts
```

## CLI Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `skills` | List learned skills |
| `projects` | Show project profiles |
| `memories` | Show memory stats |
| `quit` | Exit agent |
| Any text | Process as query |

## Output Format

Agent responses include:
- **Main response**: The agent's answer text
- **Skills detected**: Skills identified in the response (if any)
- **Plan**: Step-by-step plan for complex tasks (internal)

## Error Handling

If Ollama is not running:
```
Error: Failed to initialize connect ECONNREFUSED 127.0.0.1:11434

To use CAgent with Ollama:
  1. Install Ollama: https://ollama.com
  2. Run: ollama pull llama3.1
  3. Run: ollama serve
  4. Then run: npm run dev
```
