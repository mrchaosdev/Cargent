import { Agent } from '../agent/agent.js';
import { config } from '../core/config.js';
import { Logger } from '../core/logger.js';

async function main() {
  const logger = Logger.getInstance();
  logger.info('CAgent - Trainable AI Agent');
  logger.info(`Hardware: RTX 3060 12GB + 32GB RAM`);
  logger.info(`Backend: ${config.llmBackend}`);
  logger.info(`Model path: ${config.model.path}`);

  const agent = new Agent();

  try {
    await agent.initialize();
    logger.info('Agent ready. Type your message (or "quit" to exit).');

    const { stdin, stdout } = process;
    stdin.setEncoding('utf-8');
    stdout.write('\n> ');

    stdin.on('data', async (data: string) => {
      const input = data.trim();
      if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
        logger.info('Shutting down...');
        process.exit(0);
      }
      if (input.toLowerCase() === 'skills') {
        const skills = agent.getKnowledgeBase().getSkillSuggestions();
        stdout.write(`\nSkills: ${skills.join(', ') || 'none'}\n\n> `);
        return;
      }
      if (input.toLowerCase() === 'projects') {
        const projects = agent.getCrossProject().listProjects();
        stdout.write(`\nProjects: ${projects.join(', ') || 'none'}\n\n> `);
        return;
      }
      if (input.toLowerCase() === 'memories') {
        const size = agent.getMemory().getSize();
        stdout.write(`\nMemory - Short: ${size.short}, Long: ${size.long}\n\n> `);
        return;
      }

      try {
        const response = await agent.process(input);
        stdout.write(`\n${response.text}\n\n`);
        if (response.skills && response.skills.length > 0) {
          stdout.write(`[Skills detected: ${response.skills.join(', ')}]\n\n`);
        }
      } catch (err) {
        stdout.write(`\nError: ${err instanceof Error ? err.message : String(err)}\n\n`);
      }
      stdout.write('> ');
    });
  } catch (err) {
    logger.error('Failed to initialize', err instanceof Error ? err.message : String(err));
    console.error('\nTo use CAgent with Ollama:');
    console.error('  1. Install Ollama: https://ollama.com');
    console.error('  2. Run: ollama pull llama3.1');
    console.error('  3. Run: ollama serve');
    console.error('  4. Then run: npm run dev');
    process.exit(1);
  }
}

main();
