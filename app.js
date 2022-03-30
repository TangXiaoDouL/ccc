//app.js
const {
  httpRequestGet,
  httpRequestPost
} = require('./http/httpRequest.js')
 

App({
  onLaunch: function () { 
  
    wx.login({ 
      success: function (res) {
        var code = res.code;
        wx.setStorageSync('code',code);
        wx.request({ 
          url: 'https://wap.sinxinit.com/XCXDS/GetSXOpenID',
          method: 'Get',
          data: {
            code: code
          }, //传递后台code值 
          success: function (res) {
            console.log(res);
            var wechat = {
              openid: res.data.openid,
              thirdkey: res.data.session_key
            }
            wx.setStorage({  //返回openid session_key  本地缓存
              key: 'wechat',
              data: wechat
            })
          }
        })
      },
      fail: function (res) {
        console.log("登陆失败")
      }
    })

  },
 // 更新tabBar的badge
  updateTabBar() {
    wx.setTabBarBadge({
      index: 1,
      text: this.globalData.total + ""
    })
  },

  globalData: {
    userInfo: '',
    ageInfo:{}
  }
  
})