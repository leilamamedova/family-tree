'use client';

import ReactFlow, { Background, Controls, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';

import { useMemo, useState } from 'react';
import { people as initialPeople } from '@/data/mockPeople';
import PersonNode from './PersonNode';
import FamilyConnectorNode from './FamilyConnectorNode';
import SearchBar from './SearchBar';
import { Person } from '@/types/person';
import { buildTreeLayout } from '@/lib/buildTreeLayout';
import PersonModal from './PersonModal';
import AddPersonModal from './AddPersonModal';

const nodeTypes = {
  person: PersonNode,
  familyConnector: FamilyConnectorNode,
};

export default function TreeView() {
  const [peopleState, setPeopleState] = useState<Person[]>(initialPeople);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'root' | 'child' | 'parent'>('root');

  const { setCenter } = useReactFlow();

  const { nodes, edges } = useMemo(() => {
    const result = buildTreeLayout(peopleState);

    const validNodes = result.nodes
      .map((n) => {
        if (n.type === 'familyConnector') {
          return {
            id: n.id,
            type: 'familyConnector',
            position: { x: n.x, y: n.y },
            data: {},
            draggable: false,
            selectable: false,
          };
        }

        const person = peopleState.find((p) => p.id === n.id);
        if (!person) return null;

        return {
          id: n.id,
          type: 'person',
          position: { x: n.x, y: n.y },
          data: {
            person,
            onClick: setSelectedPerson,
            highlighted: highlighted === n.id,
          },
        };
      })
      .filter((n): n is NonNullable<typeof n> => n !== null);

    return { nodes: validNodes, edges: result.edges };
  }, [peopleState, highlighted]);

  function handleSelectPerson(person: Person) {
    setHighlighted(person.id);

    const node = buildTreeLayout(peopleState).nodes.find(
      (n) => n.id === person.id,
    );

    if (node) {
      setCenter(node.x, node.y, {
        zoom: 1.5,
        duration: 800,
      });
    }
  }

  function deletePerson(personId: string) {
    setPeopleState((prev) =>
      prev
        .filter((p) => p.id !== personId)
        .map((p) => ({
          ...p,
          parents: (p.parents || []).filter((id) => id !== personId),
          spouseId: p.spouseId === personId ? null : p.spouseId,
        })),
    );

    setSelectedPerson(null);
  }

  function updatePerson(updatedPerson: Person) {
    setPeopleState((prev) =>
      prev.map((person) =>
        person.id === updatedPerson.id ? updatedPerson : person,
      ),
    );

    setSelectedPerson(updatedPerson);
  }

  function handleCreatePerson(person: Person) {
    setPeopleState((prev) => {
      const normalizedPerson: Person = { ...person };

      if (normalizedPerson.parents?.length) {
        const selectedParentId = normalizedPerson.parents[0];
        const selectedParent = prev.find((p) => p.id === selectedParentId);

        if (selectedParent?.spouseId) {
          normalizedPerson.parents = [
            selectedParent.id,
            selectedParent.spouseId,
          ];
        }
      }

      let updated = [...prev, normalizedPerson];

      if (normalizedPerson.spouseId) {
        updated = updated.map((p) =>
          p.id === normalizedPerson.spouseId
            ? { ...p, spouseId: normalizedPerson.id }
            : p,
        );
      }

      return updated;
    });
  }

  return (
    <div className="w-full h-screen relative">
      <SearchBar
        people={peopleState}
        onSelect={handleSelectPerson}
        onClear={() => setHighlighted(null)}
      />

      <button
        onClick={() => {
          setAddMode('root');
          setShowAddModal(true);
        }}
        className="absolute top-4 right-4 z-20 bg-black text-white px-4 py-2 rounded-full border border-transparent hover:border-blue-500"
      >
        + Add Person
      </button>

      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
      </ReactFlow>

      <PersonModal
        selectedPerson={selectedPerson}
        setSelectedPerson={setSelectedPerson}
        onDelete={deletePerson}
        onUpdate={updatePerson}
      />

      <AddPersonModal
        isOpen={showAddModal}
        mode={addMode}
        people={peopleState}
        onClose={() => setShowAddModal(false)}
        onCreate={handleCreatePerson}
      />
    </div>
  );
}
