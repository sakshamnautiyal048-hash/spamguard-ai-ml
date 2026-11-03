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

## Architecture
- Email ML: Python API (`ml/`, via `VITE_ML_API_URL`) takes priority; otherwise an in-browser Naive Bayes trained from a user-uploaded CSV (`src/lib/nb-model.ts`, stored in localStorage); otherwise labelled heuristics. Why: real ML only, clearly labelled.
- Phone checks are format-only (libphonenumber-js) until a real reputation API is connected; never fabricate reputation. Why: no fake data.
- Scan history lives in browser localStorage with masked targets, never message bodies. Why: privacy.
