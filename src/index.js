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
const fs = require('fs')

const fetch = require('node-fetch');
const cv = require('opencv4nodejs')

const puppeteer = require('puppeteer')


const getFiles = function (dir,fileType) {
    try{

        if(!dir || typeof dir !== 'string'){
            throw new Error('dir has no found')
        }

        if(!fileType || typeof fileType !== 'string'){
            throw new Error('fileType has no found')
        }

      const  filesAll = fs.readdirSync(dir);

        const files = []

        filesAll.forEach(itm =>{
            const filePath = path.join(dir, itm)

            const stat = fs.statSync(filePath)

            if (stat.isFile() && path.extname(itm) === `.${fileType}`) {
                files.push(itm)
            }

        })



console.log(files)

        return files

    }catch (e) {
        console.log(e)
    }
}

const fcC = function(tagetPic,saveImg){
    try {

        if(!tagetPic || typeof tagetPic !== 'string'){
            throw new Error('tagetPic is not defined')
        }

        if(!saveImg || typeof saveImg !== 'string'){
            throw new Error('path for save img is not defined')
        }

        const mat = cv.imread(tagetPic);



        if(!mat){
            throw new Error('Image has no found')
        }

        if(!mat.sizes || mat.sizes[0] < 1 || mat.sizes[1] < 1){
            throw new Error('Image has no size')
        }


        let gray = mat.cvtColor(cv.COLOR_BGR2GRAY)

        gray = gray.gaussianBlur(new cv.Size(3,3), 0);


        const lowThresh = 70
        const highThresh = 600

       let edged = gray.canny(lowThresh, highThresh)

                const color = new cv.Vec3(0, 255, 0)

                const mode = cv.RETR_EXTERNAL
                const method = cv.CHAIN_APPROX_SIMPLE
                const contours = edged.findContours(mode, method)
                const contoursAr = contours.sort((c0, c1) => c1.area - c0.area)
                const imgContours = contoursAr.map((contour) => {
                    return contour.getPoints();
                });

        if(!imgContours || imgContours.length === 0){
            throw new Error('pazzle has no found')
        }

        mat.drawContours(imgContours, -1, color, 2)



        console.log(imgContours)


        cv.imwrite(saveImg, mat)

      return   imgContours

    }catch (e) {
        console.error(e)
    }
}

const action = function(){

    try {

        const imgArr =  getFiles(path.resolve(__dirname,'assets','imgs'),'image')

        if(!imgArr || imgArr.length === 0){
            throw new Error('img has not found')
        }


        imgArr.forEach( (itm,idx) =>{
            const saveImg = path.resolve(__dirname,'assets','imgs','result',`${ Date.now() + idx }.jpg`)
            const tagetPic = path.resolve(__dirname,'assets','imgs',itm)

           fcC(tagetPic,saveImg)
        })



    }catch (e) {
        console.log(e)
    }

    }

///action()

///////////////////////////////////

class HfcC {

    constructor(debag,agent) {
        this.browser
        this.page

        this.debag = !debag;
        this.agent = agent ? agent.toLowerCase() : 'pc'
        this.userAgent = {
            pc:`Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36`,
            mobile:`Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0. 3396.81 Mobile Safari/537.36`
        }
        this.bazeUrl = 'https://s0.ipstatp.com/sec-sdk/secsdk-captcha/2.8.8/index.html'
        }

    findPazzleTarget(tagetPic,saveImg)
    {
            try {

                if (!tagetPic || typeof tagetPic !== 'string') {
                    throw new Error('tagetPic is not defined')
                }

                if (!saveImg || typeof saveImg !== 'string') {
                    throw new Error('path for save img is not defined')
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


                const lowThresh = 70
                const highThresh = 600

                let edged = gray.canny(lowThresh, highThresh)

                const color = new cv.Vec3(0, 255, 0)

                const mode = cv.RETR_EXTERNAL
                const method = cv.CHAIN_APPROX_SIMPLE
                const contours = edged.findContours(mode, method)
                const contoursAr = contours.sort((c0, c1) => c1.area - c0.area)
                const imgContours = contoursAr.map((contour) => {
                    return contour.getPoints();
                });

                if (!imgContours || imgContours.length === 0) {
                    throw new Error('pazzle has no found')
                }

                mat.drawContours(imgContours, -1, color, 2)


                console.log(imgContours)


                cv.imwrite(saveImg, mat)

                return imgContours

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

            const res = await fetch(url);

            await new Promise((resolve, reject) => {
                const fileStream = fs.createWriteStream(patchFile);
                res.body.pipe(fileStream);
                res.body.on("error", (err) => {
                    reject(err);
                });
                fileStream.on("finish", function() {
                    resolve();
                });
            });


        }catch (e) {
            console.error(e)
        }
    }

    async delay(time = 0)
    {
        await new Promise(r => setTimeout(r, time));
    }

    async initPuppeter()
    {

        this.browser = await puppeteer.launch({
            headless: this.debag,
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

    async go()
    {
        try{

            await  this.initPuppeter()

            await this.page.goto(this.bazeUrl, {waitUntil: 'networkidle0'})
            const img = await this.getImgUrl('img[draggable="false"]')
            const targToDownload = img[0]


            if(!targToDownload){
                    throw new Error('body image url is not defined')
            }

                const saveImg = path.resolve(__dirname,'assets','imgs','result',`${ Date.now()}.jpg`)
                const tagetPic = path.resolve(__dirname,'assets','imgs',`body${path.extname(targToDownload)}`)

                await this.download(targToDownload,tagetPic)

               const pazzleTargetPosition = await  this.findPazzleTarget(tagetPic,saveImg)


            console.log({targToDownload,pazzleTargetPosition})

            await this.delay(4000)
            const origin = await this.page.$('img[class="captcha_verify_img_slide react-draggable sc-gZMcBi AJYeO"]')
            const ob = await origin.boundingBox()

            const destination = await this.page.$('div[class="captcha_verify_img--wrapper sc-dnqmqq kOYoOt"]')
            const db = await destination.boundingBox()



            console.log(`Dragging from ${ob.x + ob.width / 2}, ${ob.y + ob.height / 2}`)
            await this.page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2)
            await this.page.mouse.down()

            console.log(`Dropping at`)
            await this.page.mouse.move( (ob.x + ob.width / 2) + 80, ob.y + ob.height / 2)
            await this.page.mouse.up()



        }catch (e) {
            console.error(e)
        }

    }




}

const ht = new HfcC(false,'mobile')

ht.go()