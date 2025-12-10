// js/viewmodel/pomodoroViewModel.js

import { PomodoroModel } from "../model/pomodoroModel.js";

/**
 * # PomodoroViewModel (The ViewModel)
 * * Responsible for:
 * 1. Holding the PomodoroModel instance.
 * 2. Formatting Model data for the View (e.g., seconds to MM:SS).
 * 3. Managing the timer loop (setInterval).
 * 4. Implementing the Observer pattern to notify the View about state changes.
 */
export class PomodoroViewModel {
  constructor() {
    this.model = new PomodoroModel();
    this.timerId = null; // ID for setInterval
    this.observers = []; // Array of functions to be called when the state changes
  }

  // ----------------------------------------------------
  // OBSERVER PATTERN (To notify the View)
  // ----------------------------------------------------

  /**
   * Adds an observer function (listener), usually a View method.
   * @param {function} observer - Function to be called when the state changes.
   */
  addObserver(observer) {
    this.observers.push(observer);
    // Ensures the View is updated immediately with the initial state
    this.notifyObservers();
  }

  /**
   * Notifies all observers about the state change.
   */
  notifyObservers() {
    const state = this.getStateForView();
    this.observers.forEach((observer) => observer(state));
  }

  // ----------------------------------------------------
  // FORMATTING DATA FOR THE VIEW
  // ----------------------------------------------------

  /**
   * Converts the remaining time in seconds to the MM:SS string format.
   * @param {number} totalSeconds - Remaining time in seconds.
   * @returns {string} Formatted time.
   */
  _formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Pads with leading zero if the number is less than 10
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  /**
   * Aggregates and formats all relevant Model data for the View.
   * @returns {object} The state that the View will use for rendering.
   */
  getStateForView() {
    return {
      timeDisplay: this._formatTime(this.model.timeRemaining),
      isRunning: this.model.isRunning,
      currentMode: this.model.currentMode,
      pomodorosCompleted: this.model.pomodorosCompleted,
      // NEW: Expose current durations so the View can update button labels
      currentDurations: this.model.currentDurations,
    };
  }

  // ----------------------------------------------------
  // ACTION METHODS (Called by the View)
  // ----------------------------------------------------

  /**
   * Starts or pauses the main timer loop (setInterval).
   */
  toggleTimer() {
    this.model.toggleTimer();

    if (this.model.isRunning) {
      // If the timer is running, we start the loop
      this.timerId = setInterval(() => {
        const finished = this.model.tick();
        this.notifyObservers(); // Notify the View every second

        if (finished) {
          this.pauseTimerLoop(); // Pause the loop
          // The Model has already handled the transition, and the final notification is being sent
        }
      }, 1000); // Runs every 1000ms (1 second)
    } else {
      // If the timer was paused, we stop the loop
      this.pauseTimerLoop();
    }

    this.notifyObservers(); // Notify the View about the change in the isRunning state
  }

  /**
   * Stops the setInterval loop.
   */
  pauseTimerLoop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Resets the timer completely (to the beginning of the Work cycle).
   */
  reset() {
    this.pauseTimerLoop(); // Ensures the loop stops
    this.model.hardReset(); // Calls the new method that forces 'work' mode
    this.notifyObservers();
  }

  /**
   * Changes the timer mode (Work or Short Break).
   * @param {string} mode - The new mode.
   */
  setMode(mode) {
    this.pauseTimerLoop(); // Pause before changing the mode
    this.model.setMode(mode);
    this.notifyObservers();
  }

  /**
   * Increases or decreases the duration of the current mode by 1 minute.
   * This method is called by the arrows in the View.
   */
  adjustTime(delta) {
    // Only allows adjustment if the timer is NOT running.
    if (!this.model.isRunning) {
      const mode = this.model.currentMode;
      this.model.adjustDuration(mode, delta);

      // Forces the View to update the time display and button label
      this.notifyObservers();
    }
  }
}
