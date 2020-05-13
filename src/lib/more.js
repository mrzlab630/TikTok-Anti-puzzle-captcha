/**
 *
 * by mrZ
 * Email: mrZ@mrZLab630pw
 * Date: 12.05.2020
 * Time: 13:17
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