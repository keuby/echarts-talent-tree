import { EChartOption } from 'echarts/lib/echarts';

export type RenderContext = EChartOption.SeriesCustom.RenderItemParams['context'];

export type Coord = [number, number];

export type PolylineStyle = EChartOption.SeriesCustom.RenderItemReturnPolyline['style'] & {
  lineDash?: number[];
};

export interface GroupRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GroupContext {
  rect: GroupRect;
  coord: Coord;
  points: Coord[];
}

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
