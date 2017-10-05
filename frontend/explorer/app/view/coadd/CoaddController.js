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

        // Aladin
        aladin.showDesFootprint();
        aladin.goToPosition(position);
        aladin.plotObject(data);

        view.setLoading(false);

    },

    onLoadDatasets: function (store) {
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
    },

    onChangeImage: function () {
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('object_data'),
            visiomatic = me.lookupReference('visiomatic'),
            fov = 0.05;

        visiomatic.setView(
            object._meta_ra,
            object._meta_dec,
            fov);

        // map = visiomatic.getMap();
        // libL = visiomatic.libL;
        // wcs = map.options.crs;
        // console.log('---------------------------------');
        // var latLng = wcs.eqToCelsys(object.DEC, object.RA);
        // latlng = libL.latLng(latLng.lat, latLng.lng);
        // console.log(latlng);
        // var path = libL.ellipseMarker(latlng, {
        //     majAxis: object.A_IMAGE / 3600.0,
        //     minAxis: object.B_IMAGE / 3600.0,
        //     posAngle: 90 - object.THETA_IMAGE,
        //     color: '#FFFF00'
        // }).addTo(map);

        // feature = libL.ellipse(latlng, {
        //     majAxis: object.A_IMAGE / 3600.0,
        //     minAxis: object.B_IMAGE / 3600.0,
        //     posAngle: 90 - object.THETA_IMAGE
        // });

        // feature.addTo(map);

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

    }

});
