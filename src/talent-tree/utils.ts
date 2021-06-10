import { EChartOption } from 'echarts/lib/echarts';
import {
  LinkRecord,
  PointType,
  ItemRecord,
  Coord,
  RenderContext,
  GroupRecord,
  PolylineStyle,
  GroupRect,
  GroupContext,
} from './definations';

/**
 * 将某一项原始数据转化为对象
 * @param data 一项原始数据
 * @returns
 */
export function parseItem(data: number[]): LinkRecord {
  const [group, fromKey, toKey, value] = data;
  const to = Math.abs(toKey);
  const from = Math.abs(fromKey);
  const toType = toKey > 0 ? PointType.GROUP : PointType.NORMAL;
  const fromType = fromKey > 0 ? PointType.GROUP : PointType.NORMAL;
  return { group, left: from, leftType: fromType, right: to, rightType: toType, value };
}

export function getGroupContext(context: Record<string, any>, group: number) {
  return context[group] as GroupContext;
}

export function registerGroup(
  context: Record<string, any>,
  record: GroupRecord,
  points: Coord[],
  rect: GroupRect
): GroupContext {
  return (context[record.current.key] = {
    rect,
    points,
    coord: [(points[1][0] + points[2][0]) / 2, points[1][1]] as Coord,
  });
}

/**
 * 计算相关性在Y轴的坐标点的值
 *
 * @param api echart renderItem 函数的第二个参数
 * @param value 当前分组的真实数据值（相关性值）
 */
export function computeYCoord(api: EChartOption.SeriesCustom.RenderItemApi, value: number) {
  const originY = api.coord([0, 0])[1] as number;
  const height = api.size([0, value])[1] as number;
  return originY - height;
}

export function getGroupRectComputer(orders: number[]) {
  return function computeGroupRect(
    api: EChartOption.SeriesCustom.RenderItemApi,
    group: GroupRecord,
    yCoord: number
  ): GroupRect {
    const min = orders[group.current.min];
    const max = orders[group.current.max];
    const x = api.coord([min, 0])[0];
    const y = yCoord;
    const [itemWidth, height] = api.size([1, group.value]);
    const width = itemWidth * (max - min);
    return { x, y, width, height };
  };
}

export function getCoordCreator(orders: number[]) {
  /**
   * @param api echart renderItem 函数的第二个参数
   * @param context 当前绘制的上下文对象，取自 echart renderItem 函数的第一个参数
   * @param item 分组某一边的记录数据
   * @param yCoord Y轴坐标的值
   */
  const createCoord = (
    api: EChartOption.SeriesCustom.RenderItemApi,
    context: RenderContext,
    item: ItemRecord,
    yCoord: number
  ) => {
    let top: Coord;
    let bottom: Coord;
    if (item.type === PointType.NORMAL) {
      const x = orders[item.key];
      bottom = api.coord([x, 0]);
      top = [bottom[0], yCoord];
    } else {
      const data = getGroupContext(context, item.key);
      bottom = data.coord;
      top = [bottom[0], yCoord];
    }
    return { bottom, top };
  };

  return createCoord;
}

export function createPolyline(
  points: number[][],
  style: PolylineStyle
): EChartOption.SeriesCustom.RenderItemReturnPolyline {
  return {
    type: 'polyline',
    shape: { points },
    style: {
      ...style,
      fill: 'none',
    },
    z2: 1000,
  };
}

/**
 * 获取元素创建方法
 * @param colors 不同聚类分组的颜色序列
 */
export function getElCreator(colors: string[], dashLineStyle: PolylineStyle) {
  /**
   * 创建多边形元素描述对象
   * @param points 多边形的四个点
   * @param record 该元素的分组记录
   * @returns 多边形元素的描述对象
   */
  const createEl = (
    record: GroupRecord,
    context: GroupContext,
    renderContext: RenderContext
  ): ReturnType<EChartOption.SeriesCustom.RenderItem> => {
    const clust = record.current.clust;
    const points = context.points;

    if (clust != null) {
      return createPolyline(points, {
        stroke: colors[clust],
      });
    }

    return createPolyline(points, dashLineStyle);
  };

  return createEl;
}
