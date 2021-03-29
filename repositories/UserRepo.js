const db = require('../models/index');

module.exports = {
  getAccount,
  getUserByEmail,
  getById,
  create,
  update,
  delete: _delete,
};


async function getById(id) {
  const account = await getAccount(id);
  return basicDetails(account);
}

async function create(params) {
  // validate
  if (await db.Account.findOne({ where: { email: params.email } })) {
    throw 'Email "' + params.email + '" is already registered';
  }

  const account = new db.Account(params);
  account.verified = Date.now();

  // hash password
  account.passwordHash = await hash(params.password);

  // save account
  await account.save();

  return basicDetails(account);
}

async function update(id, params) {
  const account = await getAccount(id);

  // validate (if email was changed)
  if (params.email && account.email !== params.email && await db.Account.findOne({ where: { email: params.email } })) {
    throw 'Email "' + params.email + '" is already taken';
  }

  // hash password if it was entered
  if (params.password) {
    params.passwordHash = await hash(params.password);
  }

  // copy params to account and save
  Object.assign(account, params);
  account.updated = Date.now();
  await account.save();

  return basicDetails(account);
}

async function _delete(id) {
  const account = await getAccount(id);
  await account.destroy();
}


async function getAccount(id) {
  const account = await db.User.findOne({
    where: {
      id: id
    },
    include: db.Role
  });
  
  if (!account) throw 'Account not found';
  return { ...basicDetails(account)};
}

// helper functions



function basicDetails(account) {
  const { id, avatar, firstName, lastName, fullName, email, Role , createdAt, updatedAt, isVerified } = account;
  const roleNames = [Role.name]
  return { id, avatar, firstName, lastName, fullName, email, roleNames, createdAt, updatedAt, isVerified };
}

async function getUserByEmail(email) {
  const user = await db.User.findOne({ where: { email } });
  return user;
}


