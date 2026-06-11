# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "statusCode": 200
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

Request:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### POST /auth/login
Login user.

Request:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /auth/refresh
Refresh JWT token.

#### POST /auth/logout
Logout user.

### Households

#### GET /households
List all households for current user.

#### POST /households
Create a new household.

Request:
```json
{
  "name": "Smith Family",
  "description": "Family shopping",
  "budgetLimit": 500,
  "currency": "USD"
}
```

#### GET /households/:id
Get household details.

#### PUT /households/:id
Update household.

#### DELETE /households/:id
Delete household.

#### GET /households/:id/members
List household members.

#### POST /households/:id/members
Invite household member.

Request:
```json
{
  "email": "member@example.com",
  "role": "member"
}
```

### Shopping Lists

#### GET /shopping-lists
List shopping lists (filtered by household).

#### POST /shopping-lists
Create shopping list.

Request:
```json
{
  "householdId": "household-id",
  "name": "Weekly Groceries",
  "weekOf": "2024-01-08T00:00:00Z",
  "totalBudget": 150
}
```

#### GET /shopping-lists/:id
Get shopping list details.

#### PUT /shopping-lists/:id
Update shopping list.

#### DELETE /shopping-lists/:id
Delete shopping list.

### Shopping Items

#### GET /shopping-lists/:listId/items
Get items in shopping list.

#### POST /shopping-lists/:listId/items
Add item to shopping list.

Request:
```json
{
  "name": "Milk",
  "category": "dairy",
  "quantity": 2,
  "unit": "liters",
  "estimatedPrice": 3.99,
  "priority": "normal",
  "notes": "Whole milk preferred"
}
```

#### PUT /items/:itemId
Update shopping item.

#### PATCH /items/:itemId/complete
Mark item as purchased.

Request:
```json
{
  "actualPrice": 3.99
}
```

#### DELETE /items/:itemId
Delete item.

### Spending & Analytics

#### GET /households/:id/spending
Get spending summary.

#### POST /households/:id/spending
Record spending.

Request:
```json
{
  "totalSpent": 150,
  "recordedDate": "2024-01-08T12:00:00Z",
  "shoppingListId": "list-id"
}
```

#### GET /households/:id/reports
Generate spending report.

### MCP/AI Endpoints

#### POST /mcp/suggestions
Get AI-powered suggestions.

#### POST /mcp/recipes
Get recipe recommendations.

#### POST /mcp/budget-optimization
Get budget optimization advice.

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

## Rate Limiting

All endpoints are rate-limited to 100 requests per 15 minutes per IP address.

## Pagination

List endpoints support pagination:

```
GET /api/v1/households?page=1&limit=20&sortBy=createdAt&order=desc
```

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

## WebSocket Events

The application supports real-time updates via WebSocket.

Connect to: `ws://localhost:3000/socket.io`

### Events

- `item:added` - Item added to list
- `item:updated` - Item updated
- `item:completed` - Item marked as completed
- `list:updated` - Shopping list updated
- `member:joined` - Member joined household
- `member:left` - Member left household
