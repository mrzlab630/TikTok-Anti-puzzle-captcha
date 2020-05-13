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



    const ht = new FcCaptcha(true,'mobile')

    const saveImg = path.resolve(__dirname,'assets','imgs','result',`${ Date.now()}.jpg`)
    const tagetPic = path.resolve(__dirname,'assets','imgs','target','body.image')

    const action = await ht.go() //.findPazzleTarget(tagetPic,saveImg)//

    console.log(action)

}




fc()