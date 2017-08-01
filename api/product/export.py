import csv
import logging
import os
import shutil
import zipfile
from smtplib import SMTPException
from urllib.parse import urljoin
import time
import humanize
from catalog.views_db import CatalogObjectsViewSetDBHelper
from django.conf import settings
from django.contrib.auth.models import User
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
            data_dir = settings.DATA_DIR
            data_tmp_dir = settings.DATA_TMP_DIR

            name = name.strip().replace(" ", "_").lower()

            # Adicionar timestamp ao nome para que possa haver exports diferentes para o mesmo produto
            ts = int(time.time())
            name = "%s_%s" % (name, ts)

            export_dir = os.path.join(data_dir, data_tmp_dir, name)

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

    def delete_export_dir(self, export_dir):
        """
        Remove o Diretorio utilizado na task de export
        :param export_dir: path absoluto e para o diretorio nao compactado
        """
        self.logger.info("Deleting dir: %s " % export_dir)
        # Remover o diretorio nao compactado.
        shutil.rmtree(export_dir)

    def get_columns(self, row):
        """
        Retorna a lista com todas as colunas.
        utiliza uma das linhas do resultado da query para descobrir as colunas.
        poderia tb se utilizar o metodo da classe DBase()
        :param row: um dos resultados da query.
        :return: Columns list()
        """
        self.logger.info("Retrieving the columns for the headers")
        columns = list()

        for property in row:
            columns.append(str(property.lower().strip()))

        self.logger.debug("Columns: [%s]" % ", ".join(columns))

        return columns

    def table_to_csv(self, table, export_dir, schema=None, database=None, filters=None):
        """
        Le uma tabela no banco de Catalogos e cria um csv com o resultado.
        OBS: NAO recomendada para tabelas grandes. por que neste metodo todos as linhas
        sao recuperadas ao mesmo tempo e e feito um for para inserir as linhas no csv.
        :param export_dir: diretorio onde o arquivo csv vai ser gerado.
        """

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
        """
        Executa a Query no banco de dados usando a classe de Catalogo apropriada
        :param table: Nome da tabela no banco de catalogo, deve vir do model Product.
        :param schema: Schema no banco de catalogo, deve vir do model Product.
        :param database: Database qual das settings de dabase deve ser utilizada para a query deste produto. tb vem do model Produto
        :param limit:
        :param start:
        :param filters: uma lista de condicoes no formato SQLAlchemy. pode ser uma instancia do Serializer  FConditionSerializer
            list([dict({
                column: <nome da coluna>,
                op: <nome do operador> ex: eq, ne, gt, ge, lt, le...
                value: <valor da ser usado na consulta
                })])

        :return:
        """

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
        """
        Este metodo recebe como entrada um diretorio que deve conter os cutouts,
        faz um arquivo zip com todos os cutout. esse arquivo zip vai ficar no diretorio do export.
        :param name: nome do arquivo zip
        :param path_origin: path absoluto do diretorio que sera comprimido
        :param path_destination: path absoluto do diretorio onde sera criado o zip.
        :param format: por enquanto apenas o formato .zip
        """
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

    def create_zip(self, export_dir):
        """
        Comprime o diretorio de export para um unico arquivo e exclui o diretorio.
        :param export_dir: Diretorio com os arquivos de tabela e imagens
        :return: url para o download do arquivo
        """
        zipname = "%s.zip" % export_dir

        self.logger.info("Zip directory: %s" % zipname)

        with zipfile.ZipFile(zipname, 'w') as ziphandle:
            for root, dirs, files in os.walk(export_dir):
                for file in files:
                    origin_file = os.path.join(root, file)
                    self.logger.debug("Adding File: %s" % origin_file)
                    ziphandle.write(origin_file, arcname=file)

        ziphandle.close()

        file_size = humanize.naturalsize(os.path.getsize(zipname))
        self.logger.debug("Zip Size: [%s]" % file_size)

        # Remover o diretorio nao compactado.
        self.delete_export_dir(export_dir)

        # Retirar o apenas o diretorio DATA_TMP_DIR/Filename.zip
        relative_path = zipname.split(settings.DATA_TMP_DIR)[1].strip("/")
        relative_path = os.path.join(settings.DATA_TMP_DIR, relative_path)

        self.logger.debug("Relative Path: %s" % relative_path)

        # Criar a url usando o atributo de settings DATA_SOURCE
        try:
            host = settings.BASE_HOST
            data_source = settings.DATA_SOURCE
        except AttributeError as e:
            msg = ("Variable is not configured in the settings file. %s" % e)
            self.logger.error(msg)
            raise msg

        url = urljoin(host, os.path.join(data_source, relative_path))
        self.logger.debug("URL: %s" % url)

        return url

    def notify_user_export_start(self, user, product):
        """
        Envia um email para o usuario informando que os arquivos estao sendo criados.
        """
        try:
            if user.email:
                self.logger.info("Sending mail notification START.")

                try:
                    from_email = settings.EMAIL_NOTIFICATION
                except:
                    raise Exception("The EMAIL_NOTIFICATION variable is not configured in settings.")

                subject = "LIneA Science Server - Export in Progress"
                body = render_to_string("export_notification_start.html", {
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

    def notify_user_export_success(self, user_id, product_name, url):
        """
        Envia um email para o usuario informando que o export terminou.
        neste email tem um link para o arquivo final do export.
        """
        try:
            user = User.objects.get(pk=user_id)

            if user.email:
                self.logger.info("Sending mail notification SUCCESS.")

                try:
                    from_email = settings.EMAIL_NOTIFICATION
                except:
                    raise Exception("The EMAIL_NOTIFICATION variable is not configured in settings.")

                subject = "LIneA Science Server - Export Finish"
                body = render_to_string("export_notification_finish.html", {
                    "username": user.username,
                    "target_display_name": product_name,
                    "url": url
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

    def notify_user_export_failure(self, user, product):
        """
        Envia um email para o usuario informando que houve um erro na geracao dos arquivos.
        """
        try:
            if user.email:
                self.logger.info("Sending mail notification FAILURE.")

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
