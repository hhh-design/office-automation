<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="showAddCateDialog"
          >添加分类</el-button
        >
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 定义插槽 slot-scope接收这一行的数据-->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button
            type="primary"
            @click="showeditCateDialog(scope.row)"
            icon="el-icon-edit"
            size="mini"
            >编辑</el-button
          >
          <el-button
            type="danger"
            @click="removeCate(scope.row.cat_id)"
            icon="el-icon-delete"
            size="mini"
            >删除</el-button
          >
        </template>
      </tree-table>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options 用来指定数据源 props 用来指定配置对象 
          v-model必须绑定数组不可以是具体的值或者对象-->
          <!-- <el-cascader
            expand-trigger="hover"
            v-model="selectdKeys"
            :options="parentCateList"
            :props="{
              ...cascaderProps,
              checkStrictly: 'true',
            }"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader> -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
            change-on-select
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类信息 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisbel"
      width="50%"
    >
      <el-form
        :model="editCate"
        :rules="editCateRules"
        ref="editCateRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCate.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisbel = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 商品分类的数据列表,默认为空
        cateList: [],
        //查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5,
        },
        // 总数据条数
        total: 0,

        //为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name',
          },
          {
            label: '是否有效',
            // 表示,将当前列定义为模板列
            type: 'template',
            // 表示当前这一列使用模板名称
            template: 'isok',
          },
          {
            label: '排序',
            // 表示,将当前列定义为模板列
            type: 'template',
            // 表示当前这一列使用模板名称
            template: 'order',
          },
          {
            label: '操作',
            // 表示,将当前列定义为模板列
            type: 'template',
            // 表示当前这一列使用模板名称
            template: 'opt',
          },
        ],
        /* 控制添加分类对话框的显示与隐藏 */
        addCateDialogVisible: false,

        /* 添加分类的表单数据对象 */
        addCateForm: {
          /* 将要添加分类的名称 */
          cat_name: '',
          /* 父级分类的ID */
          cat_pid: 0,
          /* 分类层级,默认要添加的是1级分类 */
          cat_level: 0,
        },

        /* 父级分类的列表保存到这个数组中 */
        parentCateList: [],
        /* 指定级联选择器的配置对象 */
        cascaderProps: {
          /* 指定选项的值为选项对象的某个属性值 */
          value: 'cat_id',
          /* 指定选项标签为选项对象的某个属性值 */
          label: 'cat_name',
          /* 指定选项的子选项为选项对象的某个属性值 */
          children: 'children',
        },
        /* 选中的父级分类的id数组 */
        selectdKeys: [],

        /* 添加分类表单的验证规则对象 */
        addCateFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' },
          ],
        },
        /* 编辑对话框的显示和隐藏 */
        editCateDialogVisbel: false,
        editCate: {},
        editCateRules: {
          cat_name: [
            { required: true, message: '请输入要修改的信息', trigger: 'blur' },
          ],
        },
        editCateId: '',
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      /* 获取所有的商品分类列表 */
      async getCateList() {
        const { data: res } = await this.$http.get('categories', {
          params: this.queryInfo,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败!')
        }
        // 把数据列表赋值给cateList
        this.cateList = res.data.result
        // 为总数据条数赋值
        this.total = res.data.total
      },
      /* 监听pagesize的改变 */
      handleSizeChange(newValue) {
        this.queryInfo.pagesize = newValue
        this.getCateList()
      },
      /* 监听pagenum的改变 */
      handleCurrentChange(newpage) {
        this.queryInfo.pagenum = newpage
        this.getCateList()
      },
      /* 点击按钮展示添加分类的对话框 */
      showAddCateDialog() {
        /* 先获取父级分类的数据列表再展示出对话框 */
        this.getParentCateList()
        this.addCateDialogVisible = true
      },
      /* 获取父级分类的数据列表 */
      async getParentCateList() {
        const { data: res } = await this.$http.get('categories', {
          params: { type: 2 },
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取父级分类数据失败!')
        }
        this.parentCateList = res.data
      },
      /* 当选项变化时触发这个选项 */
      parentCateChanged() {
        console.log(this.selectdKeys)
        /* 如果 selectdKeys 数组中的length大于0证明选中父级分类；反之,就说明没有选中任何父级分类 */
        if (this.selectdKeys.length > 0) {
          /* 父级分类的id */
          this.addCateForm.cat_pid = this.selectdKeys[this.selectdKeys.length - 1]
          /* 为当前分类的等级赋值 */
          this.addCateForm.cat_level = this.selectdKeys.length
          return
        } else {
          /* 父级分类的id */
          this.addCateForm.cat_pid = 0
          /* 为当前分类的等级赋值 */
          this.addCateForm.cat_level = 0
        }
      },
      /* 关闭对话框事件,重置表单数据 */
      addCateDialogClosed() {
        this.$refs.addCateFormRef.resetFields()
        this.selectdKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      },
      /* 点击按钮添加新的分类 */
      addCate() {
        console.log(this.addCateForm)
        this.$refs.addCateFormRef.validate(async (valid) => {
          if (!valid) return
          const { data: res } = await this.$http.post(
            'categories',
            this.addCateForm
          )
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败!')
          }
          this.$message.success('添加分类成功!')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      /* 编辑分类信息 */
      async editCateInfo() {
        const { data: res } = await this.$http.put(
          'categories/' + this.editCate.cat_id,
          { cat_name: this.editCate.cat_name }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类数据失败!')
        }
        this.$message.success('更新分类数据成功!')
        this.getCateList()
        this.editCateDialogVisbel = false
      },

      /* 展示编辑分类对话框 */
      async showeditCateDialog(cateInfo) {
        this.editCateId = cateInfo.cat_id
        const { data: res } = await this.$http.get(
          'categories/' + cateInfo.cat_id
        )
        this.editCate = res.data
        console.log(this.editCate)
        // console.log(res.data)
        this.editCateDialogVisbel = true
      },

      /* 删除分类 */
      async removeCate(id) {
        const confirRustle = await this.$confirm(
          '此操作将永久删除该文件, 是否继续?',
          '删除分类',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).catch((err) => err)

        if (confirRustle !== 'confirm') {
          return this.$message.info('已取消删除操作!')
        }

        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('分类删除失败!')
        }
        this.$message.success('该分类已经成功删除!')
        this.getCateList()
      },
    },
  }
</script>

<style lang='less' scoped>
  .treeTable {
    margin-top: 10px;
  }

  .el-cascader {
    width: 100%;
  }
</style>
