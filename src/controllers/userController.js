import Joi from 'joi';
import bcrypt from 'bcrypt';
import db from './dbController.js';
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