import puppeteer from 'puppeteer'
import { mkdirSync } from 'fs'
mkdirSync('/tmp/shots', { recursive: true })

const b = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
         '--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-insecure-localhost']
})
const p = await b.newPage()
const errs = [], reqs = []
p.on('pageerror', e => errs.push('JS:' + e.message.slice(0,100)))
p.on('console', m => { if (m.type()==='error') errs.push('C:' + m.text().slice(0,120)) })
p.on('response', r => { if (r.url().includes('/models/')) reqs.push(r.status()+' '+r.url().split('/').pop()) })

await p.setViewport({ width: 460, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:4202/', { waitUntil: 'networkidle0', timeout: 20000 })

// click CAÇADOR tab
await p.evaluate(() => {
  const btn = [...document.querySelectorAll('button')]
    .find(b => b.textContent.trim().toUpperCase().includes('CAÇADOR'))
  btn?.click()
})
await new Promise(r => setTimeout(r, 800))
await p.screenshot({ path: '/tmp/shots/m1_loading.png' })

// wait for models to stream in over swiftshader
await new Promise(r => setTimeout(r, 8000))
await p.screenshot({ path: '/tmp/shots/m2_ready.png' })

// tap canvas to fire aura burst
await p.mouse.click(230, 320)
await new Promise(r => setTimeout(r, 700))
await p.screenshot({ path: '/tmp/shots/m3_tap.png' })

// switch to STATUS screen
await p.evaluate(() => {
  const btn = [...document.querySelectorAll('button')]
    .find(b => b.textContent.trim().toUpperCase().includes('STATUS'))
  btn?.click()
})
await new Promise(r => setTimeout(r, 5000))
await p.screenshot({ path: '/tmp/shots/m4_status.png' })

const hasCanvas = await p.evaluate(() => !!document.querySelector('canvas'))
console.log('canvas:', hasCanvas)
console.log('model requests:', reqs.join(', ') || 'none')
console.log('errors:', errs.filter(e => !e.includes('CERT')&&!e.includes('404')).slice(0,6).join(' | ') || 'none')
await b.close()
