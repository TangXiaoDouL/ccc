import { httpRequestPost } from "../../http/httpRequest"
import util from "../../utils/util"

let app =  getApp();

  

// pages/seach/seach.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value:'',
    kwworld:[],
    ageOId:'',
    seachGoods:[],
    pagenum:1,
    isloading:false,
    total:'',
    id:''
  },


  onRemove() {
    this.setData({
      kwworld: []
    })
    wx.setStorageSync('kw', [])
  },
  // 取消
  onClear(){
    this.setData({
      seachGoods:[]
    })
  },
  // 搜索

  async getkeyList(){
    this.setData({
      isloading: true
    })
    let value=this.data.value.trim()
    if(value=='' || value ==null){
      util.setReminder('搜索内容不能为空！')
      this.setData({
        value:''
      })
    }else{  

      if (this.data.kwworld.indexOf(value) === -1 ) {
        this.data.kwworld.unshift(value)
      }
      this.data.kwworld = this.data.kwworld.slice(0, 10)

      // 刷新数据
      this.setData({
        kwworld: this.data.kwworld
      })
      wx.setStorageSync('kw', this.data.kwworld)
      let query={
        PageIndex:this.data.pagenum,
        OrderBy:0,
        SellerId:0,
        AgeOId:this.data.ageOId
      }
      util.setParamSign(query)
  
      let query2={
        StrSearch:this.data.value
      }
      let query3={...query,...query2}
      const result= await httpRequestPost('/XCXDS/GetSearchLst',query3)
      if(result.code==200){
        let list=JSON.parse(result.json)
        if(list.json=='' || list.json ==null){
          util.setReminder('暂无该商品信息')
          this.setData({
            value:''
          })
        }else{
          this.setData({
            seachGoods:[...this.data.seachGoods,...list.json],
            total:list.recordCount,
            isloading: true
          })
        }

      }
    }
  },

  async onClick(){

      this.setData({
        seachGoods: [],
        pagenum:1
      })
      this.getkeyList()
    
  },
  // 关键词
  onKeyChange(e){
    this.setData({
      value:e.detail
    })

  },
  onClickGoodsItem(e){

        let {id,sum,status}= e.currentTarget.dataset
    let query={
      id:id,
      sum:sum,
      status:status
    }
    query=JSON.stringify(query)
    wx.navigateTo({
      url: '/pages/goodsinof/goodsinfo?query=' +query 
    });

  },
  // 删除缓存
    //删除缓存
    onRemove() {
      this.setData({
        kwworld: []
      })
      wx.setStorageSync('kw', [])
    },
    onClickKey(e){
      let {name}=e.currentTarget.dataset
      this.setData({
        value:name
      })
      this.onClick()

    },

  async seachList(id, ageoid) {
console.log("搜索的类目id",id);
    let params = {
      PageIndex: this.data.pagenum,
      OrderBy: 0,
      IndexType: id,
      SellerId: 0,
      AgeOId: ageoid
    }
    util.setParamSign(params)
    console.log(params);
    const result = await httpRequestPost('/XCXDS/GetIndexSearchLst', params)
    if (result.code == 200) {
      let list = JSON.parse(result.json).json
      console.log(list)
      this.setData({
        seachGoods: [...this.data.seachGoods, ...list],
        total: list.recordCount,
        isloading: true
      })
    }

  },

  onLoad: function (options) {

    if (options) {
      let { id } = options
      this.setData({
        id: id
      })
    }

    const kw = wx.getStorageSync('kw') || []
    this.setData({
      kwworld: kw
    })
    let result=app.globalData.userInfo
    
    if(result=='' || result== null){
      let ageInfoId = app.globalData.ageInfo.ageId
      if (ageInfoId) {
        this.setData({
          ageOId:ageInfoId
        })
      } else {
        this.setData({
          ageOId:1010
        })
      }
     
      this.seachList(this.data.id, this.data.ageOId)

    }else{
       result=JSON.parse(result)
      let ageOId = result[0].AgeOId
      this.setData({
        ageOId:ageOId
      })

      this.seachList(this.data.id, this.data.ageOId)
  
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
  onReachBottom: function (e) {
    
    if (this.data.isloading) {
        util.setReminder('没有更多数据了')
    }  
    //判断页面数据是否加载完毕
    if (this.data.seachGoods.length >= this.data.total) {
      this.setData({
        istoogle: false
      })
      return
    }
    // 页面一触底 pagenum+1
    this.setData({
      pagenum: this.data.pagenum + 1
    })
    this.getkeyList()

    if(this.data.id){
      this.seachList(this.data.id, this.data.ageOId)
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})