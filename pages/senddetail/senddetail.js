import { httpRequestPost } from "../../http/httpRequest"
import util from "../../utils/util";
let app =  getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      clickNum: 4,
      userId:'',
      sendMoneyInfo:[],
      length:'',
      sendMonny:'',
      isloading:false,
      pagenumber:1,
      count:''
  },
  onclick(e) {
    let {
      num
    } = e.currentTarget.dataset
    this.setData({
      clickNum:num,
      sendMoneyInfo:[]
    })
    this.getTradeList()

  },



  // 获取消费明细
  async  getTradeList(){
    this.setData({
      isloading: true
    })

    let query={
      PageIndex:1,
      Time:this.data.clickNum,
      SettleMethod:-1,
      UserOId:this.data.userId,
    }
    util.setParamSign(query)
    const result=await httpRequestPost('/XCXDS/GetTranFundsByUserOId',query)
    
    if(result.code==200){
      let tradentList=JSON.parse(result.json)
      if(tradentList.json==null || tradentList.json ==''){
        this.setData({
          sendMoneyInfo:[],
        })
      }else{
        let sum=0
        tradentList.json.forEach((v,i)=>{
          if(v.OPTypeName=='转出'){
            sum+=v.TranMoney
          }
        })
        this.setData({
          sendMoneyInfo:[...this.data.sendMoneyInfo,...tradentList.json],
          length:tradentList.json.length,
          count:tradentList.recordCount,
          isloading:true,
          sendMonny:sum.toFixed(2)
        })
      }


    }  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

      let result = JSON.parse(app.globalData.userInfo)
      this.setData({
        userId:result[0].UserOId
      })

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
    this.getTradeList()

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
    if (this.data.sendMoneyInfo.length >= this.data.count) {
      util.setReminder('没有更多数据了')

      return
    }
    // 页面一触底 pagenum+1
    this.setData({
      pagenumber: this.data.pagenumber + 1
    })

    this.getTradeList()

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})