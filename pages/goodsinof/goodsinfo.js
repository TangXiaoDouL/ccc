import {
  httpRequestPost
} from "../../http/httpRequest"
import util from "../../utils/util"
import wxParse from '../../assets/wxParse/wxParse.js'


let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 弹出框
    show: false,
    // 商品信息
    goodsInfo: [],
    img: '',
    commercialList: [],

    // 商品发布id
    ReleaseOId: '',
    // 规格id
    BindSpecsOId: '',
    // 规格名称
    SpecName: '',
    // 商品id
    CmdOId: '',
    // 商品名称
    CmdName: '',
    // 卖方id
    SellerOId: '',
    // 卖方名称
    SellerName: '',
    // 价格
    Price: '',
    // 数量
    Goods_Number: 1,
    // 购物类型
    CartType: '',
    // 规格库存数
    KCNum: '',
    // 机构号
    AgeOId: '',
    // 卖家id
    BuyerId: '',
    // 买家名称
    BuyerName: '',

    // 直接购买OId
    OId: '',
    goodsprice: '',
    goodsSum:'',
    goodsStatus:''
  },

  async onClickVideo() {
    let params = {
      userOId: this.data.SellerOId
    }
    util.setParamSign(params)
    const result = await httpRequestPost('/XCXDS/getCameraUrl', params)
    if (result.resultCode == '00' && result.resultData != null) {
      // util.setReminder('gai')
      let data = result.resultData
      let query={
        url:data,
        userid: this.data.SellerOId
      }
      query=JSON.stringify(query)
      wx.navigateTo({
        url: '/pages/shopsdetail/shopsdetail?query=' + query,
      })
    } else {
      let query={
        url:null,
        userid: this.data.SellerOId
      }
      query=JSON.stringify(query)
      wx.navigateTo({
        url: '/pages/shopsdetail/shopsdetail?query=' + query,
      })
    }
  },

  onClose() {
    this.setData({
      show: false
    })
  },
  async onQueDing() {

    let s = app.globalData.userInfo
    if (s == null || s == '') {
      util.setReminder('你还没有登录，请先登录！')
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      if (this.data.SpecName == '' || this.data.SpecName == null) {
        util.setReminder('请选择商品规格！')
      } else {
        let query1 = {
          SpecName: this.data.SpecName,
          CmdName: this.data.CmdName,
          SellerName: this.data.SellerName,
          Shop_Price: this.data.goodsprice,
          Goods_Number: this.data.Goods_Number,
          CartType: this.data.CartType,
          KCNum: '',
          BuyerName: this.data.BuyerName
        }

        let query2 = {
          ReleaseOId: this.data.ReleaseOId,
          BindSpecsOId: this.data.BindSpecsOId,
          CmdOId: this.data.CmdOId,
          SellerOId: this.data.SellerOId,
          AgeOId: this.data.AgeOId,
          BuyerId: this.data.BuyerId
        }
        util.setParamSign(query2)
        let query3 = {
          ...query1,
          ...query2
        }
        console.log(query3);


        const result = await httpRequestPost('/XCXDS/AddCart', query3)
        console.log('返回的结果', result.json)
        if (result.code == 200) {
          if (this.data.CartType == 2) {
            this.setData({
              OId: result.json
            })
            let query = {
              SpecOIdArr: this.data.BindSpecsOId,
              CartType: this.data.CartType,
            }
            query = JSON.stringify(query)
            console.log('query is is is', query);

            this.setData({
              show: false
            })
            wx.navigateTo({
              url: `/pages/confirmorder/confirmorder?query=${query}`
            });
          }else if(this.data.CartType==1){
            // util.setReminder('添')
            console.log('你点击的是添加购物车');

            this.setData({
              show: false,
              Goods_Number: 1
            })
            wx.showToast({
              title: '添加成功', //提示的内容,
              icon: 'success', //图标,
              duration: 1000, //延迟时间,
              mask: true //显示透明蒙层，防止触摸穿透,
            });

          }

        }
      }

    }

  },
  onClickIcon() {
    wx.switchTab({
      url: '/pages/tab/cart/cart'
    });

  },
  // 获取商品详细信息
  async getgoodsInfoList(id) {
    let query = {
      ReleaseOId: id
    }
    util.setParamSign(query)
    let {
      code,
      json
    } = await httpRequestPost('/XCXDS/GetProductByOId', query)


    if (code === 200) {
      json = JSON.parse(json)
      console.log("详情数据",json);
      let image = json[0].Img
      let name = json[0].CmdName
      wxParse.wxParse("article", "html", json[0].CmdDesc, this, 5)
      this.setData({
        goodsInfo: json,
        img: image,
        CmdName: name,
        goodsprice: json[0].Price,
        ReleaseOId: json[0].ReleaseOId,
        SellerOId: json[0].SellerOId,
        SellerName: json[0].SellerName
      })

      console.log('goodsInfo', this.data.goodsInfo);

    } else {
      util.setReminder('商品信息获取失败')
    }
  },

  onChange(e) {

    // stockstatus=1 判断库存开启   校验sumstock库存量
    if(this.data.goodsStatus==1){
      // 开启
      if(this.data.Goods_Number>=this.data.goodsSum){
        util.setReminder('库存不足!')
        this.setData({
          Goods_Number:1
        })
      }else{
        this.setData({
          Goods_Number: e.detail
        })
      }
    }else{
      // 不校验库存
      this.setData({
        Goods_Number: e.detail
      })
    }
    
    
    

  },
  // 选择规格
  onClickCate(e) {
    console.log(e)
    let {
      name,
      id
    } = e.currentTarget.dataset

    let list = this.data.commercialList
    console.log(list);


    list.forEach((v, i) => {
      if (v.BindSpecsOId == id) {
        this.setData({
          goodsprice: v.Price
        })

      }

    })

    this.setData({
      SpecName: name,
      BindSpecsOId: id
    })

  },

  //获取商品规格
  async getcommercial(id) {

    let query = {
      ReleaseOId: id
    }
    util.setParamSign(query)
    const {
      code,
      json
    } = await httpRequestPost('/XCXDS/GetSpecsByReleaseOId', query)
    if (code === 200) {
      let list = JSON.parse(json)
      console.log(list);
      this.setData({
        commercialList: list,
        SpecName:list[0].SpecName,
        BindSpecsOId:list[0].BindSpecsOId,
        goodsprice:list[0].Price
      })
    }
  },
  // 加入购物车
  onClickBtnCart() {

    this.setData({
      show: true,
      CartType: 1
    })

  },
  // 弹出框
  onClickButton() {
    this.setData({
      show: true,
      CartType: 2
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('商品详情',options)
    let result=JSON.parse(options.query)
    this.setData({
      CmdOId: result.id,
      goodsSum:result.sum,
      goodsStatus:result.status
    })
    

    //获取商品信息
    this.getgoodsInfoList(this.data.CmdOId)
    // 获取规格
    this.getcommercial(this.data.CmdOId)

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
    if (app.globalData.userInfo) {
      let result = JSON.parse(app.globalData.userInfo)
    this.setData({
      AgeOId: result[0].AgeOId,
      BuyerId: result[0].UserOId,
      BuyerName: result[0].UserName
    })
    }
    

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
  onShareAppMessage: function (e) {
    // let image=this.data.img
    console.log(e);

    let _that = this
    console.log(_that.data.img)
    return {
      title: this.data.CmdName, //分享的标题
      path: '/pages/tab/categerte/categerte',
      imageUrl: 'https://img.ego360.cn/' + _that.data.img, //分享页面的图片
    }
  }


})