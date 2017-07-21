#import cx_Oracle
from coadd.models import Release, Dataset, Tile, Tag
from django.conf import settings
from pprint import pprint
import copy


class DesoperDatabase:
    def __init__(self):

        kwargs = settings.DATADISCOVERY_DATABASE

        try:
            print ("Connecting to database DESOPER")

            args = {
                'host': kwargs.get('host'),
                'port': kwargs.get('port'),
                'service_name': kwargs.get('service_name')
            }

            dsn = cx_Oracle.makedsn(**args)
            self.db = cx_Oracle.connect(kwargs.get('user'), kwargs.get('password'), dsn=dsn)
            self.cursor = self.db.cursor()

            print ("Connected DESOPER")

        except Exception as e:
            print(e)

    def start(self):

        excludes = ["Y3A1_COADD_TEST_123", "Y3A1_COADD_TEST_123_t025", "Y3A1_COADD_TEST_123_t050",
                    "Y3A1_COADD_TEST_123_t100", "Y3A1_COADD_TEST_DEEP", "Y3A1_COADD_TEST_11"]

        patterns = ["tag like 'Y3A1_COADD_TEST%'", "tag='Y3A1_COADD'", "tag='Y3A1_COADD_DEEP'", "tag='Y3A2_COADD'",
                    "tag='Y3A2'"]

        for pattern in patterns:
            print ("--------------------------------------")

            sql = "SELECT tag, MIN(created_date) as created_date FROM PROD.PROCTAG WHERE %s GROUP BY tag ORDER BY created_date" % pattern

            print ("Finding Tags available: [ %s ]" % sql)

            rows = self.fetchall_dict(sql)

            print ("Tags available: [ %s ]" % len(rows))
            for row in rows:
                print("Tag Name: %s" % row.get('TAG'))

            for row in rows:
                print("--------------------------------------")
                tag = row.get('TAG')

                if tag not in excludes:
                    print("Tag: %s  Created Date: %s" % (tag, row.get('CREATED_DATE')))

                    # Checar se o Release ja existe no DRI se nao existir criar
                    rls_display_name = self.generate_display_name(tag)
                    rls_name = tag.lower()
                    rls_date = row.get('CREATED_DATE')
                    rls_version = 1.0

                    release, created = Release.objects.select_related().get_or_create(
                        rls_name=rls_name,
                        defaults={
                            'rls_display_name': rls_display_name,
                            'rls_date': rls_date,
                            'rls_version': rls_version
                        }
                    )

                    print("Release Created?: [ %s ] Name: [ %s ] ID: [ %s ] " % (created, release, release.id))

                    tag_name = rls_name
                    tag_display_name = 'All'
                    tag_install_date = rls_date

                    field, created = Tag.objects.select_related().get_or_create(
                        tag_release=release,
                        tag_name=rls_name,
                        defaults={
                            'tag_display_name': tag_display_name,
                            'tag_install_date': tag_install_date
                        }

                    )

                    print("Field Created?: [ %s ] Name: [ %s ] ID: [ %s ] " % (created, field, field.id))

                    tiles = self.get_tiles_by_tag(tag, field)

                    count_created = 0
                    count_updated = 0
                    count_fail = 0
                    count = 0
                    for row in tiles:

                        count = count + 1

                        tilename = row.get('TILENAME')

                        try:
                            tile = Tile.objects.select_related().get(tli_tilename__icontains=tilename)

                            dataset, created = Dataset.objects.update_or_create(
                                tag=field,
                                tile=tile,
                                defaults={
                                    'image_src_ptif': row.get('image_src_ptif'),
                                    'archive_path': row.get('ARCHIVE_PATH'),
                                    'date': row.get('CREATED_DATE')
                                }
                            )

                            if created:
                                count_created = count_created + 1
                            else:
                                count_updated = count_updated + 1

                            print("Tile: [%s] [ %s ] Created: [ %s ]" % (format(count, '6d'), tilename, created))

                        except Tile.DoesNotExist:
                            count_fail = count_fail + 1

                    print(
                        "Tiles Total [%s] Created [ %s ] Updated [ %s ] Fail [ %s ]" % (
                            count, count_created, count_updated, count_fail))

                else:
                    print("Tag: %s [ Ignored ]" % tag)

        print ("Done!")

    def fetchall_dict(self, query):
        self.cursor.execute(query)
        header = [item[0] for item in self.cursor.description]
        rows = self.cursor.fetchall()

        l = list()
        d = dict()
        result_dict = dict()

        for row in rows:
            item = dict(zip(header, row))
            l.append(item)
            result_dict = l

        return result_dict

    def get_fits_by_tilename(self, tilename):
        if tilename != None:

            sql = ("SELECT m.filename, m.filetype, m.band, f.path FROM proctag t, file_archive_info f, miscfile m WHERE t.pfw_attempt_id = m.pfw_attempt_id AND t.tag='Y3A1_COADD' AND f.filename=m.filename AND m.filetype NOT IN ('coadd_head_scamp', 'mangle_molys', 'mangle_polygons', 'mangle_csv_ccdgon', 'mangle_csv_cobjmoly', 'mangle_csv_molyccd', 'mangle_csv_molyccd', 'mangle_csv_molygon', 'coadd_psfex_model', 'coadd_qa_scamp', 'coadd_xml_scamp', 'coadd_xml_psfex', 'coadd_det_psfex_model') AND m.tilename = '" + tilename + "' ORDER BY m.filetype, m.filename")

            print("Query: %s" % sql)

            tiles = self.fetchall_dict(sql)

            fits_file = {}

            result = []

            for tile in tiles:

                url = "https://desar2.cosmology.illinois.edu/DESFiles/desarchive/%s/%s.fz" % (tile.get('PATH').replace("+", "%2B"), tile.get('FILENAME').replace("+", "%2B"))

                fits_file.update({'url': url})

                fits_file.update({
                    'tilename': tile.get('FILENAME')
                })

                fits_file.update({
                    'band': tile.get('BAND')
                })

                result.append(copy.copy(fits_file))

            return result

        else:
            return list()

if __name__ == '__main__':
    print ("---------- stand alone -------------")

    DataDiscovery().start()

    # from coadd.datadiscovery import DataDiscovery
    # DataDiscovery().assocition_tag_tile()
