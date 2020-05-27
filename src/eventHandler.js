import { setTodos } from "./idb"
import { syncTodos } from "./api/todo"

export default function () {
    document.addEventListener('update-todos', ({ detail }) => {
        setTodos(detail)
            .then(() => {
                const event = new CustomEvent('todos-updated')
                document.dispatchEvent(event)
            })
    })
}