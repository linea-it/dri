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
from userquery.models import Table


class CreateTableAs:
    def __init__(self, job_id, user_id, table_name, schema=None, timeout=None):
        self.table_name = table_name
        self.schema = schema
        self.timeout = timeout

        self.user = User.objects.get(pk=user_id)
        self.job = Job.objects.get(pk=job_id)

        # Get an instance of a logger
        self.logger = logging.getLogger('userquery create_table_as')

        # state variables
        self.is_table_successfully_created = False
        self.error_message = None

    def do_all(self):
        self._notify_by_email_start()
        self._update_job_status_before_table_creation()
        self._create_table_by_job_id()
        self._update_job_status_after_table_creation_attempt()
        self._send_notifications_by_email_after_table_creation_attempt()

    def _update_job_status_before_table_creation(self):
        self.job.job_status = 'rn'
        self.job.save()

    def _update_job_status_after_table_creation_attempt(self):
        if self.is_table_successfully_created:
            self.job.job_status = 'ok'
        else:
            self.job.job_status = 'er'

        self.job.end_date_time = timezone.now()
        self.job.save()

    def _send_notifications_by_email_after_table_creation_attempt(self):
        if self.is_table_successfully_created:
            self._notify_by_email_finish()
        else:
            self._notify_user_by_email_failure(self.error_message)

    def _create_table_by_job_id(self):
        self.logger.debug("_create_table_by_job_id - job_id: %s" % self.job.pk)

        db = DBBase('catalog')
        try:
            db.create_table_raw_sql(self.table_name, self.job.sql_sentence, schema=self.schema, timeout=self.timeout)
            self.is_table_successfully_created = True

            table = Table(table_name=self.table_name,
                          display_name=self.job.display_name,
                          owner=self.job.owner,
                          schema=self.schema)
            table.save()
        except Exception as e:
            self.error_message = str(e)
            self.logger.debug("CreateTableAs Error: %s" % self.error_message)

    def _notify_by_email_start(self):
        if self.user.email:
            self.logger.info("Sending mail notification.")
            subject = "UserQuery - The creation of your table is being processed"

            body = render_to_string("job_notification_start.html", {
                "username": self.user.username,
                "id_job": self.job.pk,
                "table_name": self.table_name
            })

            Notify().send_email(subject, body, self.user.email)
        else:
            self.logger.info("The user don't have a registered email")

    def _notify_by_email_finish(self):
        if self.user.email:
            self.logger.info("Sending mail notification.")
            host = settings.BASE_HOST
            url = urljoin(host, os.path.join("userquery_job/%s/" % str(self.job.pk)))

            subject = "The table creation is finished"

            body = render_to_string("job_notification_finish.html", {
                "username": self.user.username,
                "url": url,
                "table_name": self.table_name
            })

            Notify().send_email(subject, body, self.user.email)
        else:
            self.logger.info("The user don't have a registered email")

    def _notify_user_by_email_failure(self, error_message):
        if self.user.email:
            self.logger.info("Sending mail notification FAILURE.")

            try:
                from_email = settings.EMAIL_NOTIFICATION
            except:
                raise Exception("The EMAIL_NOTIFICATION variable is not configured in settings.")

            subject = "The table creation failed"
            body = render_to_string("job_notification_error.html", {
                "username": self.user.username,
                "table_name": self.table_name,
                "error_message": error_message
            })

            Notify().send_email(subject, body, self.user.email)

        else:
            self.logger.info("The user don't have a registered email")
