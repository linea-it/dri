Ext.define('Explorer.view.system.SystemController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.system',

    listen: {
        component: {
            'system': {
                loadpanel: 'onLoadPanel'
            },
            'system-visiomatic': {
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
        this.load(source);

    },

    load: function (source) {
        var me = this;

        me.loadProduct(source);
    },

    loadProduct: function (source) {
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
        var me = this,
            vm = me.getViewModel(),
            view = me.getView(),
            detailPanel = me.lookup('detailPanel');

        vm.set('currentProduct', product);

        detailPanel.setTitle(product.get('prd_display_name'));

        // Descobrir a Propriedade Id
        me.loadAssociations(product);

        // Carregar as propriedades dos system members
        me.loadMembersContent(product);

    },

    loadAssociations: function (product) {
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
            view = me.getView(),
            propGrid = me.lookupReference('properties-grid'),
            properties = vm.getStore('properties'),
            product = vm.get('currentProduct'),
            datasets = vm.getStore('datasets'),
            aladin = me.lookupReference('aladin'),
            data, position;

        view.setLoading(true);

        vm.set('object', object);

        // Setar as propriedades
        properties.removeAll();

        data = object.data;

        vm.set('object_data', data);

        for (var property in data) {
            var prop = property.toLowerCase();

            // nao incluir as propriedades _meta
            if (prop.indexOf('_meta_') === -1) {
                properties.add([
                    [property.toLowerCase(), data[property]]
                ]);
            }
        }

        propGrid.setStore(properties);

        // descobrir as tiles do objeto usando as coordenadas do objeto
        position = String(data._meta_ra) + ',' + String(data._meta_dec);

        datasets.addFilter([{
            property: 'position',
            value: position
        }]);

        // Aladin
        aladin.showDesFootprint();
        aladin.goToPosition(position);
        aladin.setFov(0.1);
        // aladin.plotObject(data, product.get('prd_display_name'));

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
            product = vm.get('currentProduct'),
            object = vm.get('object'),
            visiomatic = me.lookupReference('visiomatic'),
            aladin = me.lookupReference('aladin'),
            fov = 0.05;

        visiomatic.setView(
            object.get('_meta_ra'),
            object.get('_meta_dec'),
            fov);

        // Desenhar Raio
        visiomatic.drawRadius(
            object.get('_meta_ra'),
            object.get('_meta_dec'),
            object.get('_meta_radius'),
            'arcmin');

        visiomatic.showHideRadius(true);


        // Aladin Raio
        aladin.drawRadius(
            object.get('_meta_ra'),
            object.get('_meta_dec'),
            object.get('_meta_radius'),
            'arcmin'
        );

        // Descobrir se tem membros
        // os membros so podem ser plotados depois que o dataset
        // estiver carregado no visiomatic
        if (product.get('prl_related') > 0) {
            me.loadSystemMembers(product, object);
        }

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


    // ---------------------- System Members ----------------------
    loadMembersContent: function (product) {
        var me = this,
            vm = me.getViewModel(),
            displayContents = vm.getStore('displayContents'),
            membersGrid = me.lookupReference('members-grid');

        displayContents.addFilter(
            {
                'property': 'pcn_product_id',
                value: product.get('prl_related')
            }
        );

        displayContents.load({
            callback: function () {
                if (this.check_ucds()) {
                    membersGrid.reconfigureGrid(this);

                }
            }
        });

    },

    loadSystemMembers: function (product, object) {
        var me = this,
            vm = me.getViewModel(),
            members = vm.getStore('members');

        members.addFilter([
            {
                property: 'product',
                value: product.get('prl_related')
            },
            {
                property: product.get('prl_cross_property'),
                value: object.get('id')
            }
        ]);

        members.load({
            callback: function () {
                me.onLoadSystemMembers(this);
            }
        });
    },

    onLoadSystemMembers: function (members) {
        var me = this,
            vm = me.getViewModel(),
            visiomatic = me.lookupReference('visiomatic'),
            aladin = me.lookupReference('aladin'),
            lmembers;

        lmembers = visiomatic.overlayCatalog('sytem_members', members);

        visiomatic.showHideLayer(lmembers, true);

        vm.set('overlayMembers', lmembers);

        // Aladin
        aladin.plotSystemMembers('system_members', members);

    },

    onSelectSystemMember: function (selModel, member) {
        var me = this,
            vm = me.getViewModel(),
            product = vm.get('currentProduct'),
            object = vm.get('object'),
            lMarkPosition = vm.get('lMarkPosition'),
            visiomatic = me.lookupReference('visiomatic'),
            aladin = me.lookupReference('aladin'),
            fov = visiomatic.getFov(),
            position;

        visiomatic.setView(
            member.get('_meta_ra'),
            member.get('_meta_dec'),
            fov,
            true // Nao mover a crosshair
            );

        if (lMarkPosition) {
            visiomatic.showHideLayer(lMarkPosition, false);
        }

        lMarkPosition = visiomatic.markPosition(
            member.get('_meta_ra'),
            member.get('_meta_dec'),
            'x-fa fa-sort-desc fa-2x');

        vm.set('lMarkPosition', lMarkPosition);

        // Aladin
        position = String(member.get('_meta_ra')) + ',' + String(member.get('_meta_dec'));
        aladin.goToPosition(position);

    }
});
