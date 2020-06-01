import { getTodos, addTodo as addTodoUnSync } from "../localStorage/idb";
import { UPDATE_TODOS } from "../event/eventConstant";

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

export function addTodo(todo) {
  const config = window.config;

  if (!navigator.onLine) {
    throw new Error('Can\'t add todo while the user is offline !')
  }

  return fetch(`${config.api}/todos`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(todo)
  })
}

export function updateTodo(todo) {
  const config = window.config;

  if (!navigator.onLine) {
    throw new Error('Can\'t update todo while the user is offline !')
  }

  return fetch(`${config.api}/todos/${todo.id}`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(todo)
  })
}

export function deleteTodo(id) {
  const config = window.config;

  if (!navigator.onLine) {
    throw new Error('Can\'t remove todo while the user is offline !')
  }

  return fetch(`${config.api}/todos/${id}`, {
    method: 'DELETE'
  })
}

export async function syncTodos() {
  const config = window.config;

  const localTodos = await getTodos()

  const localUnsyncedTodos = localTodos
    .filter(({ synced, updated }) => synced === 'false' || updated === 'true')
    .map(async todo => {
      let url = `${config.api}/todos`
      if (todo.updated === 'true') url = url + `/${todo.id}`
      try {
        todo.synced = 'true';
        todo.updated = 'false';

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify(todo)
        })

        console.log(await res.json())
        addTodoUnSync(await res.json())
      } catch (error) {
        console.error(error)
      }
    })

  const localDeletedTodos = localTodos
    .filter(({ deleted }) => Boolean(deleted))
    .map(async ({ id }) => {
      try {
        await fetch(`${config.api}/todos/${id}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.error(error)
      }
    })

  if (!navigator.onLine || (localUnsyncedTodos.length || localDeletedTodos.length));

  await Promise.all([...localDeletedTodos, ...localUnsyncedTodos])

  const todos = await fetchTodos()

  for (const todo of todos) {
    addTodoUnSync(todo)
  }

  window.dispatchEvent(new CustomEvent(UPDATE_TODOS))
}
