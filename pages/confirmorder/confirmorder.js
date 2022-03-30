import {
  httpRequestPost,
} from "../../http/httpRequest";
import util from "../../utils/util";


let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIc:null,
    isWx:null,
    icMoney:0,
    // 配送状态
    radio: "1",
    currentTab: 0,
    userid: '',
    ageoid: '',
    uname: '',
    payActive:"2",

    // 默认地址
    defaultAddress: {},
    isShowAddress: false,

    CartType: '',
    // 预支付订单
    prepaidOrderList: [],
    // 总价格
    allMonny: '',
    // 小计
    xiaojiMonny: '',
    // 数量
    allNumber: 0,

    pidArr: '',

    //支付字段--
    // 卖方id
    SpecOIdArr: '',
    // 支付方式
    PayId: '',
    // 地址id
    AddressId: '',
    // 备注
    Remark: '',
    // 下单类型
    CartType: '',
    // 订单详细地址
    AddressDetail: '',
    // 收货人
    ReceiveName: '',
    // 收货人手机号
    ReceiveMobile: '',
    // 买方id
    BuyerId: '',
    // 买方名称
    BuyerName: '',
    // 机构号
    AgeOId: '',
    // 小程序code
    LoginCode: '',
    // data
    returndata: '',
    //用户地址经纬
    userLoction: '',
    //运费
    expressFreight: 0,
    //新建订单号
    originId: 0,
    // 请求数据
    query: {},
    //达达订单编号
    deliveryNo: '',
    //商品总重量
    bindwight: 0,
    // 骑手状态
    psStatus: 0,
    // 用户电话
    iphone: 0,
    // 商家地址
    sellerAddr: "",
    // 网点地址
    outletsAddr: "",
    // 按钮type属性
    btnFlag: false,
    // 网点自提地址
    Outlets: [],
    // 弹出层控制
    outletsShow: false,
  },

  // 选择支付
  chosePay(e){
    console.log(e);
    this.setData({
      payActive:e.currentTarget.dataset.type
    })
  },

  // 获取支付方式
async getPayType(){
  let params = {
    AgeOId:this.data.ageoid,
    BuyerId:this.data.userid
  }
  util.setParamSign(params)
  console.log("大萨达",params);
  let res = await httpRequestPost("/AgeDS/GetPayItemLst",params)
  console.log(res);
  if (res.code==200) {
    this.setData({
      isIc:res.IfIC,
      isWx:res.IfWx,
      icMoney:res.Balance
    })
  }
},
  //支付
  onSubmit() {
    if (this.data.payActive=='3') {
      if (this.data.icMoney<(this.data.allMonny + this.data.expressFreight*100)) {
        util.setReminder("余额不足")
        return
      }
    }

    let that = this
    if (!this.data.isShowAddress) {
      util.setReminder('请选择收货地址')
    } else {
      // 发起微信支付
      wx.login({
        success: async (res) => {
          let code = res.code

          let query1 = {
            SpecOIdArr: this.data.SpecOIdArr,
            PayId: parseInt(this.data.payActive),
            AddressId: this.data.AddressId,
            CartType: this.data.CartType,
            ReceiveMobile: this.data.ReceiveMobile,
            BuyerId: this.data.userid,
            AgeOId: this.data.ageoid,
            LoginCode: code,
            DistributionFee: this.data.expressFreight,
            PSOrderId: this.data.originId,
            Lat_Lng: this.data.userLoction,
            PSType: Number(this.data.radio) + 1,
            Self: 1
          }
          util.setParamSign(query1)
          let ztAddr = ""
          if (this.data.radio == 1) {
            ztAddr = this.data.sellerAddr
          } else if (this.data.radio == 2) {
            ztAddr = this.data.outletsAddr
          } else {
            ztAddr = ""
          }
          let query2 = {
            Remark: this.data.Remark,
            AddressDetail: this.data.AddressDetail,
            ReceiveName: this.data.ReceiveName,
            BuyerName: this.data.uname,
            ZTAddr: ztAddr
          }

          let query3 = {
            ...query1,
            ...query2
          }
          console.log('返回的参数',query3)
          // XinShengOrderSettle
          const result = await httpRequestPost('/AgeDS/OrderSettleWithPSFeeSelf', query3)
          console.log(result);
          // return
          if (result.code == 200) {
            console.log("jiesuanchenggong");
            if (result.msg=="结算成功") {
              console.log("huiyuan");
              if (that.data.radio == 0) {
                console.log("dada");
                that.getNewOrder()
              } else {
                // 非达达运送 其他两种跳转
                console.log("feida");
                wx.redirectTo({
                  url: '/pages/order/order'
                });
              }
              return
            }
            var d = JSON.parse(result.data);
            // 拿到服务端返回数据，调用微信小程支付
            let _that = this
            wx.requestPayment({
              timeStamp: d.timeStamp,
              nonceStr: d.nonceStr,
              package: d.package,
              signType: d.signType,
              paySign: d.paySign,
              success: function (res) { //成功
                console.log(this);
                console.log(_that.data.radio);
                util.setReminder('支付成功')
                if (_that.data.radio == 0) {
                  console.log("dada");
                  _that.getNewOrder()
                } else {
                  // 非达达运送 其他两种跳转
                  console.log("feida");
                  wx.redirectTo({
                    url: '/pages/order/order'
                  });

                }

              },
              fail: function (res) {
                util.setReminder('支付失败！')
                wx.redirectTo({
                  url: '/pages/order/order'
                });
              },
              // complete: function (res) {
              //   wx.navigateTo({
              //     url: '/pages/order/order'
              //   });
              // }
            })
          } else {
            util.setReminder(result.msg);
          }

        }
      })
    }
  },

  bindTextAreaBlur(e) {
    console.log(e);
    let {
      value
    } = e.detail
    this.setData({
      Remark: value
    })
  },
  // 跳转到收货地址页面
  goAddressList() {
    console.log(this.data.radio);
    wx.setStorageSync('status', this.data.radio)

    wx.navigateTo({
      url: '/pages/addressInfo/addressInfo'
    });
  },
  getDadaYunFei() {
    let query3 = {
      AddressDetail: this.data.AddressDetail
    }
    console.log(query3);
    httpRequestPost('/XCXDS/getMapGeo', query3).then(res => { //获取经纬度
      console.log(res)
      let appData = JSON.parse(app.globalData.userInfo, this.data)
      this.setData({
        userLoction: JSON.parse(res).geocodes[0].location,
        originId: util.createOriginId(appData[0].AgeOId, appData[0].UserOId)
      })

      let origin_id = this.data.originId
      let city_code = '0755'
      let is_prepay = 0
      let cargo_price = this.data.allMonny
      let receiver_name = this.data.defaultAddress.ReceiveName
      let receiver_address = this.data.defaultAddress.DetailedAddress
      let receiver_phone = this.data.ReceiveMobile
      let receiver_lat = this.data.userLoction.split(',')[1]
      let receiver_lng = this.data.userLoction.split(',')[0]
      let cargo_weight = this.data.bindwight

      // 114.228163,22.68572
      console.log(this.data.userLoction);
      let params = {
        //shop_no: "11047059",
        shop_no: "1507",
        origin_id,
        city_code,
        is_prepay,
        cargo_price,
        receiver_name,
        receiver_address,
        receiver_lat,
        receiver_lng,
        receiver_phone,
        callback: 'http://wap.sinxinit.com/XCXDS/DaDaNotify',
        cargo_weight
      }
      params.receiver_address = util.encodeUnicode(params.receiver_address)
      params.receiver_name = util.encodeUnicode(params.receiver_name)

      console.log(params);

      let data = {
        url: "http://newopen.imdada.cn/api/order/queryDeliverFee",
        data: util.setParamSignDaDa(params)
      }
      this.setData({
        query: data
      })
      console.log("入参data" + JSON.stringify(data));
      httpRequestPost('/DaDa/doDaDaPost', data).then(res => {
        console.log(JSON.parse(res));
        if (JSON.parse(res).code == 2155) {
          util.setReminder(JSON.parse(res).msg)
          this.setData({
            btnFlag: true
          })
        } else {
          this.setData({
            btnFlag: false
          })
        }

        this.setData({
          expressFreight: JSON.parse(res).result.fee,
          deliveryNo: JSON.parse(res).result.deliveryNo
        })
      }).catch(res => {
        console.log(res);
      })

    }).catch(err=>{
      console.log(err);
    })
  },
  // 新增订单
  getNewOrder() {
    let params = {
      deliveryNo: this.data.deliveryNo
    }
    let data = {
      url: "http://newopen.imdada.cn/api/order/addAfterQuery",
      data: util.setParamSignDaDa(params)
    }
    httpRequestPost('/DaDa/doDaDaPost', data).then(res => {
      if (res.code == 2062) {
        let data = this.data.query
        httpRequestPost('/DaDa/doDaDaPost', data).then(res => {}).catch(res => {
          console.log(res);
        }).finally(res => {
          util.setReminder('支付成功', () => {
            wx.showModal({
              title: '提示',
              content: '是否跳转至订单列表？',
              success(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.redirectTo({
                    url: '../order/order'
                  });
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          })
        })
      }
    }).catch(res => {
      console.log(res);
    }).finally(res => {
      util.setReminder('支付成功', () => {
        wx.showModal({
          title: '提示',
          content: '是否跳转至订单列表？',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
              wx.redirectTo({
                url: '../order/order'
              });
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      })
    })
  },
  // 获取默认收货地址
  async getDefaultAddress(uid, aid) {
    let query = {
      BuyerId: uid,
      AgeOId: aid
    }
    util.setParamSign(query)
    const {
      json,
      code
    } = await httpRequestPost('/XCXDS/GetDefaultAddressByBuyerId', query)

    if (code == 200) {
      let list = JSON.parse(json)
      console.log('默认地址', list);
      let list2 = {
        ...list['0']
      }
      console.log(list2);

      this.setData({
        defaultAddress: list2,
        AddressId: list2.AddrOId,
        AddressDetail: list2.ProvinceName + list2.CityName + list2.DistrictName + list2.DetailedAddress,
        ReceiveName: list2.ReceiveName,
        ReceiveMobile: list2.Mobile,
        isShowAddress: true
      })
    } else {
      this.setData({
        isShowAddress: false
      })
    }

    console.log('是否有地址', this.data.isShowAddress)

    // console.log(JSON.parse(json));

  },

  // 获取预支付订单
  async getPrepaidOrder(uid, oid) {
    let query = {
      BuyerId: uid,
      AgeOId: oid,
      SpecOIdArr: this.data.pidArr,
      CartType: this.data.CartType
    }
    console.log('预支付订单', query)
    util.setParamSign(query)

    const result = await httpRequestPost('/XCXDS/GetConfirmOrderByBuyerId', query)
    if (result.code == 200) {
      let list = JSON.parse(result.json)
      console.log('测试预付款订单信息：', list)
      let monny = 0
      let number = 0
      let xiaoji = 0
      let pay = ''
      let bind = 0
      list.forEach((v, i) => {
        if (v.BindWeight == false || v.BindWeight == null || v.BindWeight == undefined) {
          v.BindWeight = 0.5
        }
        monny += (v.Goods_Number * v.Price) * 100
        xiaoji += v.Goods_Number * v.Price
        number += parseInt(v.Goods_Number)
        pay += v.SpecOId + ','
        bind += v.Goods_Number * v.BindWeight
      })
      pay = pay.substr(0, pay.length - 1)
      console.log('pay', pay)
      let sum = monny.toFixed(2)
      this.setData({
        prepaidOrderList: list,
        allMonny: parseInt(sum),
        xiaojiMonny: xiaoji.toFixed(2),
        allNumber: number,
        SpecOIdArr: pay,
        bindwight: bind
      })

      console.log('orderList', this.data.prepaidOrderList)

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // let address = wx.getStorageSync('address');
    //商家地址
    let query = {
      PhoneNo: JSON.parse(app.globalData.userInfo)[0].LoginName,
      AgeOId: JSON.parse(app.globalData.userInfo)[0].AgeOId
    }
    console.log(query);
    util.setParamSign(query)
    httpRequestPost('/XCXDS/GetAgeByAgeTel', query).then(res => {
      this.setData({
        sellerAddr: JSON.parse(res.json)[0].SellerAddr,
        outletsAddr: JSON.parse(res.json)[0].OutletsAddr
      })
      console.log(JSON.parse(res.json)[0].SellerAddr, JSON.parse(res.json)[0].OutletsAddr);
    }).catch(err=>{
      console.log(err);
    })
    // 网点自提
    this.GetOutletsByAgeOId()
    // 获取立即购买的商品参数
    let result1 = JSON.parse(options.query)
    console.log('商品详情跳转', result1)
    this.setData({
      CartType: result1.CartType,
      pidArr: result1.SpecOIdArr
    })
    console.log('goods goods ', this.data.CartType, this.data.pidArr)

    console.log('获取的数据', this.data.CartType, this.data.pidArr)
    let result2 = JSON.parse(app.globalData.userInfo)
    // 用户id
    let userid = result2[0].UserOId
    let ageoid = result2[0].AgeOId
    let uname = result2[0].UserName
    this.setData({
      userid,
      ageoid,
      uname
    })

    // 获取订单
    this.getPrepaidOrder(this.data.userid, this.data.ageoid)
  },
  // /XCXDS/GetOutletsByAgeOId(string AgeOId, string sign)
  async GetOutletsByAgeOId() {
    let query = {
      AgeOId: JSON.parse(app.globalData.userInfo)[0].AgeOId
    }
    util.setParamSign(query)
    const res = await httpRequestPost('/XCXDS/GetOutletsByAgeOId', query)
    console.log("获取订单",res);
    if (res.json) {
      let arr = res.json == '' ? '' : JSON.parse(res.json)
    let newarr = []
    arr.forEach((el) => {
      newarr.push(el.OutletsAddr)
    })
    this.setData({
      Outlets: newarr

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
    let status = wx.getStorageSync('status')
    this.setData({
      radio: "1"
    })
    console.log(status);
    let address = wx.getStorageSync('address');

    console.log('默认默认默认默认', address)
    console.log(this.data.radio);
    if (address) {
      this.setData({
        defaultAddress: address,
        AddressId: address.AddrOId,
        AddressDetail: address.ProvinceName + address.CityName + address.DistrictName + address.DetailedAddress,
        ReceiveName: address.ReceiveName,
        ReceiveMobile: address.Mobile,
        isShowAddress: true
      })
    } else {
      // 获取默认地址
      this.getDefaultAddress(this.data.userid, this.data.ageoid)
    }

    if (this.data.radio == "0") {
      this.getDadaYunFei()
    }
    this.getPayType()
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

  },
  swiperTab: function (e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });
  },
  onClick(event) {
    const {
      name
    } = event.currentTarget.dataset;
    console.log(name);
    this.setData({
      radio: name,
    });
    if (name == 1 || name == 2) {
      this.setData({
        expressFreight: 0,
        btnFlag: false
      })
    } else {
      this.getDadaYunFei()
    }
  },
  // 打开弹出层
  showPopup() {
    this.setData({
      outletsShow: true
    });
  },
  // 关闭弹出层
  onCloseShow() {
    this.setData({
      outletsShow: false
    });
  },
  // 选择器选择
  onPickerChange(event) {
    const {
      picker,
      value,
      index
    } = event.detail;
    console.log(value);
  },
  // 选择器点击确定
  onPickerConfirm(e) {
    this.setData({
      outletsShow: false,
      outletsAddr: e.detail.value
    })
  },
  // 选择器点击取消
  onPickerCancel() {
    outletsShow: false,
    this.setData({
      outletsShow: false,
    })
  }
})