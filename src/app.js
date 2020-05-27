import page from 'page';
import { fetchTodos, syncTodos } from './api/todo.js';
import { setTodos, getTodos } from './idb.js';
import eventHandler from './eventHandler.js';

const app = document.querySelector('#app .outlet');

fetch('/config.json')
  .then((result) => result.json())
  .then(async (config) => {
    console.log('[todo] Config loaded !!!');
    window.config = config;

    page('/', async () => {
      const module = await import('./views/home.js');
      const Home = module.default;

      const ctn = app.querySelector('[page="Home"]');
      const homeView = new Home(ctn);

      let todos = [];
      if (navigator.onLine) {
        todos = await fetchTodos();
      } else {
        todos = await getTodos() || [];
      }

      homeView.todos = todos;
      document.addEventListener('todo-updated', () => getTodos().then(todos => homeView.todos = todos))
      displayPage('Home');
    });

    page();
  });

function displayPage(page) {
  const skeleton = document.querySelector('#app .skeleton');
  skeleton.removeAttribute('hidden');
  const pages = app.querySelectorAll('[page]');
  pages.forEach(page => page.removeAttribute('active'));
  skeleton.setAttribute('hidden', 'true');
  const p = app.querySelector(`[page="${page}"]`);
  p.setAttribute('active', true);

  eventHandler()
}

window.addEventListener('todos-updated', () => syncTodos())