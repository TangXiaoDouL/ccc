// pages/categerte/categerte.js
import util from '../../../utils/util.js'
import {
  httpRequestPost
} from '../../../http/httpRequest.js'

var app = getApp()
Page({

  /** 
   * 页面的初始数据
   */
  data: {
    seachValue:'',
    //二级
    secentGoodList: [],
    height: 0,
    // 弹出 
    showDilog: false,
    columns: [],
    //市场编号和名字
    Marketnumber: '',
    MarketText: '',
    MarketOid: '',
    // 左侧
    goodsCateList: [],
    active: 0,
    iphone: '',
    //ageOId机构id
    ageOId: 1010,
    // 用户id
    userid: '',
    // 商品
    goodsInfoList: [],
    // 通告信息
    getTitleInfoList: [],
    // 分页
    pagenum: 1,
    // 总数
    total: 0,
    // 是否在请求中
    isloading: false,
    ClsTypeOId: -1,
    // 公告栏
    titleInfo: '',
    isloding: false,
    show: false,
    //弹出购物车
    cartImage: '',
    cartName: '',
    // 规格
    specList: [],
    showStatus: false,
    sumstock: '',
    Goods_Number: 1,
    specname: '',
    SellerName: '',
    // 商品价格
    goodsprice: '',
    CartType: '',
    BuyerName: '',
    BuyerId: '',
    ReleaseOId: '',
    BindSpecsOId: '',
    cmdOid: '',
    sellerOId: '',
    Img: '',
    stockstatus: '',
    nologin: true,
    StrSearch:'',
    BoothName: "蔬菜"
  },

  onClick() {
    this.setData({
      showDilog: true
    })
  },


  // 机构下拉选择
  async getCateList(iphone) {

    let query = {
      PhoneNo: iphone
    }
    util.setParamSign(query)
    let data = await httpRequestPost('/XCXDS/GetAgeByTel', query)
    if (data.code === 200) {
      // 对json进行解析
      data = JSON.parse(data.json)
      const list = [];
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
  // 取消
  quxiao() {
    this.setData({
      showDilog: false
    })
  },


  // 商品左侧数据
  async getLeftGoodsCate(id) {
    let query = {
      AgeOId: id
    }

    util.setParamSign(query)
    const {
      code,
      json
    } = await httpRequestPost('/XCXDS/GetDSIndustry', query)

    if (code == 200) {

      let list = JSON.parse(json)
      console.log('list',list)

      let params = {
        text: "全部",
        value: -1
      }
      list.unshift(params)

      this.setData({
        goodsCateList: list
      })

      // this.getRightGoodsInfo(this.data.ageOId, this.data.ClsTypeOId)



    }

  },
  // 每次点击不同的商户
  onChangeClick(e) {
    console.log(e.detail)
    const screenHeight = util.getWindowHeight()
    this.setData({
      height: screenHeight
    })
    let list = this.data.goodsCateList

    list.forEach((v, i) => {
      if (i === e.detail) {
        this.setData({
          ClsTypeOId: v.value,
          pagenum: 1,
          goodsInfoList: []
        })
        this.getRightGoodsInfo(this.data.ageOId, this.data.ClsTypeOId)
      }
    })


  },

  // },
  // 右侧商品数据
  async getRightGoodsInfo(id, typeid,isScroll) {

    this.setData({
      isloading: true
    })

    let query = {
      PageIndex: this.data.pagenum,
      AgeOId: id, 
      IndustryOId: typeid
    }
    util.setParamSign(query)
    let query2={
      StrSearch: this.data.StrSearch
    }
    let query3={...query,...query2}
    const result = await httpRequestPost('/XCXDS/GetDSSellerLst', query3)
    if (result.code == 200) {
      let list = JSON.parse(result.json)
      console.log(list)
      if (isScroll) {
         this.setData({
          goodsInfoList: [...this.data.goodsInfoList, ...list],
          allData: [...this.data.goodsInfoList, ...list],
          total: list.recordCount
        })
      } else {
        this.setData({
          goodsInfoList: [...list],
          allData:[...list],
          total: list.recordCount,
        })
      }
     
      console.log(this.data.goodsInfoList)
      this.setData({
        isloading: false
      })
    }

  },

  onSeachShops(e){
    console.log(e)
    let val=e.detail.trim()
    console.log(val)

    this.setData({
      StrSearch:val,
      goodsInfoList:[]
    })
    this.getRightGoodsInfo(this.data.ageOId, this.data.ClsTypeOId)
  },
  onInputSeach(e){
    let val = e.detail.trim()
    let rex = new RegExp(val)
    let newData = []
    console.log(val)
    console.log();
    this.data.allData.forEach(el=>{
      if (rex.test(el.UserName)||rex.test(el.BoothName)) {
        newData.push(el)
      }
    })
    this.setData({
      StrSearch: val,
      goodsInfoList:newData
    })
    if(val=='' || val==null){
      this.getRightGoodsInfo(this.data.ageOId, this.data.ClsTypeOId)
    }
    
    
  },

  onSeachClear(){
    this.setData({
      StrSearch:'',
      goodsInfoList: []
    })
    this.getRightGoodsInfo(this.data.ageOId, this.data.ClsTypeOId)
  },

  // 跳转商品详情
  async goGoodsInfo(e) {
    var user = app.globalData.userInfo
    let { id, num } = e.currentTarget.dataset
    if(user==null || user=='' || user=='undefined' ){
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return 
    }
    if(num<=0){
      util.setReminder('该商户暂无可售商品')
      return
    }else{
      var res = await this.onClickVideo(id)

      let query = {
        url: res,
        userid: id
      }
      console.log('跳转', query)
      query = JSON.stringify(query)
      console.log(query)
      wx.navigateTo({
        url: '/pages/shopsdetail/shopsdetail?query=' + query
      });
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

  // 获取通告
  async getTitleInfo(id) {

    let query = {
      AgeOId: id
    }
    util.setParamSign(query)
    const result = await httpRequestPost('/XCXDS/GetGGByAgeOId', query)
    if (result.code == 200&&result.json) {
      let list = JSON.parse(result.json)
      let list2 = []
      list.forEach((v, i) => {
        var str = v.Content
        var str2 = str.replace('<p>', '')
        var str3 = str2.replace('</p>', '')
        let q = {
          Content: str3
        }
        list2.push(q)
        // v.Content
      })
      this.setData({
        getTitleInfoList: list2
      })
    }
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
      cmdOid: cmdoid,
      sellerOId: selleroid,
      Img: img,
      sumstock: sumstok,
      stockstatus: stockstatus
    })
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
            AgeOId: this.data.ageOId,
            BuyerId: this.data.BuyerId
          }
          util.setParamSign(query2)
          let query3 = {
            ...query1,
            ...query2
          }
          const result = await httpRequestPost('/XCXDS/AddCart', query3)
          if (result.code == 200) {

            if (this.data.CartType == 2) {
              let query = {
                SpecOIdArr: this.data.BindSpecsOId,
                CartType: this.data.CartType,
              }
              query = JSON.stringify(query)
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
          AgeOId: this.data.ageOId,
          BuyerId: this.data.BuyerId
        }
        util.setParamSign(query2)
        let query3 = {
          ...query1,
          ...query2
        }
        const result = await httpRequestPost('/XCXDS/AddCart', query3)
        if (result.code == 200) {

          if (this.data.CartType == 2) {
            let query = {
              SpecOIdArr: this.data.BindSpecsOId,
              CartType: this.data.CartType,
            }
            query = JSON.stringify(query)

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
  // 立即购买
  onClickButton() {
    let s = app.globalData.userInfo
    this.setData({
      CartType: 2
    })
    if (s == null || s == '') {
      util.setReminder('你还没有登录，请先登录！')
      this.setData({
        show: false,
        SpecName: '',
        BindSpecsOId: ''
      })
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {

      if (this.data.showStatus) {
        // 有库存量
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
      } else {
        this.setData({
          Goods_Number: e.detail
        })

        let query = {
          SpecOIdArr: this.data.BindSpecsOId,
          CartType: this.data.CartType,
        }
        query = JSON.stringify(query)
        this.setData({
          show: false
        })
        wx.navigateTo({
          url: `/pages/confirmorder/confirmorder?query=${query}`
        });

      }




    }



  },
  onClickSpecname(e) {
    let {
      name,
      id
    } = e.currentTarget.dataset

    let list = this.data.specList
    list.forEach((v, i) => {
      if (v.BindSpecsOId == id) {
        this.setData({
          goodsprice: v.Price
        })
      }

    })

    this.setData({
      specname: name,
      BindSpecsOId: id
    })

  },
  onChange(e) {
    // showStatus=0  不开启库存可以一直加入购物车  =1开启，必须检验库存
    if (this.data.showStatus) {
      // 有库存量
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
    } else {
      this.setData({
        Goods_Number: e.detail
      })
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const screenHeight = util.getWindowHeight()
    this.setData({
      height: screenHeight
    })
  },

  tosuyuan(e){
    console.log(e);
    let id =  e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../../suyuan/suyuan?id='+id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let rs=wxwepy.getStorageSync({ key: 'key' });



  },
  //  滚动到底部触发
  onScrollTolower(e) {
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
    this.getRightGoodsInfo(this.data.ageOId, this.data.ClsTypeOId,true)

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let s = app.globalData.userInfo;
    if (s == null || s == '') {
      let ageOId = 0
      let typeid = -1
      let ageInfoId = app.globalData.ageInfo.ageId
      if (ageInfoId) {
        ageOId = ageInfoId
        this.setData({
          isloding: true,
          ageOId: ageInfoId,
          nologin: true
        })
      } else {
        ageOId = 1010
      this.setData({
        isloding: true,
        ageOId: ageOId,
        nologin: true
      })
      }
      // 1181
      
      // 左侧
      this.getLeftGoodsCate(ageOId)

      // 获取商品信息
      this.getRightGoodsInfo(ageOId, typeid)
      // 获取提示信息
      this.getTitleInfo(ageOId)
    } else {

      let result = JSON.parse(app.globalData.userInfo)
      // 手机号
      let iphone = result[0].LoginName
      let ageOId = result[0].AgeOId
      let agencyName = result[0].AgencyName
      let typeid = this.data.ClsTypeOId
      this.setData({
        ageOId,
        iphone,
        MarketText: agencyName,
        pagenum: 1,
        goodsInfoList: [],
        isloding: false,
        BuyerId: result[0].UserOId,
        BuyerName: result[0].UserName,
        nologin: false
      })

      // 获取机构
      this.getCateList(iphone)
      // 获取商品分类
      this.getLeftGoodsCate(ageOId)
      this.getRightGoodsInfo(ageOId, typeid)
      // 获取提示信息
      this.getTitleInfo(ageOId)
    }

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      ClsTypeOId: -1,
      goodsCateList: [],
      goodsInfoList: [],
      pagenum: 1
    })
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
  onReachBottom: function (e) {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let _that = this
    return {
      title: this.data.cartName, //分享的标题
      path: '/pages/tab/categerte/categerte',
      imageUrl: 'https://img.ego360.cn/' + _that.data.Img, //分享页面的图片
    }
  },
  // 去购物车
  onClickIcon() {
    this.setData({
      show: false
    })
    wx.switchTab({
      url: '/pages/tab/cart/cart'
    });


  },
})