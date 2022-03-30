// components/insrec/insrec.js
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
      type: Number,
      value: ""
    },
    userOId: {
      type: Number,
      value: ""
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    itemData: []
  },
  ready(){
    this.getEvaluate()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async getEvaluate() {
      let params = {
        UserOId: this.data.userOId,
        AgeOId: this.data.ageOid
      }
      util.setParamSign(params)
      console.log(params);
      let res = await httpRequestPost('/ScanXCX/GetChkXunGenByAgeOId', params)
      if(res.json=='') return
      console.log(JSON.parse(res.json));
      this.itemData = JSON.parse(res.json)
      this.setData({
        itemData:JSON.parse(res.json)
      })
    }
  }
})
