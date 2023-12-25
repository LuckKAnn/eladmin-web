<template>
  <div class="app-container">
    <el-descriptions title="源函数信息" :column="3" border>
      <el-descriptions-item label="函数名称" label-class-name="my-label" content-class-name="my-content">
        {{ this.codeInfoOne.functionName }}
      </el-descriptions-item>
      <el-descriptions-item label="编译优化级别">{{ this.codeInfoOne.level }}</el-descriptions-item>
      <el-descriptions-item label="目标架构">{{ this.codeInfoOne.archTarget }}</el-descriptions-item>
      <el-descriptions-item label="混淆方式">{{ this.codeInfoOne.obs }}</el-descriptions-item>
      <el-descriptions-item label="漏洞信息">
        <el-tag v-if="!codeInfoTwo.faultInfo.includes('None')" type="danger">{{ this.codeInfoTwo.faultInfo }}</el-tag>
        <el-tag v-if="codeInfoTwo.faultInfo.includes('None')" type="success">{{ this.codeInfoTwo.faultInfo }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="软件著作保护">
        <el-tag v-if="!codeInfoTwo.protectInfo.includes('许可')" type="danger">{{ this.codeInfoTwo.protectInfo }}</el-tag>
        <el-tag v-if="codeInfoTwo.protectInfo.includes('许可')" type="success">{{ this.codeInfoTwo.protectInfo }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="恶意代码标识">
        <el-tag v-if="!codeInfoTwo.dangerInfo.includes('None')" type="danger">{{ this.codeInfoTwo.dangerInfo }}</el-tag>
        <el-tag v-if="codeInfoTwo.dangerInfo.includes('None')" type="success">{{ this.codeInfoTwo.dangerInfo }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="来源信息" :content-style="{'text-align': 'right'}">
        Apache 自建软件代码
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="相似函数信息" :column="3" border>
      <el-descriptions-item label="函数名称" label-class-name="my-label" content-class-name="my-content">
        {{ this.codeInfoTwo.functionName }}
      </el-descriptions-item>
      <el-descriptions-item label="编译优化级别">{{ this.codeInfoTwo.level }}</el-descriptions-item>
      <el-descriptions-item label="目标架构">{{ this.codeInfoTwo.archTarget }}</el-descriptions-item>
      <el-descriptions-item label="混淆方式">{{ this.codeInfoTwo.obs }}</el-descriptions-item>
      <el-descriptions-item label="漏洞信息">
        <el-tag v-if="!codeInfoTwo.faultInfo.includes('None')" type="danger">{{ this.codeInfoTwo.faultInfo }}</el-tag>
        <el-tag v-if="codeInfoTwo.faultInfo.includes('None')" type="success">{{ this.codeInfoTwo.faultInfo }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="软件著作保护">
        <el-tag v-if="!codeInfoTwo.protectInfo.includes('许可')" type="danger">{{ this.codeInfoTwo.protectInfo }}</el-tag>
        <el-tag v-if="codeInfoTwo.protectInfo.includes('许可')" type="success">{{ this.codeInfoTwo.protectInfo }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="恶意代码标识">
        <el-tag v-if="!codeInfoTwo.dangerInfo.includes('None')" type="danger">{{ this.codeInfoTwo.dangerInfo }}</el-tag>
        <el-tag v-if="codeInfoTwo.dangerInfo.includes('None')" type="success">{{ this.codeInfoTwo.dangerInfo }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="来源信息" :content-style="{'text-align': 'right'}">
        字节跳动软件研发赔付项目专项代码
      </el-descriptions-item>
    </el-descriptions>
    <code-diff
      :old-string="this.codeInfoOne.codeInfo"
      :new-string="this.codeInfoTwo.codeInfo"
      file-name="test.txt"
      output-format="side-by-side"
    />
  </div>
</template>

<script>
import crudDict from '@/api/system/dict'
import CRUD, { presenter, header, form } from '@crud/crud'
import { getSearch, initGetInfo, searchById } from '@/api/self/llvm'
import { CodeDiff } from 'v-code-diff'

const defaultForm = { id: null, name: null, description: null, dictDetails: [] }

export default {
  name: 'Dict',
  components: { CodeDiff },
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
      codeInfoOne: {},
      codeInfoTwo: {},
      showCode: null
    }
  },
  beforeCreate() {
    this.initGetInfo()
  },
  created() {
    console.log('roter data:', this.$router)
    console.log('roter data:', this.$route.query)
    console.log('roter data:', this.$router.params)
    console.log('roter data:', this.props)
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
      initGetInfo(this.$route.query.code1, this.$route.query.code2).then(res => {
        this.codeInfoOne = res[0]
        this.codeInfoTwo = res[1]
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

<style scoped>

.my-label {
  background: #E1F3D8;
}

.my-content {
  background: #FDE2E2;
}
</style>
