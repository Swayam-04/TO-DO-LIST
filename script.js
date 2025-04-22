document.addEventListener('DOMContentLoaded', function() {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const remainingCount = document.getElementById('remaining-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const currentDayEl = document.getElementById('current-day');
    const currentDateEl = document.getElementById('current-date');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let editId = null;
    
    // Initialize date display
    function updateDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDayEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
        currentDateEl.textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    
    // Render todos
    function renderTodos(filter = 'all') {
        todoList.innerHTML = '';
        
        if (todos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks yet</h3>
                    <p>Add a task to get started!</p>
                </div>
            `;
            return;
        }
        
        const filteredTodos = todos.filter(todo => {
            if (filter === 'all') return true;
            if (filter === 'active') return !todo.completed;
            if (filter === 'completed') return todo.completed;
        });
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>No ${filter} tasks</h3>
                    <p>${filter === 'active' ? 'All tasks are completed!' : 'Add some tasks first!'}</p>
                </div>
            `;
            return;
        }
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <div class="todo-actions">
                    <button class="edit-btn"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            todoList.appendChild(li);
        });
        
        updateRemainingCount();
    }
    
    // Add new todo
    function addTodo() {
        const text = todoInput.value.trim();
        if (text) {
            if (editId !== null) {
                // Edit existing todo
                todos = todos.map(todo => 
                    todo.id === editId ? { ...todo, text } : todo
                );
                editId = null;
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
            } else {
                // Add new todo
                const newTodo = {
                    id: Date.now(),
                    text,
                    completed: false
                };
                todos.push(newTodo);
            }
            
            saveTodos();
            renderTodos(getCurrentFilter());
            todoInput.value = '';
            todoInput.focus();
        }
    }
    
    // Delete todo
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos(getCurrentFilter());
    }
    
    // Toggle todo completion status
    function toggleTodo(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        
        saveTodos();
        renderTodos(getCurrentFilter());
    }
    
    // Edit todo
    function editTodo(id) {
        const todoToEdit = todos.find(todo => todo.id === id);
        if (todoToEdit) {
            todoInput.value = todoToEdit.text;
            todoInput.focus();
            editId = id;
            addBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        }
    }
    
    // Clear completed todos
    function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos(getCurrentFilter());
    }
    
    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Update remaining tasks count
    function updateRemainingCount() {
        const count = todos.filter(todo => !todo.completed).length;
        remainingCount.textContent = count;
    }
    
    // Get current filter
    function getCurrentFilter() {
        const activeFilter = document.querySelector('.filter-btn.active');
        return activeFilter.dataset.filter;
    }
    
    // Event listeners
    addBtn.addEventListener('click', addTodo);
    
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    todoList.addEventListener('click', function(e) {
        if (e.target.closest('.delete-btn')) {
            const id = parseInt(e.target.closest('.todo-item').dataset.id);
            deleteTodo(id);
        }
        
        if (e.target.closest('.edit-btn')) {
            const id = parseInt(e.target.closest('.todo-item').dataset.id);
            editTodo(id);
        }
        
        if (e.target.classList.contains('todo-checkbox')) {
            const id = parseInt(e.target.closest('.todo-item').dataset.id);
            toggleTodo(id);
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTodos(this.dataset.filter);
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Initialize
    updateDateDisplay();
    renderTodos();
});