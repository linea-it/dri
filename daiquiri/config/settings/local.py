# the hostname and port number of the current Server
BASE_HOST = "http://localhost"

# A list of strings representing the host/domain names that this Django site can serve.
ALLOWED_HOSTS = ['*']

QUERY_DROPDOWNS = [
    {
        'key': 'simbad',
        'service': 'query/js/dropdowns/simbad.js',
        'template': 'query/query_dropdown_simbad.html',
        'options': {
            'url': 'https://simbad.u-strasbg.fr/simbad/sim-id'
        }
    },
    {
        'key': 'vizier',
        'service': 'query/js/dropdowns/vizier.js',
        'template': 'query/query_dropdown_vizier.html',
        'options': {
            'url': 'https://vizier.u-strasbg.fr/viz-bin/votable',
            'catalogs': ['I/322A', 'I/259', 'II/281', 'II/246', 'V/139', 'V/147', 'I/317', 'II/328/allwise', 'II/312/ais', 'I/345', 'I/350', 'I/329', 'II/349', 'II/342']
        }
    },
]


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/
STATIC_URL = '/daiquiri_static/'

SITE_ID = 2
SITE_IDENTIFIER = 'http://localhost/daiquiri/'
SITE_TITLE = 'LIneA - Laboratório Interinstitucional de e-Astronomia'
SITE_DESCRIPTION = "É um laboratório multiusuário apoiado pelo Observatório Nacional (ON), o Laboratório Nacional de Computação Científica (LNCC), e a Rede Nacional de Ensino e Pesquisa (RNP), que foi criado com a finalidade de dar suporte à participação brasileira em levantamentos astronômicos gerando grandes volumes de dados. Para alcançar os objetivos científicos destes projetos, o LIneA gerencia toda uma infraestrutura de armazenamento, processamento, análise e distribuição de dados astronômicos e desenvolve tecnologia para lidar com os desafios de projetos envolvendo Big Data. Participam do LIneA pesquisadores e técnicos dos institutos do MCTI mencionados acima, além de professores de universidades."
SITE_LICENSE = 'CC0'
SITE_CREATOR = 'LIneA'
SITE_CONTACT = {
    'name': 'LIneA',
    'address': 'Rua General José Cristino, 77 - Vasco da Gama - Rio de Janeiro - RJ - Brasil - 20921-400',
    'email': 'scienceserver@linea.gov.br',

}
SITE_PUBLISHER = 'LIneA'
SITE_CREATED = '2021-08-23'
SITE_UPDATED = '2021-08-26'

AUTH_SIGNUP = False

QUERY_QUEUES = [
    {
        'key': 'default',
        'label': '30 Seconds',
        'timeout': 30,
        'priority': 1,
        'access_level': 'PUBLIC',
        'groups': []
    },
    {
        'key': 'five_minutes',
        'label': '5 Minutes',
        'timeout': 300,
        'priority': 2,
        'access_level': 'PUBLIC',
        'groups': []
    },
    {
        'key': 'fifteen_minutes',
        'label': '15 Minutes',
        'timeout': 900,
        'priority': 3,
        'access_level': 'PUBLIC',
        'groups': []
    }
]

QUERY_LANGUAGES = [
    {
        'key': 'adql',
        'version': 2.0,
        'label': 'ADQL',
        'description': '',
        'quote_char': '"'
    },
    {
        'key': 'postgresql',
        'version': 13.4,
        'label': 'PostgreSQL',
        'description': '',
        'quote_char': '"'
    }
]
