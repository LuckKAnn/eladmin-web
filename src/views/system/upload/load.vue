<template>
  <div class="app-container" style="padding: 8px;">
    <!--工具栏-->
<!--    <el-form ref="form" :model="form" size="small" label-width="800px">-->
      <!--   上传文件   -->
<!--      <el-form-item label="上传" >-->
        <el-upload
          ref="upload"
          :limit="1"
          :before-upload="beforeUpload"
          :auto-upload="false"
          :headers="headers"
          :on-success="handleSuccess"
          :on-error="handleError"
          :action="fileUploadApi + '?name=' + form.name"
        >
          <div class="eladmin-upload" style="width: 1300px; height: 100px">
            <i class="el-icon-upload"/> 添加文件
            <div slot="tip" class="el-upload__tip">可上传任意格式文件，且不超过100M</div>
          </div>

        </el-upload>
<!--      </el-form-item>-->
<!--    </el-form>-->
<!--      <el-button type="text" @click="crud.cancelCU">取消</el-button>-->
    <el-divider></el-divider>
    <el-col :span="12"> <el-button type="primary" @click="upload">执行上传</el-button></el-col>
<!--      <el-button type="primary" @click="upload">上传</el-button>-->
      <!--          <el-button v-else :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>-->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import crudFile from '@/api/tools/localStorage'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

const defaultForm = { id: null, name: '' }
export default {
  components: { pagination, crudOperation, rrOperation, DateRangePicker },
  cruds() {
    return CRUD({ title: '文件', url: 'api/localStorage', crudMethod: { ...crudFile } })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      delAllLoading: false,
      loading: false,
      headers: { 'Authorization': getToken() },
      permission: {
        edit: ['admin', 'storage:edit'],
        del: ['admin', 'storage:del']
      }
    }
  },
  props: {
    data: {}
  },
  computed: {
    ...mapGetters([
      'baseApi',
      'fileUploadApi'
    ])
  },
  created() {
    this.crud.optShow.add = false
  },
  methods: {
    // 上传文件
    upload() {
      this.$refs.upload.submit()
    },
    beforeUpload(file) {
      let isLt2M = true
      isLt2M = file.size / 1024 / 1024 < 100
      if (!isLt2M) {
        this.loading = false
        this.$message.error('上传文件大小不能超过 100MB!')
      }
      this.form.name = file.name
      return isLt2M
    },
    handleSuccess(response, file, fileList) {
      console.log(response)
      // 拿到了response，也就是我们的基本信息，设置到某个属性上面去
      this.$emit('changeFileInfo', response)
      this.crud.notify('上传成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
      this.$refs.upload.clearFiles()
      this.crud.status.add = CRUD.STATUS.NORMAL
      this.crud.resetForm()
      this.crud.toQuery()
    },
    // 监听上传失败
    handleError(e, file, fileList) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 2500
      })
      this.loading = false
    }
  }
}
</script>

<style scoped>
::v-deep .el-image__error, .el-image__placeholder {
  background: none;
}

::v-deep .el-image-viewer__wrapper {
  top: 55px;
}
</style>
