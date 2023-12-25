<template>
  <div class="app-container">
    <el-row :gutter="10">

    </el-row>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible="crud.status.cu > 0"
               :title="crud.status.title" width="500px"
    >
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;"/>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" style="width: 370px;"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!-- 字典列表 -->
    <el-row>
      <el-col :span="24" style="margin-bottom: 10px;height: 800px">
        <el-form ref="form" :model="form">
          <el-col :span="12" type="flex" justify="center">
            <el-form-item label="函数名称">
              <el-input v-model="form.name" style="width: 300px;" placeholder="请输入待测LLVM函数的名称"></el-input>
              <!--            <el-input v-model="form.name" style="width: 300px;"></el-input>-->
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="函数信息简介">
              <el-input v-model="form.name" style="width: 300px;" placeholder="请输入待测LLVM函数有关信息"></el-input>
              <!--            <el-input v-model="form.name" style="width: 300px;"></el-input>-->
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="编译优化等级">
              <el-select v-model="form.level" placeholder="请选择优化等级">
                <el-option label="未优化" value="None"></el-option>
                <el-option label="O1" value="O1"></el-option>
                <el-option label="O2" value="O2"></el-option>
                <el-option label="O3" value="O3"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="编译优化架构">
              <el-select v-model="form.arch" placeholder="请选择目标就架构">
                <el-option label="x86_64" value="x86_64"></el-option>
                <el-option label="ARM64" value="ARM64"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="混淆方式">
              <el-select v-model="form.hx" placeholder="请选择目标就架构">
                <el-option label="未混淆" value="None"></el-option>
                <el-option label="BCF" value="BCF"></el-option>
                <el-option label="ACF" value="ACF"></el-option>
                <el-option label="其他数据流混淆" value="其他数据流混淆"></el-option>
                <el-option label="其他控制流" value="其他控制流"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <codemirror  v-model="seeCodeInfo" :options="options"></codemirror>
            <el-divider></el-divider>
            <!--          <Yaml v-model="inputValue" :value="inputValue" :height="500" style="width: 600px;"/>-->
          </el-col>
          <el-col :span="6" type="flex" justify="end">
            <el-form-item>
              <el-button  type="primary" @click="handleSearchCodeByFuncInfo">寻找相似</el-button>
            </el-form-item>
          </el-col>

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
    </el-row>
    <div class="app-container">
    </div>
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

export default {
  name: 'Dict',
  components: { crudOperation, pagination, rrOperation, udOperation, dictDetail, Yaml, CodeDiff, codemirror },
  cruds() {
    return [
      CRUD({ title: '字典', url: 'api/dict', crudMethod: { ...crudDict } })
    ]
  },
  mixins: [presenter(), header(), form(defaultForm)],
  data() {
    return {
      seeCodeInfo: 'adding your llvm code here\n for example：',
      options: {
        line: true,
        theme: 'dracula', // 主题
        tabSize: 4, // 制表符的宽度
        indentUnit: 2, // 一个块应该缩进多少个空格（无论这在编辑语言中意味着什么）。默认值为 2。
        firstLineNumber: 1, // 从哪个数字开始计算行数。默认值为 1。
        readOnly: false, // 只读
        autorefresh: true,
        smartIndent: true, // 上下文缩进
        lineNumbers: true, // 是否显示行号
        styleActiveLine: true, // 高亮选中行
        // viewportMargin: Infinity, //处理高度自适应时搭配使用
        showCursorWhenSelecting: true, // 当选择处于活动状态时是否应绘制游标
        mode: 'javascript'
      },
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
      console.log(this.seeCodeInfo)
      commitSearch(info).then(res => {
        this.searchData = res
        this.thisVid = 445177401023661798
      })
      this.$router.push({ path: '/detail', query: { code1: 445177401023668152, code2: 445177401023669296 } })
    },
    handleGoDetail(id) {
      this.$router.push({ path: '/compare/index', query: { code1: id, code2: this.thisVid } })
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

<style >
.CodeMirror {
  height: 600px !important;
}
</style>
