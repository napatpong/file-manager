import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url)
      const path = url.pathname
      
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
          }
        })
      }
      
      // Handle API requests - proxy to backend
      if (path.startsWith('/api/')) {
        const apiUrl = env.API_URL || 'http://localhost:2087'
        
        // For file uploads, stream directly without buffering to avoid 413 limits
        if (path === '/api/files/upload' && request.method === 'POST') {
          const backendUrl = new URL(path + url.search, apiUrl)
          const backendHeaders = new Headers(request.headers)
          backendHeaders.delete('host')
          
          try {
            const response = await fetch(backendUrl.toString(), {
              method: 'POST',
              headers: backendHeaders,
              body: request.body,
              duplex: 'half'
            })
            
            const responseHeaders = new Headers(response.headers)
            responseHeaders.set('Access-Control-Allow-Origin', '*')
            responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            
            return new Response(response.body, {
              status: response.status,
              headers: responseHeaders
            })
          } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            })
          }
        }
        
        const backendUrl = new URL(path + url.search, apiUrl)
        
        // Create headers for backend request
        const backendHeaders = new Headers(request.headers)
        backendHeaders.delete('host')
        
        // For large file uploads, use clone and stream the body
        const clonedRequest = request.clone()
        const response = await fetch(backendUrl.toString(), {
          method: request.method,
          headers: backendHeaders,
          body: request.method !== 'GET' && request.method !== 'HEAD' ? clonedRequest.body : undefined
        })
        
        // Add CORS headers to response
        const responseHeaders = new Headers(response.headers)
        responseHeaders.set('Access-Control-Allow-Origin', '*')
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        
        return new Response(response.body, {
          status: response.status,
          headers: responseHeaders
        })
      }
      
      // Handle static assets and SPA routing
      // Try to get static assets from KV (if populated) or return index.html for SPA
      try {
        const asset = await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil
          },
          {
            ASSET_NAMESPACE: env.drive_manager,
            ASSET_MANIFEST: undefined,
            cacheControl: {
              default: 'no-cache, no-store, must-revalidate',
              'max-age=31536000': ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'woff', 'woff2']
            },
            mapRequestToAsset: request => mapRequestToAsset(new Request(new URL(request.url).pathname === '/' ? '/index.html' : request.url, request))
          }
        )
        
        return asset
      } catch (err) {
        // Fall back to serving index.html for SPA routing
        try {
          const indexAsset = await getAssetFromKV(
            {
              request: new Request(new URL('/index.html', request.url).toString(), {
                method: 'GET',
                headers: request.headers
              }),
              waitUntil: ctx.waitUntil
            },
            {
              ASSET_NAMESPACE: env.drive_manager,
              ASSET_MANIFEST: undefined,
              cacheControl: {
                default: 'no-cache, no-store, must-revalidate'
              }
            }
          )
          
          return indexAsset
        } catch (fallbackErr) {
          // If KV is empty, serve a minimal index.html
          return new Response(
            `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>File Manager</title>
    <script type="module" crossorigin src="/assets/index-DNwVaC2R.js"><\/script>
    <link rel="stylesheet" crossorigin href="/assets/index-C6nvBeLd.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
            {
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              }
            }
          )
        }
      }
    } catch (error) {
      return new Response('Internal Server Error: ' + error.message, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
  }
}
