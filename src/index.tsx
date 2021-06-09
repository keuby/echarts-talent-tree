import echarts from 'echarts';
import { createApp, defineComponent, onMounted, ref, watchEffect } from 'vue';
import jsonData from './data.json';
import { TalentTree } from './talent-tree';
import './index.less';

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

    const tt = new TalentTree(jsonData.data, jsonData.extras, ins);

    watchEffect(() => {
      const { seriesData, categories, renderItem } = tt.build(clust.value);

      ins.setOption(
        {
          xAxis: {
            data: categories,
          },
          series: [
            {
              type: 'custom',
              name: 'talentTree',
              data: seriesData,
              encode: TalentTree.encode,
              renderItem: renderItem,
            },
          ],
        },
        {
          // echarts4 以及以上版本需要添加该参数
          // replaceMerge: ['series'],
        }
      );
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
