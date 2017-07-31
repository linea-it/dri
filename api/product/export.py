import csv
import logging
import os
import zipfile
from smtplib import SMTPException

import humanize
from catalog.views_db import CatalogObjectsViewSetDBHelper
from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string


class Export:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("product_export")

    def create_export_dir(self, name):
        """
        Cria um diretorio onde vao ficar os aquivos gerados.
        O diretorio criado sera a juncao DATA_TMP_DIR/name
        OBS: DATA_TMP_DIR deve estar setado no arquivo de settings
        :param name: Nome do diretorio a ser criado
        :return: path completo do diretorio
        """
        try:
            data_tmp_dir = settings.DATA_TMP_DIR

            name = name.strip().replace(" ", "_").lower()

            export_dir = os.path.join(data_tmp_dir, name)

            self.logger.info("Creating Directory %s" % name)

            if not os.path.exists(export_dir):
                os.makedirs(export_dir)
                self.logger.info("Export Directory %s" % export_dir)
            else:
                self.logger.warning("Export directory %s already exists." % export_dir)

            return export_dir

        except AttributeError as e:
            msg = ("Variable DATA_TMP_DIR is not configured in the settings file. %s" % e)
            self.logger.error(msg)
            raise msg

    def get_columns(self, row):

        self.logger.info("Retrieving the columns for the headers")
        columns = list()

        for property in row:
            columns.append(str(property.lower().strip()))

        self.logger.debug("Columns: [%s]" % ", ".join(columns))

        return columns

    def table_to_csv(self, table, export_dir, schema=None, database=None, filters=None):

        self.logger.info("Export table \"%s\" to csv" % table)

        name = ("%s.csv" % table)

        filename = os.path.join(export_dir, name)
        self.logger.debug("Filename: %s" % filename)

        rows, count = self.get_catalog_objects(table, schema, database, filters=filters)

        self.logger.debug("Row Count: %s" % count)

        if count > 0:

            columns = self.get_columns(rows[0])

            self.logger.info("Creating csv file")
            with open(filename, 'w') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=columns)

                self.logger.info("Writing the headers")
                writer.writeheader()

                self.logger.info("Writing the rows")
                writer.writerows(rows)

            csvfile.close()
            self.logger.info("Successfully created")

            file_size = humanize.naturalsize(os.path.getsize(filename))
            self.logger.debug("File Size %s" % file_size)

        else:
            self.logger.error("Query returned no results")

    def get_catalog_objects(self, table, schema=None, database=None, limit=None, start=None, filters=None):

        self.logger.info("Retrieving table rows")

        db_helper = CatalogObjectsViewSetDBHelper(
            table,
            schema=schema,
            database=database,
            filters=filters,
            limit=limit,
            start=start)

        return db_helper.query_result()

    def product_cutouts(self, name, path_origin, path_destination, format="zip"):
        self.logger.info("Export cutouts of Job %s" % name)

        self.logger.debug("Cutout Job path: %s" % path_origin)

        origin_path = os.path.join(settings.DATA_DIR, path_origin.strip("/"))

        data_dir_tmp = settings.DATA_TMP_DIR

        destination_path = path_destination

        self.logger.debug("Origin Path: %s" % origin_path)
        self.logger.debug("Destination Path: %s" % destination_path)

        not_images_extensions = list([".txt", ".csv", ".log"])

        if format == "zip":
            zip_name = name.strip().replace(" ", "_").lower() + ".zip"

            filename = os.path.join(destination_path, zip_name)

            self.logger.debug("Zip File: %s" % filename)

            with zipfile.ZipFile(filename, 'w') as ziphandle:
                for root, dirs, files in os.walk(origin_path):
                    for file in files:
                        origin_file = os.path.join(root, file)
                        fname, extension = os.path.splitext(origin_file)

                        if extension not in not_images_extensions:
                            self.logger.debug("Adding File: %s" % origin_file)
                            ziphandle.write(origin_file, arcname=file)

            ziphandle.close()

            self.logger.info("Zip %s Created" % zip_name)

            file_size = humanize.naturalsize(os.path.getsize(filename))
            self.logger.debug("Zip Size: [%s]" % file_size)

    def notify_user_export_failure(self, user, product):

        try:
            if user.email:
                self.logger.info("Sending mail notification.")

                try:
                    from_email = settings.EMAIL_NOTIFICATION
                except:
                    raise Exception("The EMAIL_NOTIFICATION variable is not configured in settings.")

                subject = "LIneA Science Server - Export Failed"
                body = render_to_string("export_notification_error.html", {
                    "username": user.username,
                    "target_display_name": product.prd_display_name
                })

                msg = EmailMessage(
                    subject=subject,
                    body=body,
                    from_email=from_email,
                    to=[user.email],
                )
                msg.content_subtype = "html"
                msg.send(fail_silently=False)

            else:
                self.logger.info("It was not possible to notify the user, for not having the email registered.")

        except SMTPException as e:
            self.logger.error(e)
