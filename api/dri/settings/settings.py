# Load defaults and local_vars in order to then add/override with development-only settings
from dri.settings.defaults import *
# Load defulta settings for logs
from dri.settings.logging import *

# Aqui é feita a importação do arquivo de variaveis locais.
# As variaveis declaradas neste arquivo sobrescrevem as variaveais declaradas antes
# deste import. isso é usado para permitir diferentes configurações por ambiente.
# basta cada ambiente ter o seu arquivo local_vars.py.
from dri.settings.local_vars import *

