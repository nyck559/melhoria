import { Capacitor, registerPlugin } from '@capacitor/core'
import { useGame, tasksForDay } from './store/useGame'

interface WidgetBridgePlugin {
  update(options: { data: string }): Promise<void>
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge')

/** Push today's checklist into the native widget (no-op off Android). */
export function syncWidget() {
  if (Capacitor.getPlatform() !== 'android') return
  try {
    const s = useGame.getState()
    const list = tasksForDay(s.tasks)
    const tasks = list.map((t) => ({ nome: t.nome, done: s.doneToday.includes(t.id) }))
    const payload = {
      date: new Date().toISOString().slice(0, 10),
      done: tasks.filter((t) => t.done).length,
      total: tasks.length,
      tasks,
    }
    WidgetBridge.update({ data: JSON.stringify(payload) }).catch(() => {})
  } catch {
    /* ignore */
  }
}

/** Subscribe so the widget updates whenever tasks change. */
export function initWidgetSync() {
  if (Capacitor.getPlatform() !== 'android') return () => {}
  syncWidget()
  return useGame.subscribe(syncWidget)
}
