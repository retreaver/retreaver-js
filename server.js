import http from 'http'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Test server for examples/ dir
// yarn serve

const exampleHtml = 'examples/index.html'
const __dirname = resolve(fileURLToPath(import.meta.url), '..')

const server = http.createServer(async (req, res) => {
  let filePath

  if (req.url === '/') {
    filePath = resolve(__dirname, exampleHtml)
  } else if (req.url.startsWith('/dist/')) {
    filePath = resolve(__dirname, `.${req.url}`)
  } else {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  try {
    const content = await readFile(filePath)
    const contentType = filePath.endsWith('.js') ? 'text/javascript' : 'text/html'
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(content)
  } catch {
    res.writeHead(404)
    res.end('File not found')
  }
})

const PORT = 8080
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
