import Joi from "joi";

const userSchema = Joi.object({
    'name': Joi.string().alphanum().min(1),
    'email': Joi.string().min(1).required(),
    'password': Joi.string().min(1).required()
});

export async function signUpValidate(req, res, next) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.sendStatus(422);
    }

    const user = { name, email, password };
    const validation = userSchema.validate(user, { abortEarly: false });
    if (validation.error) {
        return res.sendStatus(422);
    }

    next();
}

export async function signInValidate(req, res, next) {
    const email = req.headers.user;
    const { password } = req.body;

    if (!email || !password) {
        return res.sendStatus(422);
    }

    const user = {email, password };
    const validation = userSchema.validate(user, { abortEarly: false });
    if (validation.error) {
        return res.sendStatus(422);
    }

    next();
}