import { Edge, Node } from 'reactflow';
import { FishboneStructure } from './types';

const SPINE_Y = 300;
const SPACING_X = 250;
const RIB_HEIGHT = 150;
const RIB_OFFSET_X = 50;

export const calculateFishboneLayout = (
  data: FishboneStructure
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // 1. Head (Root Problem)
  const headId = data.id;

  const bones = data.children || [];
  const spineLength = (bones.length + 1) * SPACING_X;
  const headX = spineLength + 100;

  nodes.push({
    id: headId,
    type: 'fishboneHead',
    position: { x: headX, y: SPINE_Y - 25 },
    data: { label: data.label, type: 'head' },
  });

  // Main Spine Edge
  nodes.push({
    id: 'spine-tail',
    type: 'default',
    position: { x: 0, y: SPINE_Y },
    style: { width: 1, height: 1, opacity: 0 },
    data: { label: '' },
    draggable: false,
    connectable: false,
  });

  edges.push({
    id: `edge-spine`,
    source: 'spine-tail',
    target: headId,
    type: 'step',
    style: { stroke: '#64748b', strokeWidth: 4 },
    markerEnd: { type: 'arrowclosed' as any, color: '#64748b' },
  });

  // 2. Bones (Ribs)
  bones.forEach((bone, index) => {
    const boneX = (index + 1) * SPACING_X;
    const isTop = index % 2 === 0;
    const direction = isTop ? -1 : 1;
    const boneY = SPINE_Y + (direction * RIB_HEIGHT);
    const boneNodeX = boneX - RIB_OFFSET_X;

    nodes.push({
      id: bone.id,
      type: 'fishboneNode',
      position: { x: boneNodeX, y: boneY },
      data: { label: bone.label, type: 'bone' },
    });

    const anchorId = `anchor-${bone.id}`;
    nodes.push({
      id: anchorId,
      type: 'default',
      position: { x: boneX, y: SPINE_Y },
      style: { width: 1, height: 1, opacity: 0 },
      data: { label: '' },
      draggable: false,
      parentId: 'spine-tail',
    });

    const sourceHandle = isTop ? 'source-bottom' : 'source-top';

    edges.push({
      id: `edge-${bone.id}`,
      source: bone.id,
      target: anchorId,
      sourceHandle: sourceHandle,
      type: 'straight',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    });

    // 3. Recursive Children (Causes & Sub-causes)
    const processNodeHierarchy = (
      parentNode: FishboneStructure,
      parentX: number,
      parentY: number,
      level: number,
      direction: number // 1 (Bottom) or -1 (Top)
    ) => {
      if (!parentNode.children || parentNode.children.length === 0) return;

      parentNode.children.forEach((child, cIndex) => {
        let nodeX = 0;
        let nodeY = 0;

        // Visual refinements:
        // Increase horizontal spacing to avoid overlapping the parent node (especially for Bone -> Cause)
        if (level === 2) {
          // Level 2 (Causes): Shift right significantly
          nodeX = parentX + 180;
          // Vertical spacing
          nodeY = parentY + ((cIndex - (parentNode.children!.length - 1) / 2) * 80);
        } else {
          // Level 3+ (Sub-causes): Shift Right
          nodeX = parentX + 200;
          nodeY = parentY + ((cIndex - (parentNode.children!.length - 1) / 2) * 60);
        }

        nodes.push({
          id: child.id,
          type: 'fishboneNode',
          position: { x: nodeX, y: nodeY },
          data: { label: child.label, type: level === 2 ? 'cause' : 'sub-cause' },
        });

        edges.push({
          id: `edge-${child.id}`,
          source: parentNode.id,
          target: child.id,
          sourceHandle: 'source-right',
          targetHandle: 'target-left',
          type: 'bezier',
          style: { stroke: '#cbd5e1' },
        });

        processNodeHierarchy(child, nodeX, nodeY, level + 1, direction);
      });
    };

    if (bone.children) {
      processNodeHierarchy(bone, boneNodeX, boneY, 2, direction);
    }
  });

  return { nodes, edges };
};
