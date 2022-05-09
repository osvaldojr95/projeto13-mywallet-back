import db from './dbController.js';
import { ObjectId } from 'mongodb';
import dayjs from 'dayjs';

export async function addBalance(req, res) {
    const { operation } = req.query;
    const { name, value } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '').trim();

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return res.sendStatus(401);
        }

        const user = await db.collection('users').findOne({ _id: new ObjectId(session.userId) });
        if (!user) {
            return res.sendStatus(404);
        }

        const transaction = { name, value, 'operation': (operation === 'true') };
        await db.collection('balance').insertOne({ 'userId': user._id, ...transaction, data: dayjs(Date.now()).format("DD/MM") });
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
            return res.sendStatus(401);
        }

        const user = await db.collection('users').findOne({ _id: new ObjectId(session.userId) });
        if (!user) {
            return res.sendStatus(404);
        }

        const balances = await db.collection('balance').find({ userId: new ObjectId(user._id) }).toArray();
        return res.status(200).send([...balances].map((cash) => {
            return { 'id': cash._id, 'name': cash.name, 'value': cash.value, 'operation': cash.operation, 'data': cash.data }
        }));
    } catch (e) {
        return res.sendStatus(500);
    }
}

export async function updateBalance(req, res) {
    const { id } = req.params;
    const { value, name } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '').trim();

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return res.sendStatus(401);
        }

        const user = await db.collection('users').findOne({ _id: session.userId });
        if (!user) {
            return res.sendStatus(404);
        }

        const balanceCollection = db.collection('balance');
        const cash = await balanceCollection.findOne({ _id: new ObjectId(id) });
        if (!cash) {
            return res.sendStatus(404);
        }

        await balanceCollection.updateMany({ _id: cash._id }, { $set: { value, name } });
        return res.sendStatus(200);
    } catch (e) {
        return res.status(500).send(e.message);
    }
}

export async function removeBalance(req, res) {
    const { id } = req.params;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '').trim();

    if (!id || !token) {
        return res.sendStatus(422);
    }

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return res.sendStatus(401);
        }

        const user = await db.collection('users').findOne({ _id: session.userId });
        if (!user) {
            return res.sendStatus(404);
        }

        const balanceCollection = db.collection('balance');
        const cash = await balanceCollection.findOne({ _id: new ObjectId(id) });
        if (!cash) {
            return res.sendStatus(404);
        }

        await balanceCollection.deleteOne({ _id: cash._id });
        return res.sendStatus(200);
    } catch (e) {
        return res.status(500).send(e.message);
    }
}