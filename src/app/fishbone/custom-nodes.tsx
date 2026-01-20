import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { FishboneNodeData } from './types';

const FishboneHeadNode = ({ data, id }: NodeProps<FishboneNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(data.label);

  const handleSave = () => {
    setIsEditing(false);
    if (data.onChange) data.onChange(value);
  };

  return (
    <div className="relative flex h-[60px] min-w-[150px] items-center justify-center cursor-default transition-all">
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />

      <div className="relative z-10 flex w-full flex-col items-center justify-center rounded-lg border-2 border-red-600 bg-red-500 p-2 shadow-lg text-white">
        {isEditing ? (
          <div className="flex gap-1">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-8 bg-white/90 text-black"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-red-600" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="group flex items-center justify-center gap-2">
            <span className="text-lg font-bold uppercase tracking-wider">{data.label}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/80 hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FishboneNode = ({ data, id }: NodeProps<FishboneNodeData>) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(data.label);

  const handleSave = () => {
    setIsEditing(false);
    if (data.onChange) data.onChange(value);
  };

  // Styles based on type
  const isBone = data.type === 'bone';
  const bgColor = isBone ? 'bg-white' : 'bg-slate-50';
  const borderColor = isBone ? 'border-blue-500' : 'border-slate-300';
  const textColor = isBone ? 'text-slate-800' : 'text-slate-600';

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-400" id="bottom" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-400" id="top" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-400" id="source-bottom" />
      <Handle type="source" position={Position.Top} className="!w-2 !h-2 !bg-gray-400" id="source-top" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-400" id="source-right" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-400" id="target-left" />

      <div className={`
        relative z-10 min-w-[120px] rounded border px-3 py-2 shadow-sm transition-all
        ${bgColor} ${borderColor} ${textColor}
        ${isBone ? 'border-2 font-semibold' : 'border text-sm'}
      `}>
        {isEditing ? (
          <div className="flex gap-1 min-w-[150px]">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-7 text-xs"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span>{data.label}</span>
            <div className={`flex gap-1 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-slate-400 hover:text-blue-500"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              {data.onAddChild && (
                <button
                  onClick={data.onAddChild}
                  className="p-1 text-slate-400 hover:text-green-500"
                  title="Add Sub-cause"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
              {data.onDelete && (
                <button
                  onClick={data.onDelete}
                  className="p-1 text-slate-400 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const nodeTypes = {
  fishboneHead: memo(FishboneHeadNode),
  fishboneNode: memo(FishboneNode),
};
