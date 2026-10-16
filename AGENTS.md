<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- WorkRadar uses mock data only (src/data/mockData.ts); all app state lives in the WorkProvider context (src/lib/store.tsx) persisted to localStorage — no real integrations or login.
- AI calls go through the `generateAi` server function (src/lib/ai.functions.ts → ai.server.ts) and every AI view must fall back to the template text in src/lib/derive.ts when AI fails.
