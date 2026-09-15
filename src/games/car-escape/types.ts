export interface Vehicle {
  id: number;
  isTarget: boolean;
  isHorizontal: boolean;
  length: number;
  row: number;
  col: number;
  color: string;
}

export interface LevelConfig {
  size: number;
  vehicles: Vehicle[];
  targetRow: number;
  city: number;
}
