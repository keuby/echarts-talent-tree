import { EChartOption, ECharts } from 'echarts';
import { computeYCoord, getCoordCreator, getElCreator, registerGroup } from './utils';
import { ItemExtraData, GroupRecord, PointType, ItemRecord, LinkRecord } from './definations';

export class TalentTree {
  data: GroupRecord[] = [];
  itemRecords: ItemRecord[] = [];
  groupRecords: GroupRecord[] = [];

  /**
   * 用户标记 series data 哪些项关联到 x 轴，哪些项关联到 y 轴
   */
  static encode = {
    y: 7,
    x: [3, 6],
  };

  /**
   * @param data 原始数据
   *
   * example:
   *
   * ```JSON
   * [
   *    [1, -2, -3, 0.5],
   *    [2, -4, -5, 0.8],
   *    [3, 1, 2, 0.9],
   * ]
   * ```
   *
   * - data[0] 分组编号
   * - data[1], data[2] 关联的两条数据，< 0 表示的值为 extra.order 的值，> 0 表示分组编号
   * - data[3] 距离相对值
   *
   * @param extras 附加信息，是对于原始数据 1 2 位置元素的描述
   *
   * example:
   *
   * ```JSON
   * [
   *    { label: '张三', order: 1, clust: 0 },
   *    { label: '李四', order: 2, clust: 1 },
   *    { label: '王五', order: 3, clust: 2 },
   * ]
   * ```
   *
   * - label: 显示在 x 轴上的标签
   * - order: 对应 data[1] 或 data[2] 值为负数时的绝对值，代表某个人
   * - clust: 当前人所属聚类
   *
   * @param echarts echarts 实例
   */
  constructor(data: number[][], private extras: ItemExtraData[], private echarts: ECharts) {
    this.initDataRecords(data);
  }

  build(clust?: any) {
    let data: GroupRecord[];
    let extras: ItemExtraData[];
    if (clust == null) {
      data = this.data;
      extras = this.extras;
    } else {
      data = this.data.filter(({ current }) => current.clust === clust);
      extras = this.extras.filter((e) => e.clust === clust);
    }

    const orders = extras.map((e) => e.order);
    const categories = extras.map((e) => e.label);
    const seriesData = data.map(({ current: group, left: from, right: to, value }) => {
      return [group.key, from.key, from.type, from.min, to.key, to.type, to.max, value];
    });

    return {
      seriesData,
      categories,
      renderItem: this.createRenderItem(orders),
    };
  }

  private initDataRecords(data: number[][]) {
    for (const item of data) {
      const record = this.createGrouRecord(item);
      record && this.data.push(record);
    }
  }

  /**
   * 将某一项原始数据解析成对象
   * @param data 原始数据数据
   */
  private parseItem(data: number[]): LinkRecord {
    const [group, fromKey, toKey, value] = data;
    const to = Math.abs(toKey);
    const from = Math.abs(fromKey);
    const toType = toKey > 0 ? PointType.GROUP : PointType.NORMAL;
    const fromType = fromKey > 0 ? PointType.GROUP : PointType.NORMAL;
    return { group, left: from, leftType: fromType, right: to, rightType: toType, value };
  }

  private getItemRecord(key: number, type: PointType, current: ItemRecord) {
    let itemRecord: ItemRecord;
    if (type === PointType.GROUP) {
      const groupRecord = this.groupRecords[key];
      if (groupRecord != null) {
        groupRecord.parent = current;
        itemRecord = groupRecord.current;
      }
    } else {
      const dataIndex = this.extras.findIndex((e) => e.order === key);
      const extraData = this.extras[dataIndex];
      itemRecord = this.itemRecords[dataIndex];
      if (itemRecord == null) {
        itemRecord = {} as ItemRecord;
        itemRecord.key = itemRecord.min = itemRecord.max = key;
        itemRecord.type = PointType.NORMAL;
        itemRecord.clust = extraData.clust;
        this.itemRecords[dataIndex] = itemRecord;
      }
    }
    return itemRecord;
  }

  private createGrouRecord(itemData: number[]) {
    const { left, leftType, right, rightType, group, value } = this.parseItem(itemData);
    const groupRecord = {} as GroupRecord;
    const currentItemRecord = {} as ItemRecord;
    const leftItemRecord = this.getItemRecord(left, leftType, currentItemRecord);
    const rightItemRecord = this.getItemRecord(right, rightType, currentItemRecord);

    groupRecord.value = value;
    groupRecord.current = currentItemRecord;
    currentItemRecord.key = group;
    currentItemRecord.type = PointType.GROUP;

    if (leftItemRecord.min > rightItemRecord.max) {
      currentItemRecord.min = rightItemRecord.min;
      currentItemRecord.max = leftItemRecord.max;
      groupRecord.left = rightItemRecord;
      groupRecord.right = leftItemRecord;
    } else {
      currentItemRecord.min = leftItemRecord.min;
      currentItemRecord.max = rightItemRecord.max;
      groupRecord.left = leftItemRecord;
      groupRecord.right = rightItemRecord;
    }

    if (groupRecord.left.clust === groupRecord.right.clust) {
      groupRecord.current.clust = groupRecord.left.clust;
    } else {
      groupRecord.current.clust = null;
    }

    this.groupRecords[group] = groupRecord;
    return groupRecord;
  }

  private createRenderItem(orders: number[]): EChartOption.SeriesCustom.RenderItem {
    const colors = this.echarts.getOption().color;
    const createEl = getElCreator(colors);
    const createCoord = getCoordCreator(orders);

    return (params, api) => {
      const context = params.context;
      const group = api.value(0) as number;
      const record = this.groupRecords[group];

      // 计算相关性在Y轴的坐标点的值
      const yCoord = computeYCoord(api, context, record.value);

      // 计算多边形的四个点坐标
      const leftCoord = createCoord(api, context, record.left, yCoord);
      const rightCoord = createCoord(api, context, record.right, yCoord);

      // 注册该分组顶部中点位置的坐标，存储到上下文对象中
      registerGroup(context, group, leftCoord.top, rightCoord.top);

      const points = [leftCoord.bottom, leftCoord.top, rightCoord.top, rightCoord.bottom];
      return createEl(points, record.current.clust);
    };
  }
}