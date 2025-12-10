// js/model/pomodoroModel.js

export class PomodoroModel {
  constructor(durations = {}) {
    // 1. Default Duration Definitions (in minutes) - Only Work and Short Break
    this.durations = {
      work: durations.work || 25,
      shortBreak: durations.shortBreak || 5,
    };

    // 2. Initial Timer State
    this._currentMode = "work"; // 'work' or 'shortBreak'
    this._timeRemaining = this.durations.work * 60; // Initial time in seconds
    this._isRunning = false; // Whether the timer is active or stopped
    this._pomodorosCompleted = 0; // Counter for completed work cycles
  }

  // ----------------------------------------------------
  // GETTERS (State Access)
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

  // NEW GETTER: Returns the current durations for the View/VM
  get currentDurations() {
    return this.durations;
  }

  // ----------------------------------------------------
  // BUSINESS ACTIONS
  // ----------------------------------------------------

  /**
   * Starts or Pauses the Timer.
   */
  toggleTimer() {
    this._isRunning = !this._isRunning;
  }

  /**
   * Resets the timer to the beginning of the current mode.
   */
  resetTimer() {
    this._isRunning = false;
    // Uses the saved duration for the current mode
    this._timeRemaining = this.durations[this._currentMode] * 60;
  }

  /**
   * Completely resets the state, forcing the mode back to Work.
   */
  hardReset() {
    this._pomodorosCompleted = 0;
    this.setMode("work"); // Forces the mode back to Work
  }

  /**
   * Switches the timer to a new mode ('work' or 'shortBreak').
   * @param {string} newMode - The new mode.
   */
  setMode(newMode) {
    if (this.durations[newMode]) {
      this._currentMode = newMode;
      this.resetTimer(); // Always resets the time when changing the mode
    }
  }

  /**
   * Decreases the remaining time by 1 second.
   * @returns {boolean} - Returns true if time has run out.
   */
  tick() {
    if (!this._isRunning) {
      return false;
    }

    if (this._timeRemaining > 0) {
      this._timeRemaining--;
      return false;
    } else {
      // Time is up! Automatic transition
      this.handleModeEnd();
      return true;
    }
  }

  /**
   * Logic for automatic transition to the next cycle (business rules).
   */
  handleModeEnd() {
    // Pauses the timer
    this._isRunning = false;

    // Toggles between work and shortBreak
    if (this._currentMode === "work") {
      // 1. After WORK: Go to Break. The counter IS NOT INCREMENTED YET.
      this.setMode("shortBreak");
    } else if (this._currentMode === "shortBreak") {
      // 2. After SHORT BREAK: The full cycle (Work + Break) is complete.
      this._pomodorosCompleted++; // <-- INCREMENTS HERE!
      this.setMode("work"); // Goes back to Work
    }
  }
  /**
   * Adjusts the duration of a mode (in minutes).
   * @param {string} mode - 'work' or 'shortBreak'.
   * @param {number} delta - Value to be added (e.g., +1 or -1).
   */
  adjustDuration(mode, delta) {
    if (this.durations[mode] !== undefined) {
      let newDuration = this.durations[mode] + delta;

      // Ensures the time doesn't go below 1 minute
      if (newDuration >= 1) {
        this.durations[mode] = newDuration;

        // If the timer is stopped and in the changed mode, update the remaining time
        if (this._currentMode === mode && !this._isRunning) {
          this._timeRemaining = newDuration * 60;
        }
      }
    }
  }
}
