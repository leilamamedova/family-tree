import type { CSSProperties } from 'react';
import { Person } from '@/types/person';

type LayoutNode = {
  id: string;
  x: number;
  y: number;
  type: 'person' | 'familyConnector';
};

type LayoutEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  style?: CSSProperties;
};

const SPOUSE_EDGE_STYLE: CSSProperties = {
  stroke: '#f59e0b',
  strokeWidth: 2,
};

const FAMILY_EDGE_STYLE: CSSProperties = {
  stroke: '#9ca3af',
  strokeWidth: 1.5,
};

export function buildTreeLayout(people: Person[]) {
  const map = new Map<string, Person>();
  people.forEach((p) => map.set(p.id, p));

  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  const placedPeople = new Set<string>();
  const renderedCouples = new Set<string>();
  const connectorNodes = new Set<string>();

  const LEVEL_HEIGHT = 190;
  const NODE_WIDTH = 180;
  const SPOUSE_GAP = 160;
  const CONNECTOR_OFFSET_Y = 135;
  const CONNECTOR_SIZE = 8;

  // PersonNode visual circle is 80px wide.
  // React Flow position is top-left, but handles are visually centered.
  const PERSON_HANDLE_CENTER_X = 40;

  function getCoupleKey(a: string, b: string) {
    return [a, b].sort().join('__');
  }

  function getEffectiveParents(person: Person) {
    const parents = person.parents || [];

    if (parents.length === 1) {
      const parent = map.get(parents[0]);

      if (parent?.spouseId) {
        return [parent.id, parent.spouseId];
      }
    }

    return parents;
  }

  function getCoupleChildren(parentA: string, parentB: string) {
    return people.filter((p) => {
      const parents = getEffectiveParents(p);

      return parents.includes(parentA) && parents.includes(parentB);
    });
  }

  function getSingleParentChildren(parentId: string) {
    return people.filter((p) => {
      const parents = getEffectiveParents(p);

      return parents.length === 1 && parents[0] === parentId;
    });
  }

  function getVisualWidth(personId: string) {
    const person = map.get(personId);

    if (!person) return NODE_WIDTH;

    if (person.spouseId) {
      return SPOUSE_GAP + NODE_WIDTH;
    }

    return NODE_WIDTH;
  }

  function addPersonNode(id: string, x: number, y: number) {
    if (placedPeople.has(id)) return;

    placedPeople.add(id);

    nodes.push({
      id,
      x,
      y,
      type: 'person',
    });
  }

  function addConnectorNode(id: string, x: number, y: number) {
    if (connectorNodes.has(id)) return;

    connectorNodes.add(id);

    nodes.push({
      id,
      x,
      y,
      type: 'familyConnector',
    });
  }

  function addSpouseEdge(personId: string, spouseId: string) {
    const coupleKey = getCoupleKey(personId, spouseId);
    const edgeKey = `spouse-${coupleKey}`;

    if (renderedCouples.has(edgeKey)) return;

    renderedCouples.add(edgeKey);

    edges.push({
      id: edgeKey,
      source: personId,
      target: spouseId,
      sourceHandle: 'spouse-source',
      targetHandle: 'spouse-target',
      type: 'straight',
      style: SPOUSE_EDGE_STYLE,
    });
  }

  function addCoupleChildrenLayout(
    parentAId: string,
    parentBId: string,
    depth: number,
    leftX: number,
    rightX: number,
  ) {
    const coupleKey = getCoupleKey(parentAId, parentBId);
    const childrenKey = `children-${coupleKey}`;

    if (renderedCouples.has(childrenKey)) return;

    const children = getCoupleChildren(parentAId, parentBId);

    if (children.length === 0) return;

    renderedCouples.add(childrenKey);

    const y = depth * LEVEL_HEIGHT;

    const leftHandleCenterX = leftX + PERSON_HANDLE_CENTER_X;
    const rightHandleCenterX = rightX + PERSON_HANDLE_CENTER_X;

    const connectorCenterX = (leftHandleCenterX + rightHandleCenterX) / 2;
    const connectorX = connectorCenterX - CONNECTOR_SIZE / 2;
    const connectorY = y + CONNECTOR_OFFSET_Y;

    const connectorId = `family-${coupleKey}`;

    addConnectorNode(connectorId, connectorX, connectorY);

    edges.push({
      id: `parent-${parentAId}-${connectorId}`,
      source: parentAId,
      target: connectorId,
      sourceHandle: 'child-source',
      targetHandle: 'top',
      type: 'straight',
      style: FAMILY_EDGE_STYLE,
    });

    edges.push({
      id: `parent-${parentBId}-${connectorId}`,
      source: parentBId,
      target: connectorId,
      sourceHandle: 'child-source',
      targetHandle: 'top',
      type: 'straight',
      style: FAMILY_EDGE_STYLE,
    });

    const childWidths = children.map((child) => getVisualWidth(child.id));
    const totalWidth = childWidths.reduce((sum, width) => sum + width, 0);
    const totalGaps = Math.max(children.length - 1, 0) * 40;
    const fullWidth = totalWidth + totalGaps;

    let currentX = connectorCenterX - fullWidth / 2;

    children.forEach((child, index) => {
      const childWidth = childWidths[index];
      const childX = currentX + childWidth / 2 - PERSON_HANDLE_CENTER_X;

      edges.push({
        id: `${connectorId}-${child.id}`,
        source: connectorId,
        target: child.id,
        sourceHandle: 'bottom',
        targetHandle: 'child-target',
        type: 'straight',
        style: FAMILY_EDGE_STYLE,
      });

      dfs(child.id, depth + 1, childX);

      currentX += childWidth + 40;
    });
  }

  function dfs(id: string, depth: number, x: number) {
    const person = map.get(id);

    if (!person) return;

    const y = depth * LEVEL_HEIGHT;

    addPersonNode(id, x, y);

    const spouseId = person.spouseId;
    const spouse = spouseId ? map.get(spouseId) : null;

    if (spouseId && spouse) {
      const existingPersonNode = nodes.find((n) => n.id === id);
      const personX = existingPersonNode?.x ?? x;

      const existingSpouseNode = nodes.find((n) => n.id === spouseId);
      const spouseX = existingSpouseNode
        ? existingSpouseNode.x
        : personX + SPOUSE_GAP;

      addPersonNode(spouseId, spouseX, y);

      addSpouseEdge(id, spouseId);

      const leftX = Math.min(personX, spouseX);
      const rightX = Math.max(personX, spouseX);

      addCoupleChildrenLayout(id, spouseId, depth, leftX, rightX);

      const singleChildren = getSingleParentChildren(id);

      singleChildren.forEach((child, index) => {
        const childX = x + index * NODE_WIDTH;

        edges.push({
          id: `${id}-${child.id}`,
          source: id,
          target: child.id,
          sourceHandle: 'child-source',
          targetHandle: 'child-target',
          type: 'straight',
          style: FAMILY_EDGE_STYLE,
        });

        dfs(child.id, depth + 1, childX);
      });

      return;
    }

    const singleChildren = getSingleParentChildren(id);

    singleChildren.forEach((child, index) => {
      const childX = x + index * NODE_WIDTH;

      edges.push({
        id: `${id}-${child.id}`,
        source: id,
        target: child.id,
        sourceHandle: 'child-source',
        targetHandle: 'child-target',
        type: 'straight',
        style: FAMILY_EDGE_STYLE,
      });

      dfs(child.id, depth + 1, childX);
    });
  }

  const roots = people.filter((person) => {
    const parents = getEffectiveParents(person);

    if (parents.length > 0) return false;

    if (person.spouseId) {
      const spouse = map.get(person.spouseId);

      if (spouse?.parents && spouse.parents.length > 0) {
        return false;
      }

      return person.id < person.spouseId;
    }

    return true;
  });

  let startX = 0;

  roots.forEach((root) => {
    if (placedPeople.has(root.id)) return;

    dfs(root.id, 0, startX);

    startX += NODE_WIDTH * 5;
  });

  people.forEach((person) => {
    if (!placedPeople.has(person.id)) {
      dfs(person.id, 0, startX);
      startX += NODE_WIDTH * 5;
    }
  });

  return { nodes, edges };
}
