# Cross-Project Skill Sharing

CAgent's cross-project system allows skills learned in one project to be transferred and reused in another.

## Overview

```
Project A (web-app)          Project B (api-server)
    │                              │
    │  ┌──────────────────────┐     │
    │  │  Shared Skills       │     │
    │  │  • code              │     │
    │  │  • react             │     │
    │  │  • javascript        │─────┤───► Shared
    │  │  • typescript        │     │
    │  └──────────────────────┘     │
    │                              │
    ▼                              ▼
  Skills: [code, react,    Skills: [code, node,
          typescript, css]          sql, typescript]
```

## Usage

### Register a Project

```typescript
const cp = agent.getCrossProject();

await cp.registerProject('web-app', ['react', 'javascript', 'css']);
await cp.registerProject('api-server', ['node', 'sql', 'typescript']);
```

### Share Skills

```typescript
// Share a skill from one project to another
await cp.shareSkill({
  name: 'typescript',
  description: 'TypeScript development',
  usageCount: 15,
  transferable: true,
});

// Get all transferable skills
const skills = await cp.getTransferableSkills();
```

### Transfer Skills Between Projects

```typescript
// Transfer specific skills to another project
await cp.transferToProject('api-server', ['typescript', 'code']);

// Recommend skills for a project (not yet learned)
const suggestions = await cp.recommendSkills('web-app');
// Returns: ['node', 'sql'] (skills from other projects you haven't learned yet)
```

### Export/Import Profiles

```typescript
// Export project profile as JSON
const json = await cp.exportProfile('web-app');

// Import a profile from JSON
await cp.importProfile(json);
```

### Project Management

```typescript
const cp = agent.getCrossProject();

// List all projects
const projects = cp.listProjects();
// → ['web-app', 'api-server']

// Get skills for a project
const skills = cp.getProjectSkills('web-app');
// → [{ name: 'react', usageCount: 10 }, ...]
```

## Skill Object

```typescript
interface Skill {
  name: string;
  description: string;
  usageCount: number;
  lastUsed?: string;
  transferable: boolean;  // Can this skill be shared?
}
```

## Project Profile

```typescript
interface ProjectProfile {
  name: string;
  skills: Skill[];
  knowledgeAreas: string[];
  lastActive?: string;
}
```

## Use Cases

1. **Learn once, apply everywhere**: Learn React in web project → automatically available in full-stack project
2. **Skill gap analysis**: Use `recommendSkills()` to find what to learn next
3. **Team sharing**: Export/import profiles to share between team members
4. **Project migration**: Transfer skills when moving between projects

## Integration with Learning System

Skills are automatically extracted from every agent response:

```typescript
// When Agent.process() is called:
await agent.process('Build a React component');
// → Skills detected: [code, react, typescript]
// → Added to current project's skill list
// → Available for cross-project sharing
```
