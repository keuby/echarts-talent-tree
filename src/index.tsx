import echarts from 'echarts';
import { createApp, defineComponent, onMounted, ref, watchEffect } from 'vue';
import { TalentTree } from './talent-tree';
import './index.less';

const persons = [
  { label: '帅敏', order: 26, clust: 0 },
  { label: '张宇', order: 32, clust: 0 },
  { label: '苏晓天', order: 34, clust: 0 },
  { label: '邓希', order: 12, clust: 0 },
  { label: '穆劼睿', order: 16, clust: 0 },
  { label: '汪海蛟', order: 1, clust: 0 },
  { label: '任静', order: 4, clust: 0 },
  { label: '雷书阳', order: 11, clust: 0 },
  { label: '高蓉', order: 7, clust: 0 },
  { label: '欧琴', order: 17, clust: 0 },
  { label: '徐磊', order: 15, clust: 1 },
  { label: '王涛', order: 14, clust: 1 },
  { label: '陈慧', order: 22, clust: 1 },
  { label: '祝昳雯', order: 37, clust: 1 },
  { label: '李慧', order: 31, clust: 1 },
  { label: '陈达', order: 9, clust: 1 },
  { label: '顾叶', order: 36, clust: 1 },
  { label: '周健', order: 2, clust: 1 },
  { label: '丁丽', order: 6, clust: 1 },
  { label: '贾芊彦', order: 23, clust: 1 },
  { label: '龚洁', order: 28, clust: 2 },
  { label: '管云敏', order: 21, clust: 2 },
  { label: '侯一君', order: 5, clust: 2 },
  { label: '陈思思', order: 27, clust: 2 },
  { label: '刘寅', order: 35, clust: 2 },
  { label: '徐聪', order: 30, clust: 2 },
  { label: '李丽', order: 13, clust: 2 },
  { label: '朱梓圻', order: 29, clust: 2 },
  { label: '孙素琴', order: 25, clust: 2 },
  { label: '俞江容', order: 18, clust: 2 },
  { label: '李宁', order: 8, clust: 2 },
  { label: '杨茜玫', order: 20, clust: 2 },
  { label: '王晓斌', order: 19, clust: 2 },
  { label: '李婷', order: 24, clust: 2 },
  { label: '王琪', order: 33, clust: 2 },
  { label: '李戈', order: 3, clust: 2 },
  { label: '陈小娟', order: 10, clust: 2 },
];

const originData = [
  [1, -13, -29, 0],
  [2, -8, -20, 0.1548703],
  [3, -4, -11, 0.1567766],
  [4, -14, -22, 0.1858394],
  [5, -6, -23, 0.19338],
  [6, -30, 1, 0.2021499],
  [7, -1, 3, 0.2024095],
  [8, -9, -36, 0.2058965],
  [9, -24, -33, 0.22],
  [10, -2, 5, 0.2204179],
  [11, -18, 2, 0.2207996],
  [12, -7, -17, 0.2361603],
  [13, -3, -10, 0.2433882],
  [14, -27, -35, 0.2566038],
  [15, -25, 11, 0.2633795],
  [16, -5, 14, 0.2753829],
  [17, -12, -16, 0.281834],
  [18, -15, 4, 0.2879092],
  [19, 9, 13, 0.3055666],
  [20, 8, 10, 0.3156333],
  [21, 6, 15, 0.3278322],
  [22, 7, 12, 0.3360474],
  [23, -21, 16, 0.3743167],
  [24, -31, 20, 0.3849964],
  [25, -32, -34, 0.4],
  [26, -28, 23, 0.4241975],
  [27, 17, 22, 0.4288355],
  [28, -37, 24, 0.4334103],
  [29, -19, 19, 0.4472378],
  [30, 21, 29, 0.4921327],
  [31, 25, 27, 0.5099923],
  [32, 18, 28, 0.5481654],
  [33, 26, 30, 0.5773177],
  [34, -26, 31, 0.6780887],
  [35, 32, 33, 0.6925785],
  [36, 34, 35, 0.8860371],
];

const App = defineComponent(() => {
  const host = ref<HTMLDivElement>(null);
  const clust = ref<number>(null);

  onMounted(() => {
    const ins = echarts.init(host.value);

    ins.setOption({
      yAxis: {
        type: 'value',
      },
      xAxis: {
        type: 'category',
        scale: true,
        axisLabel: {
          rotate: 90,
        },
        axisTick: {
          alignWithLabel: true,
          show: false,
        },
      },
    });

    const tt = new TalentTree(originData, persons, ins);

    watchEffect(() => {
      const { seriesData, categories, renderItem } = tt.build(clust.value);

      ins.setOption({
        xAxis: {
          data: categories,
        },
        series: [
          {
            type: 'custom',
            name: 'talentTree',
            data: seriesData,
            encode: TalentTree.encode,
            //@ts-ignore
            clip: true,
            clipOverflow: true,
            renderItem: renderItem,
          },
        ],
      });
    });
  });

  function onSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    clust.value = target.value ? Number(target.value) : null;
  }

  return () => (
    <div class="container">
      <div>
        <label>聚类：</label>
        <select onChange={onSelectChange}>
          <option value={null}>全部</option>
          <option value={0}>聚类0</option>
          <option value={1}>聚类1</option>
          <option value={2}>聚类2</option>
        </select>
      </div>
      <div class="echart-host" ref={host}></div>
    </div>
  );
});

createApp(App).mount('#app');
