// pages/paydetail/paydetail.js

import util from '../../utils/util'

import {
  httpRequestPost
} from "../../http/httpRequest"
let app =  getApp();

  
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clickNum: 4,
    number: '',
    paymonny: '',
    csMonny: '',
    payInfoList: [],
    pagenumber: 1,
    total: 0,
    isloading: false
  },
  async getCZTrade() {
    let query = {
      Time: this.data.clickNum,
      AgeOId: 1010,
      UserOId: 51703,
    }
    util.setParamSign(query)
    const result = await httpRequestPost('/XCXDS/GetCZCntByUserOId', query)
    if (result.code == 200) {
      let list = JSON.parse(result.json)
      this.setData({
        number: list[0].Cnt || 0,
        paymonny: list[0].TotalMoney || 0,
        csMonny: list[0].TotalGiveMoney || 0
      })
    }
  },

  async getPayList() {

    this.setData({
      isloading: true
    })

    let query = {
      PageIndex: 1,
      Time: this.data.clickNum,
      AgeOId: this.data.ageOId,
      UserOId: this.data.userId,
    }

    util.setParamSign(query)
    const result = await httpRequestPost('/XCXDS/GetCZByUserOId', query)
    if (result.code == 200) {
      let list = JSON.parse(result.json)
      if (list.json == null || list.json == '') {
        this.setData({
          payInfoList: [],
        })
      } else {
        this.setData({
          payInfoList: [...this.data.payInfoList, ...list.json],
          total: list.recordCount,
          isloading: true
        })
      }

    }


  },

  onclick(e) {

    let {
      num
    } = e.currentTarget.dataset
    this.setData({
      clickNum: num,
      payInfoList:[]
    })
    this.getCZTrade()
    this.getPayList()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let result = JSON.parse(app.globalData.userInfo)
    this.setData({
      userId:result[0].UserOId,
      ageOId:result[0].AgeOId
    })


    this.getCZTrade()
    this.getPayList()
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

    //判断页面数据是否加载完毕
    if (this.data.payInfoList.length >= this.data.total) {
      util.setReminder('没有更多数据了')
      return
    }
    // 页面一触底 pagenum+1
    this.setData({
      pagenumber: this.data.pagenumber + 1
    })

    this.getPayList()

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})