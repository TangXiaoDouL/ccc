import Dialog from '../../../@vant/weapp/dialog/dialog';
import {
  httpRequestPost
} from '../../../http/httpRequest';
import util from '../../../utils/util';
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showBazzer: false,
    ageOId: '',
    agencyName: '',
    phone: '',
    phones:'',
    columns: [],
    callPhone:'',
    ishavephoen:false,
    nocallPhone:'',
    // 登录
    isloding:false,
    userId:'',
    balance:0,
    showPayList:false
  },

  // 充值列表
  async getPayList() {
    let query = {
      AgeOId: this.data.ageOId
    }
    util.setParamSign(query)

    const result = await httpRequestPost('/XCXDS/GetPayItem', query)
    if (result.code == 200) {
        console.log(result)
        let json=result.json
        if(json=='' || json==null){
          console.log('隐藏')
        }else{
          console.log('显示')
          this.setData({
            showPayList: true
          })
        }
    }else{
      console.log('隐藏1')
    }
  },



  goAddressInfo() {
    if (!this.data.isloding) {
      return util.setReminder('请先登录')
    }
    wx.navigateTo({
      url: '/pages/addressInfo/addressInfo'
    });
  },
  freeTell: function () {

    if(this.data.callPhone=='' || this.data.callPhone == null){
      // alert()
      util.setReminder('暂无手机号')
    }else{
      wx.makePhoneCall({

        phoneNumber: this.data.callPhone,
  
      })
    }



  },
  // 我的订单
  onClickOrder(){
    if (!this.data.isloding) {
      return util.setReminder('请先登录')
    }
    wx.navigateTo({
      url:'/pages/order/order'
    })
  },
  onClickTicker(){
    if (!this.data.isloding) {
      return util.setReminder('请先登录')
    }
  },
  onClickBalance(){
    if (!this.data.isloding) {
      return util.setReminder('请先登录')
    }
  },
  onClickSendMonny(){
    if (!this.data.isloding) {
      return util.setReminder('请先登录')
    }
    wx.navigateTo({
      url:'/pages/senddetail/senddetail'
    })
  },
  onClickPayMonny(){
    if (!this.data.isloding) {
      return util.setReminder('请先登录')
    }
    wx.navigateTo({
      url:'/pages/paydetail/paydetail'
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

  


  },
  onShow: function () {
    let s=app.globalData.userInfo
    if(s==null || s=='' ){
      this.setData({
        isloding:false
      })
    }else{
      let result = JSON.parse(app.globalData.userInfo)
      let arr = result[0].LoginName.split('')
      let star = ["*","*","*","*","*"]
      arr.splice(3,5,...star)
      let phone = arr.join('')
      this.setData({
        BuyerName: result[0].UserName,
        ageOId: result[0].AgeOId,
        agencyName: result[0].AgencyName,
        phone: result[0].LoginName,
        userId:result[0].UserOId,
        isloding:true,
        phones:phone
      })

      this.getBalance(this.data.ageOId,this.data.userId)

      this.getCateList(this.data.phone)
  
      this.getCallPhone(this.data.ageOId)

      this.getPayList()
    }
    
  },
  onClickLogin(){
    wx.navigateTo({
      url:'/pages/login/login'
    })
  },
  // 获取分类
  async getCateList(number) {
    let query = {
      PhoneNo: number
    }
    util.setParamSign(query)
    const result = await httpRequestPost('/XCXDS/GetAgeByTel', query)
    if (result.code == 200) {
      let data = JSON.parse(result.json)
      let list = []
      for (var i in data) {
        var obj = {
          'keyId': data[i].UserOId,
          'oid': data[i].AgeOId,
          'text': data[i].AgencyName
        }
        list.push(obj)
      }

      this.setData({
        columns: list
      })

    }
  },
  onClickRecharge(){

    if(!this.data.isloding){
      return util.setReminder('请先登录')
    }
    let query={
      name:this.data.phone,
      monny:this.data.balance
    }
    query=JSON.stringify(query)
    // 跳转支付
    wx.navigateTo({
      url: '/pages/recharge/recharge?data='+query
    })
  },
  // 获取余额
  async getBalance(oid,uid){
    let query={
      UserOId:uid,
      AgeOId:oid
    }
    util.setParamSign(query)
    const result=await httpRequestPost('/XCXDS/GetUserAccount',query)
    if(result.code==200){
      this.setData({
        balance:result.Balance
      })
    }
  },
  async getCallPhone(oid){
    let query={
      AgeOId:oid
    }
    util.setParamSign(query)

    const result =await httpRequestPost('/XCXDS/GetECServiceTel',query)
    if(result.code==200){
      let call=JSON.parse(result.json)
      if(call[0].ECServiceTel=='' || call[0].ECServiceTel==null ){
          this.setData({
            nocallPhone:'',
            ishavephoen:false
          })
      }else{
        this.setData({
          callPhone:call[0].ECServiceTel,
          ishavephoen:true
        })
      }
    }
    
  },
  // 退出登录
  onClickExit() {
    Dialog.confirm({
      message: '是否退出当前账号'
    }).then(async () => {


      Dialog.close();
      app.globalData.userInfo = JSON.stringify({})
      wx.navigateTo({
        url: "/pages/login/login"
      })
    }).catch(() => {
      Dialog.close();
    })
  }

})