import { getUserTodos } from '../api.js';
import { getQueryParams } from '../router.js';

export async function renderTodos(searchTerm = '') {
  const params = getQueryParams();
  const userId = params.get('userId');
  
  const [apiTodos, localTodos] = await Promise.all([
    fetch('https://jsonplaceholder.typicode.com/todos').then(r => r.json()),
    JSON.parse(localStorage.getItem('userTodos') || '{}')
  ]);

  let allTodos = [];
  let userInfo = '';
  
  if (userId) {
    const apiUserTodos = apiTodos.filter(t => t.userId == userId || t.userId === userId);
    const localUserTodos = localTodos[userId] || [];
    allTodos = [...apiUserTodos, ...localUserTodos];
    
    const allUsers = await fetch('https://jsonplaceholder.typicode.com/users').then(r => r.json());
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const user = [...allUsers, ...localUsers].find(u => u.id == userId || u.id === userId);
    userInfo = user ? ` пользователя ${user.name}` : '';
  } 
  else {
    allTodos = [...apiTodos, ...Object.values(localTodos).flat()];
  }

  const filtered = allTodos.filter(todo =>
    todo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const html = filtered.map(todo => `
    <div class="todo ${todo.completed ? 'completed' : ''}">
      <strong>${todo.title}</strong> 
      <span>— ${todo.completed ? '✅' : '❌'}</span>
      ${todo.local ? `<button onclick="toggleTodo('${todo.id}', '${todo.userId}')">Переключить</button>` : ''}
    </div>
  `).join('');

  const title = userId ? `Задачи${userInfo}` : 'Все задачи';
  
  document.getElementById('app').innerHTML = `
    <h2>${title}</h2>
    ${userId ? `<p><a href="#users">← Назад к пользователям</a></p>` : ''}
    ${html || '<p>Задачи не найдены</p>'}
  `;
}

window.toggleTodo = function(todoId, userId) {
  const userTodos = JSON.parse(localStorage.getItem('userTodos') || '{}');
  if (userTodos[userId]) {
    const todoIndex = userTodos[userId].findIndex(t => t.id === todoId);
    if (todoIndex !== -1) {
      userTodos[userId][todoIndex].completed = !userTodos[userId][todoIndex].completed;
      localStorage.setItem('userTodos', JSON.stringify(userTodos));
      location.reload();
    }
  }
};