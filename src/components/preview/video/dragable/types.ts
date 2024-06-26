import { ReactNode } from "react";

export interface IDragStatus {
    startPosition: number;
    startWidth: number;
    currPosition: number;
    currWidth: number;
    x: number;
    isOn: boolean;
    target: TTarget;
}

export type TTarget = 'left' | 'right' | 'drag';

export interface IDragProps {
    children: ReactNode;
    onDrag: (diff: number, status: IDragStatus) => { leftWidth: number, width: number } | void;
    getTarget: () => HTMLDivElement | null;
    deps?: number[]
}