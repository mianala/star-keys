import { useMemo } from 'react';
import type { Measure } from '@/types/index.ts';
import { getMeasureDuration, getMeasureCapacity, getEffectiveTimeSignature } from '@/core/score/duration.ts';

export interface MeasureCapacityInfo {
  currentDuration: number; // in quarter notes
  capacity: number; // in quarter notes
  remaining: number; // in quarter notes
  isFull: boolean;
  percentage: number; // 0-100
}

export function useMeasureCapacity(measure: Measure, previousMeasures: Measure[]): MeasureCapacityInfo {
  return useMemo(() => {
    const currentDuration = getMeasureDuration(measure);
    const timeSignature = getEffectiveTimeSignature(measure, previousMeasures);
    const capacity = getMeasureCapacity(timeSignature);
    const remaining = Math.max(0, capacity - currentDuration);
    const isFull = currentDuration >= capacity;
    const percentage = capacity > 0 ? Math.min(100, (currentDuration / capacity) * 100) : 0;

    return {
      currentDuration,
      capacity,
      remaining,
      isFull,
      percentage,
    };
  }, [measure, previousMeasures]);
}
