import { createRequire } from 'node:module'
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import UglifyJS from 'uglify-js';

// # Build for development and production
// yarn build

// # Generate documentation
// yarn docs

// # Clean build artifacts
// yarn clean

// # Run the server for /examples/index.html
// yarn serve

// Resolve project root from this file's location
const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

// Input files in the same order as Gruntfile.js
const sourceFiles = [
    'src/retreaver.js',
    'src/retreaver/base/helpers.js',
    'src/retreaver/base/cookies.js',
    'src/retreaver/base/base64.js',
    'src/retreaver/base/data.js',
    'src/retreaver/base/model.js',
    'src/retreaver/base/request.js',
    'src/retreaver/base/request_number.js',
    'src/retreaver/cache.js',
    'src/retreaver/number.js',
    'src/retreaver/campaign.js',
    'src/retreaver/callpixels.js',
    'src/retreaver/vendor/find_and_replace_dom_text.js'
].map(p => resolve(__dirname, p))

// Get the name and version from package.json
const pkg = JSON.parse(await readFile(resolve(__dirname, 'package.json'), 'utf8'))
const outputName = pkg.name // 'retreaver'
const distDir = resolve(__dirname, 'dist')

async function concatenateFilesToString(files) {
    const contents = await Promise.all(files.map(p => readFile(p, 'utf8')))
    return contents.join(';' + '\n') + '\n'
}

function createContentHash(content) {
    return createHash('md5').update(content).digest('hex').substring(0, 8)
}

async function shouldRebuild(outputPath, newContent) {
    try {
        const existingContent = await readFile(outputPath, 'utf8')
        const existingHash = existingContent.match(/\/\*! .* \| \d{4}-\d{2}-\d{2} \| ([a-f0-9]{8}) \*\//)?.[1]
        const newHash = createContentHash(newContent)
        
        // If no existing hash or hashes don't match, we need to rebuild
        return !existingHash || existingHash !== newHash
    } catch (error) {
        // File doesn't exist or can't be read, so we need to rebuild
        return true
    }
}

async function build() {
    console.log('Building Retreaver.js...')

    // Ensure dist directory exists
    await mkdir(distDir, { recursive: true })

    try {
        // Step 1: Concatenate source files in order
        const concatenated = await concatenateFilesToString(sourceFiles)
        const contentHash = createContentHash(concatenated)
        
        const devOutputPath = resolve(distDir, `${outputName}.js`)
        const minOutputPath = resolve(distDir, `${outputName}.min.js`)

        // Check if we need to rebuild the development version
        // We include a hash in the banner and compare it to the existing hash
        const needsDevRebuild = await shouldRebuild(devOutputPath, concatenated)
        
        if (needsDevRebuild) {
            // Step 2: Create development build (unminified)
            const today = new Date().toISOString().split('T')[0]
            const banner = `/*! ${pkg.name} v${pkg.version} | ${today} | ${contentHash} */`
            const devContent = `${banner}\n${concatenated}`
            await writeFile(devOutputPath, devContent)
            console.log(`   Updated dist/${outputName}.js`)

            // Step 3: Create production build (minified) - only if dev changed
            const uglifyResult = UglifyJS.minify(concatenated, {
                fromString: true, // grunt used this mode
                compress: {
                    warnings: false, // grunt default
                    dead_code: true,
                    drop_console: false,
                    drop_debugger: true,
                    keep_infinity: true,
                    passes: 1
                },
                mangle: {
                    toplevel: false // grunt did NOT mangle toplevel by default
                },
                output: {
                    comments: /^!|@preserve/i, // grunt's regex for keeping banners
                    ascii_only: true
                }
            })
            if (uglifyResult.error) throw uglifyResult.error
            
            await writeFile(minOutputPath, `${banner}\n${uglifyResult.code}`)
            console.log(`   Updated dist/${outputName}.min.js`)
        } else {
            console.log(`   Skipped dist/${outputName}.js (no changes)`)
            console.log(`   Skipped dist/${outputName}.min.js (no changes)`)
        }

        console.log('Build complete!')

    } catch (error) {
        console.error('Build failed:', error)
        process.exit(1)
    }
}

await build()
