# Tools

CAgent includes 6 built-in tools that the agent can use autonomously. Tools can also be called programmatically.

## Tool Registry

```typescript
import { Agent } from './agent/agent.js';

const agent = new Agent();
await agent.initialize();

// List all tools
const tools = agent.getToolRegistry().getAll();
const names = agent.getToolRegistry().getToolNames();

// Get specific tool
const fileTool = agent.getToolRegistry().get('read_file');

// Register custom tool
import { RegisteredTool } from './tools/types.js';
agent.getToolRegistry().register({
  definition: {
    name: 'my_tool',
    description: 'Does something custom',
    parameters: { arg1: { type: 'string', description: 'An argument', required: true } },
  },
  execute: async (args) => ({ success: true, output: String(args.arg1) }),
});
```

## Built-in Tools

### 1. read_file

Read contents of a file.

```typescript
const result = await fileTool.execute({
  path: './src/agent/agent.ts',
});
// result.success → true
// result.output → File contents as string
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ✅ | Path to file (relative or absolute) |

### 2. write_file

Write content to a file. Overwrites if exists.

```typescript
const result = await write_tool.execute({
  path: './output.txt',
  content: 'Hello, World!',
});
// result.output → "Wrote 13 chars to ./output.txt"
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ✅ | Path to file |
| `content` | string | ✅ | Content to write |

### 3. list_files

List files in a directory.

```typescript
const result = await list_tool.execute({
  path: './src',
});
// result.output → "agent/\ncore/\ntools/\n..."
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ❌ (default: `.`) | Directory path |

### 4. execute_bash

Execute a shell command. ⚠️ Use carefully - has full system access.

```typescript
const result = await bash_tool.execute({
  command: 'node --version',
});
// result.output → "v26.3.1"
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | string | ✅ | Command to execute |

**Safety:**
- Max execution time: 30 seconds
- Max buffer: 10MB
- Errors caught and returned in `result.error`

### 5. execute_code

Execute JavaScript/TypeScript code in a sandbox.

```typescript
const result = await code_tool.execute({
  code: 'const x = 42; x * 2;',
});
// result.output → "84"

// Console output is captured too:
// code: "console.log('hello'); 42;"
// output: "hello42"
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | ✅ | JavaScript code to execute |

**⚠️ Warning:** Code runs in the same process via `eval()`. Never use with untrusted input in production.

### 6. web_search

Search the web using DuckDuckGo.

```typescript
const result = await search_tool.execute({
  query: 'TypeScript best practices 2025',
});
// result.output → Search result snippets
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | Search query |

## Tool Result Format

```typescript
interface ToolResult {
  success: boolean;
  output: string;       // Result output on success
  error?: string;       // Error message on failure
}
```

## Tool Invocation by Agent

When the agent decides a tool is needed, it extracts tool calls from its response:

```
[TOOL:read_file(path="./package.json")]
```

The agent executes the tool automatically and includes the result in its next LLM call.

## Adding Custom Tools

```typescript
import { RegisteredTool } from './tools/types.js';

const customTool: RegisteredTool = {
  definition: {
    name: 'fetch_url',
    description: 'Fetch content from a URL',
    parameters: {
      url: { type: 'string', description: 'URL to fetch', required: true },
    },
  },
  execute: async (args) => {
    const res = await fetch(String(args.url));
    const text = await res.text();
    return { success: true, output: text.substring(0, 10000) };
  },
};

agent.getToolRegistry().register(customTool);
```
