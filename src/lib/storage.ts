import { createStore } from 'idb-keyval'

const DB_NAME = 'glyph-globe'
const STORE_NAME = 'app-state'

const store = createStore(DB_NAME, STORE_NAME)

export async function getItem<T>(key: string): Promise<T | undefined> {
  const { get } = await import('idb-keyval')
  return get<T>(key, store)
}

export async function setItem<T>(key: string, value: T) {
  const { set } = await import('idb-keyval')
  await set(key, value, store)
}

export async function deleteItem(key: string) {
  const { del } = await import('idb-keyval')
  await del(key, store)
}

export async function clearStore() {
  const { clear } = await import('idb-keyval')
  await clear(store)
}
