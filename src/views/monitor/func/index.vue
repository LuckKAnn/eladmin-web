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
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;"
              @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="函数来源">
              <el-tag>{{ props.row.functionFrom }}</el-tag>
            </el-form-item>
            <el-form-item label="编译级别">
              <el-tag>{{ props.row.compileLevel }}</el-tag>
            </el-form-item>
            <el-form-item label="目标架构">
              <el-tag>{{ props.row.targetArch }}</el-tag>
            </el-form-item>
            <el-form-item label="混淆方式">
              <el-tag>{{ props.row.obsMethod }}</el-tag>
            </el-form-item>
            <el-form-item label="代码行数">
              <el-tag>{{ props.row.codeLine }}</el-tag>
            </el-form-item>
            <el-form-item label="代码来源">
              <el-tag>{{ props.row.functionFrom }}</el-tag>
            </el-form-item>
            <el-form-item label="详细信息">
              <el-tag>{{ props.row.detail }}</el-tag>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="functionName" label="函数文件名称"/>
      <el-table-column prop="description" label="描述"/>
      <el-table-column label="代码详情" width="100px">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="info(scope.row.id)">查看详情</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="time" label="检索次数" align="center">
        <template slot-scope="scope">
          <el-tag>
            <count-to :start-val="0" :end-val="scope.row.searchCount" :duration="2000" class="card-panel-num"/>
            次
          </el-tag>
          <!--          <el-tag v-else-if="scope.row.time <= 1000" type="warning">{{ scope.row.time }}1次</el-tag>-->
          <!--          <el-tag v-else type="danger">{{ scope.row.time }}1次</el-tag>-->
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="软件著作保护" width="180px">
        <template slot-scope="scope">
          <el-button v-if="scope.row.protectInfo.includes('许可')" type="primary" @click="goToDatasetDetail">{{ scope.row.protectInfo }}
          </el-button>
          <el-button v-if="!scope.row.protectInfo.includes('许可')" type="danger" @click="goToDatasetDetail">{{ scope.row.protectInfo }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="漏洞情況" width="180px">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.leakInfo.includes('None')" type="danger" @click="goToDatasetDetail">{{ scope.row.leakInfo }}</el-button>
          <el-button v-if="scope.row.leakInfo.includes('None')" type="primary" @click="goToDatasetDetail">{{ scope.row.leakInfo }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="恶意代码" width="180px">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.dangerious.includes('None')" type="danger" @click="goToDatasetDetail">{{ scope.row.dangerious }}</el-button>
          <el-button v-if="scope.row.dangerious.includes('None')" type="primary" @click="goToDatasetDetail">{{ scope.row.dangerious }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialog" title="代码信息" append-to-body top="30px" width="85%">
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
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import CountTo from 'vue-count-to'

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

export default {
  name: 'Log',
  components: { Search, crudOperation, pagination, codemirror, CountTo },
  cruds() {
    return CRUD({ title: '日志', url: 'es/list' })
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
      },
      errorInfo: '', dialog: false
    }
  },
  methods: {
    goToDatasetDetail() {
      this.$router.push({ path: '/fault/datasetDetail', query: { code1: 445177401023668152, code2: 445177401023669296 }})
    },
    // 获取异常详情
    info(id) {
      console.log(id)
      // this.dialog = true
      this.errorInfo = id
      // getErrDetail(id).then(res => {
      //   this.errorInfo = res.exception
      // })
      this.$router.push({ path: '/fault/funcDetail', query: { id: id} })
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

.CodeMirror {
  height: 600px !important;
}

</style>
