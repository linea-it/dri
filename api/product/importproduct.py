import logging
from django.contrib.auth.models import User
import json
from ast
from product_classifier.models import ProductClass


class ImportTargetListCSV:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("import_product")

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

        # Parse and Valid CSV Data
        self.parse_csv_data(self.csv_data)


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

        # TODO
        if self.have_headers:
            # pular a primeira linha
            pass
        else:
            # fazer um for e validar os dados
            pass

        rows = self.parse_rows(self.headers, lines)

        self.logger.debug("ROWS:  ", rows)

        # if (len(cols) == 2):
        #     # Lista com apenas RA and Dec
        #     pass
        # elif (len(cols) == 3):
        #     # Lista com ID, RA, Dec
        #     pass
        # elif (len(cols) > 3):
        #     # Lista com ID, RA, Dec e mais colunas
        #     pass
        # else:
        #     # TODO nao sei se vai haver essa situacao



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
            pass

        headers = tmp_headers


        return headers


    def parse_rows(self, headers, lines):
        self.logger.info('Parse Rows')

        self.logger.debug('Have Headers: %s', self.have_headers)

        rows = list()

        # Descobrir o tipo de dados de cada coluna usando a primeira linha de dados

        # Para cada linha validar
        for line in lines:
            self.logger.debug("ROW: %s" % line)
            values = line.split(self.csv_separator)

            row = dict({})

            for index, value in enumerate(values, start=0):

                # Tratar o campo header
                header = self.headers[index].strip().replace('\n', '').lower()

                # Tratar o Valor, tentar descorbrir o tipo e convertelo.
                value = self.parse_value_type(value)

                self.logger.debug("Header: %s Value: %s" % (header, value))

                row.update({
                    header: value
                })

            rows.append(row)

        return rows


    def get_value_type(self, value):
        try:
            ast

    def parse_value_type(self, value):

        if value.isnumeric():
            if value.find('.') > -1:
                return float(value)
            else:
                return int(value)

        elif value.isalpha():
            return str(value)

        elif value.isalnum():
            return str(value)

        else:
            return str(value)


# {'class': 'galaxy_clusters',
#  'csvData': '93.96499634,-57.77629852\\n94.28079987,-55.13209915\\n68.05249786,-61.84970093\\n',
#  'description': 'TESTE DE IMPORTACAO POR CSV',
#  'displayName': 'Teste Import CSV',
#  'isPublic': True,
#  'mime': 'csv',
#  'name': 'teste_import_csv',
#  'releases': ['y1_wide_survey'],
#  'type': 'catalog'}
