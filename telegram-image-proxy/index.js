addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request, event))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request, event) {
  const path = request.url // https://reroll.in/telegram-image-proxy/fileId.jpeg
  const rg = new RegExp('.*/(.+).jpeg')
  const matches = path.match(rg)
  // Construct the cache key from the cache URL
  const cacheKey = new Request(request.url.toString(), request)
  const cache = caches.default

  // Check whether the value is already available in the cache
  // if not, you will need to fetch it from origin, and store it in the cache
  // for future access
  let response = await cache.match(cacheKey)
  if (!response) {
    try {
      const fileId = matches[1]
      const fileRespone = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`,
      )
      const file = await fileRespone.json()
      const res = await fetch(
        `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.result.file_path}`,
      )

      response = new Response(res.body, {
        headers: { 'content-type': 'image/jpeg' },
      })
      response.headers.append('Cache-Control', 's-maxage=31536000')
    } catch (e) {
      response = new Response('Not found!', {
        status: 404,
        headers: { 'content-type': 'text/plain' },
      })
    }
  }
  event.waitUntil(cache.put(cacheKey, response.clone()))
  return response
}
