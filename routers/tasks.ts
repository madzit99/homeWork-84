import express from "express";
import auth, { RequestWithUser } from "../middleware/auth";
import Task from "../models/Task";
import mongoose from "mongoose";

const tasksRouter = express.Router();

tasksRouter.post("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const task = new Task({
      user: req.user?._id,
      title: req.body.title,
      description: req.body.description,
    });
    await task.save();

    return res.send(task);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }
    return next(error);
  }
});

tasksRouter.get("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user?._id }).populate(
      "user",
      "username"
    );
    return res.send(tasks);
  } catch (error) {
    return next(error);
  }
});

export default tasksRouter;
