# CLAUDE.md - Hazelnode

Workflow automation platform built on Frappe framework with React frontend.

## Tech Stack

**Backend:** Python 3.10+, Frappe 15.0+, MariaDB 10.6+, Redis
**Frontend:** React 18, TypeScript, Vite, TanStack Router/Query, Zustand, ReactFlow, Tailwind CSS

## Project Structure

```
hazelnode/
├── hazelnode/                 # Python backend (Frappe app)
│   ├── hazelnode/doctype/     # Data models (workflows, nodes, logs)
│   ├── nodes/                 # Node implementations
│   │   ├── actions/           # Email, API call, condition, create/update doc, etc.
│   │   ├── triggers/          # Webhook, schedule, document events
│   │   └── __init__.py        # Abstract Node base class
│   ├── fixtures/              # Standard node types (JSON)
│   ├── hooks.py               # Frappe hooks
│   └── api.py                 # REST endpoints
├── frontend/                  # React app
│   └── src/
│       ├── components/        # UI, nodes, workflows
│       ├── routes/            # TanStack Router pages
│       ├── stores/            # Zustand state (editor.ts)
│       └── queries/           # React Query definitions
├── pyproject.toml             # Python config + Ruff settings
└── .pre-commit-config.yaml    # Pre-commit hooks
```

## Commands

```bash
# Tests
bench --site test_site run-tests --app hazelnode

# Frontend dev
cd frontend && npm run dev      # Port 8080
cd frontend && npm run build    # Build to ../hazelnode/public/frontend/

# Linting
ruff check .                    # Python lint
ruff format .                   # Python format
cd frontend && npm run lint     # TypeScript lint
```

## Code Style

**Python:** Ruff formatter/linter. Line length 70, tabs, single quotes.
**TypeScript:** ESLint + Prettier. Strict mode enabled.

Pre-commit hooks auto-run on commit (ruff format, ruff check, import sorting).

## Architecture

### Workflow Execution
- Graph-based execution with context passing between nodes
- Triggers: Schedule (CRON), Document Event, Webhook
- Actions: Email, API Call, Condition, Create/Update Doc, Set Variable, Log, Delay
- Condition nodes return `{branch: 'true'|'false'}` for branching

### Key Doctypes
- `Hazel Workflow` - Workflow definition with nodes/connections
- `Hazel Node` - Individual node config
- `Hazel Node Type` - Node type definitions (fixtures)
- `Hazel Workflow Execution Log` - Execution history

### Frontend State
- Editor store (Zustand): nodes, edges, flow state
- React Query: server state for workflows/users
- ReactFlow: visual workflow editor

## Key Files

| File | Purpose |
|------|---------|
| `hazelnode/hazelnode/doctype/hazel_workflow/hazel_workflow.py` | Workflow execution logic |
| `hazelnode/nodes/__init__.py` | Abstract Node base class |
| `hazelnode/nodes/triggers/hazel_webhook_handler.py` | Webhook handler |
| `hazelnode/hooks.py` | Frappe hooks, fixtures, routing |
| `frontend/src/stores/editor.ts` | Zustand editor state |
| `frontend/src/routes/workflow.$id.tsx` | Workflow editor page |

## Conventions

- Node IDs: `node_${counter}_${timestamp}`
- Template vars in params: `{{ variable_name }}`
- API endpoints: `@frappe.whitelist()` decorator
- Error handling: `frappe.throw()` for user errors
- Frontend basepath: `/hazelnode`

## CI/CD

- Triggers on `develop` branch push and all PRs
- Services: MariaDB 10.6, Redis (ports 13000, 11000)
- Python 3.14, Node 24
- Runs: `bench --site test_site run-tests --app hazelnode`
