import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { UserEditsFood } from "../entity/UserEditsFood"
import axios from "axios"
import { Channel } from "amqplib"
import "dotenv/config"
const multer = require('multer');
const path = require('path');
const FormData = require('form-data');
import * as fs from 'fs';
import { User } from "../entity/User"
import { FoodLocal } from "../entity/FoodLocal"
import { FoodLocalController } from "./FoodLocalController"

axios.defaults.baseURL = "https://world.openfoodfacts.org/"

export class UserEditsFoodController {

    private userEditsFoodRepository = AppDataSource.getRepository(UserEditsFood)
    private userRepository = AppDataSource.getRepository(User)
    private foodLocalRepository = AppDataSource.getRepository(FoodLocal)
    private foodLocalController = new FoodLocalController

    private storage = multer.diskStorage({
        
        destination: (req, file, cb) => {
            fs.mkdirSync('uploads/' + req.body.imagesFolder, { recursive: true });
            cb(null, 'uploads/' + req.body.imagesFolder); // Destination folder where the files will be stored
        },
        filename: (req, file, cb) => {
            const extension = path.extname(file.originalname);
            cb(null, `${file.fieldname}${extension}`);
        }
    });

    private deleteFolder(folderName: string){
        const folderPath = path.join('uploads', folderName);

        if (fs.existsSync(folderPath)) {
            // Delete all files in the folder
            const files = fs.readdirSync(folderPath);
            files.forEach((file) => {
                const filePath = path.join(folderPath, file);
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath); // Remove file
                }
            });

            // Now that the folder is empty, remove the folder
            fs.rmdirSync(folderPath); // Remove the folder
            console.log(`Folder ${folderName} and its contents have been deleted.`);
        } else {
            console.log(`Folder ${folderName} does not exist.`);
        }
    }

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
    
            console.log('Upload successful');
        } catch (error) {
            console.error('Error uploading image');
        }
    }
    

    async all(req: Request, res: Response,) {
        const { u, f } = req.query
        const onlyAccepted = req.query.a === "true"
        const onlyPendingCount = req.query.pendingcount === "true"
        const relations = ["foodLocal", "user", 
            "foodLocal.foodHasAllergen", "foodLocal.foodHasAdditive",
            "foodLocal.foodHasAllergen.allergen", "foodLocal.foodHasAdditive.additive"
        ]

        if (onlyPendingCount) {
            const count = await this.userEditsFoodRepository.count({
                where: { state: "pending" },
            });
            return { pendingCount: count };
        }

        if (u) {
            if (typeof u !== 'string'){
                res.status(400)
                return { message: 'Parámetro inválido.' }
            }
            if (onlyAccepted){
                return this.userEditsFoodRepository.find({where: {idUser: u, state: "accepted"}, order: {createdAt: "DESC"}, relations})
            }
            return this.userEditsFoodRepository.find({where: {idUser: u}, order: {createdAt: "DESC"}, relations})
        }
        if (f) {
            if (typeof f !== 'string'){
                res.status(400)
                return { message: 'Parámetro inválido.' }
            }
            if (onlyAccepted){
                return this.userEditsFoodRepository.find({where: {idFood: f, state: "accepted"}, order: {createdAt: "DESC"}, relations})
            }
            return this.userEditsFoodRepository.find({where: {idFood: f}, order: {createdAt: "DESC"}, relations})
        }
        return this.userEditsFoodRepository.find({order: {createdAt: "DESC"}, relations})
    }

    async one(id:string, response: Response) {
        const relations = ["foodLocal", "user", "foodLocal.foodHasAllergen", "foodLocal.foodHasAdditive"]
        const userEditsFood = await this.userEditsFoodRepository.findOne({
            where: { id },
            relations
        })

        if (!userEditsFood) {
            return []
        }
        return userEditsFood
    }

    async save(req: Request, res: Response, next: NextFunction, channel: Channel) {
        const {foodData, idFood, idUser, ...submissionData} = req.body
        if (!idFood || !idUser){
            res.status(400);
            throw new Error("Error: formato de id inválido");
        }
        console.log("hola")
        const parsedData = JSON.parse(foodData)
        const user = await this.userRepository.findOne({where: {id: idUser}})
        const foodLocal = await this.foodLocalRepository.findOne({where: {id: idFood}})
        const newSubmission: Partial<UserEditsFood> = {
            ...submissionData, // Other fields for the submission
            foodData: parsedData,
            idUser, // Always include the user ID
            idFood, // Always include the food ID
        };
        
        // Add references to existing entities conditionally
        if (user) {
            newSubmission.user = user; // Add user relationship if it exists
        }
        
        if (foodLocal) {
            newSubmission.foodLocal = foodLocal; // Add foodLocal relationship if it exists
        }
        await this.userEditsFoodRepository.save(newSubmission)
        .then(async result => {
            console.log(result)
            const edit = await this.one(result.id, res) as UserEditsFood
            console.log("THIS WAS THE EDIT: ", edit)
            if (edit.state === "accepted"){
                let infoSent = await this.send(edit.foodData, edit.type, res)  
                let hasLocalAllergens = true
                let hasLocalAdditives = true
                const updatedFood = await this.foodLocalController.save({product: edit.foodData, hasLocalAdditives, hasLocalAllergens})
                console.log("2")
                const fullFood = await this.foodLocalController.one(updatedFood.id, res)
                console.log("THIS HOW THE FOOD ENDED UP: ", fullFood)
                channel.publish("FoodEdit", "food-local.save", Buffer.from(JSON.stringify(fullFood)))
            }
            res.send(result)
        })
        .catch(error =>{
            res.send(error)
        })
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
                console.log("enviado")
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
        let updated = await this.userEditsFoodRepository.update(id, data)
        if (updated.affected===1){
            let submission = await this.userEditsFoodRepository.findOneBy({id})
            if (data.state === "accepted"){
                let infoSent = await this.send(submission.foodData, submission.type, response)  
                if (submission.imagesFolder){
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
                        console.log("4")
                        console.log(`Folder does not exist: ${imagesFolderPath}`);
                    }
                }
                
            }
            console.log(submission)
            return submission  
        }
        else{
            response.status(400);
            throw new Error("Error al actualizar el aporte");
        }
    }

    async remove(request: Request, response: Response) {
        const { id } = request.params
        if (!id || id===""){
            response.status(400)
            return {message: "Error: id inválida"}
        }
        const onlyImages = request.query.onlyimages === "true"
        let userEditsFoodToRemove = await this.userEditsFoodRepository.findOneBy({ id })
        if (onlyImages && userEditsFoodToRemove.imagesFolder){
            this.deleteFolder(userEditsFoodToRemove.imagesFolder)
            return this.userEditsFoodRepository.update(id, {imagesFolder: null})
        }
        if (!userEditsFoodToRemove) {
            response.status(404)
            return {message: "Error: registro no existe"}
        }
        return this.userEditsFoodRepository.remove(userEditsFoodToRemove)
         
    }

    async uploadImage(req:Request, res: Response){
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