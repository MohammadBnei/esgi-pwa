import page from 'page';
import { fetchTodos, syncTodos } from './api/todo.js';
import { setTodos, getTodos } from './localStorage/idb.js';
import eventHandler from './event/eventHandler.js';
import * as eventsConstants from './event/eventConstant.js';

const app = document.querySelector('#app .outlet');

window.addEventListener('load', () => {
  if (!('serviceWorker' in navigator)) {
    console.log('service workers not supported 😣')
    return
  }

  navigator.serviceWorker.register('/service-worker.js').then(
    () => {
      console.log('registered! 👍🏼')
    },
    err => {
      console.error('SW registration failed! 😱', err)
    }
  )
})

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
        todos = await syncTodos();
      } else {
        todos = await getTodos() || [];
      }

      homeView.todos = todos;
      window.addEventListener(eventsConstants.UPDATE_TODOS, () => getTodos().then(todos => homeView.todos = todos))
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
  eventLogger()
}

const eventLogger = () => {
  for (const event of Object.values(eventsConstants)) {
    window.addEventListener(event, ({ detail }) => console.log({ event, payload: detail }))
  }
}

window.onbeforeunload = () => {
  for (const event of Object.values(eventsConstants)) {
    window.removeEventListener(event)
  }
}