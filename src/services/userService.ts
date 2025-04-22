import User, {UserDocument} from "../models/User"; // Your Mongoose User model
import { generateToken } from "../utils/jwt";
import { hashPassword, matchPassword } from "../utils/password"
import { sanitizeFields } from "../utils/security";
import { z } from "zod";

 export interface UserSignupData {
  username: string;
  password: string;
  email: string;
}

 export interface UserLoginData {
  email: string;
  password: string;
}

interface updateUserData {
  username?: string;
  password?: string;
}

interface DeleteUserResponse {
  message: string;
}

const bodySchema = z.object({
  username: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().trim().min(6),
});

const updateSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().trim().min(6)
})
export async function signupUser(data: UserSignupData): Promise<Partial<UserDocument>> {
  const parsedBody = bodySchema.safeParse(data);
  if (!parsedBody.success) {
    throw new Error("Invalid request body");
  }
  const body = parsedBody.data;
  const { username, email, password } = body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);
  //instance of the user model
  const user = new User({
    username: username,
    email: email,
    password: hashedPassword, 
    blogs: []
  });

  const savedUser = await user.save();
  const plainUser = savedUser.toObject();
  const token = generateToken(plainUser)
  savedUser.token = token
  await savedUser.save()

  return sanitizeFields(savedUser.toObject()); 
}

export async function loginUser(data: UserLoginData): 
Promise<Partial<UserDocument>>{
  if(!data.email) throw new Error ("Email must be provided");
  if(!data.password) throw new Error ("Password must be provided");

  const user = await User.findOne({email: data.email})
  if(!user){
    throw new Error ("User does not exist")
  }

const match = await matchPassword(data.password, user.password);
if(!match) throw new Error("Wrong password entered")

  user.token = await generateToken(user);
  return sanitizeFields(user.toObject())
}

export async function getUserByEmail(email: string):
Promise<Partial<UserDocument>>{

  const user = await User.findOne({email: email});
  if(!user) throw new Error ("Email does not exist")

    return sanitizeFields(user.toObject())
}

export async function updateUserInfo(data: Partial<updateUserData>, email: string):
Promise<Partial<UserDocument>>{

  const parseData = updateSchema.safeParse(data);
  if(!parseData.success) {
    throw new Error ("Invalid update data: " + parseData.error.message)
  }

  const user = await User.findOne({email})
if (!user) throw new Error("No user with this email id")

  if (data.username) {
    user.username = data.username
  }

  if (data.password){
    try{
      user.password = await hashPassword(data.password)
    }
    catch(error){
      console.error("Password hashing failed:",error)
      throw new Error("Failed to hash password")
    }
  }
  const updatedUser = await user.save()
  return sanitizeFields(updatedUser.toObject())
}

export async function deleteUser(email:string):
Promise<DeleteUserResponse> {
  const user = await User.findOneAndDelete({email});
  if(!user){
    throw new Error("User not found")
  }

  
  return {message: "User successfully deleted"}
}