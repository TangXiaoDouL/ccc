let app = getApp();

import util from '../../../utils/util'
import {
  httpRequestPost
} from '../../../http/httpRequest.js'

var QQMapWX = require('../../../assets/qqmap-wx-jssdk1.2/qqmap-wx-jssdk.js');

var qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isload: 0,
    firstShow: false,
    totalinfo: [],
    // 其他小程序跳转过来的
    forOther: false,
    // 公告栏  
    getTitleInfoList: [],
    // 轮播图 
    swiperInfo: [],
    // 弹出
    showDilog: false,
    cateList: [{
        img: '/assets/image/good1.jpg',
        title: '蔬菜净洗'
      },
      {
        img: '/assets/image/good2.jpg',
        title: '肉禽蛋类'
      },
      {
        img: '/assets/image/good3.jpg',
        title: '水产海鲜'
      },
      {
        img: '/assets/image/good4.jpg',
        title: '新鲜水果'
      },
      // {
      //   img: '/assets/image/good5.jpg',
      //   title: '冻品'
      // },
      // {
      //   img: '/assets/image/good6.jpg',
      //   title: '速食熟食'
      // },
      // {
      //   img: '/assets/image/good7.jpg',
      //   title: '粮油副食'
      // },
      {
        img: '/assets/image/good8.jpg',
        title: '其他'
      },
    ],
    count: '',
    number: '',
    iphone: '',
    //下拉列表
    columns: [],
    nologin: false
  },
  // 客户访问接口
  async uservisit() {
    let query = {
      IfLogin: 0
    }

    util.setParamSign(query)
    let params = {
      AppType: 10,
      UserOId: 0,
      OperatorId: 0,
      Tel: "",
      UserName: "",
      AgeOId: 0,
      StrLoginRemark: "",
      ...query
    }
    let data = await httpRequestPost('/MarketService/DoAppLog', params)
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
      console.log("已注册的机构", JSON.parse(data.json));
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


  // 获取通告
  async getTitleInfo(id) {

    let query = {
      AgeOId: id
    }

    util.setParamSign(query)
    const result = await httpRequestPost('/XCXDS/GetGGByAgeOId', query)
    console.log(result);
    if (result.code == 200 && result.json) {
      try {
        let list = result.json == '' ? '' : JSON.parse(result.json)
        let list2 = []
        list.forEach((v, i) => {
          var str = v.Content
          var str2 = str.replace('<p>', '')
          var str3 = str2.replace('</p>', '')
          var str4 = str3.replace('&nbsp', '')
          var str5 = str4.replace('<br />', '')
          let q = {
            Content: str5
          }
          list2.push(q)
        })
        this.setData({
          getTitleInfoList: list2
        })
        console.log(this.data.getTitleInfoList);
      } catch {
        console.log(result);
      }

    }
  },
  // 获取轮播图
  async getBannerList() {

    let query = {
      AgeOId: this.data.ageOId
    }
    console.log("轮播市场id", this.data.ageOId);
    util.setParamSign(query)

    const result = await httpRequestPost('/XCXDS/GetDSEcImg', query)
    if (result.code == 200) {
      let list = JSON.parse(result.json)
      if (list[0].EcAdImgUrl == null || list[0].EcAdImgUrl == '') {
        let banner = [{
            img: "https://img.ego360.cn/app_img/1000/BANKIMG/2020/3/24/132295145175637275.jpg"
          },
          {
            img: "https://img.ego360.cn/app_img/1000/BANKIMG/2020/3/24/132295145367508249.jpg"
          }
        ]
        this.setData({
          swiperInfo: banner
        })

      } else {
        let banner = list[0].EcAdImgUrl
        let arr = banner.split(',')
        let imgList = []
        for (let i = 0; i < arr.length; i++) {
          let data = {
            img: 'https://img.ego360.cn/' + arr[i]
          }
          imgList.push(data)
        }
        this.setData({
          swiperInfo: imgList
        })
      }
    }
  },
  onClick() {
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: "提示",
        content: "尚未登录，现在去登录",
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../../login/login',
            })
          }
        }
      })
      return
    }

    this.setData({
      showDilog: true
    })

  },
  // 取消
  quxiao() {
    this.setData({
      showDilog: false
    })
  },
  // 搜索
  onClickSeach() {
    let s = app.globalData.userInfo
    if (s == null || s == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      wx.navigateTo({
        url: '/pages/seach/seach'
      });
    }
  },
  // 获取位置
  goRegister() {
    //获取定位
    let _that = this
    wx.getSetting({
      success: (result) => {
        const scopeAddress = result.authSetting['scope.userLocation']
        if (scopeAddress === true || scopeAddress === undefined) {
          console.log("获取设置", result);
          wx.getLocation({
            success: function (result1) {
              let {
                latitude,
                longitude
              } = result1

              qqmapsdk.reverseGeocoder({
                location: {
                  latitude: latitude,
                  longitude: longitude
                },
                success: (res1) => {
                  console.log(res1);
                  let {
                    city
                  } = res1.result.address_component
                  wx.setStorageSync('city', city);
                },
                fail: (result) => {
                  wx.showToast({
                    title: '请先授权位置',
                    icon: 'none',
                    duration: 1000,
                    mask: false,
                    success: (result) => {}
                  });
                }
              })
            }
          })
        } else {
          // 用户拒绝过授权权限
          console.log("打开设置111");
          wx.openSetting({
            success: (result2) => {
              console.log("打开设置", result2);
              wx.getLocation({
                success: function (result3) {
                  var {
                    latitude,
                    longitude
                  } = result3
                  qqmapsdk.reverseGeocoder({
                    location: {
                      latitude: latitude,
                      longitude: longitude
                    },
                    success: (res2) => {
                      let {
                        city
                      } = res2.result.address_component
                      wx.setStorageSync('city', city);
                    },
                    fail: (res) => {
                      wx.showToast({
                        title: '请先授权位置',
                        icon: 'none',
                        duration: 1000,
                        mask: false,
                        success: (result) => {}
                      });

                    }
                  })
                }
              })
            },
            fail(err) {
              console.log("打开设置失败", err);
            }
          })
        }
      },
      fail(err) {
        console.log("获取设置失败", err);
      }
    })


  },

  // 热销
  async GetECProductLst() {
    let query = {
      PageIndex: 1,
      Type: 1,
      AgeOId: this.data.ageOId
    }
    console.log("热销市场id", this.data.ageOId);
    util.setParamSign(query)
    const result = await httpRequestPost('/XCXDS/GetECProductLst', query)
    console.log(result);
    if (result.code == 200) {
      let list = JSON.parse(result.json)
      console.log("热销列表", JSON.parse(result.json));
      this.setData({
        hotGoodsList: list.json,
        number: list.pageCount,
        count: list.recordCount
      })
    }
  },
  // 分类
  onClickCate() {
    wx.switchTab({
      url: '/pages/tab/categerte/categerte'
    });

  },
  onClickCate2(e) {
    console.log("分类id", e);
    let {
      id
    } = e.currentTarget.dataset
    id = id + 1
    wx.navigateTo({
      url: '/pages/seach/seach?id=' + id
    })
  },
  //热销产品
  onClickHot(e) {
    let {
      id,
      sum,
      status
    } = e.currentTarget.dataset
    let query = {
      id: id,
      sum: sum,
      status: status
    }

    query = JSON.stringify(query)
    wx.navigateTo({
      url: '/pages/goodsinof/goodsinfo?query=' + query
    });


  },

  selectChange(event) {

    const {
      value
    } = event.detail;
    console.log("选择的市场", value);
    // 切换机构修改全局机构号
    let rs = JSON.parse(app.globalData.userInfo)
    app.globalData.ageInfo.ageoId = value.oid
    rs[0].AgeOId = value.oid
    rs[0].UserOId = value.keyId
    rs[0].AgencyName = value.text
    this.setData({
      ageOId: value.oid,
      AgencyName: value.key
    })
    app.globalData.userInfo = JSON.stringify(rs)


  },
  // 确定
  queding(event) {
    const {
      value
    } = event.detail;
    console.log("确定了市场", value);
    let rs = JSON.parse(app.globalData.userInfo)
    app.globalData.ageInfo.ageoId = value.oid
    rs[0].AgeOId = value.oid
    rs[0].UserOId = value.keyId
    rs[0].AgencyName = value.text
    this.setData({
      ageOId: value.oid,
      showDilog: false,
      AgencyName: value.text,
      swiperInfo: [],
      getTitleInfoList: []
    })
    app.globalData.userInfo = JSON.stringify(rs)
    console.log("改变了市场333", JSON.parse(app.globalData.userInfo));
    console.log("改变了市场", this.data.ageOId);
    this.getCateList(this.data.iphone)
    this.getTotalList()
    this.getTitleInfo(this.data.ageOId)
    this.getBannerList()
    this.GetECProductLst()


  },

  // 弹出提示
  async getTotalList() {
    let query = {
      AgeOId: this.data.ageOId
    }
    util.setParamSign(query)
    const result = await httpRequestPost('/XCXDS/GetDSBannerByAgeOId', query)
    if (result.code == 200) {
      let info = JSON.parse(result.json)
      if (info[0].DSBanner == '' || info[0].DSBanner == null) {
        this.setData({
          firstShow: false
        })
      } else {
        this.setData({
          totalinfo: info,
          firstShow: true,
          isload: 1
        })
      }
    }

  },

  onClickKnow() {
    this.setData({
      firstShow: false
    })
  },

  // 判断用户是否注册该市场
  async judegAge(data) {
    console.log("开始判断");
    let params = {
      PhoneNo: data[0].LoginName
    }
    util.setParamSign(params)
    let res = await httpRequestPost('/XCXDS/GetAgeByTel', params)
    console.log("用户的市场列表", JSON.parse(res.json));
    let isre = false
    if (res.code == 200) {
      let result = JSON.parse(res.json)
      console.log("个人市场列表", JSON.parse(res.json));
      for (let i = 0; i < result.length; i++) {
        if (result[i].AgeOId == data[0].AgeOId) {
          console.log("已注册");
          data[0].AgencyName = result[i].AgencyName
          data[0].UserOId = result[i].UserOId
          isre = true
        }

      }
      return isre
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

  onLoad: function (options) {
    let that = this
    console.log("opccc", options);
    console.log(app.globalData);
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'VJ6BZ-AFJHS-G6BOE-6F5L2-FJBV6-P5FCV'
    });

    // let result = app.globalData.userInfo
    // console.log("全局信息",result);
    // let op = "1534"
    let user = app.globalData.userInfo
    app.globalData.y = options.y

    if (options.ageid) {
      // if (options.userid) {
      //   if (user) {
      //     let data = JSON.parse(user)
      //     data[0].AgeOId = options.ageid
      //     this.judegAge(data).then(res1 => {
      //       this.getAgeName(options.ageid).then(result => {
      //         if (res1) {
      //           that.onClickVideo(options.userid).then(res => {
      //             let query = {
      //               url: res,
      //               userid: id
      //             }
      //             query = JSON.stringify(query)
      //             wx.navigateTo({
      //               url: '../../shopsdetail/shopsdetail?query=' + query
      //             });
      //           })

      //         } else {
      //           wx.showModal({
      //             title: "登录提示",
      //             content: "此用户未注册该市场",
      //             success: res => {
      //               if (res.confirm) {
      //                 wx.navigateTo({
      //                   url: '../../register/register',
      //                 })
      //               }
      //             }
      //           })
      //         }
      //       })
      //     })
      //   } else {
      //     this.getAgeName(options.ageid).then(result => {
      //       wx.showModal({
      //         title: "登录提示",
      //         content: "需要先登录",
      //         success: res => {
      //           if (res.confirm) {
      //             wx.navigateTo({
      //               url: '../../login/login?userid=' + options.userid,
      //             })
      //           }
      //         }
      //       })
      //     })

      //   }
      // }
      if (user) {
        let data = JSON.parse(user)
        data[0].AgeOId = options.ageid
        this.judegAge(data).then(res => {
          console.log('res', res);
          this.getAgeName(options.ageid).then(result => {
            if (res) {
              console.log("跳转数据", data);
              app.globalData.userInfo = JSON.stringify(data)
              if (options.userid) {
                that.onClickVideo(options.userid).then(res => {
                  let query = {
                    url: res,
                    userid: options.userid
                  }
                  query = JSON.stringify(query)
                  wx.navigateTo({
                    url: '../../shopsdetail/shopsdetail?query=' + query
                  });
                })
              }

            } else {
              wx.showModal({
                title: "登录提示",
                content: "此用户未注册该市场",
                success: res => {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: '../../register/register',
                    })
                  }
                }
              })
            }
          })

        })
      } else {
        if (options.userid) {
          this.getAgeName(options.ageid).then(result => {
            wx.showModal({
              title: "登录提示",
              content: "需要先登录",
              success: res => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../../login/login?userid=' + options.userid,
                  })
                }
              }
            })
          })
        }
      }


      // console.log("跳转过来的");
      // this.getAgeName(options.ageid)
      this.setData({
        ageOId: options.ageid,
        forOther: true
      })
    }
    // else if (result == '' || result == null) {
    //   let ageoid = 1181
    //   this.setData({
    //     ageOId: ageoid
    //   })
    // 弹窗

    // console.log("默认");

    // } else if (result) {
    // console.log("有全局信息");
    //   this.setData({
    //     ageOId: JSON.parse(result).AgeOId
    //   })
    // }


  },

  // 用市场id获取市场名
  async getAgeName(id) {
    let params = {
      AgeOId: id
    }
    util.setParamSign(params)
    let res = await httpRequestPost('/ScanXCX/GetAgeAdImg', params)
    let data = JSON.parse(res.json)
    app.globalData.ageInfo = {
      ageId: id,
      AgencyName: data[0].AgencyName
    }
    this.setData({
      AgencyName: data[0].AgencyName
    })
  },

  onShow: function () {
    this.uservisit()
    let result = app.globalData.userInfo
    console.log("市场id", this.data.ageOId);
    console.log(result);
    this.goRegister()

    if (result == '' || result == null) {
      console.log("wu");
      if (!this.data.forOther) {
        console.log("默认");
        let ageoid = 1010
        this.setData({
          ageOId: ageoid,
          nologin: true
        })
      } else {
        console.log("跳转过来");
        this.getAgeName(this.data.ageOId)
      }

      this.GetECProductLst()
      // this.getTitleInfo(this.data.ageOId)

      this.getBannerList()


    } else {
      let res = JSON.parse(app.globalData.userInfo)
      console.log('已登录', res);
      let iphone = res[0].LoginName
      let ageOId = res[0].AgeOId
      this.setData({
        AgencyName: res[0].AgencyName,
        ageOId: ageOId,
        iphone: iphone,
        nologin: false
      })

      // 获取机构
      this.getCateList(this.data.iphone)
      this.getTitleInfo(this.data.ageOId)
      this.getBannerList()
      this.GetECProductLst()
      console.log("是否弹出过", this.data.isload);
      if (this.data.isload == 0) {
        this.getTotalList()
      }

    }

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