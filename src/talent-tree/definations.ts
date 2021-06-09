import { EChartOption } from 'echarts/lib/echarts';

export interface ItemExtraData {
  label: string;
  order: number;
  clust: any;
}

export interface ItemRecord {
  min: number;
  max: number;
  key: number;
  type: PointType;
  clust: any;
}

export interface GroupRecord {
  left: ItemRecord;
  right: ItemRecord;
  parent?: ItemRecord;
  current: ItemRecord;
  value: number;
}

export enum PointType {
  NORMAL = 0,
  GROUP = 1,
}

export interface LinkRecord {
  group: number;
  left: number;
  leftType: PointType;
  right: number;
  rightType: PointType;
  value: number;
}

export type Context = EChartOption.SeriesCustom.RenderItemParams['context'];

export type Coord = [number, number];
