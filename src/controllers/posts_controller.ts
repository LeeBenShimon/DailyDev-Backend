import postsModel, { IPost } from "../models/posts_model";
import createController from "./base_controller";

const postsController = createController<IPost>(postsModel);
export default postsController;
