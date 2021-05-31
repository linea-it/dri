import os
import logging
from django.utils import timezone
from math import log
import requests
import shutil


class Download():
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("downloads")

    def download_file_from_url(self, url, dir, filename, ignore_errors=False, auth=None):
        """
        Esta funcao faz o download de um arquivo
        :param url: url completa de qual arquivo deve ser baixado
        :param dir: path completo onde o arquivo devera se salvo
        :param filename: nome do arquivo apos baixado
        :param auth: tupla (user, password)
        :return: file_path: file path completo do arquivo salvo
        """
        self.logger.info("Downloading %s " % filename)

        self.logger.debug("From: %s" % url)

        file_path = os.path.join(dir, filename)

        start = timezone.now()

        if not os.path.exists(file_path):
            try:

                #urllib.request.urlretrieve(url, file_path)
                r = requests.get(url, stream=True, verify=False, auth=auth)
                if r.status_code == 200:
                    with open(file_path, 'wb') as f:
                        r.raw.decode_content = True
                        shutil.copyfileobj(r.raw, f)

                size = os.path.getsize(file_path)
                hsize = self.bytes2human(size)

                self.logger.debug("File: %s" % file_path)
                self.logger.debug("Size: %s" % hsize)

                finish = timezone.now()

                tdelta = finish - start
                seconds = tdelta.total_seconds()

                self.logger.debug("Time: %s seconds" % seconds)

                self.logger.info("Downloading Done! File: %s Size: %s bytes" % (filename, hsize))

                return file_path

            except Exception as e:
                self.logger.error(e)
                if ignore_errors:
                    return None
                else:
                    raise e
        else:
            self.logger.debug("File %s exists" % filename)
            return file_path

    def bytes2human(self, n, format='%(value).0f %(symbol)s', symbols='customary'):
        """
        (c) http://code.activestate.com/recipes/578019/

        Convert n bytes into a human readable string based on format.
        symbols can be either "customary", "customary_ext", "iec" or "iec_ext",
        see: http://goo.gl/kTQMs

          bytes2human(0)
          '0.0 B'
          bytes2human(0.9)
          '0.0 B'
          bytes2human(1)
          '1.0 B'
          bytes2human(1.9)
          '1.0 B'
          bytes2human(1024)
          '1.0 K'
          bytes2human(1048576)
          '1.0 M'
          bytes2human(1099511627776127398123789121)
          '909.5 Y'

          bytes2human(9856, symbols="customary")
          '9.6 K'
          bytes2human(9856, symbols="customary_ext")
          '9.6 kilo'
          bytes2human(9856, symbols="iec")
          '9.6 Ki'
          bytes2human(9856, symbols="iec_ext")
          '9.6 kibi'

          bytes2human(10000, "%(value).1f %(symbol)s/sec")
          '9.8 K/sec'

          # precision can be adjusted by playing with %f operator
          bytes2human(10000, format="%(value).5f %(symbol)s")
          '9.76562 K'
        """
        dsymbols = {
            'customary': ('B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'),
            'customary_ext': ('byte', 'kilo', 'mega', 'giga', 'tera', 'peta', 'exa',
                              'zetta', 'iotta'),
            'iec': ('Bi', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'),
            'iec_ext': ('byte', 'kibi', 'mebi', 'gibi', 'tebi', 'pebi', 'exbi',
                        'zebi', 'yobi'),
        }
        n = int(n)
        if n < 0:
            raise ValueError("n < 0")
        symbols = dsymbols[symbols]
        prefix = {}
        for i, s in enumerate(symbols[1:]):
            prefix[s] = 1 << (i + 1) * 10
        for symbol in reversed(symbols[1:]):
            if n >= prefix[symbol]:
                value = float(n) / prefix[symbol]
                return format % locals()
        return format % dict(symbol=symbols[0], value=n)

    def sizeof_fmt(num):
        """Human friendly file size"""
        unit_list = zip(['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'], [0, 0, 1, 2, 2, 2])
        if num > 1:
            exponent = min(int(log(num, 1024)), len(unit_list) - 1)
            quotient = float(num) / 1024 ** exponent
            unit, num_decimals = unit_list[exponent]
            format_string = '{:.%sf} {}' % (num_decimals)
            return format_string.format(quotient, unit)
        if num == 0:
            return '0 bytes'
        if num == 1:
            return '1 byte'
