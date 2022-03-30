// pages/suyuan/suyuan.js
import uCharts from '../../utils/u-charts'
	let _self;
	let canvaColumn = null;


	import {
		httpRequestPost
	} from '../../http/httpRequest.js'
	import util from '../../utils/util.js'
	import {
		Base64
	} from '../../utils/base64.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    AgencyName: '',
				mheight:0,
				mtop:0,
				orderNum:"",
				cWidth: '',
				cHeight: '',
				pixelRatio: 1,
				serverData: '',
				active: 0,
				userOId: 1068,
				tradeoid: '',
				IsJXC: '',
				headPic: '',
				userType: '',
				userName: '',
				stallName: '',
				suYuanFlag: false,
				score: 5,
				license: [],
				ageOid: '',
				imgArr: [
					{
						src: '../../assets/image/jyzt.png',
						text: '经营主体'
					}, {
						src: '../../assets/image/cjjl.png',
						text: '抽验记录'
					}, {
						src: '../../assets/image/jhpz.png',
						text: '进货凭证',
					},
					{
						src: '../../assets/image/jrxs.png',
						text: '今日销售'
					}, {
						src: '../../assets/image/jcjl.png',
						text: '检查记录'
					}, {
						src: '../../assets/image/fxts.png',
						text: '风险提示'
					}
				]
  },

  convert_length(length) {
    return Math.round(wx.getSystemInfoSync().windowWidth * length / 750);
  },

goBack(){
  console.log(6666);
			wx.navigateBack()
			},
			
			setid(){
        this.setData({
          tradeoid:"2262186"
        })
			},
			// 获取query值
			getQueryVariable(query, letiable) {
				// let query = window.location.search.substring(1);
				let lets = query.split("&");
				for (let i = 0; i < lets.length; i++) {
					let pair = lets[i].split("=");
					if (pair[0] == letiable) {
						return pair[1];
						console.log(pair[1]);
					}
				}
				return (false);
			},
			
			// 获取tradeoid 
			async getTradeid(orderNum){
				let params = {
					BillCode:orderNum
				}
				util.setParamSign(params)
				let res = await httpRequestPost("/ScanXCX/GetTradeMainInfoByBillCode",params)
				console.log("订单号获取的id",res)
				console.log("数据",JSON.parse(res.json))
				let resData = JSON.parse(res.json)[0]
				this.tradeoid = resData.TradeOId
				this.IsJXC = resData.ScanType
				this.suYuanFlag = true
				this.active = 6
			},
			// 获取用户信息
			async getUserInfo(e=1068) {
				console.log("用户id",e)
				let params = {
					UserOId: e
				}
				util.setParamSign(params)
				let res = await httpRequestPost('/ScanXCX/GetUserInfoDTByUserOId', params)
				console.log("商户数据",res)
				if (!res.json) {
					util.setReminder('暂无数据')
					return
				}
				let data = JSON.parse((res.json))[0]
				console.log(data, '用户信息');
				if (data.HeadPic) {
					data.HeadPic = data.HeadPic.split('"')[1].replace('http://{0}/', 'https://img.ego360.cn/')
				} else {
					data.HeadPic = '../../static/image/default.png'
        }
        this.setData({
          headPic:data.HeadPic,
          userName : data.UserName,
			  userType : data.IndustryName,
			  ageOid : data.AgeOId,
			  stallName : data.MECHANT_NUM,
			  score : Number(data.Score),
			  AgencyName : data.AgencyName,
        })
				// this.userName = data.UserName
				// this.userType = data.IndustryName
				// this.ageOid = data.AgeOId
				// this.stallName = data.MECHANT_NUM
				// this.score = Number(data.Score)
				// this.AgencyName = data.AgencyName
				let arr = data.License.split('="')
				arr.shift()
				arr.forEach((item, index) => {
					if(item.indexOf("https")==-1){
						console.log("http路径")
						arr[index] = item.split('"')[0].replace('http://{0}/', 'https://img.ego360.cn/')
					} else {
						console.log("https路径")
						arr[index] = item.split('"')[0].replace('https://{0}/', 'https://img.ego360.cn/')
					}
				})
        this.license = arr
        this.setData({
          license:arr
        })
				console.log("营业证照",arr)
				// uni.setStorage({
				// 	key: 'userData',
				// 	data: {
				// 		ageOid: this.ageOid,
				// 		userOId: this.userOId
				// 	},
				// 	success: el => {
				// 		console.log('存储成功');
				// 	},
				// 	fail: el => {
				// 		console.log('存储失败')
				// 	}
				// })
			},
			toggle(e) {
				// 选择点击按钮
				// 0 经营主体 1 抽验记录 2 进货凭证 3 今日销售 4 检查记录 5 风险提示
				// 6 溯源小票 7 评价 8 投诉
        let index = e.currentTarget.dataset.index
        this.setData({
          active:index
        })
				// 若点击风险提示 重新加载图表
				if (index == 5) {
					_self = this;
					console.log("当前this",this)
					//#ifdef MP-ALIPAY
					// 计算宽高
					wx.getSystemInfo({
						success: function(res) {
							if (res.pixelRatio > 1) {
								//正常这里给2就行，如果pixelRatio=3性能会降低一点
								//_self.pixelRatio =res.pixelRatio;
                _self.pixelRatio = 2;
                _self.setData({
                  pixelRatio:2
                })
							}
						}
					});
					//#endif
					this.cWidth = this.convert_length(750);
          this.cHeight = this.convert_length(500);
          this.setData({
            cWidth : this.convert_length(750),
          cHeight : this.convert_length(500),
          })
					this.getServerData();
				}
			},

			async getServerData() {
				// 获取风险提示 GetFXCdDtCharts(int AgeOId, string sign)
				let params = {
					AgeOId: this.data.ageOid
				}
				util.setParamSign(params)
				let res1 = await httpRequestPost('/ScanXCX/GetFXCdDtCharts', params)

				let res = {
					"success": true,
					"data": {
						"Column": {
							"categories": res1.jsonCdName.split(','),
							"series": [{
								"name": "",
								"data": res1.jsonCnt.split(','),
							}],

						},
					}
				}
				//下面这个根据需要保存后台数据，我是为了模拟更新柱状图，所以存下来了
        _self.serverData = res.data;
        this.setData({
          serverData:res.data
        })
				let Column = {
					categories: [],
					series: [],
				};
				//这里我后台返回的是数组，所以用等于，如果您后台返回的是单条数据，需要push进去
				Column.categories = res.data.Column.categories;
				//这里的series数据是后台做好的，如果您的数据没有和前面我注释掉的格式一样，请自行拼接数据
        Column.series = res.data.Column.series;
        let canvas = wx.createCanvasContext('canvasColumn')
				_self.showColumn(canvas, Column);
			},
			showColumn(canvasId, chartData) {
				canvaColumn = new uCharts({
					$this: _self,
					context: canvasId,
					type: 'column',
					legend: {
						"show": false
					},
					fontSize: 11,
					background: '#FFFFFF',
					pixelRatio: _self.data.pixelRatio,
					animation: true,
					categories: chartData.categories,
					series: chartData.series,

					xAxis: {
						disableGrid: true,
						rotateLabel: true
					},
					yAxis: {

						format: (val) => {
							return val.toFixed(1)
						},
						splitNumber: 3
					},
					dataLabel: true,
					width: _self.data.cWidth * _self.data.pixelRatio,
					height: _self.data.cHeight * _self.data.pixelRatio,
					extra: {
						column: {
							width: _self.data.cWidth * _self.data.pixelRatio * 0.35 / chartData.categories.length
						}
					}
				});
			},
			changeData() {
				canvaColumn.updateData({
					series: _self.serverData.ColumnB.series,
					categories: _self.serverData.ColumnB.categories
				});
			},

  //==============================

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id
    let menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    console.log(menuButtonInfo)
    this.setData({
      mheight:menuButtonInfo.height,
      mtop:menuButtonInfo.top,
      userOId:id
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
    this.getUserInfo(this.data.userOId)
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