import { TodoModel } from "../model/todoModel.js";

const STORAGE_KEY = "todoList";

export class TodoViewModel {
  constructor() {
    this.observers = [];
    this.todos = this._loadFromLocalStorage();
    this.filter = "all"; // 'all', 'active', 'completed'

    // Notifica a View com o estado inicial
    this.notifyObservers();
  }

  /**
   * Padrão Observer: Adiciona um observador (a View) à lista.
   * @param {Function} observer - O método de atualização da View.
   */
  addObserver(observer) {
    this.observers.push(observer);
  }

  /**
   * Padrão Observer: Notifica todos os observadores com o estado atual.
   */
  notifyObservers() {
    // Envia uma cópia do estado para a View
    const state = {
      todos: this.getFilteredTodos(),
      activeCount: this.getActiveTodos().length,
      totalCount: this.todos.length,
      currentFilter: this.filter,
    };
    this.observers.forEach((observer) => observer(state));
  }

  /**
   * Salva a lista de tarefas no localStorage e notifica as Views.
   * @private
   */
  _saveAndNotify() {
    this._saveToLocalStorage();
    this.notifyObservers();
  }

  /**
   * Persistência: Carrega a lista do localStorage.
   * @returns {Array<TodoModel>} A lista de tarefas.
   * @private
   */
  _loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // Mapeia os dados brutos de volta para instâncias de TodoModel
        return JSON.parse(stored).map(
          (data) => new TodoModel(data.text, data.completed)
        );
      }
    } catch (e) {
      console.error("Erro ao carregar do localStorage", e);
    }
    return [];
  }

  /**
   * Persistência: Salva a lista de tarefas no localStorage.
   * @private
   */
  _saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos));
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e);
    }
  }

  // --- MÉTODOS DE MANIPULAÇÃO DE DADOS ---

  /**
   * Adiciona uma nova tarefa.
   * @param {string} text - O texto da nova tarefa.
   */
  addTodo(text) {
    if (!text || text.trim() === "") return;

    const newTodo = new TodoModel(text.trim());
    this.todos.push(newTodo);
    this._saveAndNotify();
  }

  /**
   * Alterna o estado de conclusão de uma tarefa pelo ID.
   * @param {string} id - O ID da tarefa.
   */
  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this._saveAndNotify();
    }
  }

  /**
   * Remove uma tarefa pelo ID.
   * @param {string} id - O ID da tarefa.
   */
  removeTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id);
    this._saveAndNotify();
  }

  /**
   * Remove todas as tarefas concluídas.
   */
  clearCompleted() {
    this.todos = this.todos.filter((t) => !t.completed);
    this._saveAndNotify();
  }

  // --- MÉTODOS DE FILTRO E VISUALIZAÇÃO ---

  /**
   * Define o filtro de visualização.
   * @param {string} filter - O novo filtro ('all', 'active', 'completed').
   */
  setFilter(filter) {
    this.filter = filter;
    this.notifyObservers(); // Não salva, apenas notifica a View
  }

  /**
   * Retorna apenas as tarefas ativas.
   * @returns {Array<TodoModel>}
   */
  getActiveTodos() {
    return this.todos.filter((t) => !t.completed);
  }

  /**
   * Retorna a lista de tarefas baseada no filtro atual.
   * @returns {Array<TodoModel>}
   */
  getFilteredTodos() {
    switch (this.filter) {
      case "active":
        return this.getActiveTodos();
      case "completed":
        return this.todos.filter((t) => t.completed);
      case "all":
      default:
        return this.todos;
    }
  }
}
