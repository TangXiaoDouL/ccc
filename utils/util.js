var hexMD5 = require('./md5.js')

export default {
  
  getWindowHeight() {
    const res = wx.getSystemInfoSync()
    return res.windowHeight
  },

  getError() {
    wx.showToast({
      title: '请求数据失败',
      icon: 'none',
      duration: 1000
    });
  },

  //网络图片转base64
  netWordImgToBase64(imgUrl) {
    return new Promise(((resolve, reject) => {
      // 下载文件资源到本地
      wx.downloadFile({
        // 资源的路径
        url: imgUrl,
        // 成功的回调函数
        success(res) {
          wx.getFileSystemManager().readFile({
            filePath: res.tempFilePath, //选择图片返回的相对路径
            encoding: 'base64', //编码格式
            success: res => { //成功的回调
              resolve('data:image/png;base64,' + res.data)
            },
            fail: () => {
              reject(null)
            }
          })
        }
      })

    }))
  },

  // 时间转换
  timeFormatDate(now) {
    let d = new Date(now)
    let year = d.getFullYear()
    var month = d.getMonth() + 1;
    var date = d.getDate();
    return year + "-" + month + "-" + date
  },

  // 提示框
  setReminder(msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 1000,
      mask: true,
    });

  },

  // 数字签名
  setParamSign(params) {
    console.log('params', params);

    var paramStr = "";
    // 判断是否是string类型
    if (typeof params == "string") {
      paramStr = params;
    }
    // 判断是否是object类型
    else if (typeof params == "object") {
      var arr = [];
      for (var i in params) {
        if (params.hasOwnProperty(i)) {
          arr.push((i + "=" + params[i]));
        }
      }
      //多个字符中间使用&分开
      paramStr = arr.join(("&"));
    }

    if (paramStr) {
      // 使用&截取字段，进行排序,然后使用join拼接
      var newParamStr = paramStr.split("&").sort().join("&");
      // console.log('newParamStr',newParamStr);
      //对字段进行md5加密
      var sign = hexMD5.hexMD5(newParamStr);
      if (typeof params == "string") {
        params += ("&sign=" + sign);
        // console.log(params)
      } else {
        params["sign"] = sign;
        console.log(params)
      }
    }
    return params;
  },
}