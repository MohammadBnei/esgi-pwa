import { openDB } from 'idb';

export async function initDB() {
  const config = window.config;

  const db = await openDB('awesome-todo', config.version || 1, {
    upgrade(db) {
      const store = db.createObjectStore('todos', {
        keyPath: 'id'
      });

      // Create indexes
      store.createIndex('id', 'id');
      store.createIndex('synced', 'synced');
      store.createIndex('updated', 'updated');
      store.createIndex('deleted', 'deleted');
      store.createIndex('done', 'done');
      store.createIndex('date', 'date');
    }
  });
  return db;
}

export async function getTodos() {
  const db = await initDB();
  return db.getAllFromIndex('todos', 'id');
}

export async function setTodos(data) {
  const db = await initDB();
  const tx = db.transaction('todos', 'readwrite');
  data.forEach(item => {
    tx.store.put(item);
  });
  await tx.done;
  return await db.getAllFromIndex('todos', 'deleted', 'false');
}

export async function addTodo(data) {
  const db = await initDB();
  const tx = db.transaction('todos', 'readwrite');
  return Promise.all([
    await tx.store.put(data),
    await tx.done
  ])
}

export async function removeTodo(id) {
  const db = await initDB();
  const tx = db.transaction('todos', 'readwrite');
  return Promise.all([
    await tx.store.delete(id),
    await tx.done
  ])
}

export async function updateTodo(data) {
  const db = await initDB();
  const tx = db.transaction('todos', 'readwrite');
  return Promise.all([
    await tx.store.put(data),
    await tx.done
  ])
}
