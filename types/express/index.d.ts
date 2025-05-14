import { UserDocument } from "../../src/models/User";
import { TokenPayload } from "../../src/auth/token";

declare global{
    namespace Express{
        interface Request{
user? : UserDocument,
tokenPayload?: TokenPayload
        }
    }
}
