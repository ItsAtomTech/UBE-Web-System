from flask import render_template, Flask
from flask_mail import Mail, Message


def mailing(mseg, type, rcpt):

    app = Flask('__main__')
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USERNAME'] = "smptmailsender@gmail.com"
    app.config['MAIL_PASSWORD'] = 'ooxwjlqqvinyzccx'
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False

    mail = Mail(app)

    msg = Message(subject='Account Control - Webapp', sender='smptmailsender@gmail.com', recipients=[rcpt])

    if type == 'confirm':
      msg.html = render_template("mails/email_confirm.html", mseg=mseg)
    elif type == 'pass_code':
        msg.html = render_template("mails/pass_code.html", mseg=mseg)
    elif type == 'pass_recover':
        msg.html = render_template("mails/pass_recover.html", mseg=mseg)
    mail.send(msg)

    return "-"


