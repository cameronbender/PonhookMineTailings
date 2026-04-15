import data from '../server/data.json' with { type: 'json' }

/** Vercel Node serverless: GET /api/content (same path as local Express API). */
export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.end('Method Not Allowed')
    return
  }
  try {
    const body = JSON.stringify(data)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    res.end(body)
  } catch (err) {
    console.error('[api/content]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Failed to load content' }))
  }
}
