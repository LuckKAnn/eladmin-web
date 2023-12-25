<template>
  <div class="app-container">
    <el-descriptions title="源函数信息" direction="horizontal" :column="1" border>
      <el-descriptions-item label="函数名称" label-class-name="my-label" content-class-name="my-content">
        {{ this.codeInfoOne.functionName }}
      </el-descriptions-item>
      <el-descriptions-item label="编译优化级别">{{ this.codeInfoOne.compileLevel }}</el-descriptions-item>
      <el-descriptions-item label="目标架构">{{ this.codeInfoOne.targetArch }}</el-descriptions-item>
      <el-descriptions-item label="混淆方式">{{ this.codeInfoOne.obsMethod }}</el-descriptions-item>
      <el-descriptions-item label="漏洞信息">
        <el-tag v-if="!codeInfoOne.leakInfo.includes('None')" type="danger">{{ this.codeInfoOne.leakInfo }}</el-tag>
        <el-tag v-if="codeInfoOne.leakInfo.includes('None')" type="success">{{ this.codeInfoOne.leakInfo }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="软件著作保护">
        <el-tag v-if="!codeInfoOne.protectInfo.includes('许可')" type="danger">{{ this.codeInfoOne.protectInfo }}
        </el-tag>
        <el-tag v-if="codeInfoOne.protectInfo.includes('许可')" type="success">{{ this.codeInfoOne.protectInfo }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="恶意代码标识">
        <el-tag v-if="!codeInfoOne.dangerious.includes('None')" type="danger">{{ this.codeInfoOne.dangerious }}</el-tag>
        <el-tag v-if="codeInfoOne.dangerious.includes('None')" type="success">{{ this.codeInfoOne.dangerious }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="来源信息">
        <el-tag type="danger">{{ this.codeInfoOne.functionFrom }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="详细信息">
        <el-tag type="danger">{{ this.codeInfoOne.detail }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item span="3" label="详细代码">
        <codemirror v-model="this.codeInfoOne.code" :options="options" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import crudDict from '@/api/system/dict'
import CRUD, { presenter, header, form } from '@crud/crud'
import { getSearch, initGetInfo, searchById } from '@/api/self/llvm'
import { CodeDiff } from 'v-code-diff'

require('codemirror/mode/clike/clike.js')
require('codemirror/mode/javascript/javascript.js')
require('codemirror/mode/xml/xml.js')
require('codemirror/mode/vue/vue.js')
require('codemirror/mode/python/python.js')
require('codemirror/mode/css/css.js')
require('codemirror/mode/sql/sql.js')
require('codemirror/mode/shell/shell.js')

import 'codemirror/lib/codemirror.css'// 引入样式文件
require('codemirror/mode/javascript/javascript.js')// 引入JavaScript格式结合option里面的mode使用
// 折叠功能需引入的文件start
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'
// 主题
import 'codemirror/theme/dracula.css'
import { codemirror } from 'vue-codemirror'
import { searchEsFunctionById } from '@/api/self/system'

const defaultForm = { id: null, name: null, description: null, dictDetails: [] }

export default {
  name: 'Dict',
  components: { codemirror },
  cruds() {
    return [
      CRUD({ title: '字典', url: 'api/dict', crudMethod: { ...crudDict }})
    ]
  },
  mixins: [presenter(), header(), form(defaultForm)],
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
        viewportMargin: Infinity, // 处理高度自适应时搭配使用
        showCursorWhenSelecting: true, // 当选择处于活动状态时是否应绘制游标
        mode: 'javascript'
      },
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
      codeInfoOne: {},
      codeInfoTwo: {},
      showCode: null
    }
  },
  beforeCreate() {
    this.initGetInfo()
  },
  created() {
    this.initGetInfo()
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      if (this.$refs.dictDetail) {
        this.$refs.dictDetail.query.dictName = ''
      }
      return true
    },
    initGetInfo() {
      searchEsFunctionById(this.$route.query.id).then(res => {
        this.codeInfoOne = res
      })
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

<style >

.my-label {
  background: #E1F3D8;
}

.my-content {
  background: #FDE2E2;
}
.CodeMirror {
  height: 600px !important;
}
</style>
