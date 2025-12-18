import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

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
      
      // Handle static assets and SPA routing with __STATIC_CONTENT binding
      try {
        const asset = await getAssetFromKV({
          request,
          waitUntil: ctx.waitUntil
        })
        
        return asset
      } catch (err) {
        // Not a static asset, check if it's a route for SPA
        // Return index.html for SPA routing (all non-API, non-asset routes)
        try {
          const indexRequest = new Request(new URL('/index.html', request.url).toString(), {
            method: 'GET'
          })
          
          const indexAsset = await getAssetFromKV({
            request: indexRequest,
            waitUntil: ctx.waitUntil
          })
          
          return indexAsset
        } catch (indexErr) {
          return new Response('Not found', { status: 404 })
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
