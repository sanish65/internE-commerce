const { promisify } = require('util');
const crypto = require('crypto');
const dotenv = require('dotenv');
const passport = require('passport');
const Email = require('email-templates');

const randomBytesAsync = promisify(crypto.randomBytes);

const mailer = require('../lib/mailer');
const Order = require('../models/Order');
const User = require('../models/User');
const dropdown = require('../helpers/dropdown.json');
const { AuthUserStatus, AuthUserType } = require('../src/constants');

dotenv.config({ path: '.env' });

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login',
  });
};

const getPostAuthenticationRedirectPath = (authUserType) => {
  const redirectionPath = {
    [AuthUserType.admin]: '/admin/dashboard',
    [AuthUserType.customer]: '/customer/dashboard',
    [AuthUserType.moderator]: '/moderator/dashboard',
    [AuthUserType.investor]: '/investor/dashboard'
  };
  return redirectionPath[authUserType] || '/';
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/login');
    }
    if (user.status !== 'Active') {
      req.flash('errors', { msg: 'Your account is currently deactivated. You cannot log in at the moment' });
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }

      const { status, usertype } = req.user;
      if (status === AuthUserStatus.active) {
        req.flash('success', { msg: 'Success! You are logged in.' });
        res.redirect(getPostAuthenticationRedirectPath(usertype) || '/');
      }
      next();
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) console.log('Error : Failed to destroy the session during logout.', err);
    req.user = null;
    res.redirect('/');
  });
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res, next) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Signup'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('fname', 'First name must be alphabetical').isAlphanumeric().notEmpty();
  req.assert('lname', 'Last name must be alphabetical').isAlphanumeric().notEmpty();
  req.assert('dob', 'Please fill out this field').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(`/signup/${req.params.usertype}`);
  }
  let user;
  Order.find({}, (err, order) => {
    const orderedItem = [];
    for (let i = 0; i < order.length; i++) {
      if (order[i].userdetails.email === req.body.email) {
        for (let j = 0; j < order[i].products.length; j++) {
          const { paymentmethod } = order[i];
          const {
            productid, name, description, photos, caption,
            price, count, discount
          } = order[i].products[j];
          orderedItem.push({
            productid,
            productname: name,
            description,
            photos,
            caption,
            price: {
              costprice: price,
              quantity: count,
              discount,
              totalprice: price * count || 0
            },
            paymentmethod
          });
        }
      }
    }
    const {
      fname, lname, email, dob, password, usertype
    } = req.body;
    user = new User({
      userdetails: {
        firstname: fname.toUpperCase(),
        lastname: lname.toUpperCase(),
      },
      profile: {
        birthdate: dob,
      },
      email,
      password,
      usertype : 'customer',
      status: AuthUserStatus.active,
      ordereditem: orderedItem,
    });
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect(`/signup/${req.params.usertype}`);
    }
    user.save((err) => {
      if (err) { return next(err); }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const receiver = req.body.email;
        const subject = 'Welcome to Xinney';
        const userName = `${req.body.fname} ${req.body.lname}`;
        const emailBody = new Email();
        emailBody
          .render('../views/emails/email-signup.pug', {
            userName: userName.toUpperCase(),
          })
          .then((html) => {
            mailer.sendCustomEmail(receiver, subject, html);
          })
          .catch(console.error);
        req.flash('success', { msg: 'Success! You are registered.' });
        res.redirect(getPostAuthenticationRedirectPath(user.usertype) || '/');
      });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  const acc = req.url === '/account' ? 'admin' : 'client';
  if (acc === 'client') {
    res.render('account/clientprofile', {
      title: 'Client Account Management',
    });
  } else {
    res.render('account/profile', {
      title: 'Account Management',
    });
  }
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  const acc = req.url === '/account/profile' ? 'admin' : 'client';

  req.assert('email', 'Please enter a valid email address.').isEmail();
  if (req.body.phone) req.assert('phone', 'Phone number must be 10 characters long').len(10, 10);
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    if (acc === 'client') res.redirect('/clientaccount');
    else res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    const {
      email, profilename, gender, fname, lname,
      phone, location, nearby, city
    } = req.body;

    user.email = email || '';
    user.profile = {
      name: profilename || '',
      gender: gender || ''
    };
    user.userdetails = {
      firstname: fname || '',
      lastname: lname || '',
      phone: phone || ''
    };
    user.address = {
      location: location || '',
      nearby: nearby || '',
      city: city || ''
    };
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          if (acc === 'client') res.redirect('/clientaccount');
          else res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });

      if (acc === 'client') res.redirect('/clientaccount');
      else res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  const acc = req.url === '/account/password' ? 'admin' : 'client';
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    if (acc === 'client') res.redirect('/clientaccount');
    else res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Password has been changed.' });
      if (acc === 'client') res.redirect('/clientaccount');
      else res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.deleteOne({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset',
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = async (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  try {
    const user = await User.findOne({ passwordResetToken: req.params.token }).where('passwordResetExpires').gt(Date.now());
    if (!user) {
      req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
      return res.redirect('back');
    }

    user.password = req.body.password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.save();

    // email
    const { email, userdetails: { firstname, lastname } } = user;
    const username = (`${firstname} ${lastname}`).toUpperCase();
    const receiver = email;
    const subject = 'Password Reset Confirmation | Xinney Nepal';
    const text = `<p>Hello ${username},<br/> This is a confirmation that the password for your account for Xinney Nepal has just been changed.</p>`;

    try {
      await mailer.sendCustomEmail(receiver, subject, text);
      req.flash('success', { msg: 'Your password has been changed successfully! Please login to continue.' });
      return res.redirect('/login');
    } catch (err) {
      req.flash('errors',
        {
          msg: `Your password has been changed,
                however we were unable to send you a confirmation email. We will be looking into it shortly.`
        });
    }
  } catch (err) {
    req.flash('errors', { msg: `${err}` });
  }
  return res.redirect('/');
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password',
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = async (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(req.path);
  }

  try {
    const userEmail = req.body.email;

    let user = await User.findOne({ email: userEmail });
    if (!user) {
      req.flash('errors', { msg: 'Account with that email does not exist.' });
      return res.redirect(req.path);
    }

    if (user.status === AuthUserStatus.inactive) {
      req.flash('errors', { msg: 'Your account is currently deactivated. You cannot log in at the moment.' });
      return res.redirect('/login');
    }

    // set random token
    const randomToken = await randomBytesAsync(16).then((buf) => buf.toString('hex'));
    user.passwordResetToken = randomToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    user = user.save();

    // send email and redirect
    try {
      const receiver = userEmail;
      const subject = 'Reset Password | Xinney Nepal';
      const text = `<p>
        Hi there, <br/>
        You are receiving this email because you (or someone else) have requested the reset of the password for your account.
        Please click on the following link, or paste this into your browser to complete the process:
        <a href="${req.headers.referer}/reset/${randomToken}">${req.headers.referer}/reset/${randomToken}</a>
        If you did not request this, please ignore this email and your password will remain unchanged.
        This token will expire in an hour.
      </p>`;
      await mailer.sendCustomEmail(receiver, subject, text);

      req.flash('success', { msg: `An e-mail has been sent to ${user.email} to reset your password.` });
      return res.redirect('/login');
    } catch (err) {
      req.flash('errors', { msg: `Couldn't send password reset email to ${user.email}. Please try again later.` });
    }
  } catch (err) {
    req.flash('errors', { msg: `${err}` });
  }

  return res.redirect(req.path);
};

exports.userList = (_req, res) => {
  User.find({}, (err, result) => {
    if (err) throw err;
    const displayUser = [];
    for (let i = 0; i < result.length; i++) {
      const href = {};
      href.id = result[i]._id;
      href.name = `${result[i].userdetails.firstname} ${result[i].userdetails.lastname}`;
      href.email = result[i].email;
      href.usertype = result[i].usertype;
      href.dropdownUsertype = dropdown.usertype;
      displayUser.push(href);
    }
    res.render('account/userlist', {
      title: 'Create user type',
      items: displayUser,
    });
  });
};
exports.editUser = (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) {
      console.log(err);
      return err;
    }
    user.dropdownUsertype = dropdown.usertype;
    res.render('account/edituser', {
      title: 'Edit user',
      edituser: user
    });
  });
};
exports.updateUser = (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if (err) {
      return next(err);
    }
    const {
      fname, lname, email, phone, usertype, userstatus,
      profilename, gender, picture, location, nearby, city
    } = req.body;

    user.email = email;
    user.usertype = usertype;
    user.userdetails = {
      firstname: fname,
      lastname: lname,
      phone
    };
    user.profile = {
      name: profilename,
      gender,
      picture
    };
    user.status = userstatus === AuthUserStatus.active ? userstatus : AuthUserStatus.inactive;
    user.address = {
      location,
      nearby,
      city
    };
    user.save((err) => {
      if (err) {
        return next(err);
      }
      user.dropdownUsertype = dropdown.usertype;
      req.flash('success', { msg: 'User information has been updated successfully.' });
      res.redirect('/userlist');
    });
  });
};
exports.deleteUser = (req, res, next) => {
  User.deleteOne({ _id: req.params.id }, (err) => {
    if (err) { return next(err); }
    req.flash('info', { msg: 'The account has been deleted permanently.' });
    res.redirect('/userlist');
  });
};

exports.getCreateUser = (req, res, next) => {
  const { usertype } = dropdown;
  res.render('account/createuser', {
    title: 'Create User',
    usertype
  });
};

exports.postCreateUser = (req, res, next) => {
  req.assert('fname', 'First name must be alphabetical').isAlpha().notEmpty();
  req.assert('lname', 'Last name must be alphabetical').isAlpha().notEmpty();
  req.assert('usertype', 'Please fill out this field').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/createuser');
  }
  const {
    fname, lname, email, password, usertype
  } = req.body;
  const user = new User({
    userdetails: {
      firstname: fname.toUpperCase(),
      lastname: lname.toUpperCase(),
    },
    email,
    password,
    usertype,
    status: AuthUserStatus.active,
  });
  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/createuser');
    }
    user.save((err) => {
      if (err) { return next(err); }
      const receiver = email;
      const subject = 'Welcome to Xinney';
      const userName = `${fname} ${lname}`;
      const emailBody = new Email();
      emailBody
        .render('../views/emails/email-signup.pug', {
          userName: userName.toUpperCase(),
        })
        .then((html) => mailer.sendCustomEmail(receiver, subject, html))
        .catch(console.error);
      req.flash('success', { msg: 'You have successfully created new user' });
      res.redirect(`/${req.user.usertype}/dashboard`);
    });
  });
};
