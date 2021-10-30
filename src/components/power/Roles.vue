<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 == 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-arrow-right"></i>
              </el-col>
              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-arrow-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :class="[i3 === 0 ? '' : 'bdtop']"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="dialogVisible"
      width="50%"
      @close="addRolesClosed"
    >
      <!-- 内容主体区域 -->
      <el-form :model="addForm" label-width="80px" ref="addRolesRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 编辑的对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        /* 所有角色列表数据 */
        rolelist: [],
        /* 控制分配权限对话框的显示与隐藏 */
        setRightDialogVisible: false,
        /* 所有权限的数据 */
        rightslist: [],
        treeProps: {
          label: 'authName',
          children: 'children',
        },
        /* 默认选中的节点id值数组 */
        defKeys: [],
        /* 当前即将分配权限的角色id */
        roleId: '',
        /* 控制修改角色信息的对话框显示 */
        editDialogVisible: false,
        /* 查询到的角色信息对象 */
        editForm: {},
        /* 控制添加角色对话框是否显示 */
        dialogVisible: false,
        /* 添加角色的表单数据 */
        addForm: {
          roleName: '',
          roleDesc: '',
        },
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      /* 获取所有角色的列表 */
      async getRolesList() {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status != 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.rolelist = res.data
        console.log(this.rolelist)
      },
      /* 根据ID删除对应的权限 */
      async removeRightById(role, rightId) {
        /* 弹框提示用户是否要删除 */
        const confirmResult = await this.$confirm(
          '此操作将永久删除该文件, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).catch((err) => err)
        if (confirmResult == 'cancel') {
          return this.$message({
            message: '取消了删除',
            duration: 1000,
          })
        }
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status != 200) {
          return this.$message.error('删除权限失败')
        }
        role.children = res.data
      },
      /* 展示分配权限的对话框 */
      async showSetRightDialog(role) {
        this.roleId = role.id
        /* 获取所有权限 */
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status != 200) {
          return this.$message.error('获取权限数据失败')
        }
        /* 把获取到的权限数据保存到data中 */
        this.rightslist = res.data
        console.log(this.rightslist)

        /* 获取三级节点 */
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      },
      /* 通过递归函数获取角色下所有三级权限的id，并保存到defkeys数组中 */
      getLeafKeys(node, arr) {
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach((item) => this.getLeafKeys(item, arr))
      },
      /* 监听分配权限对话框的关闭事件 */
      setRightDialogClosed() {
        this.defKeys = []
      },
      /* 点击为角色分配权限 */
      async allotRights() {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys(),
        ]
        const idStr = keys.join(',')
        const { data: res } = await this.$http.post(
          `roles/${this.roleId}/rights`,
          { rids: idStr }
        )
        if (res.meta.status != 200) {
          return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
      },
      /* 控制修改角色信息对话框的显示 */
      async showEditDialog(id) {
        this.editDialogVisible = true
        const { data: res } = await this.$http.get('roles/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('获取角色信息失败')
        }
        this.editForm = res.data
      },
      /* 控制修改角色信息对话框的关闭 */
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      /* 提交修改角色信息表单 */
      async editUserInfo() {
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        )
        if (res.meta.status != 200) {
          return this.$message.error('提交角色信息失败')
        }
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('更新角色信息成功')
      },
      /* 根据id删除对应的角色信息 */
      async removeRoleById(id) {
        /* 弹框确认是否删除 */
        const confirmResult = await this.$confirm(
          '此操作将永久删除该角色, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).catch((cancel) => {
          return cancel
        })
        if (confirmResult == 'cancel') {
          return this.$message('已取消删除')
        }

        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status != 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        this.getRolesList()
      },
      /* 监听角色修改表单的关闭事件 */
      addRolesClosed() {
        this.$refs.addRolesRef.resetFields()
      },
      async addRole() {
        const { data: res } = await this.$http.post('roles', {
          roleName: this.addForm.roleName,
          roleDesc: this.addForm.roleDesc,
        })
        if (res.meta.status != 201) {
          return this.$message.error('角色创建失败')
        }
        this.$message.success('角色创建成功')
        this.dialogVisible = false
        this.getRolesList()
      },
    },
  }
</script>
<style lang='less' scoped>
  .el-tag {
    margin: 7px;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
