# Plan: Persona Distill Playground

**Date:** 2026-04-09
**Inspired by:** xixu-me/awesome-persona-distill-skills (1611 ⭐)

## What it does

Paste any text from a person (essays, tweets, transcripts, book excerpts) → Claude analyzes and distills their thinking style into a structured persona card (communication style, mental models, decision frameworks, characteristic phrases) → you can then chat with that distilled persona in real-time.

The persona isn't trying to impersonate the person — it's capturing their *cognitive fingerprint*: how they reason, what they optimize for, what they'd push back on.

## Where it fits

**Personal tooling for Daniel.** He's Head of Product AI/Automation/Integrations — constantly synthesizing ideas from product leaders, AI researchers, and systems thinkers. This gives him a way to stress-test ideas against different thinking frameworks interactively.

## Scoped MVP

1. **Preset personas** — 5 pre-loaded thinkers with actual excerpt text, so it works out-of-the-box:
   - Paul Graham (essays — startups, ideas, writing)
   - Andrej Karpathy (AI/software engineering philosophy)
   - Charlie Munger (mental models, decision-making)
   - Jeff Bezos (shareholder letters — customer obsession, long-term thinking)
   - Shreyas Doshi (product thinking, PM frameworks)

2. **Custom paste** — any text, any person

3. **Persona card** — after distillation: summary, top mental models, communication style, characteristic phrases, what they'd push back on

4. **Chat interface** — streaming chat with the distilled persona, shows "thinking as X" context

## Real data

- Preloaded excerpts from public essays, shareholder letters, and threads (actual quotes)
- Claude API via household OAuth token from `~/.claude/.credentials.json`

## Build tasks

1. Scaffold: Vite + React + TS + Tailwind (frontend) + Express (backend API + static serve)
2. Backend: `/api/distill` (POST text → persona JSON) + `/api/chat` (POST messages → stream)
3. Frontend: PersonaSelector, PersonaCard, ChatInterface components
4. Preset data: 5 personas with real excerpts
5. Deploy via pm2

## Tech

- Frontend: Vite + React + TypeScript + Tailwind CSS
- Backend: Express + @anthropic-ai/sdk
- Deploy: pm2 server app (port from 3460-3499 range)
- Live URL: https://mvp.trollefsen.com/2026-04-09-persona-distill/
