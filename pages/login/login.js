// pages/login/login.js
import util from '../../utils/util.js';

const {
  httpRequestGet,
  httpRequestPost
} = require('../../http/httpRequest.js')
// 全局变量
var app = getApp()

Page({

  data: {
    // 手机号
    iphnoVal: '',
    // 验证码
    authcode: '',
    // 倒计时
    iphnoBtn: false,
    iphnoNum: 10,
    iphnoMsg: '获取验证码',
  },

  getPhoneNumber2: function (e) {
    var that = this;
    var ivObj = e.detail.iv
    // 拒绝授权
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      // wx.navigateTo({
      //   url: '/pages/register/register',
      // })
      util.setReminder("未授权不能注册！")
    } else {
      // 接受授权
      wx.getStorage({
        key: 'wechat',
        success: function (res) {
          var openid = res.data.openid; //openid
          var thirdkey = res.data.thirdkey; //session_key
          wx.request({
            url: 'https://wap.sinxinit.com/XCXDS/getOnlyPhoneNumber',
            method: 'Get',
            data: {
              encryptedData: e.detail.encryptedData,
              iv: e.detail.iv,
              session_key: thirdkey
            },
            success: function (res) {
              if (res.data.code == 200) {
                let list = JSON.parse(res.data.userJson)
                let phone = list
                wx.setStorageSync('phone',phone) 
                wx.navigateTo({ 
                  url: '/pages/register/register',
                })
              }  else {
                wx.navigateTo({
                  url: '/pages/register/register',
                })
              }
            },
            fail: function (res) {
              console.log("提交到服务器失败了")
            }
          })
        }
      })
    }
  },

  // 判断用户是否注册该市场
  async judegAge(data){
    console.log("开始判断");
    let params ={
      PhoneNo:data[0].LoginName
    }
    util.setParamSign(params)
    let res = await httpRequestPost('/XCXDS/GetAgeByTel',params)
    console.log("用户的市场列表",JSON.parse(res.json));
    let isre = false
    if (res.code==200) {
      let result = JSON.parse(res.json)
      console.log("个人市场列表",JSON.parse(res.json));
      for (let i = 0; i < result.length; i++) {
        if (result[i].AgeOId==data[0].AgeOId) {
          console.log("已注册");
          isre = true
        }
        
      }
      return isre
    }
  },

  // 获取直播地址
  async onClickVideo(id) {
    let params = {
      userOId: id
    }
    util.setParamSign(params)
    const result = await httpRequestPost('/XCXDS/getCameraUrl', params)
    if (result.resultCode == '00' && result.resultData != null) {
      // util.setReminder('gai')
      let data = result.resultData
      return data
    }
  },

  getPhoneNumber: function (e) {
    var that = this;
    var ivObj = e.detail.iv
    console.log(e)
    // 拒绝授权
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      // 用户拒绝过授权权限
      console.log('用户拒绝过授权权限');
      
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权您将无法登陆',
        success: function (res) {
        }
      })
    } else {
      console.log('可以获取手机号',e)
      // 接受授权
      wx.getStorage({
        key: 'wechat',
        success: function (res) {
          console.log(res);
          var openid = res.data.openid; //openid
          var thirdkey = res.data.thirdkey; //session_key
          console.log('thirdkey is ',thirdkey);
          
          wx.request({
            url: 'https://wap.sinxinit.com/XCXDS/getPhoneNumber',
            method: 'Get',
            data: {
              encryptedData: e.detail.encryptedData,
              iv: e.detail.iv,
              session_key: thirdkey
            },
            success: function (res) {
              console.log(res)
              if (res.data.code == 200) {
                console.log("提交到服务器成功了~~~~",res)
                console.log("提交到服务器成功了~~~~手机号登录",JSON.parse(res.data.userJson))
                console.log("市场id",app.globalData.ageInfo);
                let data= JSON.parse(res.data.userJson)
                let ageInfo = app.globalData.ageInfo
                if (ageInfo.ageId&&ageInfo.AgencyName) {
                  data[0].AgeOId = app.globalData.ageInfo.ageId
                  data[0].AgencyName = app.globalData.ageInfo.AgencyName
                }
                console.log("判断结果",that.judegAge(data));
                // 判断是否有注册市场
                that.judegAge(data).then(e=>{
                  if (!e) {
                    util.setReminder('该手机号还没有注册该市场，请点击注册')
                    return
                  } 
                  util.setReminder('恭喜你登录成功')
                app.globalData.userInfo = JSON.stringify(data)
                wx.setStorage({
                  key:"userInfo",
                  data:JSON.stringify(data)
                })
                if (that.data.userId) {
                  that.onClickVideo(that.data.userId).then(reurl=>{
                    let query = {
                      url: reurl,
                      userid: that.data.userId
                    }
                    console.log('跳转', query)
                    query = JSON.stringify(query)
                    console.log(query)
                    wx.navigateTo({
                      url: '/pages/shopsdetail/shopsdetail?query=' + query
                    });
                  })

                 
                }
                wx.switchTab({
                  url: '/pages/tab/home/home'
                });
                })
              
              
              } else if (res.data.code == 100) {
                util.setReminder('该手机号还没有注册，点击去注册')
              }else {
                util.setReminder('获取失败')
              }
            },
            fail: function (res) {
              console.log("提交到服务器失败了")
            }
          }) //end of wx.request
        }
      })
    }
  },

  goRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },
  goHome() {

    wx.switchTab({
      url: '/pages/tab/home/home'
    });

  },
  // 手机号输入框
  onChangeIphone(e) {
    this.setData({
      iphnoVal: e.detail.value
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.userid) {
      this.setData({
        userId:options.userid
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },


})