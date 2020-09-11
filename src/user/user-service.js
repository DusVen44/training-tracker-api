const bcrypt = require('bcryptjs');
const REGEX_UPPER_LOWER_NUMBER = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[\S]+/;

const UserService = {
    validatePassword(password) {
        if (password.length < 8) {
            return 'Password must be longer than 8 characters';
        }
        if (password.length > 25) {
            return 'Password must be shorter than 26 characters';
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces';
        }
        if (!REGEX_UPPER_LOWER_NUMBER.test(password)) {
            return 'Password must include an uppercase letter, lowercase letter, and a number';
        }
        return null;
    },
    getAllUsers(knex) {
        return knex.select('*').from('users');
    },
    emailTaken(knex, email) {
        return knex
            .select('email')
            .from('users')
            .where({ email })
            .first()
            .then((user) => !!user)
    },
    usernameTaken(knex, username) {
        return knex 
            .select('*')
            .from('users')
            .where({ username })
            .first()
            .then((user) => !!user)
    },
    hashPassword(password) {
        return bcrypt.hash(password, 10);
    },
    insertUser(knex, newUser) {
        return knex
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(([user]) => user)
    }    
};

module.exports = UserService;