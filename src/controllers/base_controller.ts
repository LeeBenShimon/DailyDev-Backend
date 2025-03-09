
import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
    model: Model<T>;
    constructor(model: Model<T>){
        this.model = model;
    }
        async create(req:Request, res:Response) {
        try{
            const comment=await this.model.create(req.body);
            res.status(201).send(comment);
        }catch (err){
            res.status(400);
            res.send(err); 
        }
    };

    async getAll(req: Request, res: Response) {
        const filter = { ...req.query };
        try {
          const data = await this.model.find(filter as Partial<T>);
          res.status(200).send(data);
        } catch (err) {
          res.status(400).send(err);
        }
    };

    async getById(req:Request, res:Response) {
        const IdFilter = req.params.id;
        try{
            if(IdFilter){
                const comments=await this.model.findById(IdFilter);
                res.status(200).send(comments);
                return;
            }
        }catch(err){
            res.status(400).send(err);
        }
    };


    async getPostId(req:Request, res:Response) {
        const PostIdFilter = req.query.postId;
        try{
            if(PostIdFilter){
                const comments=await this.model.find({postId:PostIdFilter});
                res.status(200).send(comments);
                return;
            }
        }catch(err){
            res.status(400).send(err);
        }
    };

    // async deleteById(req: Request, res: Response) {
    //     const id = req.params.id;
    //     try {
    //         await this.model.findByIdAndDelete(id);
    //         res.status(200);
    //     } catch (err) {
    //         res.status(400).send(err);
    //     }
    // };

    async deleteById(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const data = await this.model.findByIdAndDelete(id);
            if (!data) {
                res.status(400).send({ message: "Post not found" });
                return;
            }
            res.status(200).send(data);
        } catch (err) {
            res.status(400).send(err);
        }
    };


    async updateById(req:Request, res:Response) {
        const ID=req.params.id;
        const comment=req.body;
        try{
            const update=await this.model.findByIdAndUpdate(ID,comment,{new:true,runValidators: true});
            res.status(200).send(update);
        if (!update) {
            return res.status(400).send({ message: "Post not found" });
        }
        }
        catch(err){
            res.status(400).send(err);
        }
    };
}

const createController = <T>(model: Model<T>) => {
    return new BaseController(model);
};
export default createController;
