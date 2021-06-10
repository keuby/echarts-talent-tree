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
        axisLabel: {
          rotate: 90,
        },
        axisTick: {
          show: false,
        },
      },
    });

    const tt = new TalentTree({
      data: jsonData.data,
      extras: jsonData.extras,
      echarts: ins,
    });

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
          //echarts4 以及以上版本需要添加该参数
          // replaceMerge: ['series'],
        }
      );
    });
  });

  function onSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    clust.value = target.value ? Number(target.value) : null;
  }

  const clusts = Array.from(new Set(jsonData.extras.map((item) => item.clust)))
    .map((clust) => ({
      value: clust,
      label: `聚类${clust}`,
    }))
    .concat({
      value: null,
      label: '全部',
    });

  return () => (
    <div class="container">
      <div>
        <label>聚类：</label>
        <select onChange={onSelectChange}>
          {clusts.map((clust) => (
            <option value={clust.value}>{clust.label}</option>
          ))}
        </select>
      </div>
      <div class="echart-host" ref={host}></div>
    </div>
  );
});

createApp(App).mount('#app');
