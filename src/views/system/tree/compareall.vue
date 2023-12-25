<template>
  <div class="app-container">
    <div class="head-container">
      <Search/>
      <crudOperation>
        <el-button
            slot="left"
            class="filter-item"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :loading="crud.delAllLoading"
            @click="confirmDelAll()"
        >
          清空
        </el-button>
      </crudOperation>
    </div>
    <el-row>
      <el-col :span="12">
        <DegradeVis :datas="scatterArray" :dataDetail="compareDetailData"></DegradeVis>
      </el-col>
      <el-col :span="12">
        <HeatMapVis  :score-array="scoreArray"></HeatMapVis>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <!--表格渲染-->
    <el-table ref="table" v-loading="loading" :data="compareDetailData" style="width: 100%;"
              @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="函数来源">
              <span>{{ props.row.fromFile }}</span>
            </el-form-item>
            <el-form-item label="编译级别">
              <span>{{ props.row.compileLevel }}</span>
            </el-form-item>
            <el-form-item label="目标架构">
              <span>{{ props.row.targetArch }}</span>
            </el-form-item>
            <el-form-item label="混淆方式">
              <span>{{ props.row.obs }}</span>
            </el-form-item>
            <el-form-item label="代码行数">
              <span>{{ props.row.codeLine }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="functionName" label="函数文件名称"/>
      <el-table-column prop="description" label="描述"/>
      <el-table-column label="代码详情" width="100px">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="info(scope.row.code)">代码检查</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="相似度得分" align="center">
        <template slot-scope="scope">
          <el-progress v-if="scope.row.score  >= 50" :percentage="scope.row.score" status="exception"></el-progress>
          <el-progress v-if="scope.row.score  <= 50" :percentage="scope.row.score" status="success"></el-progress>
          <!--          <el-tag v-if="scope.row.time <= 300">{{ scope.row.score }}</el-tag>-->
          <!--          <el-tag v-else-if="scope.row.time <= 1000" type="warning">{{ scope.row.score }}</el-tag>-->
          <!--          <el-tag v-else type="danger">{{ scope.row.score }}</el-tag>-->
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="软件著作保护" width="180px">
        <template slot-scope="scope">
          <el-button v-if="scope.row.protectInfo.includes('许可')" type="primary">{{ scope.row.protectInfo }}
          </el-button>
          <el-button v-if="!scope.row.protectInfo.includes('许可')" type="danger">{{ scope.row.protectInfo }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="漏洞情況" width="180px">
        <template slot-scope="scope">
          <el-button v-if="scope.row.faultInfo.includes('None')" type="primary">{{ scope.row.faultInfo }}
          </el-button>
          <el-button v-if="!scope.row.faultInfo.includes('None')" type="danger">{{ scope.row.faultInfo }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="恶意代码" width="180px">
        <template slot-scope="scope">
          <el-button v-if="scope.row.dangerInfo.includes('None')" type="primary">{{ scope.row.dangerInfo }}
          </el-button>
          <el-button v-if="!scope.row.dangerInfo.includes('None')" type="danger">{{ scope.row.dangerInfo }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="time" label="对比详情" align="center">
        <template slot-scope="scope">
          <!--          <el-button size="mini" type="primary" icon="el-icon-edit" @click="doAnalyze()"-->
          <!--          />-->

          <el-button type="text" @click="doAnalyze()">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialog" title="异常详情" append-to-body top="30px" width="85%">
      <!--      <pre>{{ errorInfo }}</pre>-->
      <codemirror v-model="errorInfo" :options="options"></codemirror>
    </el-dialog>

    <!--分页组件-->
    <pagination/>
  </div>
</template>

<script>
import Search from './search'
import { delAllInfo } from '@/api/monitor/log'
import CRUD, { presenter } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import { getSearch } from '@/api/self/llvm'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'

require('codemirror/mode/clike/clike.js')
require('codemirror/mode/javascript/javascript.js')
require('codemirror/mode/xml/xml.js')
require('codemirror/mode/vue/vue.js')
require('codemirror/mode/python/python.js')
require('codemirror/mode/css/css.js')
require('codemirror/mode/sql/sql.js')
require('codemirror/mode/shell/shell.js')

import 'codemirror/lib/codemirror.css'//引入样式文件
require('codemirror/mode/javascript/javascript.js')//引入JavaScript格式结合option里面的mode使用
// 折叠功能需引入的文件start
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'
// 主题
import 'codemirror/theme/dracula.css'
import Index from '@/views/tools/email/send.vue'
import HeatMapVis from '@/views/system/tree/vis/index.vue'
import DegradeVis from '@/views/system/tree/vis/degradeVis.vue'

export default {
  name: 'Log',
  components: { Index, Search, crudOperation, pagination, codemirror, HeatMapVis, DegradeVis },
  cruds() {
    // 这个好像只能给分也的数据用
    return CRUD({ title: '日志', url: 'api/user' })
  },
  beforeCreate() {
    getSearch('').then(res => {
      this.similarityRes = res.similarities
      this.compareDetailData = this.similarityRes
      this.vectorArray = this.compareDetailData.map(item => item.vectorId)
      this.scoreArray = res.scoreVOList
      this.scatterArray = res.tenseVectors
      this.loading = false
      console.log('this origin is score', this.scatterArray)
    })
  },
  mixins: [presenter()],
  created() {
    this.crud.optShow = {
      add: false,
      edit: false,
      del: false,
      download: true
    }
  },
  data() {
    return {
      vectorArray: [],
      scoreArray: [],
      scatterArray: [],
      errorInfo: '', dialog: false,
      compareDetailData: [],
      loading: true,
      options: {
        line: true,
        theme: 'dracula', // 主题
        tabSize: 4, // 制表符的宽度
        indentUnit: 2, // 一个块应该缩进多少个空格（无论这在编辑语言中意味着什么）。默认值为 2。
        firstLineNumber: 1, // 从哪个数字开始计算行数。默认值为 1。
        readOnly: true, // 只读
        autorefresh: true,
        smartIndent: true, // 上下文缩进
        lineNumbers: true, // 是否显示行号
        styleActiveLine: true, // 高亮选中行
        viewportMargin: Infinity, //处理高度自适应时搭配使用
        showCursorWhenSelecting: true, // 当选择处于活动状态时是否应绘制游标
        mode: 'javascript'
      }
    }
  },
  methods: {
    initDeatail() {
      getSearch('').then(res => {
        this.compareDetailData = res
        this.loading = false
      })
    },
    // 获取异常详情
    doAnalyze() {
      this.$router.push({ path: '/compare/index', query: { code1: 445177401023668152, code2: 445177401023669296 } })
    },
    info(id) {
      console.log(id)
      this.dialog = true
      this.errorInfo = id
      // getErrDetail(id).then(res => {
      //   this.errorInfo = res.exception
      // })
    },
    confirmDelAll() {
      this.$confirm(`确认清空所有操作日志吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.crud.delAllLoading = true
        delAllInfo().then(res => {
          this.crud.delAllLoading = false
          this.crud.dleChangePage(1)
          this.crud.delSuccessNotify()
          this.crud.toQuery()
        }).catch(err => {
          this.crud.delAllLoading = false
          console.log(err.response.data.message)
        })
      }).catch(() => {
      })
    }
  }
}
</script>

<style>
.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 70px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}

.demo-table-expand .el-form-item__content {
  font-size: 12px;
}
</style>
