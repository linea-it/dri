from coadd.models import Dataset, Tile, Tag
import csv


class Utils():
    # def generate_ptif_url(self, release, host):
    #     NAO E MAIS VALIDA ESSA FUNCAO POR QUE NO RELEASE Y3 OS PTIFS TEM UM SUFIXO APOS O TILENAME.
    #     print("Generate PTIFs URLs")
    #
    #     datasets = Dataset.objects.select_related().filter(tag__tag_release=release)
    #     print('Datasets: %s', datasets.count())
    #     for dataset in datasets:
    #         release = dataset.tag.tag_release
    #         release_name = release.rls_name
    #         tile = dataset.tile
    #         tilename = tile.tli_tilename.replace("+", "%2B")
    #
    #         url = "http://%s/visiomatic?FIF=data/releases/%s/images/visiomatic/%s.ptif" % (host, release_name, tilename)
    #
    #         dataset.image_src_ptif = url
    #         dataset.save()
    #
    #         print(url)
    #     print("Complete")


    def generate_dataset(self, file):
        print("Associate tile - release - tag")
        # Importa um CSV com esse formato
        # tag (field id); tilename; ptif (host completo)
        # 51;DES0000+0209;http://desportal.cosmology.illinois.edu/visiomatic?FIF=data/releases/y3a1_coadd_test_01/images/visiomatic/DES0000+0209_r2468p01.ptif

        with open(file) as csvfile:
            reader = csv.DictReader(csvfile, fieldnames=('tag', 'tilename', 'ptif'), delimiter=';')

            tag_id = 0
            tag = None
            for row in reader:
                print ('---------------------------')

                if tag_id != row.get('tag'):
                    tag_id = row.get('tag')
                    tag = Tag.objects.select_related().get(pk=tag_id)

                print('Tag: %s' % tag.id)

                # para cara tilename procurar o registro da tile
                tilename = row.get('tilename')
                tile = Tile.objects.select_related().get(tli_tilename__icontains=tilename)

                print('Tile: %s' % tile.id)

                ptif = row.get('ptif')
                ptif = ptif.replace("+", "%2B")

                dataset, created = Dataset.objects.update_or_create(
                    tag=tag, tile=tile)

                dataset.image_src_ptif = ptif

                dataset.save()

                print('Dataset: %s  %s' % (dataset.id, created))

                print('Complete!')

        print('Done!')
