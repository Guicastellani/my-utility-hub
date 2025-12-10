// js/view/pomodoroView.js

import { PomodoroViewModel } from "../viewmodel/pomodoroViewModel.js"; // Ensure this import is correct

export class PomodoroView {
  constructor(containerId) {
    this.viewModel = new PomodoroViewModel();
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`Container with ID '${containerId}' not found.`);
      return;
    }

    this.renderInitialUI(); // Corrected call, no argument

    // 1. The View subscribes to the ViewModel as an Observer
    this.viewModel.addObserver(this.updateUI.bind(this));
  }

  /**
   * Renders the initial Pomodoro skeleton to the DOM.
   * The code is clean, without background watermark classes.
   */
  renderInitialUI() {
    this.container.innerHTML = `
        <div class="relative w-full h-full p-4"> 
            
            <div id="pomodoro-modes" class="flex justify-center space-x-4 mb-8">
                <button data-mode="work" class="mode-btn px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-200 shadow-md w-36">Work</button>
                <button data-mode="shortBreak" class="mode-btn px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-200 shadow-md w-36">Break</button>
            </div>

            <div class="flex justify-center mb-8 relative">
                
                <div class="relative w-full max-w-xs md:max-w-sm mx-auto"> 
                    
                    <p id="timer-display" class="text-8xl md:text-9xl font-black text-center text-gray-800 dark:text-white transition-colors duration-500 select-none">25:00</p>
                    
                    <div class="flex flex-col space-y-2 justify-center absolute inset-y-0 -left-12 h-full"> 
                        <button id="up-arrow" class="text-gray-500 dark:text-gray-400 hover:text-green-500 disabled:opacity-30 text-3xl" aria-label="Increase time">▲</button>
                        <button id="down-arrow" class="text-gray-500 dark:text-gray-400 hover:text-red-500 disabled:opacity-30 text-3xl" aria-label="Decrease time">▼</button>
                    </div>
                </div>
            </div>

            <p id="status-message" class="text-center text-xl mt-2 text-indigo-600 dark:text-indigo-400 font-medium mb-8 w-48 mx-auto">Ready to start!</p>
            
            <div class="flex justify-center space-x-4">
                <button id="toggle-btn" class="text-white font-bold py-3 px-10 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 uppercase text-lg">
                    START
                </button>
                <button id="reset-btn" class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-10 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 uppercase text-lg">
                    RESET
                </button>
            </div>
            
            <div class="flex justify-center mx-auto max-w-xs"> 
                <p class="text-center mt-6 text-gray-500 dark:text-gray-400">
                    Completed Cicles: <span id="completed-count" class="font-bold text-lg">0</span>
                </p>
            </div>
        </div> `;

    // attachEventListeners must be called here, after innerHTML
    this._attachEventListeners();
    this.viewModel.notifyObservers(); // Forces the first update
  }

  /**
   * Connects click events to the ViewModel.
   */
  _attachEventListeners() {
    // START / PAUSE Button
    document.getElementById("toggle-btn").addEventListener("click", () => {
      this.viewModel.toggleTimer();
    });

    // RESET Button
    document.getElementById("reset-btn").addEventListener("click", () => {
      this.viewModel.reset();
    });

    // MODE Buttons (Work, Short Break)
    document.querySelectorAll(".mode-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const mode = event.target.dataset.mode;
        this.viewModel.setMode(mode);
      });
    });

    // Events for time adjustment arrows
    document.getElementById("up-arrow").addEventListener("click", () => {
      this.viewModel.adjustTime(1); // Increase 1 minute
    });

    document.getElementById("down-arrow").addEventListener("click", () => {
      this.viewModel.adjustTime(-1); // Decrease 1 minute
    });
  }

  /**
   * Observer Method: Updates the interface whenever the ViewModel notifies a change.
   */
  updateUI(state) {
    // 1. Updates the Time Display
    document.getElementById("timer-display").textContent = state.timeDisplay;

    // 2. Defines Colors and Status
    let modeColor = "indigo";
    let statusText = "Work"; // Translated

    if (state.currentMode === "shortBreak") {
      modeColor = "teal";
      statusText = "Break"; // Translated
    }

    // 3. Updates the START / PAUSE Button
    const toggleBtn = document.getElementById("toggle-btn");
    const isRunning = state.isRunning;
    toggleBtn.textContent = isRunning ? "PAUSE" : "START"; // Translated

    // Applies the mode color to the toggle button
    toggleBtn.className = `text-white font-bold py-3 px-10 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 uppercase text-lg bg-${modeColor}-600 hover:bg-${modeColor}-700`;

    // Updates the status message
    document.getElementById("status-message").textContent = isRunning
      ? `${statusText} Mode` // Translated
      : `Ready for ${statusText}`; // Translated

    // 4. Enables/Disables adjustment arrows
    const upArrow = document.getElementById("up-arrow");
    const downArrow = document.getElementById("down-arrow");

    // Arrows ONLY work if the timer is NOT running.
    upArrow.disabled = isRunning;
    downArrow.disabled = isRunning;
    upArrow.classList.toggle("opacity-30", isRunning);
    downArrow.classList.toggle("opacity-30", isRunning);

    // 5. Updates the Pomodoro Count
    document.getElementById("completed-count").textContent =
      state.pomodorosCompleted;

    // 6. Styles Mode Buttons (Highlight and Disabling)
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      const btnMode = btn.dataset.mode;
      // Defines the label based on the mode (Translated)
      const label = btnMode === "work" ? "Work" : "Break";
      btn.textContent = label;

      // LOCK LOGIC
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
        // Active Mode: uses the mode color, MAINTAINING FIXED WIDTH (w-36)
        btn.className = `mode-btn px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-200 shadow-xl w-36 bg-${modeColor}-500 text-white dark:bg-${modeColor}-600`;
      } else {
        // Inactive Mode: default color, MAINTAINING FIXED WIDTH (w-36)
        btn.className = `mode-btn px-6 py-3 text-lg font-semibold rounded-full transition-colors duration-200 shadow-md w-36 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600`;
      }

      // FINAL APPLICATION OF OPACITY and LOCKING
      if (shouldDisable) {
        // Uses opacity-40 for a dimmer tone, similar to navigation buttons
        btn.classList.add("opacity-40", "pointer-events-none");
      } else {
        btn.classList.remove("opacity-40", "pointer-events-none");
      }

      // Ensures the width class is not lost (w-36)
      btn.classList.add("w-36");
    });
  }
}
