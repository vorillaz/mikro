export interface IDragStatus {
    startPosition: number;
    startWidth: number;
    currPosition: number;
    currWidth: number;
    x: number;
    isOn: boolean;
    target: 'left' | 'right' | 'drag';
}