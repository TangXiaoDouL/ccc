import util from "../../utils/util"
import {
  httpRequestPost
} from "../../http/httpRequest";
let app = getApp();


// pages/recharge/recharge.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onclick: false,
    userName: '',
    monny: '',
    ageOId: '',
    userId: '',
    index:'',
    // 支付列表
    payList: [],
    dates: [
            { "data_name": "30", "name": "十三"},
            { "data_name": "1", "name": "十四"},
            { "data_name": "2", "name": "十五"},
            { "data_name": "3", "name": "十六"},
            { "data_name": "4", "name": "十七"}
          ],
    state:'',
    // 充值金额
    CZMoney:'',
    // 金额id
    AgeRuleDeId:'',
    ZSMoney:'',
    Phone:'',
    ischecked:true,
    ZSDayMoney:'',
    ZSMonthMoney:''
  },
  select_date: function (e) {

    let {key,deid,czmoney,zsmoney}=e.currentTarget.dataset
     this.setData({
           state: e.currentTarget.dataset.key,
           AgeRuleDeId:deid,
           CZMoney:czmoney.toFixed(2),
           ZSMoney:zsmoney
         });

    },
  // 日赠送
  async daygiveMoney(){
    let query={
      UserOId:this.data.userId,
      Type:0,
    }
    util.setParamSign(query)

    const result=await httpRequestPost('/XCXDS/GetGiveAmount',query)
    if(result.code==200){
      this.setData({
        ZSDayMoney:JSON.parse(result.json)
      })
    }
  },
  // 月赠送
  async monthgiveMoney(){
    let query={
      UserOId:this.data.userId,
      Type:1,
    }
    util.setParamSign(query)

    const result=await httpRequestPost('/XCXDS/GetGiveAmount',query)
    if(result.code==200){
      this.setData({
        ZSMonthMoney:JSON.parse(result.json)
      })
    }
  },


  onClickPayMoney(){
    if(this.data.ischecked!=true){
      util.setReminder('请选择支付方式')
    }else{
      wx.login({
        success: async (res) => {
          let code = res.code
          let query={
            CZMoney:this.data.CZMoney,
            AgeRuleDeId:this.data.AgeRuleDeId,
            ZSMoney:this.data.ZSMoney,
            UserOId:this.data.userId,
            AgeOId:this.data.ageOId,
            Phone:this.data.Phone,
            LoginCode:code
          }
          util.setParamSign(query)

          const result = await httpRequestPost('/XCXDS/WebChatChongZhi', query)
          if (result.code == 200) {

            var d = JSON.parse(result.data);

            //拿到服务端返回数据，调用微信小程支付
            wx.requestPayment({
              timeStamp: d.timeStamp,
              nonceStr: d.nonceStr,
              package: d.package,
              signType: d.signType,
              paySign: d.paySign,
              success: function (res) { //成功
                util.setReminder('充值成功!')
                // wx.switchTab({
                //   url: '/pages/tab/me/me'
                // });
              },
              fail:function (res) {
                util.setReminder('充值失败！')
                // wx.switchTab({
                //   url: '/pages/tab/me/me'
                // });
              }

            })
          }

        }
      })
      

    }
  },

  onClickChange(){
    this.setData({
      ischecked:!this.data.ischecked
    })

  },




  onLoad: function (options) {
    let {
      name,
      monny
    } = JSON.parse(options.data)
    this.setData({
      userName: name,
      monny: monny
    })

    let result = JSON.parse(app.globalData.userInfo)
    this.setData({
      ageOId: result[0].AgeOId,
      userId: result[0].UserOId,
      Phone: result[0].LoginName
    })
    // 获取天赠送
    this.daygiveMoney()
    this.monthgiveMoney()
  },

  async getPayList() {
    let query = {
      AgeOId: this.data.ageOId
    }
    util.setParamSign(query)

    const result = await httpRequestPost('/XCXDS/GetPayItem',query)
    if(result.code==200){
      let list=JSON.parse(result.json)  
      let day=this.data.ZSDayMoney
      let month=this.data.ZSMonthMoney
      list.forEach((v,i)=>{
          if(day>=v.DayGiveAmt || month >=v.MonthGiveAmt){
            v.noMony=true
            v.FeeMoney=0
          }else{
            v.noMony=false
          }
   
      })

      this.setData({
        payList:list,
        CZMoney:list[0].MaxCnt.toFixed(2),
        ZSMoney:list[0].FeeMoney,
        AgeRuleDeId:list[0].AgeRuleDeId
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
    
    this.getPayList()
  }

})