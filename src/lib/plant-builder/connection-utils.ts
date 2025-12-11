import type { Connection, PlacedComponent } from '@/app/plant-operator/plant-builder/types';

export type StoredConnectionPayload = {
  id: string;
  from: number;
  to: number;
  type?: string;
  reason?: string;
  data?: Record<string, any>;
};

export const buildConnectionPayloadForComponent = (
  componentId: string,
  connectionList: Connection[],
  componentList: PlacedComponent[]
): StoredConnectionPayload[] => {
  const source = componentList.find((c) => c.id === componentId);
  if (!source?.instanceId) return [];
  const sourceInstanceId = Number(source.instanceId);

  return connectionList
    .filter((conn) => conn.from === componentId)
    .map((conn) => {
      const target = componentList.find((c) => c.id === conn.to);
      if (!target?.instanceId) return null;

      return {
        id: conn.id,
        from: sourceInstanceId,
        to: Number(target.instanceId),
        type: conn.type,
        reason: conn.reason,
        data: conn.data || {},
      };
    })
    .filter((payload): payload is StoredConnectionPayload => Boolean(payload));
};
