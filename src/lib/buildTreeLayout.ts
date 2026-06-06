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

type ChildUnit = {
  childId: string;
  unitKey: string;
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
  people.forEach((person) => map.set(person.id, person));

  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  const placedPeople = new Set<string>();
  const placedUnits = new Set<string>();
  const measuringUnits = new Set<string>();
  const renderedEdges = new Set<string>();
  const connectorNodes = new Set<string>();

  const LEVEL_HEIGHT = 300;
  const NODE_BOX_WIDTH = 170;
  const SPOUSE_GAP = 180;
  const CHILD_UNIT_GAP = 70;
  const ROOT_GAP = 80;
  const CONNECTOR_OFFSET_Y = 180;
  const CONNECTOR_SIZE = 8;

  function getCoupleKey(a: string, b: string) {
    return [a, b].sort().join('__');
  }

  function getNode(id: string) {
    return nodes.find((node) => node.id === id);
  }

  function getEffectiveParents(person: Person) {
    const parents = person.parents || [];

    if (parents.length === 1) {
      const parent = map.get(parents[0]);

      if (parent?.spouseId && map.has(parent.spouseId)) {
        return [parent.id, parent.spouseId];
      }
    }

    return parents;
  }

  function getUnitKey(personId: string) {
    const person = map.get(personId);

    if (!person?.spouseId || !map.has(person.spouseId)) {
      return personId;
    }

    return getCoupleKey(person.id, person.spouseId);
  }

  function getUnitMembers(unitKey: string) {
    return unitKey.split('__').filter((id) => map.has(id));
  }

  function getUnitOwnWidth(unitKey: string) {
    const members = getUnitMembers(unitKey);

    if (members.length === 2) {
      return SPOUSE_GAP + NODE_BOX_WIDTH;
    }

    return NODE_BOX_WIDTH;
  }

  function getPersonParentUnitKeys(person: Person) {
    const parents = getEffectiveParents(person);
    const ownUnitKey = getUnitKey(person.id);
    const parentUnitKeys = new Set<string>();

    parents.forEach((parentId) => {
      const parentUnitKey = getUnitKey(parentId);

      if (parentUnitKey !== ownUnitKey) {
        parentUnitKeys.add(parentUnitKey);
      }
    });

    return Array.from(parentUnitKeys);
  }

  const allUnitKeys = Array.from(
    new Set(people.map((person) => getUnitKey(person.id))),
  );

  const unitParentMap = new Map<string, string[]>();
  const unitPrimaryParentMap = new Map<string, string>();

  allUnitKeys.forEach((unitKey) => {
    const parentUnitKeys = new Set<string>();

    getUnitMembers(unitKey).forEach((memberId) => {
      const member = map.get(memberId);

      if (!member) return;

      getPersonParentUnitKeys(member).forEach((parentUnitKey) => {
        parentUnitKeys.add(parentUnitKey);
      });
    });

    const parents = Array.from(parentUnitKeys);

    unitParentMap.set(unitKey, parents);

    if (parents.length > 0) {
      unitPrimaryParentMap.set(unitKey, parents[0]);
    }
  });

  const unitDepths = new Map<string, number>();

  allUnitKeys.forEach((unitKey) => {
    unitDepths.set(unitKey, 0);
  });

  for (let i = 0; i < allUnitKeys.length * 4; i += 1) {
    let changed = false;

    allUnitKeys.forEach((unitKey) => {
      const parents = unitParentMap.get(unitKey) || [];

      if (parents.length === 0) return;

      const requiredDepth =
        Math.max(
          ...parents.map((parentUnitKey) => unitDepths.get(parentUnitKey) || 0),
        ) + 1;

      const currentDepth = unitDepths.get(unitKey) || 0;

      if (currentDepth < requiredDepth) {
        unitDepths.set(unitKey, requiredDepth);
        changed = true;
      }
    });

    if (!changed) break;
  }

  function getPrimaryChildUnits(parentUnitKey: string): ChildUnit[] {
    const result: ChildUnit[] = [];
    const seenUnits = new Set<string>();

    people.forEach((person) => {
      const unitKey = getUnitKey(person.id);

      if (unitPrimaryParentMap.get(unitKey) !== parentUnitKey) return;
      if (seenUnits.has(unitKey)) return;

      seenUnits.add(unitKey);

      result.push({
        childId: person.id,
        unitKey,
      });
    });

    return result;
  }

  function measureUnit(unitKey: string): number {
    if (measuringUnits.has(unitKey)) {
      return getUnitOwnWidth(unitKey);
    }

    measuringUnits.add(unitKey);

    const ownWidth = getUnitOwnWidth(unitKey);
    const children = getPrimaryChildUnits(unitKey);

    if (children.length === 0) {
      measuringUnits.delete(unitKey);
      return ownWidth;
    }

    const childrenWidth =
      children.reduce((sum, childUnit) => {
        return sum + measureUnit(childUnit.unitKey);
      }, 0) +
      Math.max(children.length - 1, 0) * CHILD_UNIT_GAP;

    measuringUnits.delete(unitKey);

    return Math.max(ownWidth, childrenWidth);
  }

  function addPersonNode(id: string, x: number, y: number) {
    const existingNode = getNode(id);

    if (existingNode) {
      existingNode.x = x;
      existingNode.y = y;
      placedPeople.add(id);
      return;
    }

    placedPeople.add(id);

    nodes.push({
      id,
      x,
      y,
      type: 'person',
    });
  }

  function addConnectorNode(id: string, x: number, y: number) {
    const existingNode = getNode(id);

    if (existingNode) {
      existingNode.x = x;
      existingNode.y = y;
      return;
    }

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
    const edgeKey = `spouse-${getCoupleKey(personId, spouseId)}`;

    if (renderedEdges.has(edgeKey)) return;

    renderedEdges.add(edgeKey);

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

  function addFamilyEdge(
    id: string,
    source: string,
    target: string,
    sourceHandle: string,
    targetHandle: string,
  ) {
    if (renderedEdges.has(id)) return;

    renderedEdges.add(id);

    edges.push({
      id,
      source,
      target,
      sourceHandle,
      targetHandle,
      type: 'step',
      style: FAMILY_EDGE_STYLE,
    });
  }

  function getUnitCenterX(unitKey: string) {
    const members = getUnitMembers(unitKey);
    const firstNode = getNode(members[0]);

    if (!firstNode) return 0;

    const ownWidth = getUnitOwnWidth(unitKey);

    return firstNode.x + ownWidth / 2;
  }

  function getUnitY(unitKey: string) {
    return (unitDepths.get(unitKey) || 0) * LEVEL_HEIGHT;
  }

  function layoutUnit(unitKey: string, leftX: number) {
    if (placedUnits.has(unitKey)) return;

    placedUnits.add(unitKey);

    const members = getUnitMembers(unitKey);

    if (members.length === 0) return;

    const unitWidth = measureUnit(unitKey);
    const ownWidth = getUnitOwnWidth(unitKey);
    const ownLeftX = leftX + (unitWidth - ownWidth) / 2;
    const y = getUnitY(unitKey);

    const firstPersonId = members[0];
    const secondPersonId = members[1];

    addPersonNode(firstPersonId, ownLeftX, y);

    if (secondPersonId) {
      addPersonNode(secondPersonId, ownLeftX + SPOUSE_GAP, y);
      addSpouseEdge(firstPersonId, secondPersonId);
    }

    const children = getPrimaryChildUnits(unitKey);

    if (children.length === 0) return;

    const parentCenterX = ownLeftX + ownWidth / 2;

    const childrenTotalWidth =
      children.reduce((sum, childUnit) => {
        return sum + measureUnit(childUnit.unitKey);
      }, 0) +
      Math.max(children.length - 1, 0) * CHILD_UNIT_GAP;

    let currentChildX = parentCenterX - childrenTotalWidth / 2;

    children.forEach((childUnit) => {
      const childWidth = measureUnit(childUnit.unitKey);

      layoutUnit(childUnit.unitKey, currentChildX);

      currentChildX += childWidth + CHILD_UNIT_GAP;
    });
  }

  function addAllFamilyEdges() {
    people.forEach((person) => {
      const parents = getEffectiveParents(person);

      if (parents.length === 0) return;

      const parentUnitKey = getUnitKey(parents[0]);
      const parentMembers = getUnitMembers(parentUnitKey);

      if (parentMembers.length === 0) return;

      const firstParentNode = getNode(parentMembers[0]);

      if (!firstParentNode) return;

      const parentCenterX = getUnitCenterX(parentUnitKey);
      const connectorId = `family-${parentUnitKey}`;
      const connectorX = parentCenterX - CONNECTOR_SIZE / 2;
      const connectorY = firstParentNode.y + CONNECTOR_OFFSET_Y;

      addConnectorNode(connectorId, connectorX, connectorY);

      parentMembers.forEach((parentId) => {
        addFamilyEdge(
          `parent-${parentId}-${connectorId}`,
          parentId,
          connectorId,
          'child-source',
          'top',
        );
      });

      addFamilyEdge(
        `${connectorId}-${person.id}`,
        connectorId,
        person.id,
        'bottom',
        'child-target',
      );
    });
  }

  const rootUnits = allUnitKeys.filter((unitKey) => {
    return (unitParentMap.get(unitKey) || []).length === 0;
  });

  let currentRootX = 0;

  rootUnits.forEach((unitKey) => {
    if (placedUnits.has(unitKey)) return;

    const width = measureUnit(unitKey);

    layoutUnit(unitKey, currentRootX);

    currentRootX += width + ROOT_GAP;
  });

  allUnitKeys.forEach((unitKey) => {
    if (placedUnits.has(unitKey)) return;

    const width = measureUnit(unitKey);

    layoutUnit(unitKey, currentRootX);

    currentRootX += width + ROOT_GAP;
  });

  function compactRows() {
    const rows = new Map<number, LayoutNode[]>();

    nodes.forEach((node) => {
      if (node.type !== 'person') return;

      const row = rows.get(node.y) || [];
      row.push(node);
      rows.set(node.y, row);
    });

    rows.forEach((row) => {
      row.sort((a, b) => a.x - b.x);

      let nextX = row[0]?.x ?? 0;

      row.forEach((node, index) => {
        if (index === 0) {
          nextX = node.x + NODE_BOX_WIDTH + CHILD_UNIT_GAP;
          return;
        }

        if (node.x > nextX) {
          node.x = nextX;
        }

        nextX = node.x + NODE_BOX_WIDTH + CHILD_UNIT_GAP;
      });
    });
  }

  // compactRows();
  addAllFamilyEdges();

  return { nodes, edges };
}
