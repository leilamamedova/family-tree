# Family Tree Visualizer

Interactive family tree application built with Next.js, React Flow, GraphQL, Apollo Client, MongoDB, and TypeScript.

This application allows users to create, edit, visualize, and manage dynamic family relationships inside an interactive graph-based tree structure.

---

# Features

## Family Tree Visualization

- Interactive family tree graph
- Parent / child relationships
- Spouse relationships
- Shared children between spouses
- Multi-root family support
- Smart family connector system

## Person Management

- Add new family members
- Edit existing people
- Delete family members
- Upload profile images
- Add birth / death years
- Add descriptions / biography

## Relationship Management

- Assign parents
- Assign spouses
- Automatic spouse synchronization
- Automatic shared parent assignment
- Prevent duplicate spouses

## User Experience

- Search and highlight people
- Zoom and pan controls
- Responsive modals
- Validation for required fields
- Interactive hover effects
- Modern UI

---

# Tech Stack

## Frontend

- Next.js 16
- React
- TypeScript
- React Flow
- Tailwind CSS
- Apollo Client
- Lucide React

## Backend

- GraphQL
- Apollo Server
- MongoDB
- Mongoose

---

# Architecture

Frontend and backend are implemented inside a single Next.js project using App Router.

## Frontend Responsibilities

- Graph rendering
- UI interactions
- Form handling
- Search
- Client state
- Apollo Client integration

## Backend Responsibilities

- GraphQL API
- MongoDB persistence
- Relationship synchronization
- Data validation
- Family logic

---

# Project Structure

```bash
src/
│
├── app/
│   │
│   ├── api/
│   │   └── graphql/
│   │       └── route.ts
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   │
│   ├── providers/
│   │   ├── ApolloProvider.tsx
│   │   └── ReactFlowProvider.tsx
│   │
│   ├── tree/
│   │   ├── TreeView.tsx
│   │   ├── PersonNode.tsx
│   │   ├── PersonModal.tsx
│   │   ├── AddPersonModal.tsx
│   │   ├── SearchBar.tsx
│   │   └── FamilyConnectorNode.tsx
│   │
│   └── ui/
│       └── ConfirmModal.tsx
│
├── graphql/
│   ├── personOperations.ts
│   ├── resolvers.ts
│   └── typeDefs.ts
│
├── lib/
│   ├── apollo-client.ts
│   ├── buildTreeLayout.ts
│   └── mongodb.ts
│
├── models/
│   └── PersonModel.ts
│
└── types/
    └── person.ts
```

---

# Installation

## 1. Clone repository

```bash
git clone <repo-url>
cd famtree
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/famtree
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/api/graphql
```

---

## 4. Run MongoDB

Make sure MongoDB server is running locally.

---

## 5. Start development server

```bash
npm run dev
```

---

# GraphQL API

## Endpoint

```bash
/api/graphql
```

## Queries

- `persons`
- `person(id)`
- `searchPersons(query)`

## Mutations

- `createPerson`
- `updatePerson`
- `deletePerson`

---

# Family Logic

## Shared Parents

If a selected parent has a spouse, the child automatically receives both parents.

## Spouse Synchronization

Spouse relationships are bidirectional:

```txt
Ahmed ↔ Sandra
```

If one spouse changes, the other is updated automatically.

## Connector Nodes

Invisible connector nodes are used to create cleaner family tree layouts between parents and children.

---

# Current Limitations

- Images are currently stored as local object URLs
- No authentication system yet
- No cloud image storage yet
- No drag-and-drop node repositioning persistence

---

# Planned Features

- Cloud image uploads
- Authentication
- Role permissions
- Relationship editing visualization
- Tree export
- Drag-and-drop editing
- Multiple spouses history
- Marriage dates
- Family grouping
- Timeline mode

---

# License

MIT
