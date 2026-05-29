import puppeteer from 'puppeteer'
import { mkdirSync } from 'fs'
mkdirSync('/tmp/shots',{recursive:true})
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']})
const p=await b.newPage()
const errs=[]; p.on('pageerror',e=>errs.push('ERR:'+e.message))
await p.setViewport({width:460,height:900,deviceScaleFactor:2})
await p.goto('http://localhost:4201/',{waitUntil:'networkidle0'})
await new Promise(r=>setTimeout(r,2500))
// tap the character area (center of hero on Status ~ y 230)
const box = {x:230, y:230}
await p.mouse.move(box.x, box.y)
await p.mouse.down(); await new Promise(r=>setTimeout(r,60)); await p.mouse.up()
await new Promise(r=>setTimeout(r,350))
const bubble = await p.evaluate(()=>{
  const els=[...document.querySelectorAll('span')].map(s=>s.textContent).filter(Boolean)
  // find a line that looks like a character quote
  return els.find(t=>/forte|desist|Levante|dia|Monarca|sombras|escurid|resistir|poder|evolu/i.test(t))||null
})
await p.screenshot({path:'/tmp/shots/v5_tap.png'})
// drag to tilt
await p.mouse.move(230,230); await p.mouse.down()
await p.mouse.move(330,180,{steps:8}); await new Promise(r=>setTimeout(r,200))
await p.screenshot({path:'/tmp/shots/v5_tilt.png'})
await p.mouse.up()
console.log('speech bubble:', bubble)
console.log('errors:', errs.join(' | ')||'none')
await b.close()
