from __future__ import absolute_import, unicode_literals
import logging
import os
from urllib.parse import urljoin

from django.utils import timezone
from django.template.loader import render_to_string
from django.contrib.auth.models import User
from django.conf import settings

from lib.sqlalchemy_wrapper import DBBase

from common.notify import Notify
from userquery.models import Job


class CreateTableAs:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger('userquery create_table_as')

    def create_table_by_job_id(self, job_id, user_id, table_name, schema=None, timeout=None):
        self.logger.debug("CreateTableAs job_id: %s" % job_id)

        db = DBBase('catalog')
        q = Job.objects.get(pk=job_id)
        q.job_status = 'rn'

        user = User.objects.get(pk=user_id)
        try:
            self.notify_by_email_start(user, job_id, table_name)

            # create table
            db.create_table_raw_sql(table_name, q.sql_sentence, schema=schema, timeout=timeout)
            q.job_status = 'ok'

            self.notify_by_email_finish(user, q)
        except Exception as e:
            self.logger.debug("CreateTableAs Error: %s" % str(e))
            q.job_status = 'er'

            self.notify_user_export_failure(user, table_name, str(e))
        q.end_date_time = timezone.now()
        q.save()

    def notify_by_email_start(self, user, job_id, table_name):
        if user.email:
            self.logger.info("Sending mail notification.")
            subject = "UserQuery - The creation of your table is being processed"

            body = render_to_string("job_notification_start.html", {
                "username": user.username,
                "id_job": job_id,
                "table_name": table_name
            })

            Notify().send_email(subject, body, user.email)
        else:
            self.logger.info("The user don't have a registered email")

    def notify_by_email_finish(self, user, new_job):
        if user.email:
            self.logger.info("Sending mail notification.")
            host = settings.BASE_HOST
            url = urljoin(host, os.path.join("userquery_job/%s/" % str(new_job.pk)))

            subject = "The table creation is finished"

            body = render_to_string("job_notification_finish.html", {
                "username": user.username,
                "url": url,
                "table_name": new_job.table_name
            })

            Notify().send_email(subject, body, user.email)
        else:
            self.logger.info("The user don't have a registered email")

    def notify_user_export_failure(self, user, table_name, error_message):
        if user.email:
            self.logger.info("Sending mail notification FAILURE.")

            try:
                from_email = settings.EMAIL_NOTIFICATION
            except:
                raise Exception("The EMAIL_NOTIFICATION variable is not configured in settings.")

            subject = "The table creation failed"
            body = render_to_string("job_notification_error.html", {
                "username": user.username,
                "table_name": table_name,
                "error_message": error_message
            })

            Notify().send_email(subject, body, user.email)

        else:
            self.logger.info("The user don't have a registered email")
