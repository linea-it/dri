Ext.define('Explorer.view.coadd.CoaddController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.coadd',

    listen: {
        component: {
            'coadd-objects': {
                loadpanel: 'onLoadPanel'
            },
            'coadd-visiomatic': {
                changedataset: 'onChangeDataset',
                changeimage: 'onChangeImage'
            }
        },
        store: {
            '#datasets': {
                load: 'onLoadDatasets'
            }
        }
    },

    onLoadPanel: function (source, object_id) {
        // console.log('onLoadPanel(%o, %o)', source, object_id);
        this.loadProduct(source);

    },

    loadProduct: function (source) {
        // console.log('loadProduct(%o)', source);
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            products = vm.getStore('products');

        view.setLoading(true);

        products.addFilter({
            property: 'prd_name',
            value: source
        });

        products.load({
            callback: function () {
                if (this.count() === 1) {
                    me.onLoadProduct(this.first());

                    view.setLoading(false);
                }

            }
        });

    },

    onLoadProduct: function (product) {
        // console.log('onLoadProduct(%o)', product)
        var me = this,
            vm = me.getViewModel(),
            view = me.getView(),
            detailPanel = me.lookup('detailPanel');

        vm.set('currentProduct', product);

        detailPanel.setTitle(product.get('prd_display_name'));

        // Descobrir a Propriedade Id
        me.loadAssociations(product);

    },

    loadAssociations: function (product) {
        // console.log('loadAssociations(%o)', product);
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            associations = vm.getStore('associations');

        view.setLoading(true);

        associations.addFilter({
            property: 'pca_product',
            value: product.get('id')
        });

        associations.load({
            callback: function () {
                if (this.count() > 0) {

                    this.each(function (item) {
                        if (item.get('pcc_ucd') === 'meta.id;meta.main') {
                            vm.set('property_id', item.get('pcn_column_name'));
                        }

                    }, me);

                    view.setLoading(false);

                    me.loadObject();
                }
            }
        });
    },


    loadObject: function () {
        // console.log('loadObject()');
        var me = this,
            vm = me.getViewModel(),
            view = me.getView(),
            product = vm.get('currentProduct'),
            objects = vm.getStore('objects'),
            object_id = vm.get('object_id'),
            property_id = vm.get('property_id');

        view.setLoading(true);

        objects.addFilter([
            {
                property: 'product',
                value: product.get('id')
            },
            {
                property: property_id,
                value: object_id
            }
        ]);

        objects.load({
            callback: function () {
                if (this.count() === 1) {
                    me.onLoadObject(this.first());

                    view.setLoading(false);
                }
            }
        });
    },

    onLoadObject: function (object) {
        var me = this,
            vm = me.getViewModel(),
            grid = me.lookupReference('properties-grid'),
            properties = vm.getStore('properties'),
            datasets = vm.getStore('datasets'),
            aladin = me.lookupReference('aladin'),
            view = me.getView(),
            data, position;

        // Setar as propriedades
        properties.removeAll();

        data = object.data;

        for (var property in data) {
            var prop = property.toLowerCase();

            // nao incluir as propriedades _meta
            if (prop.indexOf('_meta_') === -1) {
                properties.add([
                    [property.toLowerCase(), data[property]]
                ]);
            }
        }

        vm.set('object_data', data);


        grid.setStore(properties);


        // descobrir as tiles do objeto usando as coordenadas do objeto
        position = String(data._meta_ra) + ',' + String(data._meta_dec);

        datasets.addFilter([{
            property: 'position',
            value: position
        }]);

        vm.set('position', position);

        // Criar os dados para o plot Spectral Distribution (Flux)
        me.loadSpectralDistribution();

        view.setLoading(false);

    },

    onLoadDatasets: function (store) {
        // console.log("onLoadDatasets")
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            cmb = visiomatic.lookupReference('cmbCurrentDataset');

        // Apenas uma tile na coordenada do objeto,
        if (store.count() == 1) {
            // setar essa tile no imagepreview
            me.changeImage(store.first());

            cmb.select(store.first());

            // Desabilitar a combobox Image
            cmb.setReadOnly(true);

        } else if (store.count() > 1) {
            me.changeImage(store.first());

            // Seleciona a primeira tile disponivel
            cmb.select(store.first());

            // Habilitar a combobox Image
            cmb.setReadOnly(false);

        } else {
            console.log('Nenhuma tile encontrada para o objeto');
        }

    },

    changeImage: function (dataset) {
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            url = dataset.get('image_src_ptif');

        if (dataset) {
            if (url !== '') {
                visiomatic.setImage(url);

            } else {
                visiomatic.removeImageLayer();

            }

        } else {
            console.log('dataset nao encontrado');
        }
    },

    onChangeDataset: function (dataset) {
        var me = this;

        me.changeImage(dataset);

        // Depois de Selecionar um dataset carregar o Aladin com a imagem
        // do mesmo Release do dataset
        me.loadSurveys(dataset.get('release'))

        // Carregar as Tile Grid que e apresentada no aladin
        me.loadTags(dataset.get('release'))
    },

    onChangeImage: function () {
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('object_data'),
            visiomatic = me.lookupReference('visiomatic'),
            fov = 0.03;

        visiomatic.setView(
            object._meta_ra,
            object._meta_dec,
            fov);
    },

    /**
     * Carrega a lista de imagens disponiveis para um release.
     * @param {int} release - Release ID
     */
    loadSurveys: function (release) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('surveys');

        store.addFilter(
            [
                {
                    property: 'srv_project',
                    value: 'DES'
                },
                {
                    property: 'srv_release',
                    value: release
                }
            ]
        );

        store.load({
            callback: function () {
                me.onLoadSurvey(this);
            }
        })
    },

    onLoadSurvey: function (surveys) {
        // console.log('onLoadSurvey(%o)', surveys)
        var me = this,
            aladin = me.lookupReference('aladin'),
            position = me.getViewModel().get('position'),
            data = me.getViewModel().get('object_data');

        // Aladin
        aladin.goToPosition(position);

        aladin.setFov(180);

        // Marcar com um ponto o Objeto
        aladin.plotObject(data);

    },

    onSearch: function (value) {
        var me = this,
            vm = me.getViewModel(),
            properties = vm.getStore('properties');

        if (value !== '') {
            properties.filter([
                {
                    property: 'property',
                    value: value
                }
            ]);

        } else {
            me.onSearchCancel();
        }

    },

    onSearchCancel: function () {
        var me = this,
            vm = me.getViewModel(),
            properties = vm.getStore('properties');

        properties.clearFilter();

    },

    /**
     * Retorna os tags que estao associados a um release
     * Filtra a Store TagsByRelease de acordo com o release
     */
    loadTags: function (release) {
        var me = this,
            vm = me.getViewModel(),
            tags = vm.getStore('tags');

        if (release > 0) {
            tags.addFilter([
                {
                    property: 'tag_release',
                    value: release
                }
            ]);

            tags.load({
                callback: function () {
                    me.onLoadTags(this);
                }
            })
        }
    },

    onLoadTags: function (store) {
        var me = this;

        if (store.count() > 0) {
            me.loadTiles();
        }
    },

    loadTiles: function () {
        var me = this,
            vm = me.getViewModel(),
            tags = vm.getStore('tags'),
            tiles = vm.getStore('tiles'),
            ids = [];

        tags.each(function (tag) {
            ids.push(tag.get('id'));
        },this);

        tiles.filter([
            {
                property: 'tag',
                operator: 'in',
                value: ids
            }
        ]);
    },

    onClickSimbad: function () {
        console.log('onClickSimbad()');
        // Criar uma URL para o Servico SIMBAD
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('object_data'),
            radius = .1,
            url; // Arcmin

        url = Ext.String.format(
            "http://simbad.u-strasbg.fr/simbad/sim-coo?Coord={0}+{1}&CooFrame=FK5&CooEpoch=2000&Radius={2}&Radius.unit=arcmin&submit=submit+query",
            object._meta_ra, object._meta_dec, radius)

        window.open(url, '_blank')

    },

    onClickNed: function () {
        console.log('onClickNed')
        // Criar uma URL para o Servico NED
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('object_data'),
            radius = .1,
            url; // Arcmin

        url = Ext.String.format(
            "https://ned.ipac.caltech.edu/cgi-bin/objsearch?search_type=Near+Position+Search&in_csys=Equatorial&in_equinox=J2000.0&lon={0}d&lat={1}d&radius={2}",
            object._meta_ra, object._meta_dec, radius)

        window.open(url, '_blank')
    },

    onClickVizier: function () {
        console.log('onClickVizier')
        // Criar uma URL para o Servico VizierCDS
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('object_data'),
            radius = .01,
            url; // Arcmin

        url = Ext.String.format(
            "http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=II/246&-c={0},{1},eq=J2000&-c.rs={2}",
            object._meta_ra, object._meta_dec, radius)

        window.open(url, '_blank')
    },


    loadSpectralDistribution: function () {
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('object_data'),
            spectral = vm.getStore('spectral'),
            mags = ['mag_auto_g', 'mag_auto_r', 'mag_auto_i',
                    'mag_auto_z', 'mag_auto_y'],
            wavelengths = [474, 645.5, 783.5, 926, 1008],
            wavelength, mag_auto, flux, min, max;

        for (var property in object) {
            var prop = property.toLowerCase();

            // nao incluir as propriedades _meta
            if (mags.indexOf(prop) !== -1) {

                mag_auto = parseFloat(parseFloat(object[prop]).toFixed(2));

                if ((parseInt(mag_auto) !== 99) && (parseInt(mag_auto) !== 0)) {
                    flux = (-0.4 * mag_auto);
                    flux = parseFloat(flux.toFixed(1));
                }

                wavelength = wavelengths[mags.indexOf(prop)];

                spectral.add({
                    flux: flux,
                    mag_auto: mag_auto,
                    wavelength: wavelength,
                    property: prop
                })

            }
        }
    }
});
