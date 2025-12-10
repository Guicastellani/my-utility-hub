// js/view/pomodoroView.js

import { PomodoroViewModel } from "../viewmodel/pomodoroViewModel.js"; // Garantir que esta importação esteja correta

export class PomodoroView {
  constructor(containerId) {
    this.viewModel = new PomodoroViewModel();
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`Container com ID '${containerId}' não encontrado.`);
      return;
    }

    this.renderInitialUI(); // Chamada corrigida, sem argumento

    // 1. A View se inscreve no ViewModel como um Observador
    this.viewModel.addObserver(this.updateUI.bind(this));
  }

  /**
   * Renderiza o esqueleto inicial do Pomodoro no DOM.
   * O código está limpo, sem classes de marca d'água de fundo.
   */
  renderInitialUI() {
    this.container.innerHTML = `
        <div class="relative w-full h-full p-4"> 
            
            <div id="pomodoro-modes" class="flex justify-center space-x-4 mb-8">
                <button data-mode="work" class="mode-btn px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-200 shadow-md w-36">Trabalho</button>
                <button data-mode="shortBreak" class="mode-btn px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-200 shadow-md w-36">Pausa</button>
            </div>

            <div class="flex justify-center mb-8 relative">
                
                <div class="relative w-full max-w-xs md:max-w-sm mx-auto"> 
                    
                    <p id="timer-display" class="text-8xl md:text-9xl font-black text-center text-gray-800 dark:text-white transition-colors duration-500 select-none">25:00</p>
                    
                    <div class="flex flex-col space-y-2 justify-center absolute inset-y-0 -left-12 h-full"> 
                        <button id="up-arrow" class="text-gray-500 dark:text-gray-400 hover:text-green-500 disabled:opacity-30 text-3xl" aria-label="Aumentar tempo">▲</button>
                        <button id="down-arrow" class="text-gray-500 dark:text-gray-400 hover:text-red-500 disabled:opacity-30 text-3xl" aria-label="Diminuir tempo">▼</button>
                    </div>
                </div>
            </div>

            <p id="status-message" class="text-center text-xl mt-2 text-indigo-600 dark:text-indigo-400 font-medium mb-8 w-48 mx-auto">Pronto para começar!</p>
            
            <div class="flex justify-center space-x-4">
                <button id="toggle-btn" class="text-white font-bold py-3 px-10 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 uppercase text-lg">
                    INICIAR
                </button>
                <button id="reset-btn" class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-10 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 uppercase text-lg">
                    RESET
                </button>
            </div>
            
            <div class="flex justify-center mx-auto max-w-xs"> 
                <p class="text-center mt-6 text-gray-500 dark:text-gray-400">
                    Pomodoros Concluídos: <span id="completed-count" class="font-bold text-lg">0</span>
                </p>
            </div>
        </div> `;

    // O attachEventListeners deve ser chamado aqui, após o innerHTML
    this._attachEventListeners();
    this.viewModel.notifyObservers(); // Força o primeiro update
  }

  /**
   * Conecta os eventos de clique ao ViewModel.
   */
  _attachEventListeners() {
    // Botão INICIAR / PAUSAR
    document.getElementById("toggle-btn").addEventListener("click", () => {
      this.viewModel.toggleTimer();
    });

    // Botão RESET
    document.getElementById("reset-btn").addEventListener("click", () => {
      this.viewModel.reset();
    });

    // Botões de MODO (Work, Short Break)
    document.querySelectorAll(".mode-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const mode = event.target.dataset.mode;
        this.viewModel.setMode(mode);
      });
    });

    // Eventos para as setas de ajuste de tempo
    document.getElementById("up-arrow").addEventListener("click", () => {
      this.viewModel.adjustTime(1); // Aumenta 1 minuto
    });

    document.getElementById("down-arrow").addEventListener("click", () => {
      this.viewModel.adjustTime(-1); // Diminui 1 minuto
    });
  }

  /**
   * Método Observador: Atualiza a interface sempre que o ViewModel notifica uma mudança.
   */
  updateUI(state) {
    // 1. Atualiza o Display do Tempo
    document.getElementById("timer-display").textContent = state.timeDisplay;

    // 2. Define Cores e Status
    let modeColor = "indigo";
    let statusText = "Trabalho";

    if (state.currentMode === "shortBreak") {
      modeColor = "teal";
      statusText = "Pausa";
    }

    // 3. Atualiza o Botão INICIAR / PAUSAR
    const toggleBtn = document.getElementById("toggle-btn");
    const isRunning = state.isRunning;
    toggleBtn.textContent = isRunning ? "PAUSAR" : "INICIAR";

    // Aplica a cor do modo ao botão de toggle
    toggleBtn.className = `text-white font-bold py-3 px-10 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 uppercase text-lg bg-${modeColor}-600 hover:bg-${modeColor}-700`;

    // Atualiza a mensagem de status
    document.getElementById("status-message").textContent = isRunning
      ? `Modo ${statusText}`
      : `Pronto para ${statusText}`;

    // 4. Habilita/Desabilita as setas de ajuste
    const upArrow = document.getElementById("up-arrow");
    const downArrow = document.getElementById("down-arrow");

    // As setas SÓ funcionam se o timer NÃO estiver rodando.
    upArrow.disabled = isRunning;
    downArrow.disabled = isRunning;
    upArrow.classList.toggle("opacity-30", isRunning);
    downArrow.classList.toggle("opacity-30", isRunning);

    // 5. Atualiza o Contador de Pomodoros
    document.getElementById("completed-count").textContent =
      state.pomodorosCompleted;

    // 6. Estiliza os Botões de Modo (Highlight e Desabilitação)
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      const btnMode = btn.dataset.mode;
      const label = btnMode === "work" ? "Trabalho" : "Pausa";
      btn.textContent = label;

      // LÓGICA DE BLOQUEIO
      let shouldDisable = false;

      if (state.isRunning) {
        if (state.currentMode === "work" && btnMode === "shortBreak") {
          shouldDisable = true;
        } else if (state.currentMode === "shortBreak" && btnMode === "work") {
          shouldDisable = true;
        }
      }

      btn.disabled = shouldDisable;

      if (btnMode === state.currentMode) {
        // Modo Ativo: usa a cor do modo, MANTENDO A LARGURA FIXA (w-36)
        btn.className = `mode-btn px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-200 shadow-xl w-36 bg-${modeColor}-500 text-white dark:bg-${modeColor}-600`;
      } else {
        // Modo Inativo: cor padrão, MANTENDO A LARGURA FIXA (w-36)
        btn.className = `mode-btn px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-200 shadow-md w-36 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600`;
      }

      // APLICAÇÃO FINAL DA OPACIDADE e BLOQUEIO
      if (shouldDisable) {
        // Usa opacity-40 para um tom mais apagado, similar aos botões de navegação
        btn.classList.add("opacity-40", "pointer-events-none");
      } else {
        btn.classList.remove("opacity-40", "pointer-events-none");
      }

      // Garante que a classe de largura não seja perdida (w-44)
      btn.classList.add("w-36");
    });
  }
}
