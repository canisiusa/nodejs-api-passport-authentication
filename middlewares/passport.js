var localStrategy = require('passport-local').Strategy;
const userRepo = require('../repositories/userRepo');
const bcrypt = require('bcryptjs');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const config = require('../helpers/config.json');


module.exports = function (passport) {
  passport.use('login', new localStrategy({ usernameField: 'email', passwordField: 'password' }, (email, password, done) => {
    userRepo.getUserByEmail(email).then(user => {
      if (user === null || !user) {
        return done(null, false, { message: "User Doesn't Exists.." });
      } else if (!user.isVerified) {
        return done(null, false, { message: "Veuillez verifier votre mail pour valider votre compte" });
      }
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          return done(null, false);
        }
        if (!match) {
          return done(null, false, { message: "Le mot de passe ne correspond pas" });
        }
        if (match) {
          return done(null, user, { message: 'Logged in Successfully' });
        }
      });
    }).catch(error => {
      return done(error);
    })
  }));

  passport.use(
    new JWTstrategy(
      {
        secretOrKey: config.secret,
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
      },
      async (token, done) => {
        try {
          return done(null, token);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}
// ---------------
// end of autentication statregy