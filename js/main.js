import { PomodoroView } from "./view/pomodoroView.js";
import { TodoView } from "./view/todoView.js";
import { GroceryView } from "./view/groceryView.js";

// Variáveis para armazenar as instâncias das Views
let pomodoroView;
let todoView;
let groceryView;

// =========================================================
// CLASSE PARA GERENCIAMENTO DE TEMA (DARK/LIGHT MODE)
// =========================================================
class ThemeManager {
  constructor() {
    this.htmlRoot = document.getElementById("html-root");
    this.toggleButton = document.getElementById("theme-toggle");
    this.sunIcon = document.getElementById("sun-icon");
    this.moonIcon = document.getElementById("moon-icon");

    // Carrega o tema salvo do localStorage ou usa 'light' como padrão
    this.currentTheme = localStorage.getItem("theme") || "light";

    this.initializeTheme();

    if (this.toggleButton) {
      this.toggleButton.addEventListener("click", () => this.toggleTheme());
    }
  }

  /**
   * Aplica a classe 'dark' ao <html> e atualiza os ícones.
   */
  applyTheme() {
    if (this.currentTheme === "dark") {
      this.htmlRoot.classList.add("dark");

      this.sunIcon.classList.add("hidden");
      this.moonIcon.classList.remove("hidden");
    } else {
      this.htmlRoot.classList.remove("dark");

      this.sunIcon.classList.remove("hidden");
      this.moonIcon.classList.add("hidden");
    }
    // Salva a preferência do usuário
    localStorage.setItem("theme", this.currentTheme);
  }

  /**
   * Inicializa o tema ao carregar a página.
   */
  initializeTheme() {
    // Se o sistema preferir dark, mas o localStorage estiver vazio,
    // usa o tema do sistema. Caso contrário, usa o tema salvo.
    if (
      !localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      this.currentTheme = "dark";
    }
    this.applyTheme();
  }

  /**
   * Alterna entre Light e Dark Mode.
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme();
  }
}

/**
 * Logic to manage tab switching and application navigation.
 * @param {string} tabName - The tab name (e.g., 'pomodoro', 'todo', 'grocery').
 */
function switchTab(tabName) {
  // Hides all tab content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.add("hidden");
    content.classList.remove("active-tab");
  });

  // 1. Deactivates all buttons (removes color and makes border transparent)
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.add("opacity-50", "border-transparent");
    button.classList.remove(
      "opacity-100",
      "border-pomodoro",
      "border-todo",
      "border-grocery",
      "bg-pomodoro/10",
      "dark:bg-pomodoro/20",
      "bg-todo/10",
      "dark:bg-todo/20",
      "bg-grocery/10",
      "dark:bg-grocery/20"
    );
  });

  // Shows the content of the selected tab
  const activeContent = document.getElementById(`${tabName}-tab`);
  if (activeContent) {
    activeContent.classList.remove("hidden");
    activeContent.classList.add("active-tab");
  }

  // 2. Activates the selected button (removes transparency and adds color)
  const activeBtn = document.getElementById(`tab-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.remove("opacity-50", "border-transparent");
    activeBtn.classList.add("opacity-100");

    // Defines the border color and background of the active button
    const color = activeBtn.dataset.tab;
    activeBtn.classList.add(
      `border-${color}`,
      `bg-${color}/10`,
      `dark:bg-${color}/20`
    );
  }

  // 3. FORCE REDRAW: Notify the ViewModel to update the list when the tab changes
  // Isso garante que os dados do localStorage sejam renderizados se a lista não estiver vazia.
  if (tabName === "todo" && todoView) {
    todoView.viewModel.notifyObservers();
  } else if (tabName === "grocery" && groceryView) {
    groceryView.viewModel.notifyObservers();
  }
}

// Ensures the DOM is fully loaded before initializing Views
document.addEventListener("DOMContentLoaded", () => {
  console.log("3-in-1 Application (MVVM) loaded!");

  // 0. Inicializa o ThemeManager para configurar o tema e o botão de toggle
  new ThemeManager();

  // 1. Initializes the Pomodoro Module and stores the instance
  pomodoroView = new PomodoroView("pomodoro-content");

  // 2. Initializes the To-Do List Module and stores the instance
  todoView = new TodoView("todo-content");

  // 3. Initializes the Grocery List Module and stores the instance
  groceryView = new GroceryView("grocery-content");

  // 4. Connects the click logic to the navigation buttons
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const tabName = event.currentTarget.dataset.tab;
      switchTab(tabName);
    });
  });

  // Initializes the Pomodoro tab as default
  switchTab("pomodoro");
});
