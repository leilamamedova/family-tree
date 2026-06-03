'use client';

import ReactFlow, { Background, Controls, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import PersonNode from './PersonNode';
import FamilyConnectorNode from './FamilyConnectorNode';
import SearchBar from './SearchBar';
import { Person } from '@/types/person';
import { buildTreeLayout } from '@/lib/buildTreeLayout';
import PersonModal from './PersonModal';
import AddPersonModal from './AddPersonModal';
import {
  CREATE_PERSON,
  DELETE_PERSON,
  GET_PERSONS,
  UPDATE_PERSON,
} from '@/graphql/personOperations';

const nodeTypes = {
  person: PersonNode,
  familyConnector: FamilyConnectorNode,
};

export default function TreeView() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'root' | 'child' | 'parent'>('root');

  const { setCenter } = useReactFlow();

  const { data, loading, error, refetch } = useQuery(GET_PERSONS);

  const [createPersonMutation] = useMutation(CREATE_PERSON);
  const [updatePersonMutation] = useMutation(UPDATE_PERSON);
  const [deletePersonMutation] = useMutation(DELETE_PERSON);

  const peopleState = useMemo(() => {
    return data?.persons || [];
  }, [data]);

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

  async function deletePerson(personId: string) {
    await deletePersonMutation({
      variables: {
        id: personId,
      },
    });

    setSelectedPerson(null);
    await refetch();
  }

  async function updatePerson(updatedPerson: Person) {
    await updatePersonMutation({
      variables: {
        id: updatedPerson.id,
        input: {
          firstName: updatedPerson.firstName,
          lastName: updatedPerson.lastName,
          birthYear: updatedPerson.birthYear,
          deathYear: updatedPerson.deathYear,
          image: updatedPerson.image,
          description: updatedPerson.description,
          parents: updatedPerson.parents || [],
          children: updatedPerson.children || [],
          spouseId: updatedPerson.spouseId || null,
        },
      },
    });

    setSelectedPerson(updatedPerson);
    await refetch();
  }

  async function handleCreatePerson(person: Person) {
    await createPersonMutation({
      variables: {
        input: {
          firstName: person.firstName,
          lastName: person.lastName,
          birthYear: person.birthYear,
          deathYear: person.deathYear,
          image: person.image,
          description: person.description,
          parents: person.parents || [],
          children: person.children || [],
          spouseId: person.spouseId || null,
        },
      },
    });

    await refetch();
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading family tree...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        Failed to load family tree.
      </div>
    );
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
        people={peopleState}
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
