/**
 *
 * by mrZ
 * Email: mrZ@mrZLab630pw
 * Date: 08.05.2020
 * Time: 9:53
 * About:
 *
 */
const path = require('path')

const FcCaptcha = require('./lib/FcCaptcha')





const fc = async () => {
   try{

       const testPage = 'https://s0.ipstatp.com/sec-sdk/secsdk-captcha/2.8.8/index.html'

       const ht = new FcCaptcha('mobile',true,testPage)

       const action = await ht.go()

       console.log(action)

       /*
       const saveImg = path.resolve(__dirname,'assets','imgs','result',`${ Date.now()}.jpg`)
       const tagetPic = path.resolve(__dirname,'assets','imgs','target','body.image')
       const action = await ht.findPazzleTarget(tagetPic,saveImg)
        */


    }catch (e) {
        console.log(e)
    }
}




fc()