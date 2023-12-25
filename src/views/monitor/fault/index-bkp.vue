<template>
  <div id="myChart"></div>
</template>

<style>
#myChart {
  width: 100%;
  height: 1000px;
}
</style>
<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
      initData:
        {
          'name': '科目全部',
          'className': '全年级',
          'students': [],
          'subjects': [
            {
              'name': '语文',
              'className': '高一',
              'students': [
                {
                  'name': '张弛1',
                  'age': 30,
                  'students': [
                    {
                      'name': '蒋龙',
                      'age': 20
                    }
                  ]
                },
                {
                  'name': '蒋龙2',
                  'age': 20
                },
                {
                  'name': '刘波',
                  'age': 28,
                  'students': [
                    {
                      'name': '龙傲天',
                      'age': 25
                    }
                  ]
                },
                {
                  'name': '龙傲天3',
                  'age': 25
                },
                {
                  'name': '李豆豆',
                  'age': 27
                }
              ]
            },
            {
              'name': '数学',
              'className': '高一',
              'students': [
                {
                  'name': 'JACK',
                  'age': 30
                },
                {
                  'name': 'DRAONA',
                  'age': 20
                },
                {
                  'name': 'CFAIDS',
                  'age': 28
                }
              ]
            },
            {
              'name': '英语',
              'className': '高一',
              'students': [
                {
                  'name': 'IIODS',
                  'age': 30,
                  'students': [
                    {
                      'name': '龙傲天4',
                      'age': 25
                    }
                  ]
                },
                {
                  'name': 'DWQQQS',
                  'age': 20
                },
                {
                  'name': 'ADFAWWAA',
                  'age': 28
                }
              ]
            },
            {
              'name': '历史',
              'className': '高一',
              'students': [
                {
                  'name': 'CFRRRES',
                  'age': 20
                },
                {
                  'name': 'WDFFAAW',
                  'age': 28
                }
              ]
            },
            {
              'name': '物理',
              'className': '高一',
              'students': [
                {
                  'name': 'SQWAAAD',
                  'age': 20
                },
                {
                  'name': 'FSCCCQ',
                  'age': 28
                }
              ]
            },
            {
              'name': '政治',
              'className': '高一',
              'students': [
                {
                  'name': 'KOUSDA',
                  'age': 20
                },
                {
                  'name': 'CFGRAAW',
                  'age': 28
                }
              ]
            },
            {
              'name': '化学',
              'className': '高一',
              'students': [
                {
                  'name': 'DFESQW',
                  'age': 20
                },
                {
                  'name': 'TREWWS',
                  'age': 28
                }
              ]
            }
          ]
        },
      categories: [],
      resData: [],
      graphData: [],
      graphLinks: []
    }
  },
  mounted() {
    for (var i = 0; i < 2; i++) {
      this.categories[i] = {
        name: '类目' + i
      }
    }
    this.loadData()
    //this.drawLine();
  },
  methods: {
    drawLine() {
      let myChart = this.$echarts.init(document.getElementById('myChart'))
      myChart.setOption({
        title: {
          text: 'ECharts 关系图'
        },
        tooltip: {},
        series: [
          {
            type: 'graph', // 类型:关系图
            layout: 'force', //图的布局，类型为力导图
            symbolSize: 40, // 调整节点的大小
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
    loadData() {
      let me = this
      me.resData = this.initData
      //主节点,第一父节点,只有一个
      me.graphData.push({
        name: me.resData.name,
        des: me.resData.className,
        symbolSize: 80,
        category: 2
      })
      //所有第二节点,科目
      let dataSubjects = me.resData.subjects
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
          let studentsData = dataSubjects[b].students
          this.setGraph(me, studentsData, dataSubjects[b])
        }
      }
      me.drawLine()
    },
    //递归
    setGraph(me, studentsData, dataIncludes) {
      if (studentsData != undefined && studentsData.length > 0) {
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

