import express from "express";
import User from "../models/User";
import { Error } from "mongoose";
import crypto from "crypto";
import bcrypt from 'bcrypt'

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      token: crypto.randomUUID(),
    });

    await user.save();
    return res.send(user);

  } catch (error) {
    if (error instanceof Error.ValidationError) {
      return res.status(400).send(error);
    }
    return next(error);
  }
});

usersRouter.post("/sessions", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  if (!user) {
    return res.status(400).send({ error: "Username not found" });
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);

  if (!isMatch) {
    return res.status(400).send({ error: "Password is wrong" });
  }

  user.token = crypto.randomUUID();
  await user.save();

  return res.send({ message: "Username and password correct!", user });
});

export default usersRouter;
