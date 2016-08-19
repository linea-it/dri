from coadd.models import Dataset

class Utils():

    def generate_ptif_url(self, release, host):
        print("Generate PTIFs URLs")

        datasets = Dataset.objects.select_related().filter(tag__tag_release=release)
        print('Datasets: %s', datasets.count())
        for dataset in datasets:
            release = dataset.tag.tag_release
            release_name = release.rls_name
            tile = dataset.tile
            tilename = tile.tli_tilename.replace("+", "%2B")

            url = "http://%s/visiomatic?FIF=data/releases/%s/images/visiomatic/%s.ptif" % (host, release_name, tilename)

            dataset.image_src_ptif = url
            dataset.save()

            print(url)
        print("Complete")