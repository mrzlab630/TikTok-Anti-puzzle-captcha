/**
 *
 * by mrZ
 * Email: mrZ@mrZLab630pw
 * Date: 12.05.2020
 * Time: 13:14
 * About:
 *
 */
const path = require('path')
const fs = require('fs')

const fetch = require('node-fetch');
const util = require('util')

const cv = require('opencv4nodejs')

const puppeteer = require('puppeteer')



class FcCaptcha
            {


                constructor(debag,agent) {
                    this.browser
                    this.page

                    this.streamPipeline = util.promisify(require('stream').pipeline)

                    this.debag = !debag;
                    this.agent = agent ? agent.toLowerCase() : 'pc'
                    this.userAgent = {
                        pc:`Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36`,
                        mobile:`Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0. 3396.81 Mobile Safari/537.36`
                    }
                    this.bazeUrl = 'https://s0.ipstatp.com/sec-sdk/secsdk-captcha/2.8.8/index.html'
                }



                findPazzleTarget(tagetPic,saveImg,errorFolder)
                {
                    try {

                        if (!tagetPic || typeof tagetPic !== 'string') {
                            throw new Error(`tagetPic is't defined`)
                        }

                        if (!saveImg || typeof saveImg !== 'string') {
                            throw new Error('path for save img is not defined')
                        }

                        const testTagetPic = fs.statSync(tagetPic)


                        if(!testTagetPic || testTagetPic.size === 0){
                            throw new Error(`The file ${tagetPic} is't exists.`)
                        }

                        const mat = cv.imread(tagetPic);


                        if (!mat) {
                            throw new Error('Image has no found')
                        }

                        if (!mat.sizes || mat.sizes[0] < 1 || mat.sizes[1] < 1) {
                            throw new Error('Image has no size')
                        }


                        let gray = mat.cvtColor(cv.COLOR_BGR2GRAY)

                        gray = gray.gaussianBlur(new cv.Size(3, 3), 0);


                        const lowThresh = 600
                        const highThresh = 250

                        let edged = gray.canny(lowThresh, highThresh)

                        const color = new cv.Vec3(0, 255, 0)

                        const mode = cv.RETR_EXTERNAL
                        const method = cv.CHAIN_APPROX_SIMPLE
                        const contours = edged.findContours(mode, method)

                        if (!contours || contours.length === 0) {

                            if(errorFolder && typeof errorFolder === "string"){
                                fs.copyFile(tagetPic, errorFolder, (err) =>{ if (err) throw err })
                            }

                            throw new Error(`didn't find the puzzle`)
                        }

                        const contoursAr = contours.sort((c0, c1) => c1.area - c0.area)
                        let imgContours = []
                        let imgContoursNo = []


                            contoursAr.forEach((contour) => {

                            const  rotatedRect = contour.minAreaRect()

                            const rectHeight = Math.ceil(rotatedRect.size.height)

                            const rectWidth = Math.ceil(rotatedRect.size.width)

                            const rectCount = rectWidth - rectHeight

                             //   console.log({rectHeight,rectWidth},rectWidth - rectHeight)


                            if ( rectCount === -4 || rectCount === -2 || rectCount === 0) {
                                 imgContours.push({
                                                     contour:contour.getPoints(),
                                                     center:rotatedRect.center
                                                 })
                             }else{
                                imgContoursNo.push(contour.getPoints())
                            }



                        })


                        if ( imgContours.length === 0) {

                            if (imgContoursNo.length === 0) {
                                throw new Error(`couldn't find any objects`)
                            }
                            mat.drawContours(imgContoursNo, -1, color, 2)

                            cv.imwrite(saveImg, mat)

                            if(errorFolder && typeof errorFolder === "string"){
                                fs.copyFile(tagetPic, errorFolder, (err) =>{ if (err) throw err })
                            }


                            throw new Error(`didn't find the puzzle`)
                        }


                        return imgContours || false

                    } catch (e) {
                        console.error(e)
                    }
                }

                async download(url,patchFile)
                {
                    try {

                        if(!url || typeof url !== 'string'){
                            throw new Error('url  is not defined')
                        }

                        if(!patchFile || typeof patchFile !== 'string'){
                            throw new Error('patchFile  is not defined')
                        }

                        const response = await fetch(url)

                        if (!response.ok) {
                            throw new Error(`unexpected response ${response.statusText}`)
                        }

                        await this.streamPipeline(response.body, fs.createWriteStream(patchFile))

                        return true

                    }catch (e) {
                        console.error(e)
                    }
                }

                async delay(time = 0)
                {
                    await new Promise(r => setTimeout(r, time));
                }

                randomInteger(min, max)
                {
                    let rand = min + Math.random() * (max + 1 - min);
                    return Math.floor(rand);
                }

                async initPuppeter()
                {

                    this.browser = await puppeteer.launch({
                        headless: this.debag,
                        devtools: false
                    })
                    this.page = await this.browser.newPage()
                    await this.page.setUserAgent(this.userAgent[this.agent]);

                    await this.page.setRequestInterception(true);

                    this.page.on('request', (req) => {

                        /*
                        if( req.resourceType() == 'font' || req.resourceType() == 'image'){
                            req.abort()
                        }
                        else {
                            req.continue()
                        }

                         */
                        req.continue()
                    })

                }

                async closeBrowser()
                {
                    await this.browser.close();
                }

                async getImgUrl(selector)
                {
                    return await this.page.$$eval(selector, anchors => [].map.call(anchors, img => img.src));
                }

                async getText(selector)
                {
                    return  await this.page.$$eval(selector, nodes => nodes.map(n => n.innerText))
                }

                async go()
                {
                    try{

                        await  this.initPuppeter()

                        await this.page.goto(this.bazeUrl, {waitUntil: 'networkidle0'})
                        const img = await this.getImgUrl('img[class="sc-iwsKbI jEGYro sc-ifAKCX rZemy"]')
                        const targToDownload = img[0]

                        if(!targToDownload){
                            throw new Error(`body image url is not defined`)
                        }

                        if(path.extname(targToDownload) !== '.image'){

                            const textErr = await this.getText('div[class="msg sc-gzVnrw jepoPo"]')

                            const textErrInfo = textErr && textErr === '网络故障，请稍后重试' ? 'Network failure, please try again later.' : textErr

                            throw new Error(`loading captcha\n${textErr}\nLink:${textErrInfo}`)

                        }

                        const tagetPic = path.resolve(__dirname,'..','assets','imgs','target',`body${path.extname(targToDownload)}`)
                        const saveImg = path.resolve(__dirname,'..','assets','imgs','result',`${ Date.now()}.jpg`)
                        const errorFolder = path.resolve(__dirname,'..','assets','imgs','err',`${ Date.now()}.jpg`)


                        await this.download(targToDownload,tagetPic)

                        const testDL = fs.statSync(tagetPic)

                        if(!fs.existsSync(tagetPic)  || testDL.size === 0){
                            throw new Error(`The file ${tagetPic} is't exists.`)
                        }


                        const puzzleTargetPosition = await  this.findPazzleTarget(tagetPic,saveImg,errorFolder)

                        if(!puzzleTargetPosition  || typeof puzzleTargetPosition !== 'object' || puzzleTargetPosition.length === 0){
                            throw new Error(`didn't find the puzzle`)
                        }

                        const moveX = puzzleTargetPosition[0].center.x - 25.966665|| 1


                        await this.delay(400)
                        const origin = await this.page.$('img[class="captcha_verify_img_slide react-draggable sc-gZMcBi AJYeO"]')
                        const ob = await origin.boundingBox()

                        const destination = await this.page.$('div[class="captcha_verify_img--wrapper sc-dnqmqq kOYoOt"]')
                        const db = await destination.boundingBox()

                        const dragX = ob.x + ob.width / 2

                        const dragY = ob.y + ob.height / 2

                        const finTargetMove = moveX-7


                        await this.page.mouse.move(dragX, dragY)
                        await this.page.mouse.down()


                        for (let i = 0; i < finTargetMove; i++) {

                            const moveIX = dragX + i

                            const delayMove = this.randomInteger(2, 15)

                            await this.delay(delayMove)

                            await this.page.mouse.move( moveIX, dragY)

                        }


                        await this.delay(7)
                        await this.page.mouse.move( dragX + finTargetMove + 1, dragY)

                        await this.delay(7)
                        await this.page.mouse.move( dragX + finTargetMove + 2, dragY)

                        await this.delay(7)
                        await this.page.mouse.move( dragX + finTargetMove + 2, dragY)

                        await this.delay(this.randomInteger(95, 120))
                        await this.page.mouse.move( dragX + finTargetMove + 3, dragY)

                        await this.delay(this.randomInteger(950, 1206))
                        await this.page.mouse.move( dragX + finTargetMove + 4, dragY)

                        await this.delay(32)
                        await this.page.mouse.move( dragX + finTargetMove + 5, dragY)

                        await this.delay(32)
                        await this.page.mouse.move( dragX + finTargetMove + 5, dragY)

                        await this.delay(47)
                        await this.page.mouse.move( dragX + finTargetMove + 6, dragY)

                        await this.delay(this.randomInteger(360, 425))
                        await this.page.mouse.move( dragX + finTargetMove + this.randomInteger(5, 9), dragY)

                        await this.page.mouse.up()

                        /*
                        await this.page.waitForNavigation({ waitUntil: 'networkidle2' })


                        const res = await this.getText('div[class="msg sc-gzVnrw flyHfP"]')

                        console.log({res})

                         */


                    }catch (e) {
                        console.error(e)
                    }

                }




            }



module.exports = FcCaptcha