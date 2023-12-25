<template>
  <div id="myChart" />
</template>

<style>
#myChart {
  width: 100%;
  height: 500px;
}
</style>
<script>

export default {
  name: 'HeatMapVis',
  props: {
    scoreArray: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      xlabelProps: Array.from({ length: 16 }, (_, index) => index),
      ylabelProps: Array.from({ length: 16 }, (_, index) => index),
      scoreData: []
    }
  },
  watch: {
    scoreArray(newValue) {
      this.scoreData = newValue.map(function(item) {
        return [item['x'], item['y'], item['score'].toFixed(2) || '-']
      })
      this.loadData()
    }
  },
  mounted() {
    this.xlabelProps = this.xlabel
    this.loadData()
  },
  methods: {
    loadData() {
      const me = this
      me.drawLine()
    },
    // 递归
    setGraph(me, studentsData, dataIncludes) {
      if (studentsData !== undefined && studentsData.length > 0) {
        for (var c = 0; c < studentsData.length; c++) {
          me.graphData.push({
            name: studentsData[c].name,
            des: studentsData[c].age,
            symbolSize: 80

          })
          me.graphLinks.push({
            source: dataIncludes.name,
            target: studentsData[c].name,
            label: {
              show: true
            }
          })
          if (studentsData[c].students != undefined) {
            console.log(studentsData[c])
            this.setGraph(me, studentsData[c].students, studentsData[c])
          }
        }
      }
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
      console.log('this is originData', this.initdata)
      const myChart = this.$echarts.init(document.getElementById('myChart'))
      myChart.on('click', this.redirectTo)
      myChart.setOption({
        tooltip: {
          position: 'left'
        },
        grid: {
          // size: 200,
          // height: '50%',
          height: '80%',
          top: '10%'
        },
        xAxis: {
          type: 'category',
          data: this.ylabelProps,
          splitArea: {
            show: true
          },
          axisLabel: {
            rotate: 90
          }
        },
        yAxis: {
          type: 'category',
          data: this.xlabelProps,
          splitArea: {
            show: true
          }
        },
        visualMap: {
          min: 0.8,
          max: 1,
          calculable: true,
          orient: 'vertical',
          left: 'right',
          top: 'center'
        },
        legend: {
          show: false
        },
        series: [
          {
            name: 'Punch Card',
            type: 'heatmap',
            data: this.scoreData,
            label: {
              show: true
            },

            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    }
  }
}
</script>

