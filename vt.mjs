import puppeteer from 'puppeteer'
import { mkdirSync } from 'fs'
mkdirSync('/tmp/shots',{recursive:true})
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']})
const p=await b.newPage()
await p.setViewport({width:430,height:920,deviceScaleFactor:2})
await p.goto('http://localhost:4202/',{waitUntil:'networkidle0'})
await new Promise(r=>setTimeout(r,500))
const go=async(t,f)=>{await p.evaluate(l=>{const x=[...document.querySelectorAll('button')].find(b=>b.textContent.includes(l));x&&x.click()},t);await new Promise(r=>setTimeout(r,600));await p.screenshot({path:f})}
await go('Checklist','/tmp/shots/fix_checklist.png')
await go('Calendário','/tmp/shots/fix_calendar.png')
await go('Recompensas','/tmp/shots/fix_rewards.png')
await b.close()
console.log('done')
