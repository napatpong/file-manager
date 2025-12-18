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
      
      // Serve static assets by proxying to origin or falling back to index.html for SPA
      // Since KV is empty, serve from default static asset handler
      let filePath = path === '/' ? '/index.html' : path
      
      // Default Cloudflare behavior will serve from local assets
      // For non-API paths, try to serve static files, then fall back to index.html for SPA routing
      const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.json', '.map']
      const isStaticFile = staticExtensions.some(ext => filePath.endsWith(ext))
      
      if (isStaticFile) {
        // Let Cloudflare serve static files from the deployment
        return fetch(request)
      }
      
      // For SPA routing, return index.html for unknown routes
      try {
        return fetch(new Request(url.origin + '/index.html', { method: 'GET' }))
      } catch (err) {
        return new Response('Not found', { status: 404 })
      }
    } catch (error) {
      return new Response('Internal Server Error: ' + error.message, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
  }
}
