import Joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db from './dbController.js';
import { ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

export async function signUp(req, res) {
    const { name, email, password } = req.body;

    // SCHEMA
    const userSchema = Joi.object({
        'name': Joi.string().alphanum().min(1).required(),
        'email': Joi.string().min(1).required(),
        'password': Joi.string().alphanum().min(1).required()
    });

    if (!name || !email || !password) {
        return res.sendStatus(422);
    }

    try {
        const user = { name, email, password };
        const validation = userSchema.validateAsync(user, { abortEarly: false });
        if (validation.error) {
            return res.sendStatus(422);
        }

        const userExist = await db.collection('users').findOne({ email });
        if (userExist) {
            return res.sendStatus(404);
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

    // SCHEMA
    const userSchema = Joi.object({
        'email': Joi.string().min(1).required(),
        'password': Joi.string().min(1).required()
    });

    if (!email || !password) {
        return res.sendStatus(422);
    }

    const validation = userSchema.validateAsync({ email, password });
    if (validation.error) {
        return res.sendStatus(407);
    }

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.sendStatus(404);
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return res.sendStatus(402);
        }

        const token = uuid();
        const sessionCollection = db.collection('sessions');
        const session = await sessionCollection.findOne({ userId: new ObjectId(user._id) });
        if (session) {
            await sessionCollection.updateOne({ _id: session._id }, { $set: { token } });
            return res.sendStatus(203);
        }

        await sessionCollection.insertOne({ userId: user._id, token });
        return res.sendStatus(201);
    } catch (e) {
        return res.status(500).send(e.message);
    }
}