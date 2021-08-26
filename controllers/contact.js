const dotenv = require('dotenv');
const mailer = require('../lib/mailer');

dotenv.config({ path: '.env' });
/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = (req, res) => {
  const unknownUser = !(req.user);
  res.render('contact', {
    title: 'Contact',
    unknownUser,
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = (req, res) => {
  if (!req.user) {
    req.flash('errors', { msg: 'You must be logged in to submit feedback' });
    return res.redirect('/contact');
  }

  const senderName = req.user.profile.name || '';
  const senderEmail = req.user.email;
  const sender = `${senderName} <${senderEmail}>`;
  const receiver = process.env.XINNEY_EMAIL;
  const subject = 'Query Form | Xinney Nepal';
  const text = req.body.message;
  return mailer.sendCustomEmail(receiver, subject, text, sender)
    .then(() => {
      req.flash('success', { msg: 'Email has been sent successfully!' });
      res.redirect('/contact');
    })
    .catch((err) => {
      console.log(err);
      req.flash('errors', { msg: "Couldn't send!! Try again later" });
      res.redirect('/');
    });
};
