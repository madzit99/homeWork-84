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

tasksRouter.put("/:id", auth, async (req: RequestWithUser, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send({ error: "Таск не найден!" });
    }

    if (task.user.toString() !== req.user?._id.toString()) {
      return res.status(403).send({ error: "У вас нет прав!" });
    }

    if (req.body.title) {
      task.title = req.body.title;
    }

    if (req.body.description) {
      task.description = req.body.description;
    }

    if (req.body.status) {
      task.status = req.body.status;
    }

    await task.save();

    return res.send(task);
  } catch (error) {
    return next(error);
  }
});

tasksRouter.delete("/:id", auth, async (req: RequestWithUser, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).send({ error: "Таск не найден!" });
    }
    if (task.user.toString() !== req.user?._id.toString()) {
      return res.status(403).send({ error: "У вас нет прав!" });
    }

    await Task.findByIdAndDelete(req.params.id);
    return res.send("Таск удален.");
  } catch (error) {
    return next(error);
  }
});

export default tasksRouter;
