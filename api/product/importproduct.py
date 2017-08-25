import logging
from django.contrib.auth.models import User
import ast
from product_classifier.models import ProductClass

from lib.CatalogDB import CatalogDB


class ImportTargetListCSV:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("product_import")

        self.csv_separator = ','

        self.require_properties = list(['ra', 'dec'])

        self.user = None

        self.product_class = None

        self.internal_name = ''

        self.display_name = ''

        self.is_public = False

        self.releases = list()

        self.description = ''

        self.csv_data = ''

        self.have_headers = False
        self.headers = list()

        self._last_data_line = 0

        self._table_data = list()

        self._columns_type = dict({
            'id': dict({
                'property': 'id',
                'type': 'int',
                'primary_key': True
            }),
            'ra': dict({
                'property': 'ra',
                'type': 'float',
                'nullable': False,
            }),
            'dec': dict({
                'property': 'dec',
                'type': 'float',
                'nullable': False,
            })
        })



    def start_import(self, user_id, data):
        self.logger.info('IMPORT TARGET LIST CSV')

        self.logger.debug(data)

        # Recuperar o Usuario pelo ID
        user = self.set_user(user_id)
        self.logger.debug('User: %s' % user.username)

        # Recuperar a Classe do produto
        product_class = self.set_product_class(data.get('class').strip().lower())
        self.logger.debug('Product Class: %s - %s' % (product_class.pk, product_class.pcl_display_name))

        # Gerar um internal name para ser usado como nome da tabela
        internal_name = self.set_internal_name(data.get('name'))
        self.logger.debug('Internal Name: %s' % internal_name)

        # Display Name
        display_name = data.get('displayName').strip()
        self.logger.debug('Display Name: %s' % display_name)

        # Is Public
        self.is_public = bool(data.get('isPublic'))
        self.logger.debug('Is Public: %s' % self.is_public)

        # Releases
        self.releases = data.get('releases')
        self.logger.debug('Releases: %s' % self.releases)

        # CSV Data
        # retirar o escape do caracter \n e remove o \n do final
        tmp_data = data.get('csvData').replace('\\n', '\n').strip('\n')
        self.csv_data = tmp_data
        self.logger.debug('CSV Data: %s' % self.csv_data)

        # Parse and Valid CSV Data o retorno sera os dados da tabela
        self._table_data = self.parse_csv_data(self.csv_data)

        # Depois de fazer o cast nos types de todos os valores e os dados terem passados
        # nas validacoes basicas descobrir o tipo de dados de cada coluna usando a
        # primeira linha de dados
        self._columns_type = self.get_columns_type(self._table_data[0])

        # tendo os dados e o nome das colunas pode ser criado a tabela com SqlAlchemy
        self.table = self.create_table(self.internal_name, self._columns_type)

    def set_user(self, user_id):

        try:
            self.user = User.objects.get(pk=user_id)

            return self.user

        except User.DoesNotExist as e:
            self.logger.error('User Not Valid user_id: %s' % user_id)
            raise e

    def set_product_class(self, class_name):

        try:
            self.product_class = ProductClass.objects.get(pcl_name=class_name)

            return self.product_class

        except User.DoesNotExist as e:
            acls = list()
            for cls in ProductClass.objects.all():
                acls.append(cls.pcl_name)
            raise Exception('It is class is not available. these are available: %s' % (', '.join(acls)))

    def set_internal_name(self, internal_name):
        """
            Cria um internal name que possa ser usado como nome de tabela
        :param internal_name:
        :return:
        """
        # troca espacos por '_', converte para lowercase, remove espacos do final
        name = internal_name.replace(' ', '_').lower().strip().strip('\n')

        # Retirar qualquer caracter que nao seja alfanumerico exceto '_'
        name = ''.join(e for e in name if e.isalnum() or e == '_')

        # Limitar a 40 characteres
        self.internal_name = name[: 40]

        return self.internal_name

    def parse_csv_data(self, csv_data):
        self.logger.info('Starting Parse CSV')

        # Descobir os headers do csv
        lines = csv_data.split('\n')
        self.logger.debug('Lines: %s' % len(lines))

        if len(lines) == 0:
            raise Exception('No data in csv')

        self.headers = self.get_headers(lines[0])
        self.logger.debug('Headers: %s', self.headers)

        # TODO se tiver headers deve remover essa linha antes de passar para o metodo
        # que retorna os dados.
        if self.have_headers:
            pass

        rows = self.parse_rows(self.headers, lines)

        # TODO remover esse Debug
        self.logger.debug("ROWS:  ", rows)

        return rows

    def get_headers(self, first_line):
        self.logger.info('Get Headers')

        self.logger.debug('First Line: %s' % first_line)

        headers = []
        tmp_headers = []

        first_line = first_line.replace('/n', '')

        # separar as colunas
        cols = first_line.split(self.csv_separator)
        count_headers = len(cols)

        # testar se as colunas sao strings
        for col in cols:
            if col.isalpha() or col.isalnum():
                tmp_headers.append(col.lower().strip().strip('\n'))

        # Se nao houver nome de colunas na primeira linha usar as required_properties
        if len(tmp_headers) == 0:
            self.have_headers = False
            tmp_headers = self.require_properties
        else:
            self.have_headers = True
            # tem nome de colunas na primeira linha
            # TODO testar com nome de colunas

            # TODO as colunas nao podem ter caracters especiais apenas alphanumericos
            pass

        headers = tmp_headers

        return headers

    def parse_rows(self, headers, lines):
        self.logger.info('Parse Rows')

        self.logger.debug('Have Headers: %s', self.have_headers)

        rows = list()

        # Para cada linha validar
        for line in lines:
            self.logger.debug("ROW: %s" % line)
            values = line.split(self.csv_separator)

            # Incrementar o contador de linhas para ajudar nas mensagens de erro
            self._last_data_line = self._last_data_line + 1

            row = dict({})

            for index, value in enumerate(values, start=0):
                # Tratar o campo header
                header = self.headers[index].strip().replace('\n', '').lower()

                # Tratar o Valor, tentar descorbrir o tipo e convertelo.
                value = self.cast_value_type(value)

                # Validar cada valor de acordo com a sua coluna.
                value = self.check_is_valid(header, value)

                self.logger.debug("Header: %s Value: %s" % (header, value))

                row.update({
                    header: value
                })

            rows.append(row)

        return rows

    def cast_value_type(self, value):
        try:
            value = ast.literal_eval(value)

        except:
            value = str(value)

        return value

    def get_columns_type(self, first_row):
        self.logger.info("Extract Column types from first data row")

        self.logger.debug(first_row)

        for property in first_row:
            # Verificar se a coluna ja nao tem tipo padrao definido
            if property not in self._columns_type:
                # se nao tiver descobrir o tipo de dados e criar um dict com o nome da
                # coluna e
                pass
                # tclass = type(first_row.get(property))

                # if isinstance(tclass, float):
                #     self.logger.debug(self._columns_type)
                #
                # self._columns_type.append(dict({
                #     property: dict({
                #         'property': property,
                #         'type_name': '<type_name>'
                #     }))

        self.logger.debug(self._columns_type)

        return self._columns_type

    # %%%%%%%%%%%%%%%%%%%%%%%%%% Create Table %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    def create_table(self, name, columns_type):
        self.logger.info("Create table with SqlAlchemy")

        self.logger.debug("Table name: %s" % name)

        from sqlalchemy import Table, Column, Integer, String

        self.db = CatalogDB()

        cols = list()
        for col in columns_type:
            cols.append(columns_type.get(col))

        try:
            self.db.create_table(name, columns=cols)

            self.logger.debug("Table %s Created" % name)

        except Exception as e:
            raise e



    # %%%%%%%%%%%%%%%%%%%%%%%%%% Validacoes por colunas %%%%%%%%%%%%%%%%%%%%%%%%%%
    def check_is_valid(self, header, value):
        """
        Aplicar validacoes especificas por colunas especificas.
        :param header:
        :param value:
        :return:
        """

        if header == 'ra':
            value = self.check_ra(value)

        elif header == 'dec':
            value = self.check_dec(value)

        return value

    def check_ra(self, value):
        """
        Valores para RA devem ser Float e estar entre 0 - 365
        :param value:
        :return:
        """

        message = ('Error on line %s, %s is an invalid value for RA. '
                   'Should be Float between 0 and 360 degrees' % (self._last_data_line, value))

        if isinstance(value, float) or isinstance(value, int):
            # Ra negativo tentar converter para 0-360
            if value < 0 and value > -180:
                value = value + 360

            if value > 360:
                raise Exception(message)

            if value >= 0 and value <= 360:
                # Formatar casas decimais
                # return float("{0:.5f}".format(value))
                return value

            else:
                raise Exception(message)
        else:
            raise Exception(message)

    def check_dec(self, value):
        """
        Valores para Dec devem ser Float e estar entre -90 a 90
        :param value:
        :return:
        """

        message = ('Error on line %s, %s is an invalid value for Dec. '
                   'Should be Float between -90 and 90 degrees' % (self._last_data_line, value))

        if isinstance(value, float) or isinstance(value, int):
            if value >= -90 and value <= 90:
                # return float("{0:.5f}".format(value))
                return value

            else:
                raise Exception(message)
        else:
            raise Exception(message)

# {'class': 'galaxy_clusters',
#  'csvData': '93.96499634,-57.77629852\\n94.28079987,-55.13209915\\n68.05249786,-61.84970093\\n',
#  'description': 'TESTE DE IMPORTACAO POR CSV',
#  'displayName': 'Teste Import CSV',
#  'isPublic': True,
#  'mime': 'csv',
#  'name': 'teste_import_csv',
#  'releases': ['y1_wide_survey'],
#  'type': 'catalog'}
