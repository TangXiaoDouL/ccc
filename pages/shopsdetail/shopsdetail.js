import util from '../../utils/util.js'
var app=getApp();

import {
  httpRequestPost
} from '../../http/httpRequest'

Page({
  data: {
    height: 0,
    showVideo:false,
    // 左侧
    goodsCateList: [],
    // 右侧
    goodsInfoList: [],
    AgeOId: '',
    SellerOId: '',
    // 是否在请求中
    isloading: false,
    pagenum: -1,
    ClsTypeOId:-1,
    total:'',
    cartName:'',
    url:'',
    OrderBy:0,
    // 价格排序
    pricePositive:true,
    //销量排序
    salesPositive:true,
    fullState:true,
    cmdOid:'',
    stockstatus: ''
  },
  // 点击价格
  onClickPriceItem(e){
    let flag=this.data.pricePositive
    if(flag){
      this.setData({
        OrderBy:1,
        pricePositive:false
      })
    }else{
      this.setData({
        OrderBy:2,
        pricePositive:true
      })
    }
    this.setData({
      goodsInfoList:[]
    })
    this.getRightGoodsInfo(this.data.AgeOId, this.data.ClsTypeOId)
  },
  // 点击销量
  onClickSalesItem(){
    let flag = this.data.salesPositive
    if (flag) {
      this.setData({
        OrderBy: 4,
        salesPositive: false
      })
    } else {
      this.setData({
        OrderBy: 3,
        salesPositive: true
      })
    }
    this.setData({
      goodsInfoList: []
    })
    this.getRightGoodsInfo(this.data.AgeOId,this.data.ClsTypeOId)

  },
  // 默认排序
  onClickSortItem(e){
    let {id}=e.currentTarget.dataset
    this.setData({
      OrderBy:id
    })
    this.setData({
      goodsInfoList: []
    })
    this.getRightGoodsInfo(this.data.AgeOId, this.data.ClsTypeOId)
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    let _that = this
    console.log(_that.data.img)
    return {
      title: this.data.cartName, //分享的标题
      path: '/pages/tab/categerte/categerte',
      imageUrl: 'https://img.ego360.cn/' + _that.data.Img, //分享页面的图片
    }
  },

  // 关闭
  onClose() {
    this.setData({
      show: false,
      specname: '',
      BindSpecsOId: ''
    })
  },

  // 商品左侧数据
  async getECCommodityTypeBySelf() {
    let query = {
      AgeOId: this.data.AgeOId,
      SellerOId: this.data.SellerOId
    }
    util.setParamSign(query)

    const res = await httpRequestPost('/XCXDS/getECCommodityTypeBySelf', query)
    if (res.code == 200) {
      let list = JSON.parse(res.json)
      // console.log(list)
      let params = {
        ClsTypeName: "全部",
        ClsTypeOId: -1
      }
      list.unshift(params)
      this.setData({
        goodsCateList: list
      })

      this.getRightGoodsInfo(this.data.AgeOId, this.data.ClsTypeOId)

    }
  },

  // 点击项
  async getRightGoodsInfo(id, typeid,isScroll) {

    this.setData({
      isloading: true
    })

    let query = {
      PageIndex: this.data.pagenum,
      OrderBy: this.data.OrderBy,
      ClsTypeOId: typeid,
      SellerId:this.data.SellerOId,
      AgeOId: id
    }
    util.setParamSign(query)
    console.log(query);
    const result = await httpRequestPost('/XCXDS/GetSellerLst', query)
    console.log(result)

    if (result.code == 200) {
      let list = JSON.parse(result.json)
      console.log('list',list)
      if(list.json!=''){
        list.json.forEach((v, i) => {
          if (v.StockStatus == 1 && v.SumStock <= 0) {
            v.flag = true
          } else {
            v.flag = false
          }
        })
        if (isScroll) {
          this.setData({
            goodsInfoList: [...this.data.goodsInfoList, ...list.json],
            total: list.recordCount
          })
        } else {
          this.setData({
            goodsInfoList: [...list.json],
            total: list.recordCount
          })
        }
        
        console.log('商品数据',this.data.goodsInfoList)
        this.setData({
          isloading: false
        })
      }

    }

  },

  goGoodsInfo(e) {
    let { id, sum, status } = e.currentTarget.dataset
    let query = {
      id: id,
      sum: sum,
      status: status
    }
    console.log(query);

    query = JSON.stringify(query)
    wx.navigateTo({
      url: '/pages/goodsinof/goodsinfo?query=' + query
    });
  },

  onChange(e) {
    // showStatus=0  不开启库存可以一直加入购物车  =1开启，必须检验库存
    if (this.data.showStatus) {
      console.log('aaaaaaaaaaa')
      // 有库存量
      console.log('总数', this.data.sumstock)
      if (this.data.Goods_Number >= this.data.sumstock) {
        util.setReminder('超出库存！')
        this.setData({
          Goods_Number: 1
        })
        return false
      } else {
        this.setData({
          Goods_Number: e.detail
        })
      }
      console.log(this.data.Goods_Number)
    } else {
      console.log('bbbbbbbbbb')
      this.setData({
        Goods_Number: e.detail
      })
    }
  },

  // 加入购物车
  async onClickBtnCart(e) {
    let { type } = e.currentTarget.dataset
    let s = app.globalData.userInfo
    this.setData({
      CartType: type
    })

    if (s == null || s == '') {
      util.setReminder('你还没有登录，请先登录！')
      this.setData({
        show: false,
        specname: '',
        BindSpecsOId: ''
      })
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      // 判断库存
      if (this.data.showStatus) {
        if (this.data.Goods_Number > this.data.sumstock) {
          util.setReminder('库存不足')
        } else {
          let query1 = {
            SpecName: this.data.specname,
            CmdName: this.data.cartName,
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
            CmdOId: this.data.cmdOid,
            SellerOId: this.data.sellerOId,
            AgeOId: this.data.AgeOId,
            BuyerId: this.data.BuyerId
          }
          util.setParamSign(query2)
          let query3 = {
            ...query1,
            ...query2
          }
          console.log('加入购物车的数据1:', query3);
          const result = await httpRequestPost('/XCXDS/AddCart', query3)
          console.log('返回的结果', result.json)
          if (result.code == 200) {

            if (this.data.CartType == 2) {
              let query = {
                SpecOIdArr: this.data.BindSpecsOId,
                CartType: this.data.CartType,
              }
              query = JSON.stringify(query)
              console.log('query is is is', query);

              this.setData({
                show: false,
                specname: '',
                BindSpecsOId: ''
              })
              wx.navigateTo({
                url: `/pages/confirmorder/confirmorder?query=${query}`
              });

            } else if (this.data.CartType == 1) {
              this.setData({
                show: false,
                specname: '',
                BindSpecsOId: ''
              })
              util.setReminder('添加成功')
            }

          }
        }

      } else {
        let query1 = {
          SpecName: this.data.specname,
          CmdName: this.data.cartName,
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
          CmdOId: this.data.cmdOid,
          SellerOId: this.data.sellerOId,
          AgeOId: this.data.AgeOId,
          BuyerId: this.data.BuyerId
        }
        util.setParamSign(query2)
        let query3 = {
          ...query1,
          ...query2
        }
        console.log('加入购物车的数据2:', query3);
        const result = await httpRequestPost('/XCXDS/AddCart', query3)
        console.log('返回的结果', result.json)
        if (result.code == 200) {

          if (this.data.CartType == 2) {
            let query = {
              SpecOIdArr: this.data.BindSpecsOId,
              CartType: this.data.CartType,
            }
            query = JSON.stringify(query)
            console.log('query is is is', query);

            this.setData({
              show: false,
              specname: '',
              BindSpecsOId: ''
            })
            wx.navigateTo({
              url: `/pages/confirmorder/confirmorder?query=${query}`
            });

          } else if (this.data.CartType == 1) {
            util.setReminder('添加成功')
            this.setData({
              show: false,
              specname: '',
              BindSpecsOId: ''
            })
          }

        }
      }
    }

  },

  onClickIcon(){
    wx.switchTab({
      url: '../tab/cart/cart',
    })
  },

  onClickSpecname(e){
    console.log(e);
    let data = e.currentTarget.dataset.item
    this.setData({
      specname: data.SpecName,
      BindSpecsOId: data.BindSpecsOId,
      goodsprice: data.Price,
      BindSpecsOId:e.currentTarget.dataset.id
    })
  },

  // 点击购物车
  async onClickCart(e) {

    let {
      img,
      name,
      price,
      id,
      stockstatus,
      sellername,
      cmdoid,
      selleroid,
      sumstok
    } = e.currentTarget.dataset

    this.setData({
      Goods_Number: 1,
      SellerName: sellername,
      ReleaseOId: id,
      cmdoid: cmdoid,
      sellerOId: selleroid,
      Img: img,
      sumstock: sumstok,
      stockstatus: stockstatus
    })
    console.log('stockstatus', this.data.cmdoid)
    // stockstatus=1 判断库存开启   校验sumstock库存量
    if (stockstatus == 0) {
      this.setData({
        showStatus: false
      })
    } else {
      this.setData({
        showStatus: true
      })
    }


    let query = {
      ReleaseOId: id
    }
    util.setParamSign(query)

    const result = await httpRequestPost('/XCXDS/GetSpecsByReleaseOId', query)
    if (result.code == 200) {
      let list = JSON.parse(result.json)
      console.log('商品规格信息', list)
      this.setData({
        specList: list,
        specname: list[0].SpecName,
        BindSpecsOId: list[0].BindSpecsOId,
        goodsprice: list[0].Price,
      })

    }

    this.setData({
      cartImage: img,
      cartName: name,
      goodsprice: price,
      show: true
    })

  },


  //  滚动到底部触发
  onScrollTolower(e) {
    console.log('滚动到底部了', e)
    if (this.data.isloading) {
      return
    }
    //判断页面数据是否加载完毕
    if (this.data.goodsInfoList.length >= this.data.total) {
      return
    }
    // 页面一触底 pagenum+1
    this.setData({
      pagenum: this.data.pagenum + 1
    })
    this.getRightGoodsInfo(this.data.AgeOId, this.data.ClsTypeOId,true)
  },

  // 每次点击不同的商户
  onChangeClick(e) {
    console.log('aaa')
    const screenHeight = util.getWindowHeight()
    this.setData({
      height: screenHeight
    })
    let list = this.data.goodsCateList
    console.log('list',list)

    list.forEach((v, i) => {
      if (i === e.detail) {
        this.setData({
          ClsTypeOId: v.ClsTypeOId,
          pagenum: 1,
          goodsInfoList: []
        })
        console.log('aaa',this.data.ClsTypeOId)

        this.getRightGoodsInfo(this.data.AgeOId, this.data.ClsTypeOId)
      }
    })


  },

  onShow() {

    let result = JSON.parse(app.globalData.userInfo)
    this.setData({
      AgeOId: result[0].AgeOId,
      BuyerId: result[0].UserOId,
      BuyerName: result[0].UserName
    })

    this.getECCommodityTypeBySelf()

  },
  onLoad(options){
    let query=JSON.parse(options.query)
    if (query.url == null || query.url == '' || query.url == 'undefined') {
      this.setData({
        showVideo: false,
        SellerOId: query.userid
      })
    } else {
      this.setData({
        url: query.url,
        showVideo: true,
        SellerOId: query.userid
      })
    }
  },
  onReady(res) {
    this.ctx = wx.createLivePlayerContext('player')
    const screenHeight = util.getWindowHeight()
    this.setData({
      height: screenHeight
    })
  },
  clickFull(){
    this.ctx = wx.createLivePlayerContext('player')
    let flag=this.data.fullState
    if(flag){
      this.ctx.requestFullScreen({
        success: res => {
          console.log('play success')
        },
        direction: 90,
      })
      this.setData({
        fullState:false
      })
    }else{
      this.ctx.exitFullScreen({
        success: res => {
          console.log('play success')
        },
        
      })
      this.setData({
        fullState:true
      })
    }

  },
  statechange(e) {
    console.log('live-player code:', e.detail.code)
  },
  error(e) {
    console.error('live-player error:', e.detail.errMsg)
  },
  bindPlay() {
    this.ctx.play({
      success: res => {
        console.log('play success')
      },
      fail: res => {
        console.log('play fail')
      }
    })
  },

  bindPause() {
    this.ctx.pause({
      success: res => {
        console.log('pause success')
      },
      fail: res => {
        console.log('pause fail')
      }
    })
  },
  bindStop() {
    this.ctx.stop({
      success: res => {
        console.log('stop success')
      },
      fail: res => {
        console.log('stop fail')
      }
    })
  },
  bindResume() {
    this.ctx.resume({
      success: res => {
        console.log('resume success')
      },
      fail: res => {
        console.log('resume fail')
      }
    })
  },
  bindMute() {
    this.ctx.mute({
      success: res => {
        console.log('mute success')
      },
      fail: res => {
        console.log('mute fail')
      }
    })
  }
})