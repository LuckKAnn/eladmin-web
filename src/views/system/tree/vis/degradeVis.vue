<template>
  <div id="myDegrade" />
</template>

<style>
#myDegrade {
  width: 100%;
  height: 500px;
}
</style>
<script>
export default {
  name: 'DegradeVis',
  props: {
    datas: {
      type: Array,
      required: true
    },
    dataDetail: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      scatterData: [],
      detailData: []
    }
  },
  watch: {
    datas(newValue) {
      console.log('find new scatter data', this.$props.dataDetail)
      // this.scatterData = newValue
      this.detailData = this.$props.dataDetail
      this.filledWithColor(newValue)
      this.drawLine()
    }
    // dataDetail(newValue) {
    //   console.log('find new scatter data', newValue)
    //   // this.scatterData = newValue
    //   this.detailData = newValue
    //   this.filledWithColor(this.$props.datas)
    //   this.drawLine()
    // }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    filledWithColor(scatterList) {
      var colors = [
        '#1f77b4', // 蓝色
        '#ff7f0e', // 橙色
        '#2ca02c', // 绿色
        '#d62728', // 红色
        '#9467bd', // 紫色
        '#8c564b', // 棕色
        '#e377c2', // 粉色
        '#7f7f7f', // 灰色
        '#bcbd22', // 黄绿色
        '#17becf', // 青色
        '#aec7e8', // 淡蓝色
        '#ffbb78', // 淡橙色
        '#98df8a', // 淡绿色
        '#ff9896', // 淡红色
        '#c5b0d5', // 淡紫色
        '#c49c94' // 淡棕色
      ]
      for (var i = 0; i < scatterList.length; i++) {
        var coordinate = scatterList[i]
        var color = colors[i]
        this.scatterData.push({
          name: 'Node ' + (i + 1),
          value: coordinate,
          itemStyle: {
            color: color
          },
          symbolSize: i === 0 ? 100 : 50,
          functionName: i === 0 ? '待测函数' : this.detailData[i - 1]['functionName']
        })
      }
    },
    loadData() {
      const me = this
      me.drawLine()
    },

    // 将来可以用来点击点，进行路由到对应的代码详细信息
    redirectTo(param) {
      // 应该先调用接口，处理这个函数，然后才去查id
      // processFile(path).then(res => {
      //   this.fileFunctionData = res
      // })
      if (param.dataType == 'node') {
        console.log('点击了节点', param)
      }
      this.$router.push({ path: '/fault/funcDetail', query: { code1: 445177401023668152, code2: 445177401023669296 }})
    },
    drawLine() {
      const myChart = this.$echarts.init(document.getElementById('myDegrade'))
      myChart.on('click', this.redirectTo)
      myChart.setOption({
        tooltip: {
          backgroundColor: 'rgba(255,255,0,0.7)',
          formatter: function(params) {
            var data = params.data
            console.log('this is params datas', data)
            var name = data.name
            var value = data.value
            var functionName = data.functionName
            return '<div style="border-bottom: 1px solid rgba(0,0,0,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">' +
                    'Node Name: ' + name + '<br>' +
                    '函数信息: ' + functionName + '<br>' +
                    'Coordinate: (' + value[0] + ', ' + value[1] + ')'
          }
        },
        xAxis: {},
        yAxis: {},
        series: [
          {
            symbolSize: 20,
            data: this.scatterData,
            type: 'scatter'
          }
        ]
      }
      )
    }
  }
}
</script>

