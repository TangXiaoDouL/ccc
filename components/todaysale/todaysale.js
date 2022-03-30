// components/todaysale/todaysale.js
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
    netWeight: '',
    cnt: '',
    adtCnt: '',
    sumCnt: ''
  },

  ready(){
    this.getYHYM()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async getYHYM() {
      let params = {
        UserOId: this.data.userOId
      }
      //(adtCnt/sumCnt)?((adtCnt/sumCnt).toFixed(2)*100):0
      util.setParamSign(params)
      let res = await httpRequestPost('/ScanXCX/GetYHYMCnt', params)
      console.log(JSON.parse(res.json1)[0].cnt);
      this.setData({
        netWeight :Number(JSON.parse(res.json1)[0].NetWeight).toFixed(0),
        cnt :JSON.parse(res.json1)[0].cnt,
        adtCnt :JSON.parse(res.json3)[0].AdtCnt,
        sumCnt :JSON.parse(res.json3)[0].Cnt,
        hege:(JSON.parse(res.json3)[0].AdtCnt/JSON.parse(res.json3)[0].Cnt).toFixed(0)
      })
      this.netWeight = Number(JSON.parse(res.json1)[0].NetWeight).toFixed(0)
      this.cnt = JSON.parse(res.json1)[0].cnt
      this.adtCnt = JSON.parse(res.json3)[0].AdtCnt
      this.sumCnt = JSON.parse(res.json3)[0].Cnt
    },
  }
})
