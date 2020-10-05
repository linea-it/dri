
import healpy as hp


def ang2pix(ra, dec, nside, nest):
    """Converte uma coordenada em RA, Dec degrees para Healpix.

    Args:
        ra (float): [description]
        dec (float): [description]
        nside (int): [description]
        nest (bool): [description]

    Returns:
        int: healpix referente a posição.
    """
    return hp.ang2pix(nside, float(ra), float(dec), nest=nest, lonlat=True)


def ang2pix_neighbours(ra, dec, nside, nest):
    """Converte uma coordenada em RA, Dec degrees para Healpix.
    retorna uma lista com todos os pixels vizinhos. 

    Args:
        ra (float): [description]
        dec (float): [description]
        nside (int): [description]
        nest (bool): [description]

    Returns:
        int: healpix referente a posição.
    """
    return hp.get_all_neighbours(nside, float(ra), float(dec), nest=nest, lonlat=True)
