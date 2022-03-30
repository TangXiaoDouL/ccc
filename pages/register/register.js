const {
  httpRequestGet,
  httpRequestPost
} = require('../../http/httpRequest.js')
import util from '../../utils/util.js';
// 引入SDK核心类
var QQMapWX = require('../../assets/qqmap-wx-jssdk1.2/qqmap-wx-jssdk.js');

var qqmapsdk;
let app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {

    showBazaar: false,
    showBazaar2: false,
    columns2: ['中科深信智慧市场', '汇民街市牛栏前市场'],


    //城市名
    cityName: '',
    // 机构id
    ageoid: '',
    // isCity
    showCity: false,
    // isshowBazaar
    shichang: false,
    bazaarList: [],
    bazaarList2: [],
    // 市场名
    AgencyName: '',
    // 市场id
    AgeOId: '',

    // 手机号
    phone: '',
    iphnoMsg: '获取验证码',
    //手机验证
    iphnoBtn: false,
    iphnoNum: 60,
    // 验证码
    yanzhengma: '',
    opencityList: []
  },

  // 盐田
  async getAgen() {
    let params = {
      sign: "zksx"
    }
    util.setParamSign(params)
    let res = await httpRequestPost('/ScanXCX/GetYTAgeLst', params)
    console.log("扫码数据", JSON.parse(res.json));
    if (res.code == 200) {
      let data = JSON.parse(res.json)
      const list = [];
      for (var i in data) {
        var obj = {
          'oid': data[i].AgeOId,
          'text': data[i].AgencyName
        }
        list.push(obj)
        
      }

      this.setData({
        bazaarList: list,
        AgencyName:app.globalData.ageInfo.AgencyName,
        AgeOId: app.globalData.ageInfo.ageId,
        shichang: true,
        showCity: true
      })
    }

  },



  onConfirm(e) {},

  //获取验证码
  onClickBtn() {
    // 获取手机号码长度
    let len = this.data.phone.length
    let reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
    let iphone = this.data.phone
    let bazaarName = this.data.AgencyName.length
    if (len <= 0) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none',
        duration: 1000
      })
    } else if (!reg.test(iphone)) {
      util.setReminder('手机格式有误')
      this.setData({
        phone: ''
      })
    } else if (bazaarName <= 0) {
      wx.showToast({
        title: '未选择市场',
        icon: 'none',
        duration: 1000,
      })
    } else {
      this.verificationCode(this.data.phone)
    }
  },

  // 发送验证码
  async verificationCode(number) {

    let query = {
      PhoneNo: number,
      AgeOId: this.data.AgeOId
    }
    console.log(query);
    util.setParamSign(query)
    const result = await httpRequestPost('/XCXDS/SendRegister', query)
    console.log(result);
    if (result.code == 200) {
      wx.showToast({
        title: '验证码发送成功',
        icon: 'success',
        duration: 1000
      })
      // 倒计时
      this.dingshiqi()
      this.setData({
        iphnoBtn: true
      })

      return
    } else {
      wx.showToast({
        title: result.msg,
        icon: 'none',
        duration: 1000
      })
    }


  },

  // 定时器
  dingshiqi() {
    var time = this.data.iphnoNum
    var timer = setInterval(() => {
      if (time == 0) {
        clearInterval(timer)
        this.setData({
          iphnoBtn: false,
          iphnoNum: 60
        })
      } else {
        this.setData({
          iphnoNum: time--
        })
      }
    }, 1000)
  },
  // 注册登录
  async onClickLogin() {

    let iphoneNumber = this.data.phone
    let iphoneCode = this.data.yanzhengma
    let AgeOId = this.data.AgeOId
    if (iphoneNumber == '' || iphoneNumber == null || iphoneNumber == 'undefined') {
      util.setReminder('请输入手机号码')
    } else if (AgeOId == '' || AgeOId == null || AgeOId == 'undefined') {
      util.setReminder('请选择城市')
    } else { 
      // else if (iphoneCode == '' || iphoneCode == null || iphoneCode == 'undefined') {
      //   util.setReminder('请输入验证码')
      // }
      let query = {
        PhoneNo: this.data.phone,
        MsgCode: -1,
        AgeOId: this.data.AgeOId
      }

      util.setParamSign(query)
      console.log("参数", query);
      const result = await httpRequestPost('/XCXDS/DoRegister', query)
      console.log("注册登录结果", result);
      if (result.code == 200) {
        if (result.msg=="已注册") {
          util.setReminder(result.msg)
          return
        }
        util.setReminder('恭喜你登录成功')
        // let data = JSON.parse(result.json)
        // let ageInfo = app.globalData.ageInfo
        // if (ageInfo.ageId && ageInfo.AgencyName) {
        //   data[0].AgeOId = app.globalData.ageInfo.ageId
        //   data[0].AgencyName = app.globalData.ageInfo.AgencyName
        // }
        app.globalData.userInfo = result.json
        wx.switchTab({
          url: '/pages/tab/categerte/categerte'
        });
      } else {
        util.setReminder('注册失败！')
      }

    }

  },

  // 手机改变
  onphoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  onClickYZM(e) {
    this.setData({
      yanzhengma: e.detail.value
    })
  },
  // 取消
  quxiao() {
    this.setData({
      showBazaar: false
    })
  },
  quxiao2() {
    this.setData({
      showBazaar2: false
    })
  },
  // 改变
  onChange(e) {
    let {
      oid,
      text
    } = e.detail.value

    this.setData({
      AgencyName: text,
      AgeOId: oid
    })

  },

  onChange2(e) {
    this.setData({
      cityName: e.detail.value
    })
  },
  // 确定
  queding(e) {
    let {
      oid,
      text
    } = e.detail.value
    this.setData({
      AgencyName: text,
      AgeOId: oid,
      showBazaar: false,
      shichang: true
    })
  },
  queding2(e) {
    this.setData({
      showCity: true,
      shichang: false,
      cityName: e.detail.value,
      showBazaar2: false
    })
    let city = wx.getStorageSync('city')
    if (city == '' || city == null) {
      wx.setStorageSync('city', e.detail.value)
    }
    this.getbazaarList()
  },

  // 点击开通城市
  cityClick() {
    this.setData({
      showBazaar2: true
    })
    this.getOpenCity()

  },

  // 获取城市
  async getOpenCity() {

    let query = {
      sign: 'zksx'
    }
    util.setParamSign(query)
    let query2 = {
      CityName: ''
    }
    let query3 = {
      ...query,
      ...query2
    }
    const result = await httpRequestPost('/XCXDS/GetAgeLstByCityName', query3)
    console.log(JSON.parse(result.json));
    if (result.code == 200) {
      let data = JSON.parse(result.json)
      const list2 = [];
      for (var i in data) {
        list2.push(data[i].CityName)
      }
      // 使用Set去重
      let list3 = [...new Set(list2)]
      this.setData({
        bazaarList2: list3
      })
    }

  },

  // 获取城市列表
  async getCityList(ageId) {
    let query = {
      sign: 'zksx'
    }
    let query1 = {
      CityName: ''
    }
    util.setParamSign(query)
    let quer3 = {
      ...query,
      ...query1
    }
    let res = await httpRequestPost('/XCXDS/GetAgeLstByCityName', quer3)
    console.log("城市列表", JSON.parse(res.json));
    let data = JSON.parse(res.json)
    for (let i = 0; i < data.length; i++) {
      if (data[i].AgeOId == ageId) {
        this.setData({
          AgeOId: data[i].AgeOId,
          AgencyName: data[i].AgencyName,
          cityName: data[i].CityName,
          shichang: true,
          showCity: true
        })
      }

    }
  },

  // 获取开通城市
  async getbazaarList() {
    if (!this.data.showCity) {
      util.setReminder('请先选择开通城市')
    } else {
      let query1 = {
        sign: 'zksx'
      }
      util.setParamSign(query1)
      let query2 = {
        CityName: this.data.cityName
      }
      let query3 = {
        ...query1,
        ...query2
      }
      const result = await httpRequestPost('/XCXDS/GetAgeLstByCityName', query3)
      if (result.code == 200) {
        let data = JSON.parse(result.json)
        const list = [];
        for (var i in data) {
          var obj = {
            'oid': data[i].AgeOId,
            'text': data[i].AgencyName
          }
          list.push(obj)
        }
        console.log("获取市场", list);
        this.setData({
          bazaarList: list,
          AgencyName: data[0].AgencyName,
          AgeOId: data[0].AgeOId,
          shichang: true
        })
      }
    }
  },
  // 获取市场
  async bazaarClick() {
    let len = this.data.bazaarList
    if (len.length <= 0) {
      console.log('切换');
      util.setReminder('该城市暂无市场,请切换城市')
      this.setData({
        showBazaar: false
      })
    } else {
      this.setData({
        showBazaar: true
      })
      if (app.globalData.y == "true") {
        this.getAgen()
        return
      }
      this.getbazaarList()
    }
  },
  // 关闭
  onBazaarClose() {
    this.setData({
      showBazaar: false
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let city = wx.getStorageSync('city') || ''
    let phone = wx.getStorageSync('phone') || ''
    console.log("缓存的城市", city);
    console.log(app.globalData.y);
    let ageInfo = app.globalData.ageInfo
    console.log(ageInfo);
    if (app.globalData.y == "true") {
      this.getAgen()
      this.setData({
        cityName: "深圳",
        y: true
      })
    } else if (ageInfo.ageId && ageInfo.AgencyName) {
      console.log("登录了");
      this.getCityList(ageInfo.ageId)
      this.setData({
        cityName: city,
        showCity: true
      })
      this.getbazaarList()
    } else if (city) {
      console.log("有城市");
      //  缓存中有city
      this.setData({
        cityName: city,
        showCity: true
      })
      this.getbazaarList()
    } else {
      console.log("没有城市");
      // 缓存中没有city
      this.setData({
        cityName: ''
      })
      this.getOpenCity();
    }

    if (phone) {
      this.setData({
        phone: phone
      })
    } else {
      this.setData({
        phone: ''
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})