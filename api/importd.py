import sys
import json
import requests
from requests.auth import HTTPBasicAuth
from pprint import pprint

class ImportProcessProduct():

    def __init__(self):

        self.url = 'http://186.232.60.126:8150/'
        self.user = 'admin'
        self.password = 'adminadmin'
        
        self.process_local_data = {
                            "epr_name": "",
                            "epr_username": "",
                            "epr_start_date": "",
                            "epr_end_date": "",
                            "epr_readme": "",
                            "epr_comment": "",
                            "epr_original_id":"" ,
                            "epr_site": ""
                        }

        self.product_local_data = {
                            "prd_process_id":"",
                            "prd_name": "",
                            "prd_display_name": "",
                            "prd_flag_removed": False,
                            "prd_class": "",
                            "ctl_num_columns":0,
                            "ctl_num_tiles":0,
                            "ctl_num_objects":0,
                            "tbl_schema":"",
                            "tbl_name":"",
                        }

        #self.data = None
        self.data = json.loads(open('data.json').read())

    def Import(self, data=None):

        # Iniciar a integracao
        if 'process' in data:
            self.ImportProcess(data)
        #elif not 'process' in data:
        #    print('You must send a process name!' )

    def StartIntegration(self, export_user=None, export_site=None):
        # Esse metodo vai criar uma importacao com status de inicio
        # Chamar a API de intergracao
        pass

    def ImportProcess(self, data=None):

        mandatory_values = [
                'owner_username',
                'process_name',
                'process_description',
                'name',
                'class',
                'display_name',
                'type'                
        ]
        
        # Checar se tem os parametros obrigatorios
        try:
            missing_values = [option for option in mandatory_values if not list(data.keys())]
        except ValueError:
            print('Missing mandatory values %s' % missing_values)
            #return missing_values trocar por retorno de funcao printando os valores faltantes

        # Se der erro atualiza a integracao.
        # ?????

        # Chamar a API de ExternalProcess do DRI vai checar se ja existe o processo
        uri = 'externalprocess'
        
        # TODO: implementar tradutor depois esse nome process_id para epr_original_id
        self.process_local_data['epr_original_id'] = data['process']['process_id']

        # criar funcao especifica para get e post, passando uri e params, este opcional
        # checando possiveis informacoes do proceso 
        payload = {"epr_original_id":self.process_local_data['epr_original_id']}

        process_exists = self.perform_http_methods(uri, 
                            params=payload)

        if len(process_exists.json()) == 0:

            data_products = data['process']['products']
            # se a checagem retornar igual a 0 entao inclui processo na api
            resp = self.perform_http_methods(uri, http_method='post', params=data_products)

            # Guardar o id retornado pelo API
            epr_id = resp.json()['id']

            # usar a funcao de Request ela vai ter uma opcao de callback que te retornar se foi bem sucedida ou nao
            # no retorno se for bem sucedido passa para a proxima funcao
            if resp.ok:
                # no callback vc recebeu um json que e o processo ja registrado
                self.ImportProducts(epr_id, data.get('products'))

        elif len(process_exists.json()) > 0:

            # se processo ja registrado entao chama registro de produtos
            #resp = self.perform_http_methods(res.url, params=self.epr_original_id)
            self.ImportProducts(process_exists.json()[0]['id'], data.get('process').get('products'))

    def ImportProducts(self, process=None, data=None):

        #  Se tiver produtos no processo inclui os produtos usando o id de processo retornado pelo passo anterior
        for product in data:
            res = self.ImportProduct(process, product)

    def ImportProduct(self, process, data):

        # Chegar o type do produto e executar a funcao especifica
        if data.get('type') == 'catalog':
            res = self.ImportProductCatalog(process, data)
        elif data.get('type') == 'file':
            res = self.ImportProductFile(process, data)
        else:
            print('Produto nao suportado')

        return res

    def ImportProductCatalog(self, process, data):

        uri = 'catalog'

        # Checar se tem os campos obrigatorios para a API Catalog
        # ex: schema e table
        mandatory_values = [
                'prd_name',
                'prd_display_name',
                'prd_class',
                'pcl_display_name',
                'pcl_is_system',
                'pgr_group',
                'tbl_schema',
                'tbl_name',
                'type'                
        ]

        self.product_local_data = {
                            "prd_process_id":process,
                            "prd_name": data['name'],
                            "prd_display_name": data['display_name'],
                            "prd_flag_removed": False,
                            "prd_class": data['class'],
                            "ctl_num_columns":0,
                            "ctl_num_tiles":0,
                            "ctl_num_objects":0,
                            "tbl_schema":data['scheme'],
                            "tbl_name":data['table'],
                        }

        try:
            missing_values = [option for option in mandatory_values if not list(data.keys())]
        except ValueError:
            print('Missing mandatory values %s' % missing_values)
            # TODO: retornar os campos obrigatorios faltantes

        # TODO: Checar se a tabela existe no DESDM

        # TODO:  Recuperar informacoes da tabela direto do Oracle
        # ex: Numero Colunas, linhas.

        # Recuperar inforcao da classe do produto
        class_id = self.getProductClass(data.get('class'))

        self.product_local_data['prd_class'] = int(class_id)

        # Tudo ok chamar a API http://dri.com/dri/api/catalog/
        resp = self.perform_http_methods(uri, http_method='post', params=self.product_local_data)
        pprint(resp)

        # TODO: Usar a funcao que retorna as colunas da tabela
        # e gravar na API http://dri.com/dri/api/productcontent/

        return True

    def ImportProductFile(self, data):

        # Checar se tem os campos obrigatorios para a API Catalog

        # ex: schema e table

        # Tudo ok chamar a API http://dri.com/dri/api/catalog/
        pass

    def getProductClass(self, classname):
        # Usar a API de classes e recuperar o id da classe que o usuario passou no json
        # http://dri.com/dri/api/productclass/?pcl_name=galaxy_clusters
        
        uri = 'productclass'
        res = self.perform_http_methods(uri, params={'pcl_name':classname})

        if res is not None:
            # retornar o ID da classe ou marcar erro por classe desconhecida
            class_id = res.json()[0]['id']
            return class_id
        else:
            # [CAS] TODO: 
            #   caso nao esteja cadastrada entao retorna uma lista organizada
            #   das classes disponiveis ao usuario
            pass

    def NotifyErro(self, data):
        # Gravar na API de intergracao que houve erro e mudar o status.

        # Escrever em um log
        pass

    def get_url(self, uri=None):
        """ returns the url for a given app """

        url = self.url + uri + '/'

        # depois eh preciso ver como autenticar de forma segura
        urlb = requests.get(url, auth=HTTPBasicAuth(self.user, self.password))
        urlb = urlb.url
        
        return urlb #requests.get(url, auth=HTTPBasicAuth(self.user, self.password))

    def perform_http_methods(self, tool_name, http_method='get', params=None):
        """
            Perform method get or post and return the results

            tool_name <str>: 
                Name of the tool
            
            http_method <bool>: 
                True <default> to perform a GET or False to POST
            
            params <dict>: Data to be queried or stored through the requests params
        """

        url = self.get_url(tool_name)

        if http_method == 'get':
            res = requests.get(url=url, auth=HTTPBasicAuth(self.user, self.password), params=params)
            return res
        elif http_method == 'post' and params is not None:
            print('POST')
            res = requests.post(url=url, auth=HTTPBasicAuth(self.user, self.password), data=params)
            print('POST')
            print('RES', res.text)
            return res
        else:
            return url

if __name__ == "__main__":
    imp = ImportProcessProduct()
    res = imp.perform_http_methods('productclass')
