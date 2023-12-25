<template>
  <div class="app-container">
    <p class="warn-content">
      Markdown 基于
      <!--      <Codemirror :value="fileContent" :options="cmOptions"></Codemirror>-->

<!--      <el-link type="primary" href="https://github.com/hinesboy/mavonEditor" target="_blank">MavonEditor</el-link>-->
    </p>
    <codemirror v-model="code" :options="options"></codemirror>
<!--    <mavon-editor ref="md" :style="'height:' + height" @imgAdd="imgAdd"/>-->
  </div>
</template>

<script>
import { upload } from '@/utils/upload'
import { mapGetters } from 'vuex'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
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
// 引入主题 可多个
import 'codemirror/theme/ayu-mirage.css'

export default {
  name: 'Markdown',
  components: {
    mavonEditor, codemirror
  },
  props: {
    value: {
      default: '#include<iostream>'
    }
  },
  data() {
    return {
      fileContent: '#include<iostream>',
      code: "asdsadsadasd",
      options: {
        line: true,
        theme: "rubyblue", // 主题
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
      height: document.documentElement.clientHeight - 200 + 'px'
    }
  },
  computed: {
    ...mapGetters([
      'imagesUploadApi',
      'baseApi'
    ])
  },
  mounted() {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 200 + 'px'
    }
  },
  methods: {
    imgAdd(pos, $file) {
      upload(this.imagesUploadApi, $file).then(res => {
        const data = res.data
        const url = this.baseApi + '/file/' + data.type + '/' + data.realName
        this.$refs.md.$img2Url(pos, url)
      })
    }
  }
}
</script>

<style scoped>
.v-note-wrapper.shadow {
  z-index: 5;
}
</style>
