import { removeTodo, addTodo } from "../localStorage/idb"
import { updateTodo as updateTodoSync, addTodo as addTodoSync, deleteTodo as deleteTodoSync, syncTodos } from "../api/todo"
import { CREATE_TODO, UPDATE_TODOS, UPDATE_TODO, DELETE_TODO, CONNECTION_UP } from "./eventConstant"

export default function () {
    window.addEventListener(CREATE_TODO, ({ detail }) => {
        (async () => {
            const todo = { ...detail }
            if (navigator.onLine) {
                try {
                    todo.synced = 'true'
                    await addTodoSync(todo)
                } catch (error) {
                    todo.synced = 'false'
                    console.error(error)
                }
            }
            await addTodo(todo)
            window.dispatchEvent(new CustomEvent(UPDATE_TODOS))
        })()
    })

    window.addEventListener(UPDATE_TODO, ({ detail }) => {
        (async () => {
            const todo = { ...detail }
            if (navigator.onLine) {
                try {
                    todo.updated = 'false'
                    await updateTodoSync(todo)
                } catch (error) {
                    todo.updated = 'true'
                    todo.synced = 'false'
                    console.error(error)
                }
            }
            await addTodo(todo)
            window.dispatchEvent(new CustomEvent(UPDATE_TODOS))
        })()
    })

    window.addEventListener(DELETE_TODO, ({ detail }) => {
        (async () => {
            if (navigator.onLine) {
                try {
                    await deleteTodoSync(detail)
                    await removeTodo(detail)
                } catch (error) {
                    const todo = { id: detail, deleted: true }
                    await addTodo(todo)
                    console.error(error)
                }
            }
            window.dispatchEvent(new CustomEvent(UPDATE_TODOS))
        })()
    })

    window.addEventListener(CONNECTION_UP, () => syncTodos())
}