// js/view/todoView.js

import { TodoViewModel } from "../viewmodel/todoViewModel.js";

export class TodoView {
  constructor(containerId) {
    this.viewModel = new TodoViewModel();
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`Container with ID '${containerId}' not found.`);
      return;
    }

    this.renderInitialUI();

    // 1. The View subscribes to the ViewModel
    this.viewModel.addObserver(this.updateUI.bind(this));
  }

  /**
   * Retorna a data atual formatada como YYYY-MM-DD para uso no atributo min.
   * @private
   */
  _getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    // Os meses são base 0, então adicionamos 1
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Renders the initial skeleton of the form and list.
   */
  renderInitialUI() {
    const todayDate = this._getTodayDate(); // Obtém a data de hoje

    this.container.innerHTML = `
            <div class="space-y-6">
                
                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner">
                    <form id="add-todo-form" class="flex flex-col space-y-3">
                        <input type="text" id="task-text" placeholder="Task (Ex: Wash Clothes)"
                            class="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-todo-500 focus:border-todo-500 dark:bg-gray-600 dark:text-white"
                            required>
                        
                        <div class="flex items-center space-x-3">
                            <label for="task-date" class="text-gray-700 dark:text-gray-300">Deadline:</label>
                            <input type="date" id="task-date"
                                class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-todo-500 focus:border-todo-500 dark:bg-gray-600 dark:text-white"
                                required
                                min="${todayDate}"> </div> <button type="submit"
                            class="bg-todo-600 text-gray-700 font-bold py-2 rounded-lg shadow-md hover:bg-todo-700 transition duration-200">
                            + Add New Task
                        </button>
                    </form>
                </div>
                
                <div id="todo-list" class="space-y-2">
                    </div>

                <div id="todo-footer" class="flex justify-between items-center text-gray-600 dark:text-gray-400 border-t pt-3 border-gray-200 dark:border-gray-700">
                    <span id="active-count">0 active tasks</span>
                    
                    <div class="space-x-2">
                        <button data-filter="all" class="filter-btn text-todo-500 font-bold hover:underline">All</button>
                        <button data-filter="active" class="filter-btn hover:text-todo-500">Active</button>
                        <button data-filter="completed" class="filter-btn hover:text-todo-500">Completed</button>
                    </div>

                    <button id="clear-completed" class="text-sm hover:text-red-500 disabled:opacity-50" disabled>
                        Clear Completed
                    </button>
                </div>

            </div>
        `;
    this._attachEventListeners();
    this.viewModel.notifyObservers(); // Forces the first update
  }

  /**
   * Connects click and submit events to the ViewModel.
   * @private
   */
  _attachEventListeners() {
    // 1. Form Submission Event
    document.getElementById("add-todo-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const taskTextElement = document.getElementById("task-text");
      const taskDateElement = document.getElementById("task-date");

      const text = taskTextElement.value.trim();
      const date = taskDateElement.value; // YYYY-MM-DD Format

      // Combines text and date into a single string
      const fullText = `${text} (Deadline: ${this._formatDate(date)})`; // Use "Deadline" internally
      this.viewModel.addTodo(fullText);

      // Clears fields after adding
      taskTextElement.value = "";
      taskDateElement.value = "";
    });

    // 2. Toggle and Removal Events (Event Delegation)
    document.getElementById("todo-list").addEventListener("click", (e) => {
      const todoItem = e.target.closest(".todo-item");
      if (!todoItem) return;
      const id = todoItem.dataset.id;

      // Completion Checkbox
      if (e.target.closest(".toggle-complete")) {
        this.viewModel.toggleTodo(id);
      }

      // Removal Button (Trashcan)
      if (e.target.closest(".remove-todo")) {
        this.viewModel.removeTodo(id);
      }
    });

    // 3. Filter Events
    document.querySelectorAll(".filter-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        this.viewModel.setFilter(e.target.dataset.filter);
      });
    });

    // 4. Clear Completed
    document.getElementById("clear-completed").addEventListener("click", () => {
      this.viewModel.clearCompleted();
    });
  }

  /**
   * Formats the date YYYY-MM-DD to DD/MM/YYYY.
   * @private
   */
  _formatDate(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  /**
   * Observer Pattern: Updates the interface based on the ViewModel state.
   * @param {Object} state - The current state (todos, activeCount, filter, etc.)
   */
  updateUI(state) {
    const todoListContainer = document.getElementById("todo-list");
    todoListContainer.innerHTML = ""; // Clears the existing list

    // 1. Renders each item in the list
    state.todos.forEach((todo) => {
      const completedClass = todo.completed ? "line-through opacity-40" : "";

      // Renders the item
      const todoItem = document.createElement("div");
      todoItem.dataset.id = todo.id;
      todoItem.classList.add(
        "todo-item",
        "flex",
        "items-center",
        "justify-between",
        "p-3",
        "rounded-lg",
        "bg-white",
        "dark:bg-gray-800",
        "shadow-sm",
        "transition",
        "duration-200"
      );

      // Separates text and deadline, if existing
      let displayText = todo.text;
      let deadlineText = "";

      // --- ATENÇÃO: Mudança no regex para extrair 'Deadline' ---
      const deadlineMatch = todo.text.match(/\(Deadline: (.*?)\)/);
      if (deadlineMatch) {
        displayText = todo.text.replace(deadlineMatch[0], "").trim();
        // Displays 'Deadline:' in the UI (TRANSLATED)
        deadlineText = `<span class="text-sm text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">${deadlineMatch[1]}</span>`;
      }

      // --- LAYOUT CORRIGIDO QUE FUNCIONAVA BEM (INCLUINDO QUEBRA DE LINHA) ---
      todoItem.innerHTML = `
                <div class="flex items-start flex-grow min-w-0"> 
                    
                    <button class="toggle-complete w-6 h-6 border-2 border-todo-500 rounded mr-3 flex items-center justify-center transition duration-150 flex-shrink-0 mt-0.5" data-id="${
                      todo.id
                    }">
                        ${
                          todo.completed
                            ? '<span class="text-white text-lg leading-none">✔</span>'
                            : ""
                        }
                    </button>

                    <p class="text-gray-800 dark:text-white flex-grow min-w-0 ${completedClass} leading-snug">
                        <span class="break-words">${displayText}</span> 
                        ${deadlineText}
                    </p>

                </div>
                
                <button class="remove-todo text-gray-400 hover:text-red-500 ml-4 p-1 rounded-full flex-shrink-0" data-id="${
                  todo.id
                }" aria-label="Remove Task">
                    <span class="text-xl">🗑️</span> 
                </button>
            `;

      // Styles the button/checkbox when completed
      const toggleBtn = todoItem.querySelector(".toggle-complete");
      if (todo.completed) {
        toggleBtn.classList.add("bg-todo-500", "border-todo-500");
      } else {
        toggleBtn.classList.remove("bg-todo-500", "border-todo-500");
      }

      todoListContainer.appendChild(todoItem);
    });

    // 2. Updates the Footer
    document.getElementById(
      "active-count"
    ).textContent = `${state.activeCount} active tasks`;

    // Enables/Disables the 'Clear Completed' button
    const completedTotal = state.totalCount - state.activeCount;
    const clearBtn = document.getElementById("clear-completed");
    clearBtn.disabled = completedTotal === 0;

    // 3. Updates the filter buttons state
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      if (btn.dataset.filter === state.currentFilter) {
        btn.classList.add("font-bold", "text-todo-500", "underline");
        btn.classList.remove("hover:text-todo-500");
      } else {
        btn.classList.remove("font-bold", "text-todo-500", "underline");
        btn.classList.add("hover:text-todo-500");
      }
    });
  }
}
