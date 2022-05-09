import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db from './dbController.js';
import { ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

export async function signUp(req, res) {
    const { name, email, password } = req.body;
    const user = { name, email, password };

    try {
        const userExist = await db.collection('users').findOne({ email });
        if (userExist) {
            return res.sendStatus(409);
        }

        user.password = bcrypt.hashSync(password, parseInt(process.env.HASH));
        await db.collection('users').insertOne(user);
        return res.sendStatus(201);
    } catch (e) {
        return res.status(500).send(e.message);
    }
}

export async function signIn(req, res) {
    const email = req.headers.user;
    const { password } = req.body;

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.sendStatus(404);
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return res.sendStatus(401);
        }

        const token = uuid();
        const sessionCollection = db.collection('sessions');
        const session = await sessionCollection.findOne({ userId: new ObjectId(user._id) });
        if (session) {
            await sessionCollection.updateOne({ _id: session._id }, { $set: { token } });
            return res.status(200).send({ name: user.name, token });
        }

        await sessionCollection.insertOne({ userId: user._id, token });
        return res.status(201).send({ name: user.name, token });
    } catch (e) {
        return res.status(500).send(e.message);
    }
}

export async function signOut(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '').trim();

    if (!token) {
        return res.sendStatus(422);
    }

    try {
        const sessionCollection = db.collection('sessions');
        const session = await sessionCollection.findOne({ token });

        if (!session) {
            return res.sendStatus(401);
        }

        await sessionCollection.deleteOne({ _id: new ObjectId(session._id) });
        return res.sendStatus(200);
    } catch (e) {
        return res.status(500).send(e.message);
    }
}