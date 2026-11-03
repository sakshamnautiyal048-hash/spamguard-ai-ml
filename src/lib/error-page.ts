export function renderErrorPage(message = "Something went wrong") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Error — SpamGuard AI</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0a0a; color: #fafafa; }
    .card { text-align: center; padding: 2rem; border: 1px solid #333; border-radius: 12px; max-width: 420px; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #a1a1aa; }
    a { color: #22d3ee; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Oops</h1>
    <p>${message}</p>
    <p><a href="/">Back to home</a></p>
  </div>
</body>
</html>`;
}
