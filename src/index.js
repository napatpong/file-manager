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
        const backendUrl = new URL(path + url.search, apiUrl)
        
        // Create headers for backend request
        const backendHeaders = new Headers(request.headers)
        backendHeaders.delete('host')
        
        const response = await fetch(backendUrl.toString(), {
          method: request.method,
          headers: backendHeaders,
          body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
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
      
      // Handle static assets from KV
      let filePath = path === '/' ? '/index.html' : path
      
      try {
        const asset = await env.drive_manager.get(filePath, { type: 'arrayBuffer' })
        
        if (asset) {
          let contentType = 'application/octet-stream'
          if (filePath.endsWith('.html')) contentType = 'text/html; charset=utf-8'
          else if (filePath.endsWith('.css')) contentType = 'text/css'
          else if (filePath.endsWith('.js')) contentType = 'application/javascript'
          else if (filePath.endsWith('.json')) contentType = 'application/json'
          else if (filePath.endsWith('.png')) contentType = 'image/png'
          else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg'
          else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml'
          else if (filePath.endsWith('.woff')) contentType = 'font/woff'
          else if (filePath.endsWith('.woff2')) contentType = 'font/woff2'
          
          return new Response(asset, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': filePath.endsWith('.js') || filePath.endsWith('.css') ? 'public, max-age=0, must-revalidate' : filePath.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600'
            }
          })
        }
      } catch (err) {
        // File not found, will return index.html
      }
      
      // Return index.html for SPA routing on all unknown paths
      try {
        const indexHtml = await env.drive_manager.get('/index.html', { type: 'text' })
        return new Response(indexHtml, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })
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
