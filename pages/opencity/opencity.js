
const {
  httpRequestGet,
  httpRequestPost
} = require('../../http/httpRequest.js')
import util from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: { 
    myCity:'',
    // 开通城市
    opencityList:[]
  },

  onLoad: function (options) {
        
  },
  async getOpenCity(){
    let query={
      sign:'zksx'
    }

    util.setParamSign(query)

    let query2={
      CityName:''
    }
    let query3={...query,...query2}

    const result = await httpRequestPost('/XCXDS/GetAgeLstByCityName',query3)
    if(result.code==200){
      let citylist=JSON.parse(result.json)
      console.log(citylist)
      this.setData({
        opencityList:citylist
      })
      console.log(this.data.opencityList)
    }

  },

  //选择城市
  onClickCity(e){
    let {ageoid,cityname} =e.currentTarget.dataset
    let query={
      ageoid,
      cityname
    }
    query=JSON.stringify(query)
    wx.navigateTo({
      url:`/pages/register/register?query=${query}`,
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOpenCity()
  },



})