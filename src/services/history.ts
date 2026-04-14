import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'pinealid_history'

export async function saveHistory(item: any) {
  const raw = await AsyncStorage.getItem(KEY)
  const list = raw ? JSON.parse(raw) : []

  list.unshift(item)

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(list.slice(0, 50)) // límite
  )
}

export async function getHistory() {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}