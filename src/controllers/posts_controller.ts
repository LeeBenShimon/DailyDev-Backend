
import postModel, { iPost } from "../models/posts_model";
import createController from "./base_controller";

const postsController = createController<iPost>(postModel);


export default postsController;
