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
from product.models import Product
from coadd.models import Release

from .target_viewer import TargetViewer
from .email import Email

class CreateTableAs:
    def __init__(self, job_id, user_id, table_name, table_display_name, release_id, release_name, associate_target_viewer, task_id, schema=None):
        self.table_name = table_name
        self.table_display_name = table_display_name
        self.release_id = release_id
        self.release_name = release_name
        self.associate_target_viewer = associate_target_viewer
        self.schema = schema
        self.task_id = task_id
        
        self.user = User.objects.get(pk=user_id)
        self.job = Job.objects.get(pk=job_id)

        # Get an instance of a logger
        self.logger = logging.getLogger('userquery')

        # state variables
        self.is_table_successfully_created = False
        self.error_message = None
        self.table = None

    def do_all(self, ):
        self._update_job_status_before_table_creation()
        self._create_table_by_job_id()
        self._notify_by_email_start()
        
        if self.is_table_successfully_created:
            self._associate_target_viewer()
        
        self._update_job_status_after_table_creation_attempt()
        self._send_notifications_by_email_after_table_creation_attempt()

    def _update_job_status_before_table_creation(self):
        self.job.job_status = 'rn'
        self.job.job_id = self.task_id
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
        self.logger.info("_create_table_by_job_id - job_id: %s" % self.job.pk)

        db = None
        try:
            db = DBBase('catalog')
            db.create_table_raw_sql(self.table_name, self.job.sql_sentence, schema=self.schema,
                                    timeout=self.job.timeout)
            if self.associate_target_viewer:
                db.create_auto_increment_column(self.table_name, 'meta_id', schema=self.schema)
            self.is_table_successfully_created = True

            release = Release.objects.get(pk=self.release_id)
            count = db.get_count(self.table_name, schema=self.schema)
            self.table = Table(table_name=self.table_name,
                               display_name=self.job.display_name,
                               owner=self.job.owner,
                               schema=self.schema,
                               release=release,
                               tbl_num_objects=count)

            self.table.save()
        except Exception as e:
            self.error_message = str(e)
            self.logger.info("CreateTableAs Error: %s" % self.error_message)
            if db.table_exists(self.table_name, schema=self.schema):
                db.drop_table(self.table_name, schema=self.schema)

    def _associate_target_viewer(self):
        if self.associate_target_viewer:
            TargetViewer.register(user=self.user, table_pk=self.table.pk, release_name=self.release_name)

    def _notify_by_email_start(self):
        Email().send({
            "email": self.user.email,
            "template": "job_notification_start.html",
            "subject": "The creation of your table is being processed",
            "username": self.user.username,
            "id_job": self.job.pk,
            "table_name": self.table_name,
            "table_display_name": self.table_display_name
        })

    def _notify_by_email_finish(self):
        Email().send({
            "email": self.user.email,
            "template": "job_notification_finish.html",
            "subject": "The table creation is finished",
            "username": self.user.username,
            "id_job": self.job.pk,
            "table_name": self.table_name,
            "table_display_name": self.table_display_name
        })

    def _notify_user_by_email_failure(self, error_message):
        Email().send({
            "email": self.user.email,
            "template": "job_notification_error.html",
            "subject": "The table creation failed",
            "username": self.user.username,
            "table_name": self.table_name,
            "error_message": error_message
        })
