import Joi from "joi";

const balanceSchema = Joi.object({
    'name': Joi.string().alphanum().min(1).required(),
    'value': Joi.number().positive().required(),
    'operation': Joi.boolean()
});

export async function addValidate(req, res, next) {
    const { operation } = req.query;
    const { name, value } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '').trim();

    if (!name || !value || !token) {
        return res.sendStatus(422);
    }

    const transaction = { name, value, 'operation': (operation === 'true') };
    const validation = balanceSchema.validate(transaction, { abortEarly: false });
    if (validation.error) {
        return res.sendStatus(422);
    }

    next();
}

export async function updateValidate(req, res, next) {
    const { id } = req.params;
    const { name, value } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '').trim();

    if (!id || !value || !token) {
        return res.sendStatus(422);
    }

    const transaction = { name, value };
    console.log(transaction);
    const validation = balanceSchema.validate(transaction, { abortEarly: false });
    if (validation.error) {
        return res.sendStatus(422);
    }

    next();
}