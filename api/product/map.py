import logging

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import cm

log = logging.getLogger('django')


def map_color_bar(datamin, datamax, output, height=900, width=60, units='', ):
    """Cria color bar baseada em um valor min e max.

    Args:
        datamin (float): Valor minimo utilizado na escala.
        datamax (float): Valor maximo utilizado na escala
        output (str): Filepath para contendo já o filename ex: /tmp/color_bar.png
        height (float, optional): Altura da imagem em px. Defaults to 900.
        width (float, optional): Largura da Imagem em px. Defaults to 60.
        units (str, optional): Label para a unidade utilizada na colorbar. Defaults to ''.

    Returns:
        str: Filepath do arquivo gerado para a imagem.
    """

    try:
        cmap = mpl.cm.get_cmap("gray_r")
        plt.style.use('dark_background')

        dpis = 100
        fig = plt.figure(figsize=[width / dpis, height / dpis])
        im = plt.imshow(np.random.random((2, 2)), vmin=datamin, vmax=datamax, cmap=cmap)
        im.set_visible(False)
        plt.axis('off')
        cbaxes = fig.add_axes([0.0, 0.02, 0.3, .96])
        plt.gcf().text(0.8, 0.5, units, rotation=90., fontsize=12, horizontalalignment='center', verticalalignment='center', color='w')
        cb = fig.colorbar(im, cax=cbaxes, cmap=cmap)
        plt.savefig(output, dpi=dpis, transparent=True)
        plt.close()

        return output

    except Exception as e:
        log.error("Failed to generate the color bar. %s" % e)
        raise(e)
