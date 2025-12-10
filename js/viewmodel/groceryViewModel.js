// js/viewmodel/groceryViewModel.js

import { GroceryModel } from "../model/groceryModel.js";

/**
 * Manages the state and business logic for the Grocery List.
 * It's an Observable that notifies the View (Observer) of changes.
 */
export class GroceryViewModel {
  constructor() {
    this.model = new GroceryModel();
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  notifyObservers() {
    const state = {
      items: this.model.getAllItems(),
      uncheckedCount: this.model.getAllItems().filter((i) => !i.checked).length,
      totalCount: this.model.getAllItems().length,
    };
    this.observers.forEach((observer) => observer(state));
  }

  // --- Model Operations ---

  addItem(item, quantity) {
    if (item.trim() && quantity.trim()) {
      this.model.addItem(item, quantity);
      this.notifyObservers();
    }
  }

  toggleItem(id) {
    this.model.toggleItem(id);
    this.notifyObservers();
  }

  removeItem(id) {
    this.model.removeItem(id);
    this.notifyObservers();
  }

  clearChecked() {
    this.model.clearChecked();
    this.notifyObservers();
  }
}
