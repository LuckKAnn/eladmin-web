<template>
  <div class="app-container">
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!-- 字典列表 -->
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <!--工具栏-->
          <div class="head-container">
            <div v-if="crud.props.searchToggle">
              <!-- 搜索 -->
              <el-input v-model="query.blurry" clearable size="small" placeholder="输入名称或者描述搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
              <rrOperation />
            </div>
            <crudOperation :permission="permission" />
          </div>
          <!--表格渲染-->
          <el-table ref="table" v-loading="crud.loading" :data="searchData" highlight-current-row style="width: 100%;" @selection-change="crud.selectionChangeHandler" @current-change="handleCurrentChange">
            <el-table-column type="selection" width="55" />
            <el-table-column :show-overflow-tooltip="true" prop="vectorId" label="ID" />
            <el-table-column :show-overflow-tooltip="true" prop="functionName" label="函數名詞" />
            <el-table-column :show-overflow-tooltip="true" prop="score" label="得分" >
              <template slot-scope="scope">
                <el-tag v-if="scope.row.time <= 342">{{ scope.row.score }}</el-tag>
                <el-tag v-else-if="scope.row.time <= 1000" type="warning">{{ scope.row.score }}</el-tag>
                <el-tag v-else type="danger">{{ scope.row.score }}ms</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination />
        </el-card>
      </el-col>
      <!-- 字典详情列表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典详情</span>
            <p> {{ showCode }} </p>>
            <el-button
              v-if="checkPer(['admin','dict:add']) && this.$refs.dictDetail && this.$refs.dictDetail.query.dictName"
              class="filter-item"
              size="mini"
              style="float: right;padding: 4px 10px"
              type="primary"
              icon="el-icon-plus"
              @click="$refs.dictDetail && $refs.dictDetail.crud.toAdd()"
            >新增</el-button>

            <el-button
              v-if="checkPer(['admin','dict:add']) && this.$refs.dictDetail && this.$refs.dictDetail.query.dictName"
              class="filter-item"
              size="mini"
              style="float: right;padding: 4px 10px"
              type="primary"
              icon="el-icon-plus"
              @click="handleSearchCodeById(index)"
            >代码对比</el-button>
          </div>
          <dictDetail ref="dictDetail" />
        </el-card>
      </el-col>
    </el-row>
     <div class="app-container">
      <p class="warn-content">
        Yaml编辑器 基于
        <a href="https://github.com/codemirror/CodeMirror" target="_blank">CodeMirror</a>，
        主题预览地址 <a href="https://codemirror.net/demo/theme.html#idea" target="_blank">Theme</a>
      </p>
      <Yaml v-model="inputValue" :value="inputValue" :height="height"  />
      <el-button
         class="filter-item"
         size="mini"
         style="float: right;padding: 4px 10px"
         type="primary"
         icon="el-icon-plus"
         @click="handleCommitCode()"
       >提交
      </el-button>
     </div>

    <code-diff
      :old-string="inputValue"
      :new-string="showCode"
      file-name="test.txt"
      output-format="side-by-side"/>
  </div>
</template>

<script>
import dictDetail from './dictDetail'
import crudDict from '@/api/system/dict'
import CRUD, { presenter, header, form } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import rrOperation from '@crud/RR.operation'
import udOperation from '@crud/UD.operation'
import Yaml from '@/components/YamlEdit/index'
import { getSearch, searchById } from '@/api/self/llvm'
import { CodeDiff } from 'v-code-diff'

const defaultForm = { id: null, name: null, description: null, dictDetails: [] }

export default {
  name: 'Dict',
  components: { crudOperation, pagination, rrOperation, udOperation, dictDetail, Yaml, CodeDiff },
  cruds() {
    return [
      CRUD({ title: '字典', url: 'api/dict', crudMethod: { ...crudDict }})
    ]
  },
  mixins: [presenter(), header(), form(defaultForm)],
  data() {
    return {
      queryTypeOptions: [
        { key: 'name', display_name: '字典名称' },
        { key: 'description', display_name: '描述' }
      ],
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'dict:add'],
        edit: ['admin', 'dict:edit'],
        del: ['admin', 'dict:del']
      },
      inputValue: `adding your llvm code here\n for example：
      `,
      searchData: [],
      showCode : null
    }
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      if (this.$refs.dictDetail) {
        this.$refs.dictDetail.query.dictName = ''
      }
      return true
    },
    handleCommitCode() {
      console.log(this.inputValue)
      getSearch().then(res => {
        this.searchData = res
      })
    },
    handleSearchCodeById(id) {
      searchById(id).then(res => {
        this.showCode = res.codeInfo
      })
    },
    // 选中字典后，设置字典详情数据
    handleCurrentChange(val) {
      console.log(val)
      this.showCode = val.functionName
      this.index = val.vectorId
      if (val) {
        // this.$refs.dictDetail.query.dictName = val.name
        // this.$refs.dictDetail.dictId = val.id
        this.$refs.dictDetail.query.dictName = val.functionName
        this.$refs.dictDetail.dictId = val.id
        this.$refs.dictDetail.crud.toQuery()
      }
    },
    // 编辑前将字典明细临时清空，避免日志入库数据过长
    [CRUD.HOOK.beforeToEdit](crud, form) {
      // 将角色的菜单清空，避免日志入库数据过长
      form.dictDetails = null
    }
  }
}
</script>

<style scoped>
</style>
