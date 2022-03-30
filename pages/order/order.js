import {
  httpRequestPost
} from "../../http/httpRequest";
import util from "../../utils/util";
import Dialog from '../../@vant/weapp/dialog/dialog';
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 控制内容显示面板
    active: 0,

    // 订单状态：-1全部，1待付款，3待收货，4已完成
    type: -1,
    userid: '',
    ageoid: '',
    pagenumber: 1,

    // 订单列表
    payOrderList: [],

    dataType: -1,

    // 分页查询
    pagenum:1,
    // 总数
    total:0,
    // 是否还在请求中
    isloading:false,

    isShow:false,

    // 待收货
    Order_Status:'',
    // 空购物车
    iscartNull:false
  },

  // 改变
  onChange(event) {
    let index = event.detail.index
    if (index == 0) {
      this.setData({
        dataType: -1,
        pagenum:1,
        payOrderList:[],
        iscartNull:true
      })
      this.getOrdersList(this.data.userid, this.data.ageoid, this.data.dataType)
    } else if (index == 1) {
      this.setData({
        dataType: 1,
        pagenum:1,
        payOrderList:[],
        iscartNull:true
      })
      this.getOrdersList(this.data.userid, this.data.ageoid, this.data.dataType)
    } else if (index == 2) {
      this.setData({
        dataType: 3,
        pagenum:1,
        payOrderList:[],
        iscartNull:true
      })
      this.getOrdersList(this.data.userid, this.data.ageoid, this.data.dataType)
    } else if (index == 3) {
      this.setData({
        dataType: 4,
        pagenum:1,
        payOrderList:[],
        iscartNull:true
      })
      this.getOrdersList(this.data.userid, this.data.ageoid, this.data.dataType)

    }

  },



  // 取消订单
  offOrder() {
  

  },
  // 待付款
  waitPayOrder() {
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      
  },


  async getOrdersList(userid, ageoid, typeid,cd) {

    this.setData({
      isloading: true
    })

    let query = {
      PageIndex: this.data.pagenum,
      Type: typeid,
      BuyerId: userid,
      AgeOId: ageoid
    }
    util.setParamSign(query)

    const result = await httpRequestPost('/XCXDS/GetBuyerOrderLst', query)
    if (result.code == 200) {
      
      let list = JSON.parse(result.json)
      
      this.setData({
        total:list.recordCound
      })
      let list2=list.json
      
      let paylist = []
      for (let i = 0; i < list2.length; i++) {
        let query = {
          OrderRdOId: list2[i].OrderRdOId
        }
        util.setParamSign(query)
        const result = await httpRequestPost('/XCXDS/getTradeOrderDetailByOrderRdOId', query)
        let ls = JSON.parse(result.json)
        let ls2={
          order:ls
        }
        let p = {
          ...ls2,
          ...list2[i]
        } 
        paylist.push(p)
      }
      this.setData({
        payOrderList: [...this.data.payOrderList,...paylist],
       
      })
      // false标识cart有数据
      if(this.data.payOrderList.length>0){
        this.setData({
          iscartNull:false
        })
      }

      this.setData({
        isloading: false
      })
      cd && cd()
    }

  },
  // 取消订单
   onQuxiao(e){
    let {day,order}=e.currentTarget.dataset
    
    let _that=this
    if(day===0){
      Dialog.confirm({
        message: '你确定要取消该订单吗？'
      }).then(async () => {
        let query={
          OrderNo:order
        }
        util.setParamSign(query)
        const result=await httpRequestPost('/XCXDS/CancelOrderSettle',query)
        if(result.code==200){
          util.setReminder('订单取消成功！')
          this.setData({
            pagenum: 1,
            total: 0,
            dataType: this.data.dataType,
            isloading: false,
            payOrderList: []
          })
          _that.getOrdersList( _that.data.userid, _that.data.ageoid, _that.data.dataType)
        }
      }).catch(() => {
        Dialog.close();
      })
    }else{
      util.setReminder('订单时间超过一天不能取消')
    }
     
    
  },
  async onAwaitPay(e){
      let {day,orderid,paymentid}=e.currentTarget.dataset
      if(day===0){
             // 发起微信支付
      wx.login({
        success: async (res) => {
          let code = res.code
          let _that=this
          let query={
            OrderRdOId:orderid,
            PaymentId:paymentid,
            LoginCode:code
          }
          util.setParamSign(query)
          
          const result = await httpRequestPost('/XCXDS/AgainOrderSettle', query)
          if(result.code===200){
            var d = JSON.parse(result.data);
            //拿到服务端返回数据，调用微信小程支付
            wx.requestPayment({
              timeStamp: d.timeStamp,
              nonceStr: d.nonceStr,
              package: d.package,
              signType: d.signType,
              paySign: d.paySign,
              success: function (res) { //成功
                util.setReminder('支付成功')
                _that.setData({
                  pagenum: 1,
                  total: 0,
                  dataType: _that.data.dataType,
                  isloading: false,
                  payOrderList: []
                })
                _that.getOrdersList( _that.data.userid, _that.data.ageoid, _that.data.dataType)
              },
              fail:function (res) {
                util.setReminder('支付失败！')
                _that.setData({
                  pagenum: 1,
                  total: 0,
                  dataType: _that.data.dataType,
                  isloading: false,
                  payOrderList: []
                })
                _that.getOrdersList( _that.data.userid, _that.data.ageoid, _that.data.dataType)
              }

            })
          }else if(result.code===0){
            util.setReminder('暂不支持拆单支付')
          }
            
          }

        
      })
      }else{
        util.setReminder('下单时间超过一天，不能发起支付')
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

    // let s=app.globalData.userInfo
    // if(s==null || s=='' ){
    //   this.setData({
    //     isloding:true
    //   })

    // }
        if(this.data.payOrderList.length<=0){
      this.setData({
        iscartNull:true
      })
    }
    

    
    let result = JSON.parse(app.globalData.userInfo)
    this.setData({
      userid: result[0].UserOId,
      ageoid: result[0].AgeOId,
      payOrderList:[],
      pagenum:1,
      dataType:-1
    })

    this.getOrdersList( this.data.userid, this.data.ageoid, this.data.dataType)

  },

  onPullDownRefresh: function () {
      // 触发下拉刷新 把数据更新
    this.setData({
      pagenum: 1,
      total: 0,
      dataType: this.data.dataType,
      isloading: false,
      payOrderList: []
    })
    this.getOrdersList(this.data.userid,this.data.ageoid,this.data.dataType,() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
    
    if (this.data.isloading) {
      return
    }

    // 判断页面数据是否加载完毕
    if (this.data.payOrderList.length >= this.data.total) {
      this.setData({
        istoogle: false
      })
      // 加载完毕直接跳出循环
      return
    }
    //页面一触底，pagenum+1
    this.setData({
      pagenum: this.data.pagenum + 1
    })
    this.getOrdersList(this.data.userid,this.data.ageoid,this.data.dataType)

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
    // 点击回到顶部
    top0(e) {
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0,
          duration:400
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    },
    // 监听页面滚动事件
    onPageScroll: function (e) {
      if(e.scrollTop>600){
        this.setData({
          isShow:true
        })
      }else{
        this.setData({
          isShow:false
        })
      }
    }
})