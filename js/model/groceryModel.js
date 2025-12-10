// js/model/groceryModel.js

/**
 * Manages the persistence of the Grocery List using localStorage.
 */
export class GroceryModel {
  constructor() {
    this.storageKey = "groceryListItems";
    this.items = this.loadItems();
  }

  /**
   * Loads items from localStorage or returns an empty array.
   * @returns {Array} List of grocery items.
   */
  loadItems() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error loading grocery list from storage:", e);
      return [];
    }
  }

  /**
   * Saves the current list to localStorage.
   */
  saveItems() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.error("Error saving grocery list to storage:", e);
    }
  }

  /**
   * Generates a simple unique ID.
   * @private
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Adds a new item to the list.
   * @param {string} item - The name of the item.
   * @param {string} quantity - The required quantity.
   */
  addItem(item, quantity) {
    const newItem = {
      id: this._generateId(),
      item: item,
      quantity: quantity,
      checked: false, // Indicates if the item has been placed in the cart
    };
    this.items.push(newItem);
    this.saveItems();
    return newItem;
  }

  /**
   * Toggles the checked status of an item.
   * @param {string} id - The ID of the item.
   */
  toggleItem(id) {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.checked = !item.checked;
      this.saveItems();
    }
  }

  /**
   * Removes an item from the list.
   * @param {string} id - The ID of the item.
   */
  removeItem(id) {
    this.items = this.items.filter((i) => i.id !== id);
    this.saveItems();
  }

  /**
   * Removes all items marked as checked.
   */
  clearChecked() {
    this.items = this.items.filter((i) => !i.checked);
    this.saveItems();
  }

  /**
   * Returns the current list of items.
   * @returns {Array}
   */
  getAllItems() {
    return this.items;
  }
}
