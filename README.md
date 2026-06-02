# Family Tree Visualizer

Interactive family tree application built with Next.js, React Flow, TypeScript, and Tailwind CSS.

This project allows users to create, visualize, and manage dynamic family relationships inside an interactive tree structure.

---

# Features

- Interactive family tree visualization
- Add new family members
- Edit existing person cards
- Delete family members
- Parent / child relationships
- Spouse relationships
- Shared children between parents
- Search and highlight people
- Image upload support
- Dynamic graph layout generation
- Zoom and pan controls
- Responsive modal system
- Modern UI with Tailwind CSS

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- React Flow
- Tailwind CSS
- Lucide React Icons

---

# Project Structure

```bash
src/
│
├── app/
│
├── components/
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
├── data/
│   └── mockPeople.ts
│
├── lib/
│   └── buildTreeLayout.ts
│
└── types/
    └── person.ts
```
