// js/view/groceryView.js

import { GroceryViewModel } from "../viewmodel/groceryViewModel.js";

export class GroceryView {
  constructor(containerId) {
    this.viewModel = new GroceryViewModel();
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(
        `Container with ID '${containerId}' not found for Grocery List.`
      );
      return;
    }

    this.renderInitialUI();
    this.viewModel.addObserver(this.updateUI.bind(this));
  }

  /**
   * Renders the initial skeleton of the form and list.
   */
  renderInitialUI() {
    this.container.innerHTML = `
            <div class="space-y-6">
                
                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner">
                    <form id="add-grocery-item-form" class="flex flex-col space-y-3">
                        
                        <div class="flex space-x-3">
                            <input type="text" id="item-name" placeholder="Item (Ex: Milk)"
                                class="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-grocery-500 focus:border-grocery-500 dark:bg-gray-600 dark:text-white flex-grow"
                                required>

                            <input type="text" id="item-quantity" placeholder="Quantity"
                                class="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-grocery-500 focus:border-grocery-500 dark:bg-gray-600 dark:text-white w-2/5"
                                required>
                        </div>
                        
                        <button type="submit"
                            class="bg-grocery-600 text-gray-700 dark:text-gray-100 font-bold py-2 rounded-lg shadow-md hover:bg-grocery-700 transition duration-200">
                            + Add to List
                        </button>
                    </form>
                </div>
                
                <div id="grocery-list" class="space-y-2">
                </div>

                <div id="grocery-footer" class="flex justify-between items-center text-gray-600 dark:text-gray-400 border-t pt-3 border-gray-200 dark:border-gray-700">
                    <span id="unchecked-count">0 items remaining</span>
                    
                    <button id="clear-checked" class="text-sm hover:text-red-500 disabled:opacity-50" disabled>
                        Clear Checked Items
                    </button>
                </div>

            </div>
        `;
    this._attachEventListeners();
    this.viewModel.notifyObservers(); // Forces the first update
  }

  /**
   * Connects events to the ViewModel.
   * @private
   */
  _attachEventListeners() {
    // 1. Form Submission Event
    document
      .getElementById("add-grocery-item-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const itemNameElement = document.getElementById("item-name");
        const itemQuantityElement = document.getElementById("item-quantity");

        const item = itemNameElement.value.trim();
        const quantity = itemQuantityElement.value.trim();

        const quantityRegex = /^(\d+([.,]\d+)?)/;

        if (!quantity || !quantityRegex.test(quantity)) {
          // Se a validação falhar, define a mensagem de erro e reporta (simulando a caixa flutuante)
          itemQuantityElement.setCustomValidity(
            "Quantity must start with a valid number (e.g., '3 kg', '1.5 lbs')."
          );
          itemQuantityElement.reportValidity();

          // Limpa a mensagem após um pequeno atraso para permitir futuras validações
          setTimeout(() => {
            itemQuantityElement.setCustomValidity("");
          }, 2000);

          return;
        }

        // Se a validação passar, certifique-se de que a mensagem de erro esteja vazia
        itemQuantityElement.setCustomValidity("");

        this.viewModel.addItem(item, quantity);

        // Clears fields after adding
        itemNameElement.value = "";
        itemQuantityElement.value = "";
        itemNameElement.focus();
      });

    // 2. Toggle and Removal Events (Event Delegation)
    document.getElementById("grocery-list").addEventListener("click", (e) => {
      const listItem = e.target.closest(".grocery-item");
      if (!listItem) return;
      const id = listItem.dataset.id;

      // Checkbox/Toggle Completion
      if (e.target.closest(".toggle-checked")) {
        this.viewModel.toggleItem(id);
      }

      // Removal Button (Trashcan)
      if (e.target.closest(".remove-item")) {
        this.viewModel.removeItem(id);
      }
    });

    // 3. Clear Checked Items
    document.getElementById("clear-checked").addEventListener("click", () => {
      this.viewModel.clearChecked();
    });
  }

  /**
   * Observer Pattern: Updates the interface based on the ViewModel state.
   * @param {Object} state - The current state (items, uncheckedCount, etc.)
   */
  updateUI(state) {
    const listContainer = document.getElementById("grocery-list");
    listContainer.innerHTML = ""; // Clears the existing list

    // 1. Renders each item
    state.items.forEach((item) => {
      const checkedClass = item.checked ? "line-through opacity-40" : "";

      const listItem = document.createElement("div");
      listItem.dataset.id = item.id;
      listItem.classList.add(
        "grocery-item",
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

      listItem.innerHTML = `
                <div class="flex items-start flex-grow min-w-0"> 
                    
                    <button class="toggle-checked w-6 h-6 border-2 border-grocery-500 rounded mr-3 flex items-center justify-center transition duration-150 flex-shrink-0 mt-0.5" data-id="${
                      item.id
                    }">
                        ${
                          item.checked
                            ? '<span class="text-white text-lg leading-none">✔</span>'
                            : ""
                        }
                    </button>

                    <div class="flex flex-col flex-grow min-w-0">
                        <p class="text-gray-800 dark:text-white font-semibold break-words ${checkedClass}">
                            ${item.item}
                        </p>
                        <span class="text-sm text-gray-500 dark:text-gray-400 ${checkedClass}">
                            Qty: ${item.quantity}
                        </span>
                    </div>
                </div>
                
                <button class="remove-item text-gray-400 hover:text-red-500 ml-4 p-1 rounded-full flex-shrink-0" data-id="${
                  item.id
                }" aria-label="Remove Item">
                    <span class="text-xl">🗑️</span> 
                </button>
            `;

      // Styles the button/checkbox when checked
      const toggleBtn = listItem.querySelector(".toggle-checked");
      if (item.checked) {
        toggleBtn.classList.add("bg-grocery-500", "border-grocery-500");
      } else {
        toggleBtn.classList.remove("bg-grocery-500", "border-grocery-500");
      }

      listContainer.appendChild(listItem);
    });

    // 2. Updates the Footer
    document.getElementById(
      "unchecked-count"
    ).textContent = `${state.uncheckedCount} items remaining`;

    // Enables/Disables the 'Clear Checked Items' button
    const clearBtn = document.getElementById("clear-checked");
    clearBtn.disabled = state.totalCount - state.uncheckedCount === 0;
  }
}
