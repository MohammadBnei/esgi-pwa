import { getTodos } from "../idb";

/**
 * 
 */
export function fetchTodos() {
  const config = window.config;

  return fetch(`${config.api}/todos`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    }
  })
    .then(result => result.json())
    .catch(error => {
      console.error(error);
      return false;
    })
}

export async function syncTodos() {
  const config = window.config;

  const localTodos = await getTodos()

  const localUnsyncedTodos = localTodos
    .map((todo, index) => ({ todo, index }))
    .filter(({ todo: { synced } }) => synced === "false")

  console.log({ localUnsyncedTodos, localTodos });

  if (!navigator.onLine || !localUnsyncedTodos.length) return localTodos;

  const syncedTodos = localTodos?.filter(({ todo: { synced } }) => synced === "true")

  for (const { todo, index } of localUnsyncedTodos) {
    try {
      const result = await fetch(`${config.api}/todos`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(todo)
      })

      syncedTodos[index] = {
        ...(await result.json()),
        synced: "true"
      }

    } catch (error) {
      console.error(error);
      break;
    }
  }

  return syncedTodos
}
