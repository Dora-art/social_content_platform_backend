import { Category, CategoryDocument } from "../models/Category";
import { NotFoundError } from "../utils/error";
import logger from "../config/logger";

export class CategoryService{

     
    async assignCategories(content: string): Promise<string[]>{
        try{
const categories: CategoryDocument[] = await Category.find({})
const matchedCategories : string[] = []

categories.forEach((category: CategoryDocument) => {
    const nameRegex = new RegExp(`\\b${category.name}\\b`, "i")
    
    if(nameRegex.test(content)){
        matchedCategories.push(category.id)
        return
    }

    if (category.desc){
        const descWords =
        category.desc.split(/\s+/).filter(word => word.length > 4)
      
       for(const word of descWords){
        const wordRegex = new RegExp(`\\b${word}\\b`, "i");
        if(wordRegex.test(content)){
            matchedCategories.push(category.id)
            return
        }
       }
    }
});
return matchedCategories
    }catch(error: unknown){
        logger.error("Failed to assign categories to client due to an internal error:", {originalErrorDetails: error, operation: "assignCategories"})
        throw error
    }
    }

    async createCategory(name: string, desc: string): Promise<CategoryDocument>{
return await Category.create({name,desc})
    }

    async getCategoryById(categoryId: string): Promise<CategoryDocument>{
    
        const category = await Category.findById(categoryId)
        if(!category){
            throw new NotFoundError("Category does not exist")
        }
        return category
    }

    async getAllCategories(): Promise<CategoryDocument[]>{
        return await Category.find({})
     
    }

   
}