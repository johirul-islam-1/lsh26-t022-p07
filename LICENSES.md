# Third-Party Material and AI Disclosure

This file declares the material third-party frameworks, libraries, UI primitives, icons, development tools, organizer-provided data, and AI tools used in the ReconFlow P07 repository.

## Third-Party Material

| Name | Version or source | Licence | Used for |
| --- | --- | --- | --- |
| Next.js | 16.3.3 | MIT | Full-stack React framework, routing, API routes, and production server |
| React | 19.2.8 | MIT | User interface |
| React DOM | 19.2.8 | MIT | React DOM rendering |
| Zod | 4.5.4 | MIT | Runtime validation of reconciliation input data |
| @radix-ui/react-tabs | 1.1.21 | MIT | Accessible tab UI primitive |
| lucide-react | 1.37.0 | ISC | Application icons |
| Tailwind CSS | 4.3.3 | MIT | Application styling |
| @tailwindcss/postcss | 4.3.3 | MIT | Tailwind PostCSS integration |
| TypeScript | 5.9.2 | Apache-2.0 | Static typing and development |
| Vitest | 4.1.11 | MIT | Automated testing |
| ESLint | 9.39.5 | MIT | Static code analysis and linting |
| @eslint/js | 9.39.5 | MIT | ESLint JavaScript configuration |
| @next/eslint-plugin-next | 16.3.3 | MIT | Next.js-specific linting |
| typescript-eslint | 8.68.0 | MIT | TypeScript ESLint integration |
| @types/node | 22.18.0 | MIT | Node.js TypeScript definitions |
| @types/react | 19.1.12 | MIT | React TypeScript definitions |
| @types/react-dom | 19.1.9 | MIT | React DOM TypeScript definitions |

## Organizer-Provided Data

The reconciliation dataset used by ReconFlow is the official public P07 fixture supplied by the LofiStack Hackathon 2026 organizers:

```text
src/data/P07_reconciliation_public.json
```

The project does not claim ownership of this organizer-provided fixture.

## Assets and External Services

ReconFlow does not use:

- stock images;
- purchased asset packs;
- external fonts;
- copied application templates;
- commercial UI kits;
- external databases;
- third-party reconciliation APIs;
- hosted LLM APIs at application runtime;
- external analytics services.

Icons used by the user interface come from `lucide-react` and are declared above.

## AI Tools

### ChatGPT / OpenAI

**Used for:**

- project planning;
- architecture and system-design assistance;
- implementation assistance;
- debugging;
- test design;
- documentation;
- hackathon development support.

**How the output was verified:**

AI-assisted work was reviewed by the team and verified using:

- TypeScript type checking;
- ESLint;
- automated Vitest tests;
- all-case reconciliation regression tests;
- production Next.js builds;
- API smoke tests;
- manual browser testing;
- human review of the final functionality.

The production reconciliation engine itself does not call an LLM or other hosted AI service.

## Original-Work Statement

Everything not declared in this file or `EVENT.md` was created by the registered team during the event window.