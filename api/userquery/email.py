"""
    send mail with html template
"""
import logging

from django.template.loader import render_to_string
from common.notify import Notify

class Email:
    def __init__(self):
        self.logger = logging.getLogger('userquery')

    def send(self, data):
        self.logger.info("Sending mail by template %s" % data["template"])
        
        subject = "UserQuery - %s" % data["subject"]
        body = render_to_string(data["template"], data)
        Notify().send_email(subject, body, data["email"])
        