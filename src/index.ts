// Grocery Shopping List Application

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  price: number;
  purchased: boolean;
}

interface GroceryList {
  items: GroceryItem[];
  budget: number;
  totalSpent: number;
}

class GroceryManager {
  private list: GroceryList;
  private nextId: number = 1;

  constructor(budget: number = 0) {
    this.list = {
      items: [],
      budget,
      totalSpent: 0
    };
  }

  addItem(name: string, quantity: number, category: string, price: number): GroceryItem {
    const item: GroceryItem = {
      id: String(this.nextId++),
      name,
      quantity,
      category,
      price,
      purchased: false
    };
    this.list.items.push(item);
    return item;
  }

  removeItem(id: string): boolean {
    const index = this.list.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.list.items.splice(index, 1);
      return true;
    }
    return false;
  }

  markAsPurchased(id: string): boolean {
    const item = this.list.items.find(item => item.id === id);
    if (item) {
      item.purchased = true;
      this.list.totalSpent += item.price * item.quantity;
      return true;
    }
    return false;
  }

  getList(): GroceryList {
    return this.list;
  }

  getItemsByCategory(category: string): GroceryItem[] {
    return this.list.items.filter(item => item.category === category);
  }

  getTotalBudgetRemaining(): number {
    return this.list.budget - this.list.totalSpent;
  }
}

export { GroceryManager, GroceryItem, GroceryList };
