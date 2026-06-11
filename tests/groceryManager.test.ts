import { GroceryManager } from '../src/index';

describe('GroceryManager', () => {
  let manager: GroceryManager;

  beforeEach(() => {
    manager = new GroceryManager(100);
  });

  test('should create a grocery manager with a budget', () => {
    const list = manager.getList();
    expect(list.budget).toBe(100);
    expect(list.items).toHaveLength(0);
  });

  test('should add an item to the grocery list', () => {
    const item = manager.addItem('Apples', 5, 'Fruits', 2.5);
    const list = manager.getList();
    expect(list.items).toHaveLength(1);
    expect(item.name).toBe('Apples');
    expect(item.quantity).toBe(5);
  });

  test('should remove an item from the grocery list', () => {
    const item = manager.addItem('Apples', 5, 'Fruits', 2.5);
    const removed = manager.removeItem(item.id);
    expect(removed).toBe(true);
    expect(manager.getList().items).toHaveLength(0);
  });

  test('should mark an item as purchased', () => {
    const item = manager.addItem('Apples', 5, 'Fruits', 2.5);
    const marked = manager.markAsPurchased(item.id);
    expect(marked).toBe(true);
    const updatedItem = manager.getList().items[0];
    expect(updatedItem.purchased).toBe(true);
  });

  test('should calculate total spent correctly', () => {
    manager.addItem('Apples', 5, 'Fruits', 2.5);
    manager.addItem('Bread', 2, 'Bakery', 3.0);
    
    const items = manager.getList().items;
    manager.markAsPurchased(items[0].id);
    manager.markAsPurchased(items[1].id);
    
    const list = manager.getList();
    expect(list.totalSpent).toBe(18.5); // (5 * 2.5) + (2 * 3.0)
  });

  test('should filter items by category', () => {
    manager.addItem('Apples', 5, 'Fruits', 2.5);
    manager.addItem('Bananas', 3, 'Fruits', 1.5);
    manager.addItem('Bread', 2, 'Bakery', 3.0);
    
    const fruits = manager.getItemsByCategory('Fruits');
    expect(fruits).toHaveLength(2);
    expect(fruits.every(item => item.category === 'Fruits')).toBe(true);
  });

  test('should calculate budget remaining', () => {
    manager.addItem('Apples', 5, 'Fruits', 2.5);
    const item = manager.getList().items[0];
    manager.markAsPurchased(item.id);
    
    const remaining = manager.getTotalBudgetRemaining();
    expect(remaining).toBe(87.5); // 100 - 12.5
  });
});
