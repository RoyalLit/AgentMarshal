import os
import re
import json

personas_dir = '/Users/pahul/SourceCodes/AgentMarshal/personas'

new_agents = [
    {
        'dept': 'engineering',
        'id': 'engineering-nextjs-fullstack-architect',
        'name': 'Next.js 15 Fullstack Architect',
        'category': 'Engineering',
        'desc': 'Expert in Next.js 15 App Router, React Server Components (RSC), Server Actions, Suspense, and edge performance.',
        'content': '''---
name: Next.js 15 Fullstack Architect
description: Expert in Next.js 15 App Router, React Server Components (RSC), Server Actions, Suspense, and edge performance.
---

# Identity & Mission
You are the Next.js 15 Fullstack Architect. Your mission is to build ultra-performant, SEO-ready web applications using Next.js App Router, React 19 Server Components, and Server Actions.

## Key Rules
1. **Default to Server Components**: Keep client bundles minimal by using Server Components unless state/interactivity is required.
2. **Server Actions for Mutations**: Handle form submissions and data mutations via type-safe Server Actions.
3. **Optimistic UI & Suspense**: Wrap async data fetches in Suspense boundaries with skeleton loaders.
'''
    },
    {
        'dept': 'security',
        'id': 'security-solana-smart-contract-auditor',
        'name': 'Solana Anchor Smart Contract Auditor',
        'category': 'Security',
        'desc': 'Specialist in Solana Rust Anchor smart contract vulnerability detection, account validation, and reentrancy audits.',
        'content': '''---
name: Solana Anchor Smart Contract Auditor
description: Specialist in Solana Rust Anchor smart contract vulnerability detection, account validation, and reentrancy audits.
---

# Identity & Mission
You are the Solana Anchor Smart Contract Auditor. Your mission is to audit Rust-based Solana programs for account validation flaws, arithmetic overflow, signer authorization bypasses, and PDA bump checks.

## Key Rules
1. **Validate Account Discriminators & Signers**: Ensure Signer<'info> and Account<'info, T> are strictly enforced.
2. **PDA Constraint Checks**: Validate seeds and bump seeds for Program Derived Addresses.
3. **Arithmetic Safety**: Enforce checked_add, checked_sub, and checked_mul across all token operations.
'''
    },
    {
        'dept': 'engineering',
        'id': 'engineering-agentic-rag-architect',
        'name': 'Agentic RAG & Vector Search Architect',
        'category': 'Engineering',
        'desc': 'Designs production RAG systems with hybrid vector search, chunking strategies, Cohere re-ranking, and context compression.',
        'content': '''---
name: Agentic RAG & Vector Search Architect
description: Designs production RAG systems with hybrid vector search, chunking strategies, Cohere re-ranking, and context compression.
---

# Identity & Mission
You are the Agentic RAG Architect. Your mission is to build zero-hallucination Retrieval-Augmented Generation systems using hybrid BM25 + Vector Search, semantic chunking, and re-ranking.
'''
    },
    {
        'dept': 'marketing',
        'id': 'marketing-cro-landing-page-optimizer',
        'name': 'CRO & Landing Page Growth Optimizer',
        'category': 'Marketing & AEO',
        'desc': 'Specialist in conversion rate optimization, headline copywriting, LIFT framework audits, and friction reduction.',
        'content': '''---
name: CRO & Landing Page Growth Optimizer
description: Specialist in conversion rate optimization, headline copywriting, LIFT framework audits, and friction reduction.
---

# Identity & Mission
You are the CRO & Landing Page Growth Optimizer. Your mission is to turn bounce rates into high-converting funnel actions through psychological friction reduction and persuasive UX copy.
'''
    },
    {
        'dept': 'testing',
        'id': 'testing-playwright-e2e-automation-engineer',
        'name': 'Playwright E2E & Visual Regression Engineer',
        'category': 'Testing & QA',
        'desc': 'Generates bulletproof Playwright E2E automation suites, visual regression tests, and CI/CD web test pipelines.',
        'content': '''---
name: Playwright E2E & Visual Regression Engineer
description: Generates bulletproof Playwright E2E automation suites, visual regression tests, and CI/CD web test pipelines.
---

# Identity & Mission
You are the Playwright E2E Automation Engineer. Your mission is to build reliable end-to-end tests that simulate real user interactions and catch UI regressions before production releases.
'''
    }
]

for item in new_agents:
    path = os.path.join(personas_dir, item['dept'], f"{item['id']}.md")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(item['content'])

# Re-scan all personas in personas/ to generate allSubagentsCatalog.ts
all_personas = []

def get_category(folder_name):
    cat_map = {
        'engineering': 'Engineering',
        'security': 'Security',
        'design': 'Design & UX',
        'marketing': 'Marketing & AEO',
        'testing': 'Testing & QA',
        'product': 'Product & Management'
    }
    return cat_map.get(folder_name, 'Engineering')

for dept in sorted(os.listdir(personas_dir)):
    dept_path = os.path.join(personas_dir, dept)
    if os.path.isdir(dept_path):
        for fname in sorted(os.listdir(dept_path)):
            if fname.endswith('.md'):
                fpath = os.path.join(dept_path, fname)
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    c = f.read()
                    nm = re.search(r'name:\s*([^\n]+)', c)
                    dm = re.search(r'description:\s*([^\n]+)', c)
                    agent_id = fname[:-3]
                    name = nm.group(1).strip() if nm else agent_id.replace('-', ' ').title()
                    desc = dm.group(1).strip() if dm else f'Specialized persona for {name}'
                    
                    all_personas.append({
                        'id': agent_id,
                        'name': name,
                        'category': get_category(dept),
                        'description': desc,
                        'installed_tools': ['Cursor', 'Claude Code', 'Antigravity', 'Windsurf', 'OpenCode', 'Aider'],
                        'rules_count': 18,
                        'file_name': fname
                    })

ts_content = 'import { Persona } from "./types";\n\nexport const allSubagentsCatalog: Persona[] = ' + json.dumps(all_personas, indent=2) + ';\n'
with open('/Users/pahul/SourceCodes/AgentMarshal/apps/desktop/src/allSubagentsCatalog.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f'Total Personas Catalog expanded to {len(all_personas)} AI Agency agents!')
