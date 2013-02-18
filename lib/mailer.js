var nodemailer = require('nodemailer'), 
    config = require('../config'), 
    mailer;


mailer = function (opts, fn) {

    var mailOpts, smtpTrans;

    // nodemailer configuration
    try {
        smtpTrans = nodemailer.createTransport('SMTP', {
            service: 'Gmail',
            auth: {
                user: config.email,
                pass: config.password
            }
        });
        mailer.close = function(cb) { smtpTrans.close(cb); }
    }
    catch (err) {
        fn('Nodemailer could not create Transport ' + err, '');
        return;
    }
    
    // mailing options    
    mailOpts = {
        from: opts.from,
        replyTo: opts.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.body
    };
    
    
    // Send maail
    try {    
        smtpTrans.sendMail(mailOpts, function (error, response) {
            //if sending fails
            if (error) {
            fn(true, error);
            }
            //Yay!! message sent
            else {
                fn(false, response.message);
                smtpTrans.close();
            }
        });
    }
    catch (err) {
        fn('Nodemailer could not send Mail ' + err, '');   
    }
};

module.exports = mailer;
