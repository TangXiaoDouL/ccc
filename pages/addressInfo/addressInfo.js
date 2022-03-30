import {
  httpRequestPost
} from "../../http/httpRequest";
import util from "../../utils/util";
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

// 全局变量
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {


    // 用户地址
    userAddressList: [],

    // 买方id
    UserOId: '',
    // 市场编号
    ageOId: '',

    isChecked: false

  },

  goNewAddress() {
    // console.log('c')
    wx.navigateTo({
      url: '/pages/newaddress/newaddress'
    });

  },


  // 获取用户地址
  async getUserAddressInfo(buyid, userid) {

    let query = {
      BuyerId: buyid,
      AgeOId: userid
    }
    util.setParamSign(query)
    const {
      code,
      json
    } = await httpRequestPost('/XCXDS/GetAddressByBuyerId', query)
    if (code == 200) {
      util.setReminder('用户地址获取成功')
      let list = JSON.parse(json)
      this.setData({
        userAddressList: list
      })

    } else {
      this.setData({
        userAddressList: []
      })
    }

    console.log('地址信息', this.data.userAddressList);


  },
  // 跳转到编辑地址页面
  onRedact(e) {
    let address = e.currentTarget.dataset.addressid
    let query = {
      BuyerId: this.data.UserOId,
      AddrOId: address
    }
    query = JSON.stringify(query)

    console.log(query);

    wx.navigateTo({
      url: `/pages/redactaddress/redactaddress?query=${query}`
    });

  },
  // 删除
  onDelete(e) {
    let _that = this

    console.log(e);
    // 地址id
    let addrid = e.currentTarget.dataset.addrid
    // 用户id
    let userid = this.data.UserOId

    Dialog.confirm({
      message: '你确定要删除该地址吗！'
    }).then(async () => {
      let query = {
        AddrOId: addrid,
        BuyerId: userid
      }
      util.setParamSign(query)
      const result = await httpRequestPost('/XCXDS/DelAddress', query)
      if (result.code == 200) {
        util.setReminder('地址删除成功！')

        Dialog.close();
        console.log('cccccccccccccccccccc');

        _that.getUserAddressInfo(_that.data.UserOId, _that.data.ageOId)
      }

    }).catch(() => {
      Dialog.close();
    });

  },
 async onClickDefault(e){
      // console.log(e);
      let {address,addrid,cityname,distriname,mobile,proname,receiname}=e.currentTarget.dataset
      let myAddress={
        DetailedAddress:address,
        AddrOId:addrid,
        CityName:cityname,
        DistrictName:distriname,
        Mobile:mobile,
        ProvinceName:proname,
        ReceiveName:receiname
      }
      console.log(myAddress);
      wx.setStorageSync('address', myAddress);
      wx.navigateBack({
        delta: 1
      });
        
        
      
  },

  // 选择默认地址
  async onClick(e) {
    let _that = this
    let {
      defaultid,
      addrid
    } = e.currentTarget.dataset
    if (defaultid == 1) {
      defaultid = 0
    } else {
      defaultid = 1
    }
    let query = {
      AddrOId: addrid,
      IsDefault: defaultid,
      BuyerId: this.data.UserOId
    }
    console.log('query is', query);

    util.setParamSign(query)
    const result = await httpRequestPost('/XCXDS/UpdateDefaultAddress', query)
    if (result.code == 200) {
      util.setReminder('设置默认地址成功！')
      _that.getUserAddressInfo(this.data.UserOId, this.data.ageOId)
    }


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    let result = JSON.parse(app.globalData.userInfo)
    // 用户id
    let userid = result[0].UserOId
    let ageoid = result[0].AgeOId

    this.setData({
      UserOId: userid,
      ageOId: ageoid
    })
    this.getUserAddressInfo(this.data.UserOId, this.data.ageOId)


    console.log(result)
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