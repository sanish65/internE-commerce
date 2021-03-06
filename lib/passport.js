const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    const { referer: redirectTo } = req.session;
    if (redirectTo) {
      delete req.session.referer;
      return res.redirect(redirectTo);
    }
    return next();
  }
  req.session.referer = req.headers.referer;
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find((token) => token.kind === provider);
  if (token) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};

exports.isAuthRole = (...permittedRoles) => (req, res, next) => {
  if (req.user && permittedRoles.includes(req.user.usertype)) {
    next();
  } else {
    req.flash('errors', { msg: 'Access Denied' });
    return res.redirect('/');
  }
};
