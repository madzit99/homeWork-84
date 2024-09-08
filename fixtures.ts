import mongoose from "mongoose";
import config from "./config";
import User from "./models/User";
import Task from "./models/Task";

const dropCollection = async (
  db: mongoose.Connection,
  collectionName: string
) => {
  try {
    await db.dropCollection(collectionName);
  } catch (e) {
    console.log(`Collection ${collectionName} was missing, skipping drop...`);
  }
};

const run = async () => {
  await mongoose.connect(config.database);
  const db = mongoose.connection;

  const collections = ["users", "tasks"];

  for (const collectionName of collections) {
    await dropCollection(db, collectionName);
  }

  const [Artem, Amir] = await User.create(
    {
      username: "Артём",
      password: "123321",
      token: crypto.randomUUID(),
    },
    {
      username: "Амир",
      password: "321123",
      token: crypto.randomUUID(),
    }
  );

  await Task.create(
    {
      user: Artem,
      title: "Подмести улицу",
      description: "Подмести улицу веником",
      status: "new",
    },
    {
      user: Amir,
      title: "Сварить кофе",
      description: "Сварить кофе в кофемашине",
      status: "new",
    }
  );

  await db.close();
};

void run();
