import { Agent } from './agent/agent.js';
import { ConfigManager } from './core/config-manager.js';
import { ToolRegistry } from './agent/registry.js';
import { CrossProjectManager } from './cross-project/cross-project.js';

async function main() {
  ConfigManager.getInstance().updateConfig({
    llmBackend: 'ollama',
    model: { path: 'llama3.1', contextSize: 4096, gpuLayers: 30, temperature: 0.7, maxTokens: 2048 },
  });

  const agent = new Agent();
  await agent.initialize();

  // === Basic chat ===
  const response1 = await agent.process('Explain TypeScript generics in 3 sentences');
  console.log(response1.text);

  // === Tool usage ===
  // Agent will auto-use tools when needed (file, bash, code, search)
  const response2 = await agent.process('List all files in the current directory');
  console.log(response2.text);

  // === Learning ===
  // Agent learns from every interaction
  const response3 = await agent.process('Write a React useEffect hook');
  console.log(response3.text);

  // === Check learned skills ===
  const skills = agent.getKnowledgeBase().getSkillSuggestions();
  console.log('Learned skills:', skills);

  // === Cross-project ===
  const cp = agent.getCrossProject();
  await cp.registerProject('my-web-app', ['code', 'react', 'javascript']);
  const transferable = await cp.getTransferableSkills();
  console.log('Transferable skills:', transferable);

  // === Memory ===
  const memSize = agent.getMemory().getSize();
  console.log(`Memory: ${memSize.short} short, ${memSize.long} long`);

  // === Knowledge query ===
  const knowledge = await agent.getKnowledgeBase().ask('React hooks');
  if (knowledge) {
    console.log('Related knowledge:', knowledge);
  }

  // === Programmatic tool use ===
  const registry = agent.getToolRegistry();
  const fileTool = registry.get('read_file');
  if (fileTool) {
    const result = await fileTool.execute({ path: './package.json' });
    console.log('File content:', result.success ? result.output.substring(0, 200) : result.error);
  }

  console.log('\nAll examples completed!');
}

main().catch(console.error);
