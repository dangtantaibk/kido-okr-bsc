export type FishboneNodeData = {
  label: string;
  type: 'head' | 'bone' | 'cause' | 'sub-cause';
  onChange?: (label: string) => void;
  onAddChild?: () => void;
  onDelete?: () => void;
};

export type FishboneStructure = {
  id: string;
  label: string;
  children: FishboneStructure[];
};
