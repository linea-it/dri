# import cx_Oracle
# from coadd.models import Release, Dataset, Tile, Tag
# from django.conf import settings
# from pprint import pprint
# import copy
#
#
# class DesoperDatabase:
#     def __init__(self):
#
#         kwargs = settings.DATADISCOVERY_DATABASE
#
#         try:
#             print ("Connecting to database DESOPER")
#
#             args = {
#                 'host': kwargs.get('host'),
#                 'port': kwargs.get('port'),
#                 'service_name': kwargs.get('service_name')
#             }
#
#             dsn = cx_Oracle.makedsn(**args)
#             self.db = cx_Oracle.connect(kwargs.get('user'), kwargs.get('password'), dsn=dsn)
#             self.cursor = self.db.cursor()
#
#             print ("Connected DESOPER")
#
#         except Exception as e:
#             print(e)
#
#     def fetchall_dict(self, query):
#         self.cursor.execute(query)
#         header = [item[0] for item in self.cursor.description]
#         rows = self.cursor.fetchall()
#
#         l = list()
#         d = dict()
#         result_dict = dict()
#
#         for row in rows:
#             item = dict(zip(header, row))
#             l.append(item)
#             result_dict = l
#
#         return result_dict
#
#     def get_fits_by_tilename(self, tilename):
#         if tilename != None:
#
#             sql = ("SELECT m.filename, m.filetype, m.band, f.path FROM proctag t, file_archive_info f, miscfile m WHERE t.pfw_attempt_id = m.pfw_attempt_id AND t.tag='Y3A1_COADD' AND f.filename=m.filename AND m.filetype NOT IN ('coadd_head_scamp', 'mangle_molys', 'mangle_polygons', 'mangle_csv_ccdgon', 'mangle_csv_cobjmoly', 'mangle_csv_molyccd', 'mangle_csv_molyccd', 'mangle_csv_molygon', 'coadd_psfex_model', 'coadd_qa_scamp', 'coadd_xml_scamp', 'coadd_xml_psfex', 'coadd_det_psfex_model') AND m.tilename = '" + tilename + "' ORDER BY m.filetype, m.filename")
#
#             print("Query: %s" % sql)
#
#             tiles = self.fetchall_dict(sql)
#
#             fits_file = {}
#
#             result = []
#
#             for tile in tiles:
#
#                 url = "https://desar2.cosmology.illinois.edu/DESFiles/desarchive/%s/%s.fz" % (tile.get('PATH').replace("+", "%2B"), tile.get('FILENAME').replace("+", "%2B"))
#
#                 fits_file.update({'url': url})
#
#                 fits_file.update({
#                     'tilename': tile.get('FILENAME')
#                 })
#
#                 fits_file.update({
#                     'band': tile.get('BAND')
#                 })
#
#                 result.append(copy.copy(fits_file))
#
#             return result
#
#         else:
#             return list()
#
# if __name__ == '__main__':
#     print ("---------- stand alone -------------")
#
#     DataDiscovery().start()
#
#     # from coadd.datadiscovery import DataDiscovery
#     # DataDiscovery().assocition_tag_tile()
