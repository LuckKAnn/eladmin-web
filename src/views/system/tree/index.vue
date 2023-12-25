<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :xs="9" :sm="6" :md="5" :lg="4" :xl="4">
        <div class="head-container">
          <el-input
              v-model="deptName"
              clearable
              size="small"
              placeholder="检索代码文件"
              prefix-icon="el-icon-search"
              class="filter-item"
              @input="getDeptDatas"
          />
        </div>
        <!--        <el-tree-->
        <!--          :data="deptDatas"-->
        <!--          :load="getDeptDatas"-->
        <!--          :props="defaultProps"-->
        <!--          :expand-on-click-node="false"-->
        <!--          lazy-->
        <!--          @node-click="handleNodeClick"-->
        <!--        />-->
        <!--        <el-tree :data="pathDatas" :props="myProps" :expand-on-click-node="false" @node-click="handlePathClick"/>-->
        <el-tree
            :data="pathDatas"
            node-key="id"
            :expand-on-click-node="false"
            @node-click="handlePathClick"
        >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span icon="el-icon-search">
           <svg-icon icon-class="menu" v-if="data.dir"/>
          <i class="el-icon-document" v-if="!data.dir"/>
          {{ data.pathName }}</span>
      </span>
        </el-tree>
      </el-col>
      <!--用户数据-->
      <el-col :xs="15" :sm="18" :md="19" :lg="20" :xl="20">
        <!--工具栏-->
        <div class="head-container">
          <div v-if="crud.props.searchToggle">
            <!-- 搜索 -->
            <el-input
                v-model="query.blurry"
                clearable
                size="small"
                placeholder="检索指定函数名称"
                style="width: 200px;"
                class="filter-item"
                @keyup.enter.native="crud.toQuery"
            />
            <el-select
                v-model="query.enabled"
                clearable
                size="small"
                placeholder="状态"
                class="filter-item"
                style="width: 90px"
                @change="crud.toQuery"
            >
              <el-option
                  v-for="item in enabledTypeOptions"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
              />
            </el-select>
            <rrOperation/>
          </div>
          <crudOperation show="" :permission="permission">
            <el-button
                slot="right"
                v-permission="['admin','user:add']"
                :disabled="crud.selections.length === 0"
                class="filter-item"
                size="mini"
                type="primary"
                icon="el-icon-refresh-left"
                @click="resetPwd(crud.selections)"
            >重新选择
            </el-button>
          </crudOperation>
        </div>
        <!--表单渲染-->
        <el-table ref="table" highlight-current-row v-loading="false" :data="fileFunctionData"
                  @current-change="handleCurrentChange" style="width: 100%;"
                  @selection-change="crud.selectionChangeHandler"
        >
          <!--          <el-table-column :selectable="checkboxT" type="selection" width="55" />-->
          <el-table-column :show-overflow-tooltip="true" prop="functionName" label="函数名称"/>
          <el-table-column :show-overflow-tooltip="true" prop="codeLine" label="函数ID"/>
          <el-table-column :show-overflow-tooltip="true" prop="comeInfo" label="文件来源"/>
          <el-table-column :show-overflow-tooltip="true" prop="fileName" label="文件名称">
            <template slot-scope="scope">
              <div>{{ scope.row.fileName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="是否可处理" align="center" prop="codeLine">
            <template slot-scope="scope">
              <el-switch
                  v-model=" scope.row.codeLine > 255 || scope.row.codeLine < 5 ? false : true "
                  disabled
                  active-color="#409EFF"
                  inactive-color="#F56C6C"
              />
            </template>
          </el-table-column>
          <el-table-column label="代码信息" align="center" prop="codeLine">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleSeeCode(scope.row.codeInfo)">查看详情</el-button>
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" prop="codeLine" width="135" label="解析日期">
            <template slot-scope="scope">

                2023-10-02 11:23:59
            </template>
          </el-table-column>
          <el-table-column
              v-if="checkPer(['admin','user:edit','user:del'])"
              label="操作"
              width="115"
              align="center"
              fixed="right"
          >
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-search" @click="redirectTo(scope.row.id)" circle></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--        <el-dialog :visible.sync="dialog" title="代码信息" top="30px" width="85%">-->
        <el-dialog :visible.sync="dialog" title="代码信息" top="30px" width="85%">
          <codemirror v-model="seeCodeInfo" :options="options"></codemirror>
          <!--                    <pre>{{ this.seeCodeInfo }}</pre>-->
        </el-dialog>
        <!--分页组件-->
        <pagination/>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import crudUser from '@/api/system/user'
import { isvalidPhone } from '@/utils/validate'
import { getDepts, getDeptSuperior, getPath, processFile } from '@/api/system/dept'
import { getAll, getLevel } from '@/api/system/role'
import { getAllJob } from '@/api/system/job'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'
import Treeselect from '@riophae/vue-treeselect'
import { mapGetters } from 'vuex'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'
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

let userRoles = []
let userJobs = []
const defaultForm = {
  id: null,
  username: null,
  nickName: null,
  gender: '男',
  email: null,
  enabled: 'false',
  roles: [],
  jobs: [],
  dept: { id: null },
  phone: null
}
export default {
  name: 'User',
  components: { Treeselect, crudOperation, rrOperation, udOperation, pagination, DateRangePicker, codemirror },
  cruds() {
    return CRUD({ title: '用户', url: 'api/user', crudMethod: { ...crudUser } })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  // 数据字典
  dicts: ['user_status'],
  beforeCreate() {
    // console.log("hhhhhh",this.$route.query.path)
    getPath(this.$route.query.path).then(res => {
      this.pathDatas = res
    })
  },
  data() {
    // 自定义验证
    const validPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入电话号码'))
      } else if (!isvalidPhone(value)) {
        callback(new Error('请输入正确的11位手机号码'))
      } else {
        callback()
      }
    }
    return {
      cmOptions: {
        mode: { name: 'javascript', json: true },//设置语法格式这里是JavaScript
        lineNumbers: true, //显示行号
        // 代码折叠功能配置项start
        foldGutter: true,
        lineWrapping: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers']
      },
      options: {
        line: true,
        theme: "dracula", // 主题
        tabSize: 4, // 制表符的宽度
        indentUnit: 2, // 一个块应该缩进多少个空格（无论这在编辑语言中意味着什么）。默认值为 2。
        firstLineNumber: 1, // 从哪个数字开始计算行数。默认值为 1。
        readOnly: false, // 只读
        autorefresh: true,
        smartIndent: true, // 上下文缩进
        lineNumbers: true, // 是否显示行号
        styleActiveLine: true, // 高亮选中行
        viewportMargin: Infinity, //处理高度自适应时搭配使用
        showCursorWhenSelecting: true, // 当选择处于活动状态时是否应绘制游标
        mode: "javascript",
      },
      dialog: false,
      seeCodeInfo: 'asddddddddd',
      chooseData: {},
      fileFunctionData: [],
      height: document.documentElement.clientHeight - 180 + 'px;',
      deptName: '', depts: [], deptDatas: [], jobs: [], level: 3, roles: [],
      jobDatas: [], roleDatas: [], // 多选时使用
      defaultProps: { children: 'children', label: 'pathName', isLeaf: !'dir' },
      myProps: { children: 'children', label: 'pathName' },
      pathDatas: [],
      permission: {
        add: ['admin', 'user:add'],
        edit: ['admin', 'user:edit'],
        del: ['admin', 'user:del']
      },
      enabledTypeOptions: [
        { key: 'true', display_name: '可处理' },
        { key: 'false', display_name: '不可处理' }
      ],
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, trigger: 'blur', validator: validPhone }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  created() {
    this.crud.msg.add = '新增成功，默认密码：123456'
  },
  mounted: function() {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 180 + 'px;'
    }
    this.getDeptDatas()
  },
  methods: {
    handleSeeCode(codeInfo) {
      this.dialog = true
      this.seeCodeInfo = codeInfo
      this.seeCodeInfo = `<script setup lang="ts">
import { dateFormat, requestAnimationFrame, cancelAnimationFrame, rafTimeout, cancelRaf } from 'vue-amazing-ui'
<\/script>
`
    },
    redirectTo(targetId) {
      // 应该先调用接口，处理这个函数，然后才去查id
      // processFile(path).then(res => {
      //   this.fileFunctionData = res
      // })
      console.log(this.chooseData)
      // this.$router.push({ path: '/compare/index', query: { code1: 445177401023668152, code2: 445177401023669296 } })
      this.$router.push({ path: '/detail', query: { code1: 445177401023668152, code2: 445177401023669296 } })
    },
    handleCurrentChange(data) {
      console.log(data)
      this.chooseData = data
    },
    // 禁止输入空格
    keydown(e) {
      if (e.keyCode === 32) {
        e.returnValue = false
      }
    },
    changeRole(value) {
      userRoles = []
      value.forEach(function(data, index) {
        const role = { id: data }
        userRoles.push(role)
      })
    },
    changeJob(value) {
      userJobs = []
      value.forEach(function(data, index) {
        const job = { id: data }
        userJobs.push(job)
      })
    },
    deleteTag(value) {
      userRoles.forEach(function(data, index) {
        if (data.id === value) {
          userRoles.splice(index, value)
        }
      })
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getRoles()
      if (form.id == null) {
        this.getDepts()
      } else {
        this.getSupDepts(form.dept.id)
      }
      this.getRoleLevel()
      this.getJobs()
      form.enabled = form.enabled.toString()
    },
    // 新增前将多选的值设置为空
    [CRUD.HOOK.beforeToAdd]() {
      this.jobDatas = []
      this.roleDatas = []
    },
    // 初始化编辑时候的角色与岗位
    [CRUD.HOOK.beforeToEdit](crud, form) {
      this.getJobs(this.form.dept.id)
      this.jobDatas = []
      this.roleDatas = []
      userRoles = []
      userJobs = []
      const _this = this
      form.roles.forEach(function(role, index) {
        _this.roleDatas.push(role.id)
        const rol = { id: role.id }
        userRoles.push(rol)
      })
      form.jobs.forEach(function(job, index) {
        _this.jobDatas.push(job.id)
        const data = { id: job.id }
        userJobs.push(data)
      })
    },
    // 提交前做的操作
    [CRUD.HOOK.afterValidateCU](crud) {
      if (!crud.form.dept.id) {
        this.$message({
          message: '部门不能为空',
          type: 'warning'
        })
        return false
      } else if (this.jobDatas.length === 0) {
        this.$message({
          message: '岗位不能为空',
          type: 'warning'
        })
        return false
      } else if (this.roleDatas.length === 0) {
        this.$message({
          message: '角色不能为空',
          type: 'warning'
        })
        return false
      }
      crud.form.roles = userRoles
      crud.form.jobs = userJobs
      return true
    },
    // 获取左侧部门数据
    getDeptDatas(node, resolve) {
      const sort = 'id,desc'
      const params = { sort: sort }
      if (typeof node !== 'object') {
        if (node) {
          params['name'] = node
        }
      } else if (node.level !== 0) {
        params['pid'] = node.data.id
      }
      // setTimeout(() => {
      //   getPath(params).then(res => {
      //     if (resolve) {
      //       resolve(res)
      //       this.deptDatas = res
      //       this.pathDatas = res
      //     } else {
      //       this.deptDatas = res
      //       this.pathDatas = res
      //     }
      //   })
      // }, 100)
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content.map(function(obj) {
          if (obj.hasChildren) {
            obj.children = null
          }
          return obj
        })
      })
    },
    getSupDepts(deptId) {
      getDeptSuperior(deptId).then(res => {
        const date = res.content
        this.buildDepts(date)
        this.depts = date
      })
    },
    buildDepts(depts) {
      depts.forEach(data => {
        if (data.children) {
          this.buildDepts(data.children)
        }
        if (data.hasChildren && !data.children) {
          data.children = null
        }
      })
    },
    // 获取弹窗内部门数据
    loadDepts({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        getDepts({ enabled: true, pid: parentNode.id }).then(res => {
          parentNode.children = res.content.map(function(obj) {
            if (obj.hasChildren) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 200)
        })
      }
    },
    // 切换部门
    handlePathClick(data) {
      // 传输到后端把
      console.log('会调用这个马')
      var path = data.pathName
      this.chooseId = path
      processFile(path).then(res => {
        this.fileFunctionData = res
      })
      console.log(data)
      // 执行编译，然后划分出函数
    },
    handleNodeClick(data) {
      if (data.pid === 0) {
        this.query.deptId = null
      } else {
        this.query.deptId = data.id
      }
      this.crud.toQuery()
    },
    // 改变状态
    changeEnabled(data, val) {
      this.$confirm('此操作将 "' + this.dict.label.user_status[val] + '" ' + data.username + ', 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudUser.edit(data).then(res => {
          this.crud.notify(this.dict.label.user_status[val] + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(() => {
          data.enabled = !data.enabled
        })
      }).catch(() => {
        data.enabled = !data.enabled
      })
    },
    // 获取弹窗内角色数据
    getRoles() {
      getAll().then(res => {
        this.roles = res
      }).catch(() => {
      })
    },
    // 获取弹窗内岗位数据
    getJobs() {
      getAllJob().then(res => {
        this.jobs = res.content
      }).catch(() => {
      })
    },
    // 获取权限级别
    getRoleLevel() {
      getLevel().then(res => {
        this.level = res.level
      }).catch(() => {
      })
    },
    checkboxT(row, rowIndex) {
      return row.id !== this.user.id
    },
    resetPwd(datas) {
      this.$confirm(`你选中了 ${datas.length} 位用户，确认重置用户的密码吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        datas.forEach(val => {
          ids.push(val.id)
        })
        console.log(ids)
        crudUser.resetPwd(ids).then(() => {
          this.crud.notify('重置成功, 用户新密码:123456', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(() => {
        })
      }).catch(() => {
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .vue-treeselect__control, ::v-deep .vue-treeselect__placeholder, ::v-deep .vue-treeselect__single-value {
  height: 30px;
  line-height: 30px;
}

</style>

<style>
.CodeMirror {
  height: 900px !important;
}
</style>
