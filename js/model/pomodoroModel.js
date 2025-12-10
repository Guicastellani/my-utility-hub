export class PomodoroModel {
  constructor(durations = {}) {
    // 1. Definições de Duração Padrão (em minutos) - Apenas Trabalho e Pausa Curta
    this.durations = {
      work: durations.work || 25,
      shortBreak: durations.shortBreak || 5,
    };

    // 2. Estado Inicial do Timer
    this._currentMode = "work"; // 'work' ou 'shortBreak'
    this._timeRemaining = this.durations.work * 60; // Tempo inicial em segundos
    this._isRunning = false; // Se o timer está ativo ou parado
    this._pomodorosCompleted = 0; // Contador de ciclos de trabalho concluídos
  }

  // ----------------------------------------------------
  // GETTERS (Acesso ao Estado)
  // ----------------------------------------------------

  get timeRemaining() {
    return this._timeRemaining;
  }

  get isRunning() {
    return this._isRunning;
  }

  get currentMode() {
    return this._currentMode;
  }

  get pomodorosCompleted() {
    return this._pomodorosCompleted;
  }

  // NOVO GETTER: Retorna as durações atuais para a View/VM
  get currentDurations() {
    return this.durations;
  }

  // ----------------------------------------------------
  // AÇÕES DE NEGÓCIO
  // ----------------------------------------------------

  /**
   * Inicia ou Pausa o Timer.
   */
  toggleTimer() {
    this._isRunning = !this._isRunning;
  }

  /**
   * Reseta o timer para o início do modo atual.
   */
  resetTimer() {
    this._isRunning = false;
    // Usa a duração salva para o modo atual
    this._timeRemaining = this.durations[this._currentMode] * 60;
  }

  /**
   * Reseta completamente o estado, forçando o modo de volta para Trabalho.
   */
  hardReset() {
    this._pomodorosCompleted = 0;
    this.setMode("work"); // Força o modo de volta para Trabalho
  }

  /**
   * Muda o timer para um novo modo ('work' ou 'shortBreak').
   * @param {string} newMode - O novo modo.
   */
  setMode(newMode) {
    if (this.durations[newMode]) {
      this._currentMode = newMode;
      this.resetTimer(); // Sempre reseta o tempo ao mudar o modo
    }
  }

  /**
   * Diminui o tempo restante em 1 segundo.
   * @returns {boolean} - Retorna true se o tempo acabou.
   */
  tick() {
    if (!this._isRunning) {
      return false;
    }

    if (this._timeRemaining > 0) {
      this._timeRemaining--;
      return false;
    } else {
      // Tempo acabou! Transição automática
      this.handleModeEnd();
      return true;
    }
  }

  /**
   * Lógica para transição automática para o próximo ciclo (regras de negócio).
   */
  handleModeEnd() {
    // Pausa o timer
    this._isRunning = false;

    // Alterna entre work e shortBreak
    if (this._currentMode === "work") {
      // 1. Após o TRABALHO: Vai para a Pausa. O contador AINDA NÃO É INCREMENTADO.
      this.setMode("shortBreak");
    } else if (this._currentMode === "shortBreak") {
      // 2. Após a PAUSA CURTA: O ciclo completo (Trabalho + Pausa) está encerrado.
      this._pomodorosCompleted++; // <-- INCREMENTA AQUI!
      this.setMode("work"); // Volta para o Trabalho
    }
  }
  /**
   * Ajusta a duração de um modo (em minutos).
   * @param {string} mode - 'work' ou 'shortBreak'.
   * @param {number} delta - Valor a ser adicionado (ex: +1 ou -1).
   */
  adjustDuration(mode, delta) {
    if (this.durations[mode] !== undefined) {
      let newDuration = this.durations[mode] + delta;

      // Garante que o tempo não fique abaixo de 1 minuto
      if (newDuration >= 1) {
        this.durations[mode] = newDuration;

        // Se o timer estiver parado e no modo alterado, atualiza o tempo restante
        if (this._currentMode === mode && !this._isRunning) {
          this._timeRemaining = newDuration * 60;
        }
      }
    }
  }
}
