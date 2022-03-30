let app =  getApp();
import util from '../../utils/util.js';
import { httpRequestPost } from '../../http/httpRequest.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    switch1Checked:false,
    BuyerId:'',
    BuyerName:'',
    AgeOId:'',
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
    //
    showAddress:false
  },

  // 获取微信地址
  handleChooseAddress(){

    wx.getSetting({
      success:(result)=>{
        const scopeAddress=result.authSetting['scope.address']
        if(scopeAddress===true||scopeAddress===undefined){
          wx.chooseAddress({
            success:(result1)=>{

              if(this.data.userName == null || this.data.userName == ''){

                console.log(result1.telNumber)
                this.setData({
                  province:result1.provinceName,
                  city:result1.cityName,
                  district:result1.countyName,
                  detailAddress:result1.detailInfo,
                  address:result1.provinceName+result1.cityName+result1.countyName,
                  showAddress:true,
                  userName:result1.userName,
                  phone:result1.telNumber
                })
              }else{
                this.setData({
                  province:result1.provinceName,
                  city:result1.cityName,
                  district:result1.countyName,
                  detailAddress:result1.detailInfo,
                  address:result1.provinceName+result1.cityName+result1.countyName,
                  showAddress:true,
                  phone:result1.telNumber
                })
              }
            }
          })
        }else{
          // 用户拒绝过授权权限
          wx.openSetting({
            success:(result2)=>{
              wx.chooseAddress({
                success: (result3) => {

                  if(this.data.userName == null || this.data.userName == ''){

                    console.log(result3.telNumber)
                    this.setData({
                      province:result3.provinceName,
                      city:result3.cityName,
                      district:result3.countyName,
                      detailAddress:result3.detailInfo,
                      address:result3.provinceName+result3.cityName+result3.countyName,
                      showAddress:true,
                      userName:result3.userName,
                      phone:result3.telNumber
                    })
                  }else{
                    this.setData({
                      province:result3.provinceName,
                      city:result3.cityName,
                      district:result3.countyName,
                      detailAddress:result3.detailInfo,
                      address:result3.provinceName+result3.cityName+result3.countyName,
                      showAddress:true,
                      phone:result3.telNumber
                    })
                  }

                }
              })
            }
          })
        }
      }
    })
  },

  // 新增收货地址
  async newAddress(){

    let userName=this.data.userName
    let phone=this.data.phone
    let address=this.data.address
    let detailAddress=this.data.detailAddress
    let provi=this.data.province
    let city=this.data.city
    let district=this.data.district
    let isdefault=this.data.isdefault
    let id=this.data.BuyerId
    let name=this.data.BuyerName
    let ageoid=this.data.AgeOId
    
    if(userName=='' || userName==null|| userName==undefined){
      util.setReminder('请填写收货人')
    }else if(phone=='' || phone==null || phone==undefined){
      util.setReminder('请填写手机号')
    }else if(address=='' || address==null || address==undefined){
      util.setReminder('请填写收货地址')
    }else if(detailAddress=='' || detailAddress==null || detailAddress==undefined){
      util.setReminder('请填写详细地址')
    } else{
      console.log('可以发起新增地址');
      let query1={
        Mobile:phone,
        IsDefault:isdefault,
        BuyerId:id,
        AgeOId:ageoid,
      }
      util.setParamSign(query1)

      let query2={
        ReceiveName:userName,
        ProvinceName:provi,
        CityName:city,
        DistrictName:district,
        Townname:'',
        DetailedAddress:detailAddress,
        BuyerName:name,
      }
      let query={...query1,...query2}
      const {code}= await httpRequestPost('/XCXDS/DoAddAddress',query)
      console.log(code)
      if(code==200){
        util.setReminder('地址新增成功！')
        wx.navigateBack({
          delta: 1
        });
      }else if(code==0){
        util.setReminder('添加失败！已存在相同地址')
      }
      
    }
      
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

  // 开关切换
  switch1Change(e){
    
    let {value}=e.detail

    this.setData({
      switch1Checked:value
    })
   
    if(value===true){
      this.setData({
        isdefault:1
      })
    }else{
      this.setData({
        isdefault:0
      })
    }
    
  },
  inputUserName(e){
    console.log(e);
    let {value}=e.detail
    this.setData({
      userName:value
    })
  },
  inputPhone(e){
    console.log(e);
    
    let {value} =e.detail
    this.setData({
      phone:value
    })
  },

  inpuAddress(e){
    let {value} =e.detail
    this.setData({
      detailAddress:value
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let s=this.data.switch1Checked
    // if(s){
    //   this.setData({

    //   })
    // }
    
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
      BuyerId:result[0].UserOId,
      BuyerName:result[0].UserName,
      AgeOId:result[0].AgeOId,
      phone:result[0].LoginName
    })
    
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