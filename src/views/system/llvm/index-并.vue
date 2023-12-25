<template>
  <div class="app-container">
    <el-row :gutter="10" />
    <!--表单组件-->
    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      :before-close="crud.cancelCU"
      :visible="crud.status.cu > 0"
      :title="crud.status.title"
      width="500px"
    >
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
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px;height: 800px">
        <el-form ref="form" :model="form" label-width="180px">
          <el-form-item label="文件名称">
            <el-input v-model="form.name" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="编译优化等级">
            <el-select v-model="form.level" placeholder="请选择优化等级">
              <el-option label="未优化" value="None" />
              <el-option label="O1" value="O1" />
              <el-option label="O2" value="O2" />
              <el-option label="O3" value="O3" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="编译优化架构">
            <el-select v-model="form.arch" placeholder="请选择目标就架构">
              <el-option label="x86_64" value="x86_64" />
              <el-option label="ARM64" value="ARM64" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="混淆方式">
            <el-select v-model="form.hx" placeholder="请选择目标就架构">
              <el-option label="未混淆" value="None" />
              <el-option label="BCF" value="BCF" />
              <el-option label="ACF" value="ACF" />
              <el-option label="其他数据流混淆" value="其他数据流混淆" />
              <el-option label="其他控制流" value="其他控制流" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <Yaml v-model="inputValue" :value="inputValue" :height="500" style="width: 600px;" />
          <el-form-item>
            <el-button type="primary" @click="handleSearchCodeByFuncInfo">寻找相似</el-button>
          </el-form-item>
        </el-form>
        <!--        <el-button-->
        <!--            class="filter-item"-->
        <!--            size="mini"-->
        <!--            style="float: right;padding: 4px 10px"-->
        <!--            type="primary"-->
        <!--            icon="el-icon-plus"-->
        <!--            @click="handleCommitCode()"-->
        <!--        >提交-->
        <!--        </el-button>-->
      </el-col>
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px; height: 800px">
        <el-card class="box-card">
          <!--工具栏-->
          <div class="head-container">
            <div v-if="crud.props.searchToggle">
              <!-- 搜索 -->
              <el-input
                v-model="query.blurry"
                clearable
                size="small"
                placeholder="输入名称或者描述搜索"
                style="width: 200px;"
                class="filter-item"
                @keyup.enter.native="crud.toQuery"
              />
              <rrOperation />
            </div>
            <crudOperation :permission="permission" />
          </div>
          <!--表格渲染-->
          <el-table
            ref="table"
            v-loading="crud.loading"
            :data="searchData"
            highlight-current-row
            style="width: 100%;"
            @selection-change="crud.selectionChangeHandler"
            @current-change="handleCurrentChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column :show-overflow-tooltip="true" prop="vectorId" label="ID" />
            <el-table-column :show-overflow-tooltip="true" prop="functionName" label="函數名詞" />
            <el-table-column :show-overflow-tooltip="true" prop="score" label="得分">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.score <= 342">{{ scope.row.score }}</el-tag>
                <el-tag v-else-if="scope.row.score <= 1000" type="warning">{{ scope.row.score }}</el-tag>
                <el-tag v-else type="danger">{{ scope.row.score }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column>
              <template slot-scope="scope">
                <el-button
                  class="filter-item"
                  size="mini"
                  type="primary"
                  icon="el-icon-plus"
                  @click="handleGoDetail(scope.row.vectorId)"
                >
                  查看具体信息
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination />
        </el-card>
      </el-col>
      <!-- 字典详情列表 -->
    </el-row>
    <div class="app-container" />

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
import { commitSearch, getSearch, searchById } from '@/api/self/llvm'
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
      form: {
        name: '',
        level: '',
        arch: '',
        hx: '',
        file: false,
        type: [],
        resource: '',
        desc: ''
      },
      thisVid: null,
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
      showCode: null
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
    handleSearchCodeByFuncInfo(id) {
      var info = {
        'functionName': this.form.name,
        'level': this.form.level,
        'targetArch': this.form.arch,
        'obs': this.form.hx,
        'code': this.inputValue
      }
      commitSearch(info).then(res => {
        this.searchData = res
        this.thisVid = 445177401023661798
      })
    },
    handleGoDetail(id) {
      this.$router.push({ path: '/compare/index', query: { code1: id, code2: this.thisVid }})
    },
    handleCommitCode() {
      console.log(this.inputValue)
      getSearch().then(res => {
        this.searchData = res
      })
    },
    handleCommitByInfo() {
      console.log(this.inputValue)
      commitSearch().then(res => {
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
