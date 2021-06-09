import { EChartOption } from 'echarts/lib/echarts';
import { LinkRecord, PointType, ItemRecord, Coord, Context } from './definations';

/**
 * 将原始的 series 数据转化为对象
 * @param data series item 数据
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

export function registerGroup(
  context: Record<string, any>,
  group: number,
  leftCoord: Coord,
  rightCoord: Coord
) {
  const minXCoord = leftCoord[0];
  const maxXCoord = rightCoord[0];
  const yCoord = rightCoord[1];
  context[group] = [(minXCoord + maxXCoord) / 2, yCoord];
}

/**
 * 计算相关性在Y轴的坐标点的值
 *
 * @param params echart renderItem 函数的第一个参数
 * @param api echart renderItem 函数的第二个参数
 * @param value 当前分组的真实数据值（相关性值）
 */
export function computeYCoord(
  api: EChartOption.SeriesCustom.RenderItemApi,
  context: Context,
  value: number
) {
  let originY: number;
  if (context.originY != null) {
    originY = context.originY;
  } else {
    originY = api.coord([0, 0])[1] as number;
    context.originY = originY;
  }
  const height = api.size([0, value])[1] as number;
  return originY - height;
}

export function getCoordCreator(orders: number[]) {
  /**
   *
   * @param api echart renderItem 函数的第二个参数
   * @param context 当前绘制的上下文对象，取自 echart renderItem 函数的第一个参数
   * @param item 分组某一边的记录数据
   * @param yCoord Y轴坐标的值
   */
  const createCoord = (
    api: EChartOption.SeriesCustom.RenderItemApi,
    context: Context,
    item: ItemRecord,
    yCoord: number
  ) => {
    let top: Coord;
    let bottom: Coord;
    if (item.type === PointType.NORMAL) {
      const x = orders.findIndex((order) => order === item.key);
      bottom = api.coord([x, 0]);
      top = [bottom[0], yCoord];
    } else {
      bottom = context[item.key] as [number, number];
      top = [bottom[0], yCoord];
    }
    return { bottom, top };
  };

  return createCoord;
}

/**
 * 获取元素创建方法
 * @param colors 不同聚类分组的颜色序列
 */
export function getElCreator(colors: string[]) {
  /**
   * 创建多边形元素描述对象
   * @param points 多边形的四个点
   * @param clust 该元素的聚类分组
   * @returns 多边形元素的描述对象
   */
  const createEl = (
    points: Coord[],
    clust: any
  ): EChartOption.SeriesCustom.RenderItemReturnPolyline => {
    const style: Record<string, any> = { fill: 'none' };
    if (clust == null) {
      style.stroke = '#000';
      style.lineDash = [5, 5];
    } else {
      style.stroke = colors[clust];
    }

    return {
      type: 'polyline',
      shape: { points },
      style,
    };
  };

  return createEl;
}
