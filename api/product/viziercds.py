import csv
from io import StringIO

import requests
from rest_framework.response import Response


class VizierCDS:
    def get_available_catalogs(self):

        return list([
            # 2MASS
            dict({
                "id": "vizier_2mass",
                "external_catalog": True,
                "prd_name": "2MASS",
                "prd_display_name": "2MASS All-Sky",
                "cds_source": "II/246",
                "cds_fieldnames": ",".join(["2MASS", "RAJ2000", "DEJ2000", "Jmag", "Hmag", "Kmag"]),
                "ctl_num_objects": 470992970,
                "description": "2MASS All-Sky Catalog of Point Sources (Cutri+ 2003)",
                "owner": "Vizier",
                "pcl_is_system": False,
                "is_owner": False,
                "text": "2MASS All-Sky",
                "bookmark": None,
                "tableExist": True,
                "editable": False,
                "markable": False,
                "iconCls": "no-icon",
                "leaf": True,
            }),
            # SDSS release 9
            dict({
                "id": "vizier_sdss",
                "external_catalog": True,
                "prd_name": "SDSS9",
                "prd_display_name": "SDSS release 9",
                "cds_source": "V/139",
                "cds_fieldnames": ",".join(["SDSS9", "RAJ2000", "DEJ2000", "umag", "gmag", "rmag", "imag", "zmag"]),
                "ctl_num_objects": 0,
                "description": "SDSS Photometric Catalog, Release 9 (Adelman-McCarthy et al. 2012)",
                "owner": "Vizier",
                "pcl_is_system": False,
                "is_owner": False,
                "text": "SDSS release 9",
                "bookmark": None,
                "tableExist": True,
                "editable": False,
                "markable": False,
                "iconCls": "no-icon",
                "leaf": True,
            }),
            # PPMXL
            dict({
                "id": "vizier_ppmxl",
                "external_catalog": True,
                "prd_name": "PPMXL",
                "prd_display_name": "PPMXL",
                "cds_source": "I/317",
                "cds_fieldnames": ",".join(["PPMXL", "RAJ2000", "DEJ2000", "Jmag", "Hmag", "Kmag", "b1mag", "b2mag",
                                            "r1mag", "r2mag", "imag", "pmRA", "pmDE"]),
                "ctl_num_objects": 0,
                "description": "PPM-Extended, positions and proper motions by Roeser et al. 2008",
                "owner": "Vizier",
                "pcl_is_system": False,
                "is_owner": False,
                "text": "PPMXL",
                "bookmark": None,
                "tableExist": True,
                "editable": False,
                "markable": False,
                "iconCls": "no-icon",
                "leaf": True,
            }),
            # # Abell clusters
            # dict({
            #     "id": "vizier_abell",
            #     "external_catalog": True,
            #     "prd_name": "abell_clusters",
            #     "prd_display_name": "Abell clusters",
            #     "cds_source": "VII/110A",
            #     "cds_fieldnames": ",".join(["ACO", "RAJ2000", "DEJ2000", "m10", "Rich", "Dclas"]),
            #     "ctl_num_objects": 0,
            #     "description": "Rich Clusters of Galaxies (Abell et al. 1989)",
            #     "owner": "Vizier",
            #     "pcl_is_system": False,
            #     "is_owner": False,
            #     "text": "Abell clusters",
            #     "bookmark": None,
            #     "tableExist": True,
            #     "editable": False,
            #     "markable": False,
            #     "iconCls": "no-icon",
            #     "leaf": True,
            # }),
            # # NVSS
            # dict({
            #     "id": "vizier_nvss",
            #     "external_catalog": True,
            #     "prd_name": "nvss",
            #     "prd_display_name": "NVSS",
            #     "cds_source": "VIII/65/NVSS",
            #     "cds_fieldnames": ",".join(["NVSS", "RAJ2000", "DEJ2000", "S1.4", "MajAxis", "MinAxis", "PA"]),
            #     "ctl_num_objects": 0,
            #     "description": "1.4GHz NRAO VLA Sky Survey (NVSS) (Condon et al. 1998)",
            #     "owner": "Vizier",
            #     "pcl_is_system": False,
            #     "is_owner": False,
            #     "text": "NVSS",
            #     "bookmark": None,
            #     "tableExist": True,
            #     "editable": False,
            #     "markable": False,
            #     "iconCls": "no-icon",
            #     "leaf": True,
            # }),
            # # FIRST
            # dict({
            #     "id": "vizier_first",
            #     "external_catalog": True,
            #     "prd_name": "visier_first",
            #     "prd_display_name": "FIRST",
            #     "cds_source": "VIII/92/first14",
            #     "cds_fieldnames": ",".join(["FIRST", "RAJ2000", "DEJ2000", "Fpeak", "fMaj", "fMin", "fPA"]),
            #     "ctl_num_objects": 0,
            #     "description": "The FIRST Survey Catalog (Helfand et al. 2015)",
            #     "owner": "Vizier",
            #     "pcl_is_system": False,
            #     "is_owner": False,
            #     "text": "FIRST",
            #     "bookmark": None,
            #     "tableExist": True,
            #     "editable": False,
            #     "markable": False,
            #     "iconCls": "no-icon",
            #     "leaf": True,
            # }),
            # AllWISE
            dict({
                "id": "vizier_allwise",
                "external_catalog": True,
                "prd_name": "visier_allwise",
                "prd_display_name": "AllWISE",
                "cds_source": "II/328/allwise",
                "cds_fieldnames": ",".join(["AllWISE", "RAJ2000", "DEJ2000", "W1mag", "W2mag", "W3mag", "W4mag"]),
                "ctl_num_objects": 0,
                "description": "AllWISE Data Release (Cutri et al. 2013)",
                "owner": "Vizier",
                "pcl_is_system": False,
                "is_owner": False,
                "text": "AllWISE",
                "bookmark": None,
                "tableExist": True,
                "editable": False,
                "markable": False,
                "iconCls": "no-icon",
                "leaf": True,
            }),
            # GALEX_AIS
            dict({
                "id": "vizier_galex_ais",
                "external_catalog": True,
                "prd_name": "visier_galex_ais",
                "prd_display_name": "GALEX AIS",
                "cds_source": "II/312/ais",
                "cds_fieldnames": ",".join(["objid", "RAJ2000", "DEJ2000", "FUV", "NUV"]),
                "ctl_num_objects": 0,
                "description": "GALEX catalogs of UV sources: All-sky Imaging Survey (Bianchi et al. 2011)",
                "owner": "Vizier",
                "pcl_is_system": False,
                "is_owner": False,
                "text": "GALEX AIS",
                "bookmark": None,
                "tableExist": True,
                "editable": False,
                "markable": False,
                "iconCls": "no-icon",
                "leaf": True,
            }),
            # GAIA_DR1
            dict({
                "id": "vizier_gaia_dr1",
                "external_catalog": True,
                "prd_name": "visier_gaia_dr1",
                "prd_display_name": "GAIA DR1",
                "cds_source": "I/337",
                "cds_fieldnames": ",".join(["Source", "RA_ICRS", "DE_ICRS", "<Gmag>", "pmRA", "pmDE"]),
                "ctl_num_objects": 0,
                "description": "First Gaia Data Release (2016)",
                "owner": "Vizier",
                "pcl_is_system": False,
                "is_owner": False,
                "text": "GAIA DR1",
                "bookmark": None,
                "tableExist": True,
                "editable": False,
                "markable": False,
                "iconCls": "no-icon",
                "leaf": True,
            }),
            # URAT1
            dict({
                "id": "vizier_urat1",
                "external_catalog": True,
                "prd_name": "visier_urat1",
                "prd_display_name": "URAT1",
                "cds_source": "I/329",
                "cds_fieldnames": ",".join(["URAT1", "RAJ2000", "DEJ2000", "f.mag", "pmRA", "pmDE"]),
                "ctl_num_objects": 0,
                "description": "The first U.S. Naval Observatory Astrometric Robotic Telescope Catalog (Zacharias et al. 2015)",
                "owner": "Vizier",
                "pcl_is_system": False,
                "is_owner": False,
                "text": "URAT1",
                "bookmark": None,
                "tableExist": True,
                "editable": False,
                "markable": False,
                "iconCls": "no-icon",
                "leaf": True,
            }),
        ])

    def get_objects(self, source, fieldnames, coordinates, bounds):
        """
        Faz uma requisicao ao servico Visier CDS e faz um parse do resultado que vem em csv para o
        uma lista de dict como se fosse um produto do DRI.
        Documentacao do Visizer
        http://vizier.u-strasbg.fr/vizier/doc/vizquery.htx

        Exemplo de uma URL
        http://vizier.u-strasbg.fr/viz-bin/asu-tsv?&-mime=csv&-source=II/246&-out=2MASS, RAJ2000, DEJ2000, Jmag, Hmag, Kmag&-out.meta=&-c.eq=J2000.0&-c=335.445459,-0.465377&-c.bd=0.0782,0.0595&-out.max=10001

        Params a serem enviados. Nao estou enviando os parametros pelo atributo params do request, por que
        nao funcionou, por que a lib requests encoda os parametros e API do visier nao aceita.
        {
            "-mime": "csv",
            "-source": "II/246",
            "-out": "2MASS, RAJ2000, DEJ2000, Jmag, Hmag, Kmag",
            "-out.meta": "",
            "-c.eq": "J2000.0",
            "-c:": "335.445459, -0.465377", {lng, lat}
            "-c.bd": "0.0782, 0.0595",
            "-out.max": "10000"
        }
        """

        entry_point = "http://vizier.u-strasbg.fr/viz-bin/asu-tsv"

        # Parametros
        params = tuple([
            ("-mime", "csv"),
            ("-source", source),
            ("-out", fieldnames),
            ("-out.meta", ''),
            ("-c.eq", "J2000.0"),
            ("-c", "%s,%s" % (coordinates[1], coordinates[0])),
            ("-c.bd", "%s,%s" % (bounds[1], bounds[0])),
            ("-out.max", "10000")
        ])

        # Criar uma string com os parametros
        payload_str = "&".join("%s=%s" % (k, v) for k, v in params)

        fieldnames = fieldnames.split(',')

        try:
            response = requests.get(
                entry_point + "?" + payload_str,
                headers={
                    "Accept": "text/tab-separated-values",
                },
            )

            # Converter o CSV para Json
            csv_str = StringIO(response.text)

            # remover as linhas da resposta que estao comentadas e a linha que separa os dados
            lines = list()
            for l in csv_str:
                if not l.startswith("#") and not l.startswith("---"):
                    lines.append(l)

            rows = list()

            reader = csv.DictReader(lines, fieldnames=fieldnames, delimiter=';')
            for row in reader:
                # As 3 primeiras propriedades sempre serao (ID, RA, DEC)
                meta_id = row.get(fieldnames[0].strip())
                ra = row.get(fieldnames[1].strip())
                dec = row.get(fieldnames[2].strip())

                # Cria uma url para acessar o objeto direto no visier.
                object_url = ("http://vizier.u-strasbg.fr/viz-bin/VizieR-5"
                              "?-source=%s&-c=%s,%s,eq=J2000&-c.rs=0.01" % (source, ra, dec))

                row.update({
                    "_meta_id": meta_id,
                    "_meta_ra": ra,
                    "_meta_dec": dec,
                    "_meta_object_url": object_url
                })

                rows.append(row)

            return rows

        except Exception as e:
            raise(e)