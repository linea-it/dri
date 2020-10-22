import ast
import csv
import io
import logging
import time
import traceback

import pandas as pd
from django.contrib.auth.models import User
from lib.CatalogDB import CatalogDB
from product_classifier.models import ProductClass
from product_register.ImportProcess import Import

from .models import Product


class ImportTargetListCSV:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("import_target_csv")

        self.csv_separator = ","

        self.require_properties = list(["ra", "dec"])

        self.database = "catalog"

        self.schema = None

        self.user = None

        self.product_class = None

        # Internal Name vai ser usado tb com tablename
        self.internal_name = ""

        self.display_name = ""

        self.is_public = False

        self.releases = list()

        self.description = ""

        self.csv_data = ""

        self.have_headers = False
        self.headers = list()

        self._last_data_line = 0

        self._table_data = list()

        self.columns_type = dict({
            "meta_id": dict({
                "property": "meta_id",
                "type": "int",
                "primary_key": True,
                "ucd": "meta.id;meta.main"
            }),
            "ra": dict({
                "property": "ra",
                "type": "float",
                "nullable": False,
                "ucd": "pos.eq.ra;meta.main"
            }),
            "dec": dict({
                "property": "dec",
                "type": "float",
                "nullable": False,
                "ucd": "pos.eq.dec;meta.main"
            })
        })

    def start_import(self, user_id, data):
        try:
            self.logger.info("IMPORT TARGET LIST CSV")

            self.logger.debug(data)

            # Recuperar o Usuario pelo ID
            user = self.set_user(user_id)
            self.logger.debug("User: %s" % user.username)

            # Recuperar a Classe do produto
            product_class = self.set_product_class(data.get("class").strip().lower())
            self.logger.debug("Product Class: %s - %s" % (product_class.pk, product_class.pcl_display_name))

            # Gerar um internal name para ser usado como nome da tabela
            self.set_internal_name(data.get("name"))
            self.logger.debug("Internal Name: %s" % self.internal_name)

            # Se já existir um produto registrado com este internal_name interrompe a execução.
            if self.check_product_exist(self.internal_name):
                raise (Exception("A record with this name already exists"))

            # Display Name
            self.display_name = data.get("displayName").strip()
            self.logger.debug("Display Name: %s" % self.display_name)

            # Is Public
            self.is_public = bool(data.get("isPublic"))
            self.logger.debug("Is Public: %s" % self.is_public)

            # Releases
            self.releases = data.get("releases")
            self.logger.debug("Releases: %s" % self.releases)

            # Description
            self.description = data.get("description", None)

            # CSV Data
            # retirar o escape do caracter \n e remover o \n do final
            # tmp_data = data.get("csvData").replace("\\n", "\n").strip("\n")
            tmp_data = data.get("csvData")
            self.csv_data = tmp_data
            self.logger.debug("CSV Data: %s ..." % self.csv_data[0:1048])

            # Identificar o delimitador e o dialect do csv.
            self.dialect = csv.Sniffer().sniff(self.csv_data)
            self.delimiter = self.dialect.delimiter
            self.logger.debug("Delimiter: [%s]" % self.delimiter)

            # Descobrir se o csv aparenta ter headers
            self.have_headers = csv.Sniffer().has_header(self.csv_data)
            self.logger.debug("Headers: %s" % self.have_headers)

            # Parse e Validação do CSV, cria um pandas dataframe
            df = self.csv_to_dataframe(self.csv_data)

            self.logger.debug(df.head())

            # Cria um Instancia do banco de dados
            self.db = CatalogDB()
            # Recupera o Schema necessário para criação da tabela e registro.
            self.schema = self.db.get_connection_schema()

            self.logger.info("Creating the table and importing the data.")
            self.logger.info("Tablename: [%s] Rows: [%s]" % (self.internal_name, df.shape[0]))
            try:
                df.to_sql(
                    # None da tabela
                    self.internal_name,
                    # engine da conexão com database.
                    self.db.engine,
                    # Schema onde a tabela vai ser criada.
                    schema=self.schema,
                    # How to behave if the table already exists.
                    if_exists='fail',  # Use 'replace' in development and tests.
                    # Cria a coluna de index do dataframe como uma coluna no DB.
                    index=True,
                    # Nome da coluna que representa o index do DF.
                    index_label="meta_id",
                    # Tamanhos das intruções de insert divididos em pedaços.
                    chunksize=1000,
                    # Controls the SQL insertion clause used: None for individual insert and 'multi' for multiple values in single insert.
                    # 'multi' é a oplão mais rapida.
                    # OBS: no Oracle 'multi' não funcionou. TODO: Testar com o postgresql
                    # method='multi'
                )
                self.logger.info("Table successfully created and imported data.")

            except Exception as e:
                msg = "Failed to create the table and import the data. Error: [%s]" % e
                self.logger.error(msg)
                raise (Exception(msg))

            # Registrar a nova tabela como produto.
            self.product = self.register_new_table_as_product(
                self.user,
                self.internal_name,
                self.display_name,
                self.database,
                self.schema,
                self.internal_name,
                self.product_class,
                self.releases,
                self.description)

            self.logger.debug("Import completed successfully")

            return self.product

        except Exception as e:
            trace = traceback.format_exc()
            self.logger.error(trace)
            self.logger.error(e)

            raise(e)

        # # Parse and Valid CSV Data o retorno sera os dados da tabela
        # self._table_data = self.parse_csv_data(self.csv_data)

        # # Depois de fazer o cast nos types de todos os valores e os dados terem passados
        # # nas validacoes basicas descobrir o tipo de dados de cada coluna usando a
        # # primeira linha de dados
        # self._columns_type = self.get_columns_type(self._table_data[0])

        # try:
        #     # Recuperar o nome do schema se o banco for postgresq.
        #     # TODO: Não tenho certeza do impact desta parte no oracle, por isso
        #     # estou condicionando a regra ao postgresql.
        #     if self.db.get_engine() == "postgresql_psycopg2":
        #         self.schema = self.db.get_connection_schema()
        #         self.logger.debug("Postgresql Schema: %s" % self.schema)

        #     # tendo os dados e o nome das colunas pode ser criado a tabela com SqlAlchemy
        #     self.table = self.create_table(self.internal_name, self._columns_type, schema=self.schema)

        #     # Inserir os dados na nova tabela
        #     self.populate_table(self.table, self._table_data)

        #     # Registrar a nova tabela como produto.
        #     self.product = self.register_new_table_as_product(self.user, self.internal_name, self.display_name,
        #                                                       self.database, self.schema,
        #                                                       self.internal_name, self.product_class, self.releases,
        #                                                       self.description)

        #     return self.product

        # except Exception as e:
        #     self.logger.info("Failed to create the table or import the data. dropping the table and the sequence if they were created.")
        #     # Verifica se a tabela foi criada
        #     if self.db.table_exists(self.internal_name, self.schema):
        #         # Drop Table
        #         self.db.drop_table(self.internal_name, self.schema)

        #         self.logger.info("Droped  Table: [%s] Schema: [%s]" % (self.internal_name, self.schema))

        #         # Drop Sequence
        #         self.db.drop_sequence(self.internal_name, self.schema)
        #         self.logger.info("Droped Sequence for Table: [%s] Schema: [%s]" % (self.internal_name, self.schema))

    def check_product_exist(self, internal_name):
        """Verificar se ja existe um produto registrado com este nome

        Args:
            internal_name (string): Nome do produto/tabela que será importado. 

        Returns:
            [bool]: True se existir um produto com mesmo internal_name (Product.prd_name), False se não exisistir.
        """
        prd = Product.objects.filter(prd_name=internal_name)
        if len(prd) == 0:
            return False
        else:
            return True

    def check_require_properties(self, df):
        """Verifica se as colunas obrigatórias estão no dataframe.
        Args:
            df (pandas.Dataframe): Dataframe com os dados do csv. 

        Returns:
            bool: [description]
        """
        self.logger.debug("Columns: %s" % df.columns)

        return set(self.require_properties).issubset(df.columns)

    def csv_to_dataframe(self, data):
        self.logger.info("Converting string csv to Pandas dataframe")

        strdata = io.StringIO(data)
        if self.have_headers:
            # Se o csv tiver headers
            df = pd.read_csv(strdata, sep=self.delimiter)
            # Remover espaços dos headers.
            df.columns = df.columns.str.strip()
            # Colocar todos os headers para minusculo.
            df.columns = map(str.lower, df.columns)
        else:
            # Para CSVs sem header é necessário informar o parametro header=None, se não for passado o pandas vai ignorar a primeira linha.
            df = pd.read_csv(strdata, sep=self.delimiter, header=None)

            # Quando o csv é informado sem o Header só possivel utilizar RA e Dec.
            # Verificar se o dataframe tem 2 colunas.
            if len(df.columns) != 2:
                raise Exception("For csv without headers use only the coordinates of RA and Dec. if you want more columns the first line must be the csv header.")

            # Adicionar o nome das colunas
            df.rename(columns={df.columns[0]: "ra", df.columns[1]: "dec"}, inplace=True)

        # Checar as colunas do dataframe.
        if not self.check_require_properties(df):
            raise Exception("RA and Dec coordinates are mandatory.")

        # Verifica se os valores de RA e Dec são validos
        df["ra"] = df["ra"].apply(self.check_ra)
        df["dec"] = df["dec"].apply(self.check_dec)

        return df

    def set_user(self, user_id):

        try:
            self.user = User.objects.get(pk=user_id)

            return self.user

        except User.DoesNotExist as e:
            self.logger.error("User Not Valid user_id: %s" % user_id)
            raise e

    def set_product_class(self, class_name):
        try:
            self.product_class = ProductClass.objects.get(pcl_name=class_name)

            return self.product_class

        except User.DoesNotExist as e:
            acls = list()
            for cls in ProductClass.objects.all():
                acls.append(cls.pcl_name)
            raise Exception("It is class is not available. these are available: %s" % (", ".join(acls)))

    def set_internal_name(self, internal_name):
        """
            Cria um internal name que possa ser usado como nome de tabela
        :param internal_name:
        :return:
        """
        # troca espacos por "_", converte para lowercase, remove espacos do final
        name = internal_name.replace(" ", "_").lower().strip().strip("\n")

        # Retirar qualquer caracter que nao seja alfanumerico exceto "_"
        name = "".join(e for e in name if e.isalnum() or e == "_")

        # Limitar a 40 characteres
        self.internal_name = name[: 40]

        return self.internal_name

    # def parse_csv_data(self, csv_data):
    #     self.logger.info("Starting Parse CSV")

    #     # Descobir os headers do csv
    #     lines = csv_data.split("\n")
    #     self.logger.debug("Lines: %s" % len(lines))

    #     if len(lines) == 0:
    #         raise Exception("No data in csv")

    #     self.headers = self.get_headers(lines[0])
    #     self.logger.debug("Headers: %s", self.headers)

    #     # TODO se tiver headers deve remover essa linha antes de passar para o metodo
    #     # que retorna os dados.
    #     if self.have_headers:
    #         pass

    #     rows = self.parse_rows(self.headers, lines)

    #     # TODO remover esse Debug
    #     self.logger.debug("ROWS:  %s" % rows)

    #     return rows

    # def get_headers(self, first_line):
    #     self.logger.info("Get Headers")

    #     self.logger.debug("First Line: %s" % first_line)

    #     headers = []
    #     tmp_headers = []

    #     first_line = first_line.replace("/n", "")

    #     # separar as colunas
    #     cols = first_line.split(self.csv_separator)
    #     count_headers = len(cols)

    #     # testar se as colunas sao strings
    #     for col in cols:

    #         col = self.cast_value_type(col)

    #         if isinstance(col, str):
    #             tmp_headers.append(col.lower().strip().strip("\n"))

    #     # Se nao houver nome de colunas na primeira linha usar as required_properties
    #     if len(tmp_headers) == 0:
    #         self.have_headers = False
    #         tmp_headers = self.require_properties
    #     else:
    #         self.have_headers = True
    #         # tem nome de colunas na primeira linha
    #         # TODO testar com nome de colunas

    #         # TODO as colunas nao podem ter caracters especiais apenas alphanumericos
    #         pass

    #     headers = tmp_headers

    #     return headers

    # def parse_rows(self, headers, lines):
    #     self.logger.info("Parse Rows")

    #     self.logger.debug("Have Headers: %s", self.have_headers)

    #     rows = list()

    #     # Para cada linha validar
    #     for line in lines:
    #         self.logger.debug("ROW: %s" % line)
    #         values = line.split(self.csv_separator)

    #         # Incrementar o contador de linhas para ajudar nas mensagens de erro
    #         self._last_data_line = self._last_data_line + 1

    #         row = dict({})

    #         for index, value in enumerate(values, start=0):
    #             # Tratar o campo header
    #             header = self.headers[index].strip().replace("\n", "").lower()

    #             # Tratar o Valor, tentar descorbrir o tipo e convertelo.
    #             value = self.cast_value_type(value)

    #             # Validar cada valor de acordo com a sua coluna.
    #             value = self.check_is_valid(header, value)

    #             self.logger.debug("Header: %s Value: %s" % (header, value))

    #             row.update({
    #                 header: value
    #             })

    #         # Adicionar a key meta_id para evitar erro no insert.
    #         if "meta_id" not in row:
    #             row.update({"meta_id": None})

    #         rows.append(row)

    #     return rows

    # def cast_value_type(self, value):
    #     try:
    #         value = value.replace("\n", "").strip()

    #         value = ast.literal_eval(value)

    #     except:
    #         value = str(value)

    #     return value

    # def get_columns_type(self, first_row):
    #     self.logger.info("Extract Column types from first data row")

    #     self.logger.debug(first_row)

    #     for property in first_row:
    #         # Verificar se a coluna ja nao tem tipo padrao definido
    #         if property not in self._columns_type:
    #             # se nao tiver descobrir o tipo de dados e criar um dict com o nome da
    #             # coluna e
    #             pass
    #             # tclass = type(first_row.get(property))

    #             # if isinstance(tclass, float):
    #             #     self.logger.debug(self._columns_type)
    #             #
    #             # self._columns_type.append(dict({
    #             #     property: dict({
    #             #         "property": property,
    #             #         "type_name": "<type_name>"
    #             #     }))

    #     self.logger.debug(self._columns_type)

    #     return self._columns_type

    def get_associations(self):
        associations = list()
        for column in self.columns_type:
            c = self.columns_type[column]

            associations.append(dict({
                "property": c.get("property"),
                "ucd": c.get("ucd")
            }))

        return associations

    # # %%%%%%%%%%%%%%%%%%%%%%%%%% Create Table %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    # def create_table(self, name, columns_type, schema=None):
    #     self.logger.info("Create table with SqlAlchemy")

    #     self.logger.debug("Table name: %s" % name)

    #     cols = list()
    #     for col in columns_type:
    #         cols.append(columns_type.get(col))

    #     try:
    #         table = self.db.create_table(name, columns=cols, schema=schema)

    #         self.logger.debug("Table %s Created" % name)

    #         return table

    #     except Exception as e:
    #         raise e

    # def populate_table(self, table, data):
    #     self.logger.info("Populate Table")

    #     try:
    #         start = time.time()

    #         self.logger.info(table.insert())
    #         self.logger.info(data)

    #         # with self.db.engine.connect().execution_options(isolation_level="AUTOCOMMIT") as con:

    #         with self.db.engine.connect() as connection:
    #             with connection.begin() as transaction:
    #                 try:
    #                     # markers = ",".join("?" * len(values[0]))
    #                     # ins = "INSERT INTO {tablename} VALUES ({markers})"
    #                     # ins = ins.format(tablename=widgets_table.name, markers=markers)

    #                     connection.execute(table.insert(), dict(data))
    #                 except:
    #                     transaction.rollback()
    #                     raise
    #                 else:
    #                     transaction.commit()

    #             # for row in data:
    #             #     table.insert().values(row)

    #         #
    #         # table.insert().values(data)
    #         # self.db.engine.execute(table.insert().values(data))
    #         # trans.commit()

    #         # if len(data) == 1:
    #         #     table.insert().values(data)
    #         # else:
    #         #     self.db.engine.execute(table.insert(), data)

    #         self.logger.info("TESTE! Passou o Insert")

    #         duration = time.time() - start

    #         self.logger.info("Insert %s rows in %s" % (len(data), "{:.2f} seconds".format(duration)))

    #     except Exception as e:
    #         trace = traceback.format_exc()
    #         self.logger.error(trace)
    #         self.logger.error(e)
    #         # TODO se falhar na importação dos dados deve remover a tabela e a sequencia.
    #         raise e

    def register_new_table_as_product(self, user, internal_name, display_name, database, schema, tablename,
                                      product_class,
                                      releases=None, description=None):

        self.logger.info("Register the new table as a product")

        associations = self.get_associations()

        self.logger.debug("Associations: %s" % associations)

        # Dados para o registro
        data = list([{
            "process_id": None,
            "name": internal_name,
            "display_name": display_name,
            "database": database,
            "schema": schema,
            "table": tablename,
            "filter": None,
            "releases": releases,
            "fields": list([]),
            "association": associations,
            "type": "catalog",
            "class": product_class.pcl_name,
            "description": description
        }])

        self.logger.debug("Data: %s" % data)
        # Registar o novo produto
        import_product = Import()

        import_product.user = user
        import_product.owner = user
        import_product.site = None
        import_product.process = None

        import_product.import_products(data)

        # Retornar o Produto que foi registrado.
        newproduct = Product.objects.get(prd_name=self.internal_name)

        self.logger.info("New Product as Registered: %s - %s" % (newproduct.pk, newproduct.prd_display_name))

        return newproduct

    def check_ra(self, value):
        """Checa o valor passado, para identificar se é um  valor valido para coordenada RA.
        verifica se é do tipo Float ou Inteiro. 
        Verifica se é o valor está entre 0 e 360 ou -180 e 180.
        caso seja esteja em -180 e 180 sera convertido para 0 e 360.
        Args:
            value (any): Valor da coordenada RA.

        Raises:
            Exception: valor não é um tipo que possa ser convertido para float.
            Exception: valor não está entre 0 e 360.

        Returns:
            [float]: Valor para RA convertido para Float entre 0 e 360.
        """

        message = ("Invalid value %s for RA. Should be Float between 0 and 360 degrees or -180 and 180" % value)

        if isinstance(value, float) or isinstance(value, int):
            # Ra negativo tentar converter para 0-360
            if value < 0 and value > -180:
                value = value + 360

            if value > 360:
                raise Exception(message)

            if value >= 0 and value <= 360:
                return float(value)

            else:
                raise Exception(message)
        else:
            raise Exception("Invalid value for RA, one or more values could not be converted to float.")

    def check_dec(self, value):
        """Checa o valor passado, para identificar se é um  valor valido para coordenada Dec.
        verifica se é do tipo Float ou Inteiro. 
        Verifica se o valor está entre -90 e 90.
        Args:
            value (any): Valor da coordenada Dec.

        Raises:
            Exception: valor não é um tipo que possa ser convertido para float.
            Exception: valor não está entre -90 e 90.

        Returns:
            [float]: Valor para Dec convertido para Float.
        """
        message = ("Invalid value %s for Dec. Should be Float between -90 and 90 degrees" % value)

        if isinstance(value, float) or isinstance(value, int):
            if value >= -90 and value <= 90:
                return float(value)

            else:
                raise Exception(message)
        else:
            raise Exception("Invalid value for Dec, one or more values could not be converted to float.")
