// js/main.js (REVISADO PARA INCLUIR O CONTROLE DE ABAS E ESTABILIDADE DE BORDA)

import { PomodoroView } from "./view/pomodoroView.js";
// Importaremos as outras Views aqui quando forem criadas

/**
 * Lógica para gerenciar a troca de abas e a navegação da aplicação.
 * * @param {string} tabName - O nome da aba (ex: 'pomodoro', 'todo', 'grocery').
 */
function switchTab(tabName) {
  // Esconde todos os conteúdos de aba
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.add("hidden");
    content.classList.remove("active-tab");
  });

  // 1. Desativa todos os botões (remove a cor e torna a borda transparente)
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.add("opacity-50", "border-transparent");
    button.classList.remove(
      "opacity-100", // Garante que a opacidade padrão volte
      "border-pomodoro",
      "border-todo",
      "border-grocery",
      "bg-pomodoro/10",
      "dark:bg-pomodoro/20",
      "bg-todo/10",
      "dark:bg-todo/20",
      "bg-grocery/10",
      "dark:bg-grocery/20"
      // NOTA: A classe "border-4" não é removida nem adicionada, pois está FIXA no HTML
    );
  });

  // Mostra o conteúdo da aba selecionada
  const activeContent = document.getElementById(`${tabName}-tab`);
  if (activeContent) {
    activeContent.classList.remove("hidden");
    activeContent.classList.add("active-tab");
  }

  // 2. Ativa o botão selecionado (remove transparência e adiciona cor)
  const activeBtn = document.getElementById(`tab-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.remove("opacity-50", "border-transparent");
    activeBtn.classList.add("opacity-100"); // Ativa opacidade total

    // Define a cor da borda e o fundo do botão ativo
    const color = activeBtn.dataset.tab;
    activeBtn.classList.add(
      `border-${color}`,
      `bg-${color}/10`,
      `dark:bg-${color}/20`
    );

    // NOTA: A classe "border-4" já está presente no HTML, não precisa ser adicionada aqui.
  }
}

// Garante que o DOM esteja completamente carregado antes de inicializar as Views
document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplicação 3 em 1 (MVVM) carregada!");

  // 1. Inicializa o Módulo Pomodoro
  // O construtor da View se encarrega de criar o Model e o ViewModel
  new PomodoroView("pomodoro-content");

  // 2. Inicialização dos Módulos To-Do e Grocery (serão adicionados aqui)
  // new TodoView('todo-content');
  // new GroceryView('grocery-content');

  // 3. Conecta a lógica de clique aos botões de navegação
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const tabName = event.currentTarget.dataset.tab;
      switchTab(tabName);
    });
  });

  // Inicializa a aba Pomodoro como padrão
  switchTab("pomodoro");
});
