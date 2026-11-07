function json(body, status) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/submit') {
      if (url.pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404);
      return env.ASSETS.fetch(request);
    }

    if (request.method !== 'POST') {
      return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    }
    // Same-origin JSON submissions only. Do not expose a public CORS endpoint.
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return json({ error: 'Origin not allowed.' }, 403);
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return json({ error: 'Use application/json.' }, 415);
    }
    if (Number(request.headers.get('Content-Length')) > 2048) {
      return json({ error: 'Request too large.' }, 413);
    }

    let input;
    try {
      const text = await request.text();
      if (new TextEncoder().encode(text).length > 2048) return json({ error: 'Request too large.' }, 413);
      input = JSON.parse(text);
    } catch {
      return json({ error: 'Invalid JSON.' }, 400);
    }
    if (!input || typeof input !== 'object' || Array.isArray(input) ||
        Object.keys(input).some(key => !['name', 'email', 'consent'].includes(key))) {
      return json({ error: 'Only name, email, and consent are accepted.' }, 400);
    }
    if (input.consent !== true) return json({ error: 'Storage consent is required.' }, 400);
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const email = typeof input.email === 'string' ? input.email.trim() : '';
    if (!name || name.length > 31 || /[\u0000-\u001f\u007f]/.test(name)) {
      return json({ error: 'Enter a name between 1 and 31 characters.' }, 400);
    }
    if (email.length > 101 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Enter a valid email address of at most 101 characters.' }, 400);
    }

    try {
      // One atomic statement prevents repeated/concurrent requests from inserting
      // the same email again, without deleting or rewriting existing records.
      const result = await env.DB.prepare(
        'INSERT INTO submissions (name, email) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE email = ? COLLATE NOCASE)'
      )
        .bind(name, email, email)
        .run();
      return json({ success: true }, result.meta.changes === 0 ? 200 : 201);
    } catch {
      // Do not log personal information or expose database details.
      return json({ error: 'Unable to save your information. Please try again.' }, 503);
    }
  }
};

