// components/purchase/purchase.js
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
    this.getSeedInfo()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 预览图片 
    seeBig(e) {
      console.log(e.currentTarget.dataset.img)
      wx.previewImage({
        urls: [e.currentTarget.dataset.img],
        fail(err) {
          console.log(err)
        }
      });
    },
    // 获取批次信息 GetSeedInfoByUserOId(int UserOId, int AgeOId, string sign)
    async getSeedInfo() {
      let params = {
        UserOId: this.data.userOId,
        AgeOId: this.data.ageOid
      }
      util.setParamSign(params)
      console.log(params);
      let res = await httpRequestPost('/ScanXCX/GetSeedInfoByUserOId', params)
      console.log(res);
      if (res.json) {
        let itemData = JSON.parse(res.json)
        console.log(this.itemData)
        // return;
        let newArr = []
        itemData.forEach((el, index) => {
          // http://103.44.239.227:7002/
          el.AddTime = el.AddTime.split(' ')[0]
          if (el.SeedImg) {
            console.log("有图片")
            el.SeedImg = el.SeedImg.split('"')[1].replace('http://{0}/', 'https://img.ego360.cn/')
            newArr.push(el)
          } else {
            // el.SeedImg = '../../static/image/nopic.png'

          }

        })
        this.itemData = newArr
        console.log(newArr);
        this.setData({
          itemData:newArr
        })
      } else {
        wx.showToast({
          title: "暂无数据"
        })
      }
      // console.log(this.itemData);
    }
  }
})