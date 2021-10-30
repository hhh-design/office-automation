<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <!-- 通过调用ref来重置表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        abel-width="0px"
        class="login_form"
      >
        <!-- 表单区域 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-zhanghu"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-row id="btn">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="success" @click="resetLoginForm">重置</el-button>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { defineComponent } from '@vue/composition-api'

  /* export default defineComponent({
      setup() {},
  }) */
  export default {
    data() {
      return {
        /* 这是登录表单的数据绑定对象 */
        loginForm: {
          username: 'admin',
          password: '123456', //加引号！
        },
        /* 这是表单的验证规则对象 */
        loginFormRules: {
          username: [
            /* 必填项 失去焦点时提示  两个花括号表示两个规则*/
            { required: true, message: '请输入活动名称', trigger: 'blur' },
            { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入活动名称', trigger: 'blur' },
            {
              min: 6,
              max: 15,
              message: '长度在 6 到 15 个字符',
              trigger: 'blur',
            },
          ],
        },
      }
    },
    methods: {
      /* 点击重置按钮重置登录表单 */
      resetLoginForm() {
        console.log(this)
        this.$refs.loginFormRef.resetFields()
      },
      /* 点击登录按钮实现预验证 */
      /* 先获取到表单的引用对象 用该对象调用validdate进行预校验*/
      login() {
        this.$refs.loginFormRef.validate(async (valid) => {
          if (!valid) return
          const { data: res } = await this.$http.post('login', this.loginForm) //await只能用在async修饰的方法中，所以外面的方法要加上async
          //返回的六个数据中只有data是需要的，所以解构赋值给res
          //console.log(res)
          if (res.meta.status != 200) this.$message.error('出错')
          else {
            this.$message.success('成功')
          }
          /* 1.将登陆成功之后的token，保存到客户端的sessionStorage 中
                        1.1 项目中除了登录之外其他的API接口，必须在登陆之后才能访问
                        1.2token只应在当前网站打开期间生效所以将token保存在sessionStorage中
                      2.通过编程式导航跳转到后台主页，路由地址是/home
                    */
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        })
      },
    },
  }
</script>

<style lang='less' scoped>
  /* lang表示支持less语法；scoped表示该样式只在当前组件内生效 不加是全局生效*/
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }
  .login_box {
    width: 450px;
    height: 300px;
    border-radius: 5px;
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .avatar_box {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: rgb(255, 255, 255);
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, -50%);
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
  }
  .avatar_box img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgb(197, 196, 196);
  }
  #btn {
    display: flex;
    justify-content: flex-end;
  }
  .login_form {
    position: absolute;
    bottom: 10px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
</style>
