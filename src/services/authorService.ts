import User from "../models/User";
import { Author, AuthorDocument} from "../models/Author"
export class AuthorService{
    async createAuthorService(name: string, userId:string, bio: string): Promise<AuthorDocument>{
        const user = await User.findById(userId);
        if(!user){
throw new Error("User doesn't exist")
    }
    const author = new Author({
name,
user: user._id,
bio,
numberOfPublications:0
        })

    const savedAuthor = await author.save()
        return savedAuthor}

        async getAuthor(id: string): Promise<AuthorDocument | null> {
            const author = await Author.findById(id).populate("user");
return author
        }

        async getAuthors(): Promise<AuthorDocument[]>{
const authors = await Author.find({}).populate("user");
return authors
        }
}

