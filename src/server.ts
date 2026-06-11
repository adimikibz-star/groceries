import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { GroceryManager } from './index';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store for demo purposes
const groceryManagers = new Map<string, GroceryManager>();

// Initialize a default list
if (groceryManagers.size === 0) {
  const defaultManager = new GroceryManager(100);
  defaultManager.addItem('Apples', 5, 'Fruits', 2.5);
  defaultManager.addItem('Bananas', 3, 'Fruits', 1.5);
  defaultManager.addItem('Milk', 1, 'Dairy', 4.5);
  groceryManagers.set('default', defaultManager);
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all lists
app.get('/api/lists', (req: Request, res: Response) => {
  const lists = Array.from(groceryManagers.entries()).map(([id, manager]) => ({
    id,
    list: manager.getList()
  }));
  res.json(lists);
});

// Get specific list
app.get('/api/lists/:id', (req: Request, res: Response) => {
  const manager = groceryManagers.get(req.params.id);
  if (!manager) {
    return res.status(404).json({ error: 'List not found' });
  }
  res.json({ id: req.params.id, list: manager.getList() });
});

// Create new list
app.post('/api/lists', (req: Request, res: Response) => {
  const { budget = 100 } = req.body;
  const id = `list_${Date.now()}`;
  const manager = new GroceryManager(budget);
  groceryManagers.set(id, manager);
  res.status(201).json({ id, list: manager.getList() });
});

// Add item to list
app.post('/api/lists/:id/items', (req: Request, res: Response) => {
  const manager = groceryManagers.get(req.params.id);
  if (!manager) {
    return res.status(404).json({ error: 'List not found' });
  }

  const { name, quantity, category, price } = req.body;
  if (!name || !quantity || !category || price === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const item = manager.addItem(name, quantity, category, price);
  res.status(201).json({ item, list: manager.getList() });
});

// Mark item as purchased
app.patch('/api/lists/:id/items/:itemId/purchase', (req: Request, res: Response) => {
  const manager = groceryManagers.get(req.params.id);
  if (!manager) {
    return res.status(404).json({ error: 'List not found' });
  }

  const success = manager.markAsPurchased(req.params.itemId);
  if (!success) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json({ list: manager.getList() });
});

// Remove item from list
app.delete('/api/lists/:id/items/:itemId', (req: Request, res: Response) => {
  const manager = groceryManagers.get(req.params.id);
  if (!manager) {
    return res.status(404).json({ error: 'List not found' });
  }

  const success = manager.removeItem(req.params.itemId);
  if (!success) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json({ list: manager.getList() });
});

// Get items by category
app.get('/api/lists/:id/categories/:category', (req: Request, res: Response) => {
  const manager = groceryManagers.get(req.params.id);
  if (!manager) {
    return res.status(404).json({ error: 'List not found' });
  }

  const items = manager.getItemsByCategory(req.params.category);
  res.json({ category: req.params.category, items });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Grocery Manager API running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API endpoints:`);
  console.log(`   GET    /api/lists`);
  console.log(`   POST   /api/lists`);
  console.log(`   GET    /api/lists/:id`);
  console.log(`   POST   /api/lists/:id/items`);
  console.log(`   PATCH  /api/lists/:id/items/:itemId/purchase`);
  console.log(`   DELETE /api/lists/:id/items/:itemId`);
  console.log(`   GET    /api/lists/:id/categories/:category\n`);
});
