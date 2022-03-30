import { httpRequestPost } from "../../http/httpRequest";
import util from "../../utils/util";

let app =  getApp();

  
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 修改地址
    updateaddress:{},


    //收货人
    userName:'',
    //电话
    phone:'',
    // 所在地区
    address:'',
    //省
    province:'',
    // 市
    city:'',
    // 区
    district:'',
    // 详细地区域
    detailAddress:'',
    isdefault:0,

    isCheck:false,

    //街道
    Townname:'',
    // 用户名
    BuyerName:'',
    // 机构id
    AgeOId:'',
    // 用户id
    userid:'',
    // 地址id
    addrid:''

  },

  // 获取当前编辑的地址
  async getEditAddress(buyid,addrid){
    
    let query={
      BuyerId:buyid,
      AddrOId:addrid
    }
    // 签名
    util.setParamSign(query)

    const {json,code} = await httpRequestPost('/XCXDS/GetAddressByAddrOId',query)
    if(code==200){
      let list =JSON.parse(json)

      this.setData({
        //收货人
        userName:list[0].ReceiveName,
        //电话
        phone:list[0].Mobile,
        // 所在地区
        address:list[0].ProvinceName+list[0].CityName+list[0].DistrictName,
        //省
        province:list[0].ProvinceName,
        // 市
        city:list[0].CityName,
        // 区
        district:list[0].DistrictName,
        // 详细地区域
        detailAddress:list[0].DetailedAddress,
        isdefault:list[0].IsDefault,

        updateaddress:list,
        
      })
      let d=this.data.isdefault
      if(d===1){
        this.setData({
          isCheck:true
        })
      }else{
        this.setData({
          isCheck:false
        })
      }
      
    }else{
      util.setReminder('地址获取失败')
    }
    
  }, 

  //  // 获取微信地址
  handleChooseAddress(){
    wx.getSetting({
      success:(result)=>{
        const scopeAddress=result.authSetting['scope.address']
        if(scopeAddress===true||scopeAddress===undefined){
          wx.chooseAddress({
            success:(result1)=>{
              this.setData({
                province:result1.provinceName,
                city:result1.cityName,
                district:result1.countyName,
                detailAddress:result1.detailInfo,
                address:result1.provinceName+result1.cityName+result1.countyName
              })
            }
          })
        }else{
          // 用户拒绝过授权权限
          wx.openSetting({
            success:(result2)=>{
              wx.chooseAddress({
                success: (result3) => {
                  this.setData({
                    province:result3.provinceName,
                    city:result3.cityName,
                    district:result3.countyName,
                    detailAddress:result3.detailInfo,
                    address:result3.provinceName+result3.cityName+result3.cityName
                  })
                }
              })
            }
          })
        }
      }
    })
  },

  // 修改
  inpuAddress(e){
    let {value} =e.detail
    this.setData({
      detailAddress:value
    })
  },
  inputUserName(e){
    let {value}=e.detail
    this.setData({
      userName:value
    })
  },
  inputPhone(e){
    let {value} =e.detail
    this.setData({
      phone:value
    })
  },
  blurPhone() {
    // 获取手机号码长度
    let reg = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/
    let iphone = this.data.phone
    if(!reg.test(iphone)) {
        util.setReminder('手机号格式有误')
        this.setData({
          phone:''
        })
    }
  },
  switch1Change(e){
      let {value}=e.detail

      if(value==false){
        this.setData({
          isdefault:0
        })
      }else{
        this.setData({
          isdefault:1
        })
      }
  },

  //修改地址
  async updataAddress(){

    let userName=this.data.userName
    let phone=this.data.phone
    let address=this.data.address
    let detailAddress=this.data.detailAddress
    let provi=this.data.province
    let city=this.data.city
    let district=this.data.district
    let isdefault=this.data.isdefault

    let userid=this.data.userid

    let name=this.data.BuyerName

    let ageoid=this.data.AgeOId

    let addrid=this.data.addrid
    
    if(userName=='' || userName==null|| userName==undefined){
      util.setReminder('请填写收货人')
    }else if(phone=='' || phone==null || phone==undefined){
      util.setReminder('请填写手机号')
    }else if(address=='' || address==null || address==undefined){
      util.setReminder('请填写收获地址')
    }else if(detailAddress=='' || detailAddress==null || detailAddress==undefined){
      util.setReminder('请填写详细地址')
    }else{

      let query1={
        ReceiveName:userName,
        ProvinceName:provi,
        CityName:city,
        DistrictName:district,
        Townname:'',
        DetailedAddress:detailAddress,
        BuyerName:name,
      }
      let query2={
        AddrOId:addrid,
        AgeOId:ageoid,
        BuyerId:userid,
        IsDefault:isdefault,
        Mobile:phone
      }
      util.setParamSign(query2)
      let query3={...query1,...query2}
      //修改收货地址
      const result=await httpRequestPost('/XCXDS/Updateddress',query3)
      if(result.code==200){
        util.setReminder('收货地址修改成功！')
        wx.navigateBack({
          delta: 1
        });
      }else if(result.code==0){
        util.setReminder('修改失败！已存在相同地址')
      }
      
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let result=JSON.parse(options.query)
      
      this.setData({
        userid:result.BuyerId,
        addrid:result.AddrOId
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
    let result = JSON.parse(app.globalData.userInfo)

    this.setData({
      BuyerName:result[0].UserName,
      AgeOId:result[0].AgeOId
    })

     this.getEditAddress(this.data.userid,this.data.addrid)

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

  }
})