const { param, validationResult, checkSchema } = require('express-validator/check');

const User = require('../models/User');

const UserController = {};

UserController.validate = (method) => {
  switch (method) {
    case 'createUser': {
      return checkSchema({
        name: {
          in: ['body'],
          exists: {
            errorMessage: 'Name field is required',
          },
          isEmpty: {
            errorMessage: 'Name field cannot be empty',
            negated: true,
          },
          trim: true,
          escape: true,
          stripLow: true,
        },
        email: {
          in: ['body'],
          exists: {
            errorMessage: 'Email field is required',
          },
          isEmail: {
            errorMessage: 'Invalid Email',
          },
          custom: {
            options: (value) => {
              return User.find({email: value}).then(user => {
                if (user.length) {
                  return Promise.reject('Email already in use');
                }
              });
            }
          },
        },
      });
    }
    case 'getUser': {
      return [
        param('userId', 'Invalid userId')
          .isMongoId(),
      ];
    }
    case 'updateUser': {
      return checkSchema({
        userId: {
          in: ['params'],
          isMongoId: {
            errorMessage: 'Invalid userId',
          },
        },
        name: {
          in: ['body'],
          optional: true,
          trim: true,
          escape: true,
          stripLow: true,
          isEmpty: {
            errorMessage: 'Name field cannot be empty',
            negated: true,
          },
        },
        email: {
          in: ['body'],
          optional: true,
          isEmail: {
            errorMessage: 'Invalid Email',
          },
          custom: {
            options: (value) => {
              return User.find({email: value}).then(user => {
                if (user.length) {
                  return Promise.reject('Email already in use');
                }
              });
            },
          },
        },
        status: {
          in: ['body'],
          optional: true,
          isIn: {
            options: ['enabled', 'disabled'],
            errorMessage: `Status must be one of the following ['enabled', 'disabled']`,
          },
          isEmpty: {
            errorMessage: 'Name field cannot be empty',
            negated: true,
          },
        },
      });
    }
  }
}

UserController.createUser = (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).send({ errors: errors.array() })
  }

  const { name, email } = req.body;

  User.create({ name, email, status: 'enabled' })
    .then(user => res.status(200).send({ data: user }))
    .catch(err => res.status(500).send({
      errors: err,
      message: 'There was a problem creating the user.',
    }));
}

UserController.listUsers = (_, res) => {
  User.find({}, { password: 0 })
    .then((users) => res.status(200).send({ data: users }))
    .catch(err => res.status(500).send({
      errors: err,
      message: 'There was a problem finding the users.'
    }));
}

UserController.getUser = (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).send({ errors: errors.array() })
  }

  const { userId } = req.params;

  User.findById(userId, '-password')
    .then(user => {
      if (!user) {
        return res.status(404).send({
          errors: {
            location: 'params',
            param: 'userId',
            value: userId,
            msg: 'User not found',
          },
        })
      }

      return res.status(200).send({ data: user })
    })
    .catch(err => res.status(500).send({
      errors: err,
      message: 'There was a problem finding the users.'
    }))
}

UserController.updateUser = (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).send({ errors: errors.array() })
  }

  const { userId } = req.params;
  const toUpdate = req.body;


  User.findByIdAndUpdate(userId, toUpdate, { new: true })
    .then(user => {
      if (!user) {
        return res.status(404).send({
          errors: {
            location: 'params',
            param: 'userId',
            value: userId,
            msg: 'User not found',
          },
        });
      }

      return res.status(200).send({ data: user });
    })
    .catch(err => res.status(500).send({
      errors: err,
      message: 'There was a problem finding the users.'
    }))
}

module.exports = UserController;
