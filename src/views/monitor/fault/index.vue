<template>
  <div id="myChart" />
</template>

<style>
#myChart {
  width: 100%;
  height: 1000px;
}
</style>
<script>
import { getFaultGraph, getPath } from '@/api/system/dept'

export default {
  name: 'Graph',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
      categories: [],
      resData: [],
      graphData: [],
      graphLinks: [],
      datasetGraphData: []
    }
  },
  beforeCreate() {
    getFaultGraph().then(res => {
      this.datasetGraphData = res
      this.loadGraphData()
    })
  },
  mounted() {
    for (var i = 0; i < 2; i++) {
      this.categories[i] = {
        name: '类目' + i
      }
    }
    // this.loadData()

    // this.drawLine();
  },
  methods: {
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
      const myChart = this.$echarts.init(document.getElementById('myChart'))
      myChart.on('click', this.redirectTo)
      myChart.setOption({
        title: {
          text: '知识图谱'
        },
        tooltip: {
          // formatter: function(params) {
          //   if (params.datatype === 'node') {
          //     return '自定义属性' + params.data.detail
          //   }
          // }
        },

        series: [
          {
            type: 'graph', // 类型:关系图
            layout: 'force', // 图的布局，类型为力导图
            symbolSize: 40, // 调整节点的大小
            legendHoverLink: true,
            hoverAnimation: true,
            roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [2, 10],
            edgeLabel: {
              normal: {
                textStyle: {
                  fontSize: 10
                }
              }
            },
            force: {
              repulsion: 2500,
              edgeLength: [10, 50]
            },
            draggable: true,
            lineStyle: {
              normal: {
                width: 2
                // color: "#4b565b",
              }
            },
            label: {
              normal: {
                show: true,
                textStyle: {}
              }
            },
            data: this.graphData,
            links: this.graphLinks,
            categories: this.categories
          }
        ]
      })
    },
    loadGraphData() {
      const me = this
      me.resData = this.datasetGraphData[0]
      // 主节点,第一父节点,只有一个
      me.graphData.push({
        name: me.resData['name'],
        // des: me.resData.className,
        symbolSize: 180,
        category: 3
      })
      // 所有第二节点,fault
      const dataSubjects = me.resData['directors']
      if (dataSubjects.length > 0) {
        for (var b = 0; b < dataSubjects.length; b++) {
          me.graphData.push({
            name: dataSubjects[b]['name'],
            symbolSize: 130,
            category: 1
          })
          me.graphLinks.push({
            source: dataSubjects[b]['name'],
            target: me.resData['name'],
            label: {
              show: true

            }
          })
          const faultDatas = dataSubjects[b]['functionNodes']
          console.log('hhh', faultDatas)
          // 递归设置学生？
          this.setDatasetGraph(me, faultDatas, dataSubjects[b])
        }
      }
      me.drawLine()
    },
    setDatasetGraph(me, faultDatas, dataIncludes) {
      if (faultDatas !== undefined && faultDatas.length > 0) {
        for (var c = 0; c < faultDatas.length; c++) {
          me.graphData.push({
            name: faultDatas[c]['esId'],
            fault: faultDatas[c]['fault'],
            detail: faultDatas[c]['detail'],
            symbolSize: 80,
            label: {
              show: true,
              formatter: function(params) {
                return params.data.fault
              }
            }
          })
          me.graphLinks.push({
            source: dataIncludes['name'],
            target: faultDatas[c]['esId'],
            label: {
              show: true
            }
          })
        }
      }
    },
    loadData() {
      const me = this
      me.resData = this.initData
      // 主节点,第一父节点,只有一个
      me.graphData.push({
        name: me.resData.name,
        des: me.resData.className,
        symbolSize: 80,
        category: 2
      })
      // 所有第二节点,科目
      const dataSubjects = me.resData.subjects
      if (dataSubjects.length > 0) {
        for (var b = 0; b < dataSubjects.length; b++) {
          me.graphData.push({
            name: dataSubjects[b].name,
            des: dataSubjects[b].className,
            symbolSize: 80,
            category: 1
          })
          me.graphLinks.push({
            source: dataSubjects[b].name,
            target: me.resData.name,
            label: {
              show: true
            }
          })
          const studentsData = dataSubjects[b].students
          // 递归设置学生？
          this.setGraph(me, studentsData, dataSubjects[b])
        }
      }
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
    }
  }
}
</script>

