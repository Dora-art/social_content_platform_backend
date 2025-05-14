import { UserDocument } from "../models/User";
import { TokenPayload } from "../auth/token";

declare global{
    namespace Express{
        interface Request{
user? : UserDocument,
tokenPayload?: TokenPayload
        }
    }
}