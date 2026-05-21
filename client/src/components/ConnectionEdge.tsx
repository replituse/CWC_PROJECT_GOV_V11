import { memo, type ReactNode } from 'react';
import {
  EdgeProps,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';

function PumpIcon({ color, label }: { color: string; label?: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: `2px solid ${color}`, background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#000', lineHeight: 1 }}>{label}</span>
    </div>
  );
}

function CheckValveIcon({ color, label }: { color: string; label?: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: `2px solid ${color}`, background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#000', lineHeight: 1 }}>{label}</span>
    </div>
  );
}

function TurbineIcon({ color, label }: { color: string; label?: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: `2px solid ${color}`, background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#000', lineHeight: 1 }}>{label}</span>
    </div>
  );
}

export const ConnectionEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  type,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edge = useNetworkStore(state => state.edges.find(e => e.id === id));
  const displayData = edge ? edge.data : data;

  const edgeType = displayData?.type as string;
  const isPump = edgeType === 'pump';
  const isCheckValve = edgeType === 'checkValve';
  const isTurbine = edgeType === 'turbine';
  const isElementEdge = isPump || isCheckValve || isTurbine;

  const isDummy = edgeType === 'dummy';
  const strokeColor = isPump ? '#f97316'
    : isCheckValve ? '#8b5cf6'
    : isTurbine ? '#14b8a6'
    : isDummy ? '#94a3b8'
    : '#3b82f6';
  const strokeDasharray = isDummy ? '8 8' : undefined;

  const tooltipTitle = isPump ? 'Pump Properties'
    : isCheckValve ? 'Check Valve Properties'
    : isTurbine ? 'Turbine Properties'
    : isDummy ? 'Dummy Pipe Properties'
    : 'Conduit Properties';

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: isElementEdge ? 2.5 : isDummy ? 2 : 2.5,
          stroke: strokeColor,
          strokeDasharray,
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <TooltipWrapper 
            content={<DataList data={displayData} title={tooltipTitle} />}
          >
            {isElementEdge ? (
              <div className="flex flex-col items-center gap-0.5 cursor-help">
                {isPump && <PumpIcon color={strokeColor} label={(displayData?.label as string) || id} />}
                {isCheckValve && <CheckValveIcon color={strokeColor} label={(displayData?.label as string) || id} />}
                {isTurbine && <TurbineIcon color={strokeColor} label={(displayData?.label as string) || id} />}
              </div>
            ) : (
              <div className="bg-white px-2 py-0.5 rounded-full border border-black text-[10px] font-semibold text-black cursor-help hover:bg-slate-50 transition-colors">
                {(displayData?.label as ReactNode) || id}
              </div>
            )}
          </TooltipWrapper>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
