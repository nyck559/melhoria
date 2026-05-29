import puppeteer from 'puppeteer'
import { mkdirSync } from 'fs'
mkdirSync('/tmp/shots',{recursive:true})
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']})
const p=await b.newPage()
const errs=[]; p.on('pageerror',e=>errs.push('ERR:'+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,140))})
await p.setViewport({width:460,height:900,deviceScaleFactor:2})
await p.goto('http://localhost:4203/',{waitUntil:'networkidle0'})
await new Promise(r=>setTimeout(r,2500))
await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].find(b=>b.textContent.trim().toUpperCase().includes('CAÇADOR'));x&&x.click()})
await new Promise(r=>setTimeout(r,4000))
await p.screenshot({path:'/tmp/shots/v7_3d.png'})
console.log('errors:', errs.slice(0,6).join(' | ')||'none')
await b.close()
