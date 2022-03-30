// components/testinfo/testinfo.js
import {
  httpRequestPost
} from '../../http/httpRequest.js'
import util from '../../utils/util.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    ageOid: {
      type:Number,
      value:0
    },
    userOId:{
            type:Number,
            value:0
          }
  },

  /**
   * 组件的初始数据
   */
  data: {
    itemData: [],
  },
ready(){
  this.getChkInfo()
},
  /**
   * 组件的方法列表
   */
  methods: {
    async getChkInfo() {
      let params = {
        UserOId: this.data.userOId,
        AgeOId: this.data.ageOid
      }
      util.setParamSign(params)
      let res = await httpRequestPost('/ScanXCX/GetChkInfoByUserOId', params)
      
      if (!res.json) {
        uni.showToast({
          title: "暂无数据"
        })
        return
      }
      console.log("抽检返回的数据",JSON.parse(res.json))
      let data = JSON.parse((res.json))
      // data.forEach((el, index) => {
      // 	if(el.Img=='') el.Img
      // 	el.Img = 'http://103.44.239.227:7002/' + el.Img
      // })
      console.log("数据列表",JSON.parse(JSON.stringify(data)))

      for (let i = 0; i < data.length; i++) {
        // <img src="http://{0}/cd_img/sr.jpg" />
        if (data[i].Img.match("<img")) {
          // http://{0}/cd_img/sr.jpg
          data[i].Img = data[i].Img.split('"')[1].replace('http://{0}/', 'https://img.ego360.cn/')
          continue
        }
        if (data[i].Img == '') {
          data[i].Img = '../../static/image/nopic.png'
          continue
        }
        data[i].Img = 'https://img.ego360.cn/' + data[i].Img
        let date = new Date(data[i].AddTime)
        data[i].AddTime = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
      }
     this.setData({
       itemData:data
     })
    },
  }
})
