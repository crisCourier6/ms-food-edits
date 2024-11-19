import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { UserEditsFood } from "../entity/UserEditsFood"
import axios from "axios"
import "dotenv/config"
const multer = require('multer');
const path = require('path');
const FormData = require('form-data');
import * as fs from 'fs';

axios.defaults.baseURL = "https://world.openfoodfacts.org/"

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

    async uploadImageToOFF(barcode, imagePath, imageField) {
        const url = 'cgi/product_image_upload.pl'; // Use test server
        const username = process.env.OFF_USER;
        const password = process.env.OFF_PASS;
        console.log(barcode, imagePath, imageField)
    
        // Create a FormData instance
    
        // Append the parameters
        const form = new FormData();
        form.append('code', barcode);
        form.append('imagefield', `${imageField}_es`);
        const imageFileName = `${imageField}_es.jpg`; // Example filename (adjust according to your actual file type)
        form.append(`imgupload_${imageField}_es`, fs.createReadStream(imagePath), {
            filename: imageFileName, // Explicitly pass the filename with barcode
            contentType: 'image/jpeg' // Set the content type explicitly if needed
        });
        console.log(form)
        // Append the image file
        try {
            const response = await axios.post(url, form, {
                auth: {
                    username,
                    password
                },
                headers: {
                    ...form.getHeaders() // Ensure headers are properly set for multipart/form-data
                }
            });
    
            console.log('Upload successful:', response.data);
        } catch (error) {
            console.error('Error uploading image:', error.response);
        }
    }
    

    async all(req: Request, res: Response,) {
        const { u, f } = req.query
        const onlyAccepted = req.query.a === "true"
        if (u) {
            if (typeof u !== 'string'){
                res.status(400)
                return { message: 'Parámetro inválido.' }
            }
            if (onlyAccepted){
                return this.userEditsFoodRepository.find({where: {idUser: u, state: "accepted"}, order: {createdAt: "DESC"}})
            }
            return this.userEditsFoodRepository.find({where: {idUser: u}, order: {createdAt: "DESC"}})
        }
        if (f) {
            if (typeof f !== 'string'){
                res.status(400)
                return { message: 'Parámetro inválido.' }
            }
            if (onlyAccepted){
                return this.userEditsFoodRepository.find({where: {idFood: f, state: "accepted"}, order: {createdAt: "DESC"}})
            }
            return this.userEditsFoodRepository.find({where: {idFood: f}, order: {createdAt: "DESC"}})
        }
        return this.userEditsFoodRepository.find({order: {createdAt: "DESC"}})
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
        console.log(req)
        const {foodData, ...newSubmission} = req.body
        const parsedData = JSON.parse(foodData)
        const submission = await this.userEditsFoodRepository.save({...newSubmission, foodData: parsedData})
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
                        login: process.env.OFF_USER,
                        password: process.env.OFF_PASS,
                        ...foodData,
                        code: foodData.id,
                        ingredients_lc: "es",
                        product_name_es: foodData.product_name,
                        ingredients_text: foodData.ingredients_text_es,
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
                        login: process.env.OFF_USER,
                        password: process.env.OFF_PASS,
                        code: foodData.id,
                        ingredients_text: foodData.ingredients_text_es,
                        ingredients_lc: "es",
                        product_name_es: foodData.product_name,
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
        console.log(data)
        let allGood = false
        if (data.state === "accepted"){
            let submission = await this.userEditsFoodRepository.findOneBy({id})
            let infoSent = await this.send(submission.foodData, submission.type, response)  
            let imagesFolderPath = path.join(__dirname, '../../uploads', submission.imagesFolder);
            if (fs.existsSync(imagesFolderPath)) {
                // Folder exists, proceed to send images to OpenFoodFacts
                const images = fs.readdirSync(imagesFolderPath);
                
                // Assuming you want to upload all images in the folder
                for (const image of images) {
                    const imageType = path.parse(image).name

                    if (['front', 'nutrition', 'ingredients'].includes(imageType)) {
                        // Construct the full image path
                        const imagePath = path.join(imagesFolderPath, image);
                        
                        // Call your function to upload the image
                        await this.uploadImageToOFF(submission.idFood, imagePath, imageType,);
                    }
                }
            } 
            else {
                console.log(`Folder does not exist: ${imagesFolderPath}`);
            }
            allGood = true
        }
        if (allGood){
            let updated = await this.userEditsFoodRepository.update(id, data)
            if (updated.affected===1){
                return this.userEditsFoodRepository.findOne({where: {id}})
            }
        }
        else{
            response.status(500)
            return {message: "error al actualizar aporte"}
        }
    }

    async remove(id: string, response: Response) {
        if (!id || id===""){
            response.status(400)
            return {message: "Error: id inválida"}
        }
        console.log(id)
        let userEditsFoodToRemove = await this.userEditsFoodRepository.findOneBy({ id })

        if (!userEditsFoodToRemove) {
            response.status(404)
            return {message: "Error: registro no existe"}
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