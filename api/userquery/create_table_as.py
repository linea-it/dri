from __future__ import absolute_import, unicode_literals

import logging
import os
import traceback
from urllib.parse import urljoin

from coadd.models import Release
from common.notify import Notify
from django.conf import settings
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.utils import timezone
from lib.sqlalchemy_wrapper import DBBase
from product.models import Product

from userquery.models import Job, Table

from .email import Email
from .target_viewer import TargetViewer


class CreateTableAs:
    def __init__(self, job_id, user_id, table_name, table_display_name, release_id, release_name, associate_target_viewer, task_id, schema=None):

        # Get an instance of a logger
        self.logger = logging.getLogger('userquery')
        self.user_id = user_id
        self.job_id = job_id
        self.table_name = table_name
        self.table_display_name = table_display_name
        self.release_id = release_id
        self.release_name = release_name
        self.associate_target_viewer = associate_target_viewer
        self.schema = schema
        self.task_id = task_id
        self.rows_count = 0

        self.table = None

        # Flag que indica se a tabela foi criada nesta rodada, evita que tabelas já existentes sejam apagadas.
        self.table_created = False

    def do_all(self, ):
        self.logger.info("Starting User Query Job ID: [%s]" % self.job_id)

        # Recupera informação do Usuario.
        self.user = User.objects.get(pk=self.user_id)

        # Recupera informação do Job
        self.job = Job.objects.get(pk=self.job_id)

        # Recupera informação do Release
        self.release = Release.objects.get(pk=self.release_id)
        self.logger.debug("Release: %s" % self.release)

        # Altera o Status do Job para Running
        self._update_job_status_before_table_creation()

        # Envia email de notificação Start para o usuario.
        self._notify_by_email_start()

        try:
            # Cria a tabela, preenche com os dados, cria os indexes.
            self._create_table_by_job_id()

            # Registra a tabela
            # TODO: Adicionar a tabela uma relação com o Job que a criou.
            self.table = Table(table_name=self.table_name,
                               display_name=self.job.display_name,
                               owner=self.job.owner,
                               schema=self.schema,
                               release=self.release,
                               tbl_num_objects=self.rows_count)

            self.table.save()

            # Registra a nova tabela como um produto no Target Viewer
            self._associate_target_viewer()

            # Altera o Status do Job para Done
            self.job.job_status = 'ok'
            self.job.save()

            # Notifica ao Usuario o termino do Job com sucesso.
            self._notify_by_email_finish()

        except Exception as e:
            # Altera o status do job para Error
            self.job.job_status = 'er'
            self.job.error = str(e)
            self.job.save()

            # Notifica o usuario o termino do Job com Error.
            self._notify_user_by_email_failure(e)

        finally:
            # Guarda a o datetime em que o job terminou.
            self.job.end_date_time = timezone.now()
            self.job.save()

            self.logger.info("Job completed Job ID: [%s] Job Status: [%s]" % (self.job.pk, self.job.job_status))

    def _update_job_status_before_table_creation(self):
        self.job.job_status = 'rn'
        self.job.job_id = self.task_id
        self.job.save()
        self.logger.info("Changed Job status to Running")

    def _create_table_by_job_id(self):

        self.logger.info("Creating the table")
        try:
            db = DBBase('catalog')

            # Seta o log do user query a classe de banco de dados,
            # nesta instancia as querys serão logadas no log do userquery
            db.setLogger(self.logger)
            # Se não foi especificado um schema para a criação da tabela, utilizar o schema da conexão.
            if self.schema is None:
                self.schema = db.schema

            self.logger.debug("Schema: %s" % self.schema)
            self.logger.debug("Tablename: %s" % self.table_name)

            # Verificar se a tabela já existe
            if db.table_exists(self.table_name, self.schema):
                raise Exception("This %s table already exists." % self.table_name)

            # Criacao da tabela
            db.create_table_raw_sql(self.table_name, self.job.sql_sentence, schema=self.schema,
                                    timeout=self.job.timeout)

            # Flag que indica que a tabela foi criada neste job. em caso de erro daqui para frente ela deve ser apagada.
            self.table_created = True

            # Criacao da Primary key
            db.create_auto_increment_column(self.table_name, 'meta_id', schema=self.schema)

            # Total de linhas adicionadas a tabela
            self.rows_count = db.get_count(self.table_name, schema=self.schema)
            self.logger.debug("Rows Count: %s" % self.rows_count)

            self.logger.info("Table Created successfully.")

        except Exception as e:
            trace = traceback.format_exc()
            self.logger.error(trace)
            self.logger.error("Table creation failed: %s" % e)

            # Se a tabela tiver sido criada antes do erro é necessário fazer o drop.
            self.logger.info("Checking if the table was created, if it has been, it will be droped.")

            if self.table_created and db.table_exists(self.table_name, schema=self.schema):
                self.logger.info("Trying to drop the table.")
                try:
                    db.drop_table(self.table_name, schema=self.schema)
                    self.logger.info("Table successfully droped")
                except Exception as e:
                    self.logger.error("Failed to drop the table. %s" % e)

            raise (e)

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
