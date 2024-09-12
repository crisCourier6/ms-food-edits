import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { UserEditsFood } from "../entity/UserEditsFood"
import axios from "axios"
import "dotenv/config"
const multer = require('multer');
const path = require('path');
import * as fs from 'fs';

axios.defaults.baseURL = "https://world.openfoodfacts.net/"

export class UserEditsFoodController {

    private userEditsFoodRepository = AppDataSource.getRepository(UserEditsFood)

    private storage = multer.diskStorage({
        
        destination: (req, file, cb) => {
            console.log(req.body)
            fs.mkdirSync('uploads/' + req.body.imagesFolder, { recursive: true });
            cb(null, 'uploads/' + req.body.imagesFolder); // Destination folder where the files will be stored
        },
        filename: (req, file, cb) => {
            const extension = path.extname(file.originalname);
            cb(null, `${file.fieldname}${extension}`);
        }
    });

    public upload = multer({
        storage: this.storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
        fileFilter: (req, file, cb) => {
            const filetypes = /jpeg|jpg|png|gif/;
            const mimetype = filetypes.test(file.mimetype);
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
            if (mimetype && extname) {
                return cb(null, true);
            }
            cb(new Error('Invalid file type. Only JPEG, PNG, and GIF files are allowed.'));
        }
    });

    async all(response: Response,) {
        return this.userEditsFoodRepository.find()
    }

    async one(id:string, response: Response) {
        const userEditsFood = await this.userEditsFoodRepository.findOne({
            where: { id }
        })

        if (!userEditsFood) {
            return []
        }
        return userEditsFood
    }

    async save(req: Request, res: Response) {
        const submission = await this.userEditsFoodRepository.save(req.body)
        console.log(submission)
        if (req.files) {
            res.status(200).json({
                message: 'File uploaded successfully',
                fileName: req.files.filename,
                filePath: `/uploads/${req.files.filename}`
            });
        } else {
            res.status(400).json({ message: 'No file uploaded' });
        }
    }

    async send(foodData: any, type:string, res: Response){
        let data = {...foodData}
        delete data.id
        
        if (type=="new"){
            console.log("new")
            try{
                let response = await axios({
                    method: "GET",
                    url: "cgi/product_jqm2.pl",
                    params: {
                        ...foodData,
                        code: foodData.id,
                        ingredients_lc: "es"
                    }
                })
                console.log(response)
                return response.data
            } 
            catch (error){
                console.log(error)
                res.status(500)
                return []
            }
        }
        else if (type=="edit"){
            console.log("edit")
            try{
                let response = await axios({
                    method: "GET",
                    url: "cgi/product_jqm2.pl",
                    params: 
                    {
                        ...data,
                        // user_id: process.env.OFF_USER,
                        // password: process.env.OFF_PASS,
                        code: foodData.id,
                        ingredients_lc: "es"
                    }
            })
                console.log(response)
                return response.data
            } 
            catch (error){
                console.log(error)
                res.status(500)
                return []
            }
        }
        
    }

    async update(id: string, data: any, response: Response) {
        let newData = data
        if (data.foodData){
            let foodDataString = JSON.stringify(data.foodData)
            newData = {...data, foodData: foodDataString}
        }
        let updated = await this.userEditsFoodRepository.update(id, newData)
        if (updated.affected==1 && data.state == "accepted"){
            let submission = await this.userEditsFoodRepository.findOneBy({id})
            return this.send(JSON.parse(submission.foodData), submission.type, response)          
        }
        else{
            return updated
        }
    }

    async remove(id: string, response: Response) {

        let userEditsFoodToRemove = await this.userEditsFoodRepository.findOneBy({ id })

        if (!userEditsFoodToRemove) {
            return []
        }

        return this.userEditsFoodRepository.remove(userEditsFoodToRemove)
         
    }

    async uploadImage(req:Request, res: Response){
        console.log(req.body)
        console.log(req.files)
        // If no error, file was uploaded successfully
        if (req.files) {
            res.status(200).json({
                message: 'File uploaded successfully',
                fileName: req.files.filename,
                filePath: `/uploads/${req.files.filename}`
            });
        } else {
            res.status(400).json({ message: 'No file uploaded' });
        }
    }

}