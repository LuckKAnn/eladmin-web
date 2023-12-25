<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24"><div class="grid-content bg-purple-dark" /></el-col>
    </el-row>
    <el-row>
      <el-col :span="24"><div class="grid-content bg-purple-dark" /></el-col>
    </el-row>
    <el-form ref="form" :model="form" label-width="180px">
      <el-form-item label="文件名称">
        <el-input v-model="form.name" placeholder="请输入文件相关名称" />
      </el-form-item>
      <el-form-item label="文件信息">
        <el-input v-model="form.name" placeholder="请输入文件相关信息" />
      </el-form-item>
      <el-form-item label="编译优化等级">
        <el-select v-model="form.level" placeholder="请选择优化等级">
          <el-option label="未优化" value="None" />
          <el-option label="O1" value="O1" />
          <el-option label="O2" value="O2" />
          <el-option label="O3" value="O3" />
          <el-option label="Os" value="Os" />
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
          <el-option label="FLA" value="FLA" />
          <el-option label="SUB" value="SUB" />
          <el-option label="其他数据流混淆" value="其他数据流混淆" />
          <el-option label="其他控制流" value="其他控制流" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      <!--      <el-upload-->
      <!--        v-model="form.file"-->
      <!--        class="upload-demo"-->
      <!--        drag-->
      <!--        action="http://10.129.27.203:8080/process/upload"-->
      <!--        style="width: 100%"-->
      <!--        multiple-->
      <!--      >-->
      <!--        <i class="el-icon-upload"></i>-->
      <!--        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>-->
      <!--        <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>-->
      <!--      </el-upload>-->
      <el-form-item label="文件上传">
        <load data="fileInfo" @changeFileInfo="changeFileInfo" />
        <el-col :span="12"><el-button type="primary" @click="onSubmit">立即创建</el-button></el-col>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import crudDict from '@/api/system/dict'
import CRUD, { presenter, header, form } from '@crud/crud'
import { commitFileSearch, commitSearch, getSearch, searchById } from '@/api/self/llvm'
import load from '@/views/system/upload/load.vue'
import Load from '@/views/system/upload/load.vue'

const defaultForm = { id: null, name: null, description: null, dictDetails: [] }

export default {
  name: 'Dict',
  components: { Load },
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
      fileInfo: {}
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
    changeFileInfo(fileInfo) {
      this.fileInfo = fileInfo
      console.log('father info ', this.fileInfo)
    },
    handleCommitCode() {
      console.log(this.inputValue)
      getSearch().then(res => {
        this.searchData = res
      })
    },
    onSubmit() {
      var commitInfo = {
        name: this.form.name,
        level: this.form.level,
        arch: this.form.arch,
        hx: this.form.hx,
        path: this.fileInfo.id
      }
      console.log('this vis commitInfo ', commitInfo
      )
      commitFileSearch(commitInfo).then(res => {
        // 返回的是pathid
        console.log()
        this.$router.push({ path: '/tree/index', query: { path: res }})
      })
      // 先提交请求，分析数据，获得结果
      // this.$router.push({ path: 'system/tree/index' })
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

.my-label {
  background: #E1F3D8;
}

.my-content {
  background: #FDE2E2;
}

.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
