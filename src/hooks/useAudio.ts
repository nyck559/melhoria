import { create } from 'zustand'

type Sfx = 'ui' | 'xp' | 'levelup' | 'corruption' | 'menu' | 'challenge'

interface AudioState {
  enabled: boolean
  ctx: AudioContext | null
  droneNode: { osc: OscillatorNode[]; gain: GainNode } | null
  toggle: () => void
  play: (s: Sfx) => void
}

function ensureCtx(get: () => AudioState): AudioContext | null {
  let { ctx } = get()
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function blip(ctx: AudioContext, freq: number, dur: number, type: OscillatorType, vol = 0.18, glideTo?: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + dur)
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + dur + 0.02)
}

export const useAudio = create<AudioState>((set, get) => ({
  enabled: false,
  ctx: null,
  droneNode: null,

  toggle: () => {
    const next = !get().enabled
    if (next) {
      const ctx = ensureCtx(get)
      if (!ctx) return
      // dark ambient drone: two detuned low oscillators through a slow LFO gain
      const gain = ctx.createGain()
      gain.gain.value = 0.04
      const o1 = ctx.createOscillator()
      const o2 = ctx.createOscillator()
      o1.type = 'sine'; o1.frequency.value = 55
      o2.type = 'sawtooth'; o2.frequency.value = 55.6
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'; lp.frequency.value = 240
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.08; lfoGain.gain.value = 0.025
      lfo.connect(lfoGain).connect(gain.gain)
      o1.connect(lp); o2.connect(lp); lp.connect(gain).connect(ctx.destination)
      o1.start(); o2.start(); lfo.start()
      set({ enabled: true, ctx, droneNode: { osc: [o1, o2, lfo], gain } })
    } else {
      const { droneNode } = get()
      if (droneNode) {
        droneNode.gain.gain.exponentialRampToValueAtTime(0.0001, (get().ctx?.currentTime ?? 0) + 0.4)
        setTimeout(() => droneNode.osc.forEach((o) => { try { o.stop() } catch {} }), 500)
      }
      set({ enabled: false, droneNode: null })
    }
  },

  play: (s) => {
    if (!get().enabled) return
    const ctx = ensureCtx(get)
    if (!ctx) return
    switch (s) {
      case 'ui':         blip(ctx, 880, 0.07, 'triangle', 0.10); break
      case 'menu':       blip(ctx, 520, 0.10, 'sine', 0.10, 760); break
      case 'xp':         blip(ctx, 660, 0.10, 'square', 0.10, 990); break
      case 'levelup':
        blip(ctx, 440, 0.18, 'sawtooth', 0.14, 880)
        setTimeout(() => blip(ctx, 880, 0.3, 'triangle', 0.14, 1320), 120)
        break
      case 'challenge':  blip(ctx, 180, 0.4, 'sawtooth', 0.16, 60); break
      case 'corruption': blip(ctx, 120, 0.5, 'sawtooth', 0.14, 48); break
    }
  },
}))
