import { createApp, defineComponent, onMounted, ref } from 'vue';
import echarts from 'echarts';
import zrUtil from 'zrender/lib/core/util';
import barLayoutGrid from 'echarts/lib/layout/barGrid';
import './index.less';

const E = echarts as any;

E.registerLayout(zrUtil.curry(barLayoutGrid, 'talentTree'));

E.extendSeriesModel({
  type: 'series.talentTree',

  defaultOption: {
    z: 2,
    zlevel: 0,
    legendHoverLink: true,
    coordinateSystem: 'cartesian2d',
    barWidth: 2,
  },
  getInitialData: function (option, ecModel) {
    const model = new E.Model(option, null, ecModel);
    return E.helper.createList(model);
  },
});

E.extendChartView({
  type: 'talentTree',
  render(seriesModel, ecModel, api) {
    // console.log(this);
    // console.log(seriesModel);
    // console.log(ecModel);
    // console.log(api);
    const group = this.group;
    const data = seriesModel.getData();
    const oldData = this._data;

    data
      .diff(oldData)
      .add((dataIndex) => {
        console.log('add', dataIndex);
        console.log(data.getItemModel(dataIndex));
      })
      .update((newIndex, oldIndex) => {
        console.log('update', newIndex, oldIndex);
      })
      .remove((dataIndex) => {
        console.log('remove', dataIndex);
      })
      .execute();

    group.add(
      new E.graphic.Arc({
        shape: {
          cx: 50,
          cy: 60,
          r: 300,
          endAngle: Math.PI / 2,
          startAngle: 0,
        },
      })
    );

    this._data = data;
    return group;
  },
});

const App = defineComponent(() => {
  const host = ref<HTMLDivElement>(null);

  onMounted(() => {
    const ins = echarts.init(host.value);
    ins.setOption({
      title: {
        text: '某地区蒸发量和降水量',
        subtext: '纯属虚构',
      },
      yAxis: [
        {
          type: 'value',
        },
      ],
      xAxis: [
        {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月'],
        },
      ],
      series: [
        {
          name: '蒸发量',
          type: 'talentTree',
          data: [2.0, 4.9, 7.0, 7.0, 7.0],
        },
        // {
        //   name: '蒸发量',
        //   type: 'bar',
        //   data: [2.0, 4.9, 7.0, 7.0, 7.0],
        // },
      ],
    });
  });

  return () => (
    <div class="container">
      <div class="echart-host" ref={host}></div>
    </div>
  );
});

createApp(App).mount('#app');
