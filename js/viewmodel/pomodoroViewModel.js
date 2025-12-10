// js/viewmodel/pomodoroViewModel.js

import { PomodoroModel } from "../model/pomodoroModel.js";

/**
 * # PomodoroViewModel (O ViewModel)
 * * Responsável por:
 * 1. Manter a instância do PomodoroModel.
 * 2. Formatar os dados do Model para a View (ex: segundos para MM:SS).
 * 3. Gerenciar o loop do timer (setInterval).
 * 4. Implementar o padrão Observer para notificar a View sobre mudanças de estado.
 */
export class PomodoroViewModel {
  constructor() {
    this.model = new PomodoroModel();
    this.timerId = null; // ID para o setInterval
    this.observers = []; // Array de funções que serão chamadas quando o estado mudar
  }

  // ----------------------------------------------------
  // PADRÃO OBSERVER (Para notificar a View)
  // ----------------------------------------------------

  /**
   * Adiciona uma função de observador (listener), geralmente um método da View.
   * @param {function} observer - Função a ser chamada quando o estado mudar.
   */
  addObserver(observer) {
    this.observers.push(observer);
    // Garante que a View seja atualizada imediatamente com o estado inicial
    this.notifyObservers();
  }

  /**
   * Notifica todos os observadores sobre a mudança de estado.
   */
  notifyObservers() {
    const state = this.getStateForView();
    this.observers.forEach((observer) => observer(state));
  }

  // ----------------------------------------------------
  // FORMATANDO DADOS PARA A VIEW
  // ----------------------------------------------------

  /**
   * Converte o tempo restante em segundos para o formato de string MM:SS.
   * @param {number} totalSeconds - Tempo restante em segundos.
   * @returns {string} Tempo formatado.
   */
  _formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Adiciona zero à esquerda se o número for menor que 10
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  /**
   * Agrega e formata todos os dados relevantes do Model para a View.
   * @returns {object} O estado que a View utilizará para renderizar.
   */
  getStateForView() {
    return {
      timeDisplay: this._formatTime(this.model.timeRemaining),
      isRunning: this.model.isRunning,
      currentMode: this.model.currentMode,
      pomodorosCompleted: this.model.pomodorosCompleted,
      // NOVO: Expor as durações atuais para a View poder atualizar os rótulos dos botões
      currentDurations: this.model.currentDurations,
    };
  }

  // ----------------------------------------------------
  // MÉTODOS DE AÇÃO (Chamados pela View)
  // ----------------------------------------------------

  /**
   * Inicia ou pausa o loop principal do timer (setInterval).
   */
  toggleTimer() {
    this.model.toggleTimer();

    if (this.model.isRunning) {
      // Se o timer está rodando, iniciamos o loop
      this.timerId = setInterval(() => {
        const finished = this.model.tick();
        this.notifyObservers(); // Avisa a View a cada segundo

        if (finished) {
          this.pauseTimerLoop(); // Pausa o loop
          // O Model já fez a transição e a notificação final já está sendo feita
        }
      }, 1000); // Roda a cada 1000ms (1 segundo)
    } else {
      // Se o timer foi pausado, paramos o loop
      this.pauseTimerLoop();
    }

    this.notifyObservers(); // Notifica a View sobre a mudança do estado isRunning
  }

  /**
   * Para o loop do setInterval.
   */
  pauseTimerLoop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Reseta o timer completamente (para o início do ciclo de Trabalho).
   */
  reset() {
    this.pauseTimerLoop(); // Garante que o loop pare
    this.model.hardReset(); // Chama o novo método que força o modo 'work'
    this.notifyObservers();
  }

  /**
   * Altera o modo do timer (Work ou Short Break).
   * @param {string} mode - O novo modo.
   */
  setMode(mode) {
    this.pauseTimerLoop(); // Pausa antes de mudar o modo
    this.model.setMode(mode);
    this.notifyObservers();
  }

  /**
   * Aumenta ou diminui a duração do modo atual em 1 minuto.
   * Este método é chamado pelas setas da View.
   */
  adjustTime(delta) {
    // Só permite ajuste se o timer NÃO estiver rodando.
    if (!this.model.isRunning) {
      const mode = this.model.currentMode;
      this.model.adjustDuration(mode, delta);

      // Força a View a atualizar o display do tempo e o rótulo do botão
      this.notifyObservers();
    }
  }
}
