# Oweru General Assistant

A lightweight AI assistant for the main **oweru.com** corporate website —
answers questions about the company, lists the areas Oweru serves, and
helps with Mjengo Challenge (Oweru's land + build savings program).
Visitors who want to actually search rentals are directed to
[rental.oweru.com](https://rental.oweru.com/); the detailed property
search assistant lives in a separate, private repository.

## What this does

- Answers "what does Oweru do?" from a database row you can edit anytime
  (no code changes needed)
- Lists which regions/neighborhoods Oweru currently has listings in
- Lets Mjengo Challenge members check their contribution progress by
  phone number
- Registers new visitors' interest in joining Mjengo Challenge
- Tracks frequently asked questions automatically
- Ships as a single, dependency-free JavaScript widget — drop it into any
  page with one `<script>` tag

## What this does NOT do (by design)

Detailed property search, listing photos/prices, lead capture for
rentals, and WhatsApp/call escalation live in the **full** assistant on
the rental platform — kept as a separate system so the corporate site's
assistant stays fast, simple, and easy to reason about.

## Tech stack

Node.js + TypeScript + Express, PostgreSQL, [Groq](https://groq.com)
(Llama/GPT-OSS via function calling) for the AI, vanilla JS for the
widget — no frontend framework, no build step.

## Setup

1. Create a Postgres database and set `DATABASE_URL` in `.env` (copy
   from `.env.example`)
2. Get a free Groq API key at https://console.groq.com/keys, set
   `GROQ_API_KEY`
3. Install dependencies: `npm install`
4. Load the schema: `npm run db:setup` (or run
   `database/schema.sql` then `database/seed.sql` manually in a
   Postgres client)
5. Start the server: `npm run dev`
6. Open `widget/demo.html` in a browser to try it

## Editing the company description

No code change needed — update the database directly:

```sql
UPDATE company_info SET
  about_text = 'New description...',
  services = ARRAY['Service 1', 'Service 2']
WHERE id = 1;
```

## Embedding on oweru.com

```html
<script>
  window.OWERU_AGENT_CONFIG = {
    apiBaseUrl: "https://YOUR_DEPLOYED_BACKEND_URL"
  };
</script>
<script src="https://YOUR_HOSTED_WIDGET_URL/oweru-widget.js"></script>
```

## Admin dashboard

Open `widget/admin-dashboard.html`, enter your `ADMIN_API_KEY` (set in
`.env`) to see conversation stats, frequently asked questions, and
Mjengo Challenge member/contribution totals.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | Authenticates with the Groq API |
| `GROQ_MODEL` | Which Groq model to use |
| `OWERU_RENTAL_URL` | Where to send visitors who want to search rentals |
| `OWERU_MJENGO_CHALLENGE_URL` | Where to send visitors wanting full Mjengo Challenge program details |
| `OWERU_WORKS_URL` | Where to send contractors/professionals asking about work opportunities |
| `ALLOWED_ORIGINS` | Comma-separated list of domains allowed to call this API (set for production) |
| `ADMIN_API_KEY` | Key required to access `/admin/stats` |

## Project structure

```
oweru-general-agent/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── src/
│   ├── agent.ts          # AI logic (Groq function calling)
│   ├── analytics.ts       # /admin/stats query logic
│   ├── companyInfo.ts     # reads the editable company_info row
│   ├── conversations.ts   # conversation/message logging, FAQ tracking
│   ├── db.ts               # Postgres connection pool
│   ├── index.ts             # Express server
│   ├── mjengoChallenge.ts  # member progress + interest registration
│   └── properties.ts        # service-area listing (regions only)
└── widget/
    ├── oweru-widget.js      # embeddable chat widget
    ├── demo.html             # local test page
    └── admin-dashboard.html   # internal stats dashboard
```

## License

Private/internal project for Oweru — add a license here if this
repository will be public.
