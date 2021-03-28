const config = require('../helpers/config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('../helpers/send-email');
const db = require('../models/index');

module.exports = {
  authenticate,
  refreshToken,
  revokeToken,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword
};


async function authenticate({ user, ipAddress }) {
  try {
    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens

    return {
     // ...basicDetails(user),
      jwtToken,
      refreshToken: refreshToken.token
    };
  } catch (error) {
    throw new Error(error)
  }

}

async function refreshToken({ account, token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);

  // replace old refresh token with a new one and save
  const newRefreshToken = generateRefreshToken(account, ipAddress);
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();
  await newRefreshToken.save();

  // generate new jwt
  const jwtToken = generateJwtToken(account);

  // return basic details and tokens
  return {
    jwtToken,
    refreshToken: newRefreshToken.token
  };
}

async function revokeToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);

  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
}

async function register(params, origin) {
  try {

    // validate
    if (await db.User.findOne({ where: { email: params.email } })) {
      // send already registered error in email to prevent account enumeration

      await sendAlreadyRegisteredEmail(params.email, origin).then(() => {
        return { message: 'Cette addresse mail est deja enregistrée', success: false }
      })
    }

    // create account object
    const account = new db.User(params);
    
    const { id } = await db.Role.findOne({ where: { name: 'READER' } })
    account.roleId = id
    account.verificationToken = randomTokenString();

    // hash password
    account.password = await hash(params.password);


    // save account
    await account.save();

    // grant member role to user


    // send email
    await sendVerificationEmail(account, origin).then(() => {
      return { message: 'Registration successful, please check your email for verification instructions', success: true }
    })
  } catch (error) {
    console.log(error)
  }
}

async function verifyEmail(token) {
  const account = await db.User.findOne({ where: { verificationToken: token } });

  if (!account) return {
    success: false,
    message: 'Ce compte n\'existe pas ou a déja été vérifié'
  };

  account.verified = Date.now();
  account.verificationToken = null;
  await account.save();
  return {
    success: true,
    data: 'Verification successful, you can now login'
  }
}

async function forgotPassword({ email }, origin) {
  const account = await db.User.findOne({ where: { email } });

  // always return ok response to prevent email enumeration
  if (!account) return;

  // create reset token that expires after 24 hours
  account.resetToken = randomTokenString();
  account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await account.save();

  // send email
  await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
  const account = await db.User.findOne({
    where: {
      resetToken: token,
      resetTokenExpires: { [Op.gt]: Date.now() }
    }
  });

  if (!account) throw 'Invalid token';

  return account;
}

async function resetPassword({ token, password }) {
  const account = await validateResetToken({ token });

  // update password and remove reset token
  account.password = await hash(password);
  account.passwordReset = Date.now();
  account.resetToken = null;
  await account.save();
}
//


// helper functions


async function getRefreshToken(token) {
  const refreshToken = await db.Refreshtoken.findOne({ where: { token } });
  console.log(refreshToken)
  if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
  return refreshToken;
}

async function hash(password) {
  return await bcrypt.hash(password, 10);
}

function generateJwtToken(account) {
  // create a jwt token containing the account id that expires in 15 minutes
  return jwt.sign({ id: account.id, email: account.email }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(account, ipAddress) {
  // create a refresh token that expires in 2 days
  return new db.Refreshtoken({
    userId: account.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress
  });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
  const { id, firstName, lastName, email, isVerified } = account;
  return { id, firstName, lastName, email, isVerified };
}

async function sendVerificationEmail(account, origin) {
  let message;
  // if (origin) {
  const verifyUrl = `${origin}/verify-email?token=${account.verificationToken}`;
  message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  /*  } else {
     message = `<p>Please use the below token to verify your email address with the <code>/verify-email</code> api route:</p>
                    <p><code>${account.verificationToken}</code></p>`;
   } */

  await sendEmail({
    to: account.email,
    subject: 'Sign-up Verification API - Verify Email',
    html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
  });
}

async function sendAlreadyRegisteredEmail(email, origin) {
  try {
    let message;
    message = `
    <p>Vous avez essayé de créer un compte avec une addresse mail déja enrégistré. Si 
    vous avec oublié votre mot de passe, veuillez <a href="${origin}/forgot-password">cliquer sur ce lien</a> pour changer votre mot de passe</p>
     `;

    await sendEmail({
      to: email,
      subject: 'Sign-up Verification API - Email Already Registered',
      text: 'Hello!',
      html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
  } catch (error) {
    throw new Error(error)
  }
}

async function sendPasswordResetEmail(account, origin) {
  let message;
  if (origin) {
    const resetUrl = `${origin}/reset-password?token=${account.resetToken}`;
    message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to reset your password with the <code>/reset-password</code> api route:</p>
                   <p><code>${account.resetToken}</code></p>`;
  }

  await sendEmail({
    to: account.email,
    subject: 'Sign-up Verification API - Reset Password',
    html: `<h4>Reset Password Email</h4>
               ${message}`
  });
}