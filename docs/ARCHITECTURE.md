# Grocery Shop List - Project Architecture Plan

## 📋 Project Overview
A collaborative household grocery shopping planner that allows family members to plan weekly groceries, track items, manage budgets, and share shopping lists in real-time.

---

## 🏗️ Architecture Overview

### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Web)                           │
│         React + TypeScript + Vite + Tailwind CSS             │
│                  (Deployed on Azure Static Web)              │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API / WebSocket
┌────────────────────┴────────────────────────────────────────┐
│              Backend API Layer                                │
│      Node.js + Express + TypeScript                          │
│         (Azure App Service / Container Instance)             │
│                                                              │
│  ├─ Authentication & Authorization (JWT + Azure AD)         │
│  ├─ REST API Endpoints                                      │
│  ├─ WebSocket for Real-time Updates                         │
│  ├─ MCP Server (Claude Integration)                         │
│  └─ Public API Documentation (OpenAPI/Swagger)              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────────┐  ┌────────▼──────────────┐
│   Database         │  │   Authentication      │
│  Azure SQL DB /    │  │   Azure AD / Auth0    │
│  PostgreSQL        │  │   JWT Tokens          │
│                    │  │                       │
│ Tables:            │  │                       │
│ - Users            │  │                       │
│ - Households       │  │                       │
│ - Shopping Lists   │  │                       │
│ - Items            │  │                       │
│ - Budgets          │  │                       │
│ - Activity Logs    │  │                       │
└────────────────────┘  └───────────────────────┘

        ┌────────────────────────────┐
        │   External Services        │
        ├────────────────────────────┤
        │ Azure Storage (Files)      │
        │ Azure Key Vault (Secrets)  │
        │ SendGrid (Email)           │
        │ Stripe (Payments - future) │
        └────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query + Zustand
- **Real-time**: Socket.io
- **API Client**: Axios + OpenAPI Generator
- **Deployment**: Azure Static Web Apps

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT + Azure AD / Auth0
- **Database ORM**: Prisma
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **Deployment**: Azure App Service / Container Apps

### Database
- **Primary**: Azure SQL Database (PostgreSQL option)
- **Caching**: Redis (Azure Cache for Redis)
- **Message Queue**: Azure Service Bus (for async tasks)

### Authentication & Security
- **Primary Auth**: Azure AD B2C (Multi-tenant families)
- **Alternative**: Auth0
- **JWT Tokens**: HS256 / RS256
- **Secrets Management**: Azure Key Vault
- **SSL/TLS**: HTTPS everywhere

### MCP Server
- **Model Context Protocol** integration
- Claude AI assistant for:
  - Natural language recipe suggestions
  - Dietary preference tracking
  - Smart shopping optimization
  - Budget recommendations

### Deployment & DevOps
- **IaC**: Azure Bicep / Terraform
- **Container**: Docker
- **CI/CD**: GitHub Actions
- **Environment**: Dev, Staging, Production
- **Monitoring**: Azure Monitor + Application Insights
- **Cost Optimization**: Auto-scaling, serverless functions

---

## 📊 Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  auth_provider VARCHAR(50), -- 'azure-ad', 'auth0'
  provider_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Households Table (Groups of people)
CREATE TABLE households (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget_limit DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Household Members
CREATE TABLE household_members (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Shopping Lists
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  week_of DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'completed'
  total_budget DECIMAL(10, 2),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shopping Items
CREATE TABLE shopping_items (
  id UUID PRIMARY KEY,
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- 'produce', 'dairy', 'meat', etc.
  quantity INTEGER,
  unit VARCHAR(50), -- 'kg', 'lbs', 'pcs'
  estimated_price DECIMAL(10, 2),
  actual_price DECIMAL(10, 2),
  is_purchased BOOLEAN DEFAULT FALSE,
  priority VARCHAR(50) DEFAULT 'normal', -- 'high', 'normal', 'low'
  notes TEXT,
  added_by UUID REFERENCES users(id),
  completed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budgets & Spending
CREATE TABLE spending_history (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  shopping_list_id UUID REFERENCES shopping_lists(id),
  total_spent DECIMAL(10, 2),
  recorded_by UUID REFERENCES users(id),
  recorded_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(255), -- 'added_item', 'completed_item', etc.
  entity_type VARCHAR(100),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/azure-callback` - Azure AD callback

### Users
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/avatar` - Upload avatar

### Households
- `GET /api/v1/households` - List user's households
- `POST /api/v1/households` - Create new household
- `GET /api/v1/households/:id` - Get household details
- `PUT /api/v1/households/:id` - Update household
- `DELETE /api/v1/households/:id` - Delete household
- `GET /api/v1/households/:id/members` - List members
- `POST /api/v1/households/:id/members` - Invite member
- `DELETE /api/v1/households/:id/members/:userId` - Remove member

### Shopping Lists
- `GET /api/v1/shopping-lists` - List shopping lists (filtered by household)
- `POST /api/v1/shopping-lists` - Create shopping list
- `GET /api/v1/shopping-lists/:id` - Get list details
- `PUT /api/v1/shopping-lists/:id` - Update list
- `DELETE /api/v1/shopping-lists/:id` - Delete list
- `POST /api/v1/shopping-lists/:id/share` - Share list

### Shopping Items
- `GET /api/v1/shopping-lists/:listId/items` - Get items
- `POST /api/v1/shopping-lists/:listId/items` - Add item
- `PUT /api/v1/items/:itemId` - Update item
- `PATCH /api/v1/items/:itemId/complete` - Mark as purchased
- `DELETE /api/v1/items/:itemId` - Delete item

### Budgets & Analytics
- `GET /api/v1/households/:id/spending` - Get spending summary
- `POST /api/v1/households/:id/spending` - Record spending
- `GET /api/v1/households/:id/reports` - Generate report

### MCP Server
- `POST /api/v1/mcp/suggestions` - Get AI suggestions
- `POST /api/v1/mcp/recipes` - Get recipe recommendations
- `POST /api/v1/mcp/budget-optimization` - Budget advice

---

## 🤖 MCP Server Features

### Claude Integration Points
1. **Smart Suggestions**
   - Analyze past shopping patterns
   - Suggest items based on household preferences
   - Prevent duplicate items

2. **Dietary Preferences**
   - Handle allergies and restrictions
   - Suggest meal ideas
   - Optimize for health goals

3. **Budget Optimization**
   - Compare prices across items
   - Suggest alternatives
   - Track spending trends

4. **Recipe Integration**
   - Suggest recipes based on available items
   - Auto-populate shopping list from recipes
   - Nutritional information

---

## 🔐 Security Features

- **JWT Authentication** with short-lived tokens
- **Azure AD B2C** for enterprise/family management
- **Role-Based Access Control (RBAC)**
- **Encryption at rest** (Azure Key Vault)
- **HTTPS/TLS** for all connections
- **Input validation** with Zod schemas
- **SQL injection prevention** with Prisma ORM
- **Rate limiting** on API endpoints
- **CORS** properly configured
- **Audit logging** for all sensitive operations

---

## 📦 Project Structure

```
groceries/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── mcp/
│   │   ├── config/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── tests/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── infrastructure/
│   ├── bicep/
│   │   ├── main.bicep
│   │   ├── database.bicep
│   │   ├── app-service.bicep
│   │   └── parameters.json
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── docker-compose.prod.yml
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── MCP-INTEGRATION.md
│   └── DATABASE.md
│
├── .github/
│   └── workflows/
│       ├── backend-ci-cd.yml
│       ├── frontend-ci-cd.yml
│       └── deploy-infra.yml
│
└── README.md
```

---

## 🚀 Deployment Strategy

### Development
- Local environment with Docker Compose
- Local database (PostgreSQL in container)
- Mock authentication

### Staging
- Azure Container Registry
- Azure App Service (staging slot)
- Azure SQL Database (staging)
- Azure Static Web Apps (staging)

### Production
- Azure Container Registry
- Azure App Service (production)
- Azure SQL Database (production, replicated)
- Azure Static Web Apps (production)
- Azure CDN for static assets
- Azure Traffic Manager for failover

---

## 📈 Scaling & Performance

- **Database**: Connection pooling, read replicas
- **Backend**: Auto-scaling based on CPU/memory
- **Frontend**: CDN caching, code splitting
- **Real-time**: WebSocket with connection limits
- **Caching**: Redis for session & frequently accessed data
- **Async**: Azure Service Bus for background jobs

---

## 🧪 Testing Strategy

- **Unit Tests**: Jest (Backend & Frontend)
- **Integration Tests**: Supertest (Backend)
- **E2E Tests**: Playwright/Cypress (Frontend)
- **API Tests**: Postman/Newman
- **Load Testing**: k6 or Artillery
- **Security**: OWASP Top 10 checks

---

## 📊 Monitoring & Logging

- **Application Insights**: Performance metrics
- **Azure Monitor**: Infrastructure metrics
- **Winston Logs**: Structured logging
- **ELK Stack** (optional): Elasticsearch, Logstash, Kibana
- **Alerts**: CPU, memory, error rates
- **Dashboards**: Real-time visibility

---

## 💰 Cost Estimation (Monthly)

- Azure SQL DB (General Purpose): ~$50-100
- Azure App Service (B2): ~$50-75
- Azure Static Web Apps: ~$0-50
- Azure Cache for Redis: ~$40-80
- Azure Service Bus: ~$10-20
- Application Insights: ~$0-30
- **Total Estimate**: $150-350/month

---

## ✅ Phase 1: MVP (Weeks 1-4)
1. Setup infrastructure & CI/CD
2. Backend: Auth, users, households
3. Frontend: Login, dashboard, household creation
4. Database: Core schema

## ✅ Phase 2: Core Features (Weeks 5-8)
1. Shopping lists CRUD
2. Real-time collaboration
3. Budget tracking
4. Item categorization

## ✅ Phase 3: Smart Features (Weeks 9-12)
1. MCP Server integration
2. AI suggestions
3. Analytics & reporting
4. Mobile responsiveness improvements

## ✅ Phase 4: Polish & Scale (Weeks 13+)
1. Performance optimization
2. Security hardening
3. User feedback integration
4. Scale testing

---

## 🎯 Success Metrics

- Load time < 2s (frontend)
- API response time < 200ms (99th percentile)
- 99.9% uptime SLA
- Real-time sync latency < 500ms
- User adoption: 100% household members active
- Budget tracking accuracy: 100%

---

**Ready to proceed? Would you like me to:**
1. Start implementing Phase 1 (Infrastructure & Backend Setup)?
2. Adjust any architectural decisions?
3. Provide more details on specific components?
