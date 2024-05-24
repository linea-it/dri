
import logging

import requests
from django.conf import settings
from requests.packages.urllib3.exceptions import InsecureRequestWarning

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


class DesAccessApi:
    """This class implements the necessary methods for integration with the DESaccess service.

    it is necessary to have the configuration parameters DESACCESS_API in Settings.
    DESACCESS_API = {
        # URL Principal do Serviço.
        'API_URL': 'https://deslabs.ncsa.illinois.edu/desaccess/api',

        # URL para download dos resultados do cutout job.
        'FILES_URL': 'https://deslabs.ncsa.illinois.edu/files-desaccess',

        # Usuario Oracle do NCSA com acesso ao desaccess.
        'USERNAME': None,
        'PASSWORD': None,

        # Database Oracle que será usado para authenticar as credenciais. must be either 'dessci' or 'desoper', usar mesmo database usado em NCSA_AUTHENTICATION_DB
        'DATABASE': 'dessci',

        # Lista dos Releases disponiveis no serviço do descut. OBS: está lista de releases é utilizada pela interface no formulário de submissão.
        'AVAILABLE_RELEASES': ['Y6A1', 'Y3A2', 'Y1A1', 'SVA1'],

        # Max de cutouts que o Descut aceita por job. default is 20000
        'MAX_OBJECTS': 20000
    }

    DESaccess API Reference: https://deslabs.ncsa.illinois.edu/desaccess/docs/api/
    """

    def __init__(self):

        # instance default do logger, esse log pode ser substituido utilizando o metodo setLogger.
        self.logger = logging.getLogger("django")

        # fazer os request sem verificar o certificado SSL / HTTPS
        self.verify_ssl = False

    def setLogger(self, logger):
        """Changes the logger used by this class. 
        it is useful when you want to keep the request logs in the same log of a process for example.

        Args:
            logger (object): Logger instance where the messages will be written.
        """
        self.logger = logger

    def login(self, ):
        """Authenticate using DES account to obtain an access token.

        Raises:
            Exception: Lança uma exception caso o login falhe.

        Returns:
            str: auth token example: eyJ0eXAiOiJK...V1QiLCJhbGciOiJI
        """
        config = settings.DESACCESS_API

        url = "{}/login".format(config['API_URL'])
        # self.logger.debug("Login URL: [%s]" % url)

        # Dados para a Autenticação.
        data = {'username': config['USERNAME'], 'password': config['PASSWORD'], 'database': config['DATABASE']}

        # Login to obtain an auth token
        r = requests.post(url, data, verify=self.verify_ssl)

        self.logger.debug("Login Status: [%s]" % r.json()['status'])

        if r.json()['status'] != 'ok':
            raise Exception(r.json()['message'])

        return r.json()['token']

    def submit_cutout_job(self, data):
        """Submits a CUTOUT job and returns the complete server response which includes the job ID.
        Complete Documentation, submit and return schema: https://deslabs.ncsa.illinois.edu/desaccess/docs/api/#/Jobs/cutout

        Args:
            data (dict): Cutout job specification, all parameters can be checked in api documentation. 

        Raises:
            Exception: throws an exception if the returned status is different from ok.

        Returns:
            str: New job UUID (universally unique identifier) example: 25f4d3bacae04a59aee7847af82c5012
        """
        self.logger.info("Submiting Descut Job")
        self.logger.debug(data)

        config = settings.DESACCESS_API
        url = "{}/job/cutout".format(config['API_URL'])

        # Submit job
        r = requests.put(
            url,
            data=data,
            headers={'Authorization': 'Bearer {}'.format(self.login())},
            verify=self.verify_ssl
        )

        response = r.json()
        self.logger.debug("Response: %s" % response)
        self.logger.debug("Response Status: [%s]" % response["status"])

        if response["status"] == "ok":
            # Retorna o jobid
            self.logger.debug("Descut Job Submited with Jobid: [%s]" % response["jobid"])

            return response["jobid"]
        else:
            msg = "Error submitting job: %s" % response["message"]
            raise Exception(msg)

    def check_job_status(self, jobid):
        """Request status of existing job(s)
        Complete Documentation and return schema: https://deslabs.ncsa.illinois.edu/desaccess/docs/api/#/Jobs/status

        Args:
            jobid (str): Either a specific job ID 

        Raises:
            Exception: Retorna uma Execption caso o Job tenha terminado com falha no lado do Desaccess.

        Returns:
            dict: Job status and information. or None when job still running.

        """

        self.logger.info("Check Status for Descut Jobid: [%s]" % jobid)

        config = settings.DESACCESS_API
        url = "{}/job/status".format(config['API_URL'])

        r = requests.post(
            url,
            data={
                "job-id": jobid
            },
            headers={'Authorization': 'Bearer {}'.format(self.login())},
            verify=self.verify_ssl
        )

        response = r.json()
        # self.logger.debug("Response Status: [%s]" % response["status"])

        if response["status"] == "ok":
            # A requisição foi bem sucedida
            job = response["jobs"][0]

            # Verificar o status_job:
            if job["job_status"] == "success":
                self.logger.info("DES Job finished and ready for download and registration.")

                return job

            elif job["job_status"] == "failure":
                # Neste caso o Job falhou na execução do lado do Descut, retorna erro e finaliza o job.

                msg = "DES Job Finished with Descut Error: %s" % job["job_status_message"]
                self.logger.error(msg)
                raise Exception(msg)

            else:
                # Job ainda não terminou com sucesso e nem falhou pode estar rodando ainda,
                # não fazer nada neste caso só logar uma mensagem de debug.
                self.logger.debug("Des Job status: [%s]" % job["job_status"])
                return None

        else:
            # Como esta requisição vai ser usada diversas vezes caso ela falhe apenas é escrito no log.
            # é aceitavel que uma das requisiçoes tenha algum problema como timeout ou outro problema de rede.
            msg = "Error checking DES Job status: %s" % response["message"]
            self.logger.error(msg)

    def delete_job(self, jobid):
        """Delete a job and all associated files

        Args:
            jobid (str): Universally unique identifier of job to be deleted

        Raises:
            Exception: Returns an exception, if the desacess returns a status other than ok.
        """

        self.logger.info("Removing Job on Desaccess. Jobid: [%s]" % jobid)

        config = settings.DESACCESS_API
        url = "{}/job/delete".format(config['API_URL'])

        # Delete job
        r = requests.delete(
            url,
            data=dict({
                "job-id": jobid
            }),
            headers={'Authorization': 'Bearer {}'.format(self.login())},
            verify=self.verify_ssl
        )
        response = r.json()
        # self.logger.debug("Response: %s" % response)
        self.logger.debug("Response Status: [%s]" % response["status"])

        if response["status"] == "ok":
            # Retorna o jobid
            self.logger.debug("Descut Job Deleted with Jobid: [%s]" % jobid)

        else:
            msg = "Error Deleting job: %s" % response["message"]
            raise Exception(msg)

    def get_cutout_tar_filename(self, jobid):
        """Retona o nome do arquivo tar.gz criado no job de cutout.

        Args:
            jobid (str): a specific job ID 

        Returns:
            str: tar.gz filename
        """
        filename = "{}.tar.gz".format(jobid)
        return filename

    def get_cutout_files_url(self, jobid):
        """Retorna a url para o arquivo tar.gz com resultados do cutout job.

        Args:
            jobid (str): a specific job ID 

        Returns:
            str: Url para download do tar.gz
        """
        config = settings.DESACCESS_API

        # Baixar o tar.gz com todos os dados
        filename = self.get_cutout_tar_filename(jobid)

        url = "{}/{}/cutout/{}".format(config["FILES_URL"], config["USERNAME"], filename)
        return url

    def tile_by_coord(self, ra, dec):
        """Searches for a tile's information from a coordinate. 
        NOTE: the urls of the files are not authorized for download. 
        it is necessary to use the file_url_to_download method to generate an authenticated url.

        Args:
            ra (float): RA Coordinate in float.
            dec (float): Dec Coordinate in float.

        Raises:
            Exception: Returns an exception, if the desacess returns a status other than ok.

        Returns:
            dict: Returns a dict with the keys "releases" and "results" both have the same information but are organized differently. 
            releases groups the tile files by release band and then image and catalog. 
            results is an array each element is a release, and then information from the images and catalogs.
        """

        self.logger.info("Get Tile Info by RA: [%s] Dec: [%s]" % (ra, dec))

        config = settings.DESACCESS_API
        url = "{}/tiles/info/coords".format(config['API_URL'])

        r = requests.post(
            url,
            data={
                "coords": "{},{}".format(ra, dec)
            },
            headers={'Authorization': 'Bearer {}'.format(self.login())},
            verify=self.verify_ssl
        )

        response = r.json()
        self.logger.debug("Response Status: [%s]" % response["status"])

        if response["status"] == "ok":
            return response
        else:
            msg = "Error Retrieving Tile Info: %s" % response["message"]
            raise Exception(msg)

    def tile_by_name(self, name):
        """Search for tilename and return all files related to tile. 
        NOTE: the urls of the files are not authorized for download. it is necessary to use the file_url_to_download method to generate an authenticated url.

        Args:
            name (str): Tile name. example: DES2359+0001

        Raises:
            Exception: Returns an exception, if the desacess returns a status other than ok.

        Returns:
            dict: Returns a dict with the keys "releases" and "results" both have the same information but are organized differently. 
            releases groups the tile files by release band and then image and catalog. 
            results is an array each element is a release, and then information from the images and catalogs.
        """

        self.logger.info("Get Tile Info by Name: [%s]" % name)

        config = settings.DESACCESS_API
        url = "{}/tiles/info/name".format(config['API_URL'])

        r = requests.post(
            url,
            data={
                "name": name
            },
            headers={'Authorization': 'Bearer {}'.format(self.login())},
            verify=self.verify_ssl
        )

        response = r.json()
        self.logger.debug("Response Status: [%s]" % response["status"])

        if response["status"] == "ok":
            return response
        else:
            msg = "Error Retrieving Tile Info: %s" % response["message"]
            raise Exception(msg)

    def file_url_to_download(self, file_url):
        """Generates a URL to download a tile file. this url already has authorization parameters.

        Args:
            file_url (str): Url for a file can be an image or catalog.

        Returns:
            str: Authenticated url to Download a file.
        """

        auth_url = "{}?token={}".format(file_url, self.login())

        return auth_url
