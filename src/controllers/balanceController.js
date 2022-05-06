import Joi from 'joi';
import db from './dbController.js';
import { ObjectId } from 'mongodb';

export async function addBalance(req, res) {
    const { operation } = req.query;
    const { name, value } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '').trim();

    // SCHEMA
    const balanceSchema = Joi.object({
        'name': Joi.string().alphanum().min(1).required(),
        'value': Joi.number().positive().required(),
        'operation': Joi.boolean().required()
    });

    if (!name || !value || !token) {
        return res.sendStatus(422);
    }
    const transaction = { name, value, 'operation': (operation === 'true') };

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return res.sendStatus(404);
        }

        const user = await db.collection('users').findOne({ _id: new ObjectId(session.userId) });
        if (!user) {
            return res.sendStatus(409);
        }

        const validation = balanceSchema.validateAsync(transaction, { abortEarly: false });
        if (validation.error) {
            return res.sendStatus(422);
        }

        await db.collection('balance').insertOne({ 'userId': user._id, ...transaction });
        return res.sendStatus(201);
    } catch (e) {
        return res.sendStatus(500);
    }
}

export async function listBalance(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '').trim();

    if (!token) {
        return res.sendStatus(422);
    }

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return res.sendStatus(404);
        }

        const user = await db.collection('users').findOne({ _id: new ObjectId(session.userId) });
        if (!user) {
            return res.sendStatus(409);
        }

        const balances = await db.collection('balance').find({ userId: new ObjectId(user._id) }).toArray();
        return res.status(201).send([...balances].map((cash) => {
            return { 'id': cash._id, 'name': cash.name, 'value': cash.value, 'operation': cash.operation }
        }));
    } catch (e) {
        return res.sendStatus(500);
    }
}

export async function updateBalance(req, res) {
    const { id } = req.params;
    const { value } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '').trim();

    // SCHEMA
    const valueSchema = Joi.number().positive().required();

    if (!id || !value || !token) {
        return res.sendStatus(422);
    }

    const validation = valueSchema.validateAsync(value, { abortEarly: false });
    if (validation.error) {
        return res.sendStatus(422);
    }

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return res.sendStatus(404);
        }

        const user = await db.collection('users').findOne({ _id: session.userId });
        if (!user) {
            return res.sendStatus(409);
        }

        const balanceCollection = db.collection('balance');
        const cash = await balanceCollection.findOne({ _id: new ObjectId(id) });
        if (!cash) {
            return res.sendStatus(410);
        }

        await balanceCollection.updateOne({ _id: cash._id }, { $set: { value } });
        return res.sendStatus(201);
    } catch (e) {
        return res.status(500).send(e.message);
    }
}