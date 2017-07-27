import logging


class Export:

    def __init__(self, product):
        # Get an instance of a logger
        self.logger = logging.getLogger("product_export")

        #Instancia de um Model Product

        self.product = product




