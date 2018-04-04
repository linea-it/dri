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
            products = vm.getStore('products'),
            vacProducts = vm.getStore('vacProducts');

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

        vacProducts.addFilter({
            property: 'class_name',
            value: 'vac_cluster'
        });

        vacProducts.load({
            scope: me,
            callback: me.onLoadVacProducts
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

        // Load VAC cluster used with input in original proccess
        me.loadVacCluster();


    },

    loadVacCluster: function () {
        console.log('loadVacCluster()')
        var me = this,
            vm = me.getViewModel(),
            product = vm.get('currentProduct'),
            relateds = vm.getStore("productRelateds");

        relateds.addFilter([
            {
                property: 'prl_product',
                value: product.get('id')
            },
            {
                property: 'prl_relation_type',
                value: "input"
            },
            {
                property: 'prd_class',
                value: "vac_cluster"
            }
        ]);

        relateds.load({
            callback: function (response) {
                if (relateds.count() == 1) {
                    vm.set('relatedVacCluster', relateds.first())

                    me.linkVacRelatedWithVacProduct();
                }
            }
        });
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

        vm.set('position', position);

        view.setLoading(false);

        // Descobrir se tem membros
        // os membros so podem ser plotados depois que o dataset
        // estiver carregado no visiomatic
        if (product.get('prl_related') > 0) {
            me.loadSystemMembers(product, object);
        }

        // Setar um valor default para o raio utilizado na VacGrid
        // por default 2 vezes o valor do raio
        // vacRadius = object.get('_meta_radius') * 2;
        vm.set('vacRadius', 2);

        // Formatar RA, Dec
        vm.set('display_ra', parseFloat(object.get('_meta_ra')).toFixed(5));
        vm.set('display_dec', parseFloat(object.get('_meta_dec')).toFixed(5));
        vm.set('display_radius', parseFloat(object.get('_meta_radius')).toFixed(3));
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

            visiomatic.setDataset(dataset.get('id'));
            visiomatic.setCurrentDataset(dataset);

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
        // console.log('onChangeImage')
        var me = this,
            vm = me.getViewModel(),
            product = vm.get('currentProduct'),
            object = vm.get('object'),
            visiomatic = me.lookupReference('visiomatic'),
            aladin = me.lookupReference('aladin'),
            members = vm.getStore('members')
            fov = 0.07;

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

        me.onLoadSystemMembers(members);

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

        // Aladin Raio
        aladin.drawRadius(
            data._meta_ra,
            data._meta_dec,
            data._meta_radius,
            'arcmin'
        );

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
            currentProduct = vm.get('currentProduct'),
            visiomatic = me.lookupReference('visiomatic'),
            aladin = me.lookupReference('aladin'),
            lmembers;

        lmembers = visiomatic.overlayCatalog(currentProduct.get('prd_display_name'), members);

        visiomatic.showHideLayer(lmembers, true);

        vm.set('overlayMembers', lmembers);

        // Aladin
        aladin.plotSystemMembers(currentProduct.get('prd_display_name'), members);

        vm.set('have_members', true);

    },

    onSelectSystemMember: function (selModel, member) {
        this.highlightObject(member);

    },

    highlightObject: function (object, sincGrid) {
        var me = this,
            vm = me.getViewModel(),
            product = vm.get('currentProduct'),
            lMarkPosition = vm.get('lMarkPosition'),
            visiomatic = me.lookupReference('visiomatic'),
            aladin = me.lookupReference('aladin'),
            fov = visiomatic.getFov(),
            grid = me.lookup('members-grid'),
            position;

        visiomatic.setView(
            object.get('_meta_ra'),
            object.get('_meta_dec'),
            fov,
            true // Nao mover a crosshair
            );

        if (lMarkPosition) {
            visiomatic.showHideLayer(lMarkPosition, false);
        }

        lMarkPosition = visiomatic.markPosition(
            object.get('_meta_ra'),
            object.get('_meta_dec'),
            'x-fa fa-sort-desc fa-2x');

        vm.set('lMarkPosition', lMarkPosition);

        // Aladin
        position = String(object.get('_meta_ra')) + ',' + String(object.get('_meta_dec'));
        aladin.goToPosition(position);

        vm.set('selected_member', object);

        // if (sincGrid) {
            // index = grid.getStore().find('_meta_id', member.get('_meta_id'));
            // grid.getView().getRow(index).scrollIntoView();
        //}
    },


    // -------------------------- VACs -----------------------------------------

    /**
     * Executada quando a store de vacs e carregada.
     */
    onLoadVacProducts: function () {
        var me = this;

        me.linkVacRelatedWithVacProduct()
    },


    linkVacRelatedWithVacProduct: function () {
        // console.log("linkVacRelatedWithVacProduct()")
        var me = this,
            vm = me.getViewModel(),
            relatedVacCluster = vm.get('relatedVacCluster'),
            vacProducts = vm.getStore("vacProducts");

        if (relatedVacCluster.get("id")) {
            vacCluster = vacProducts.getAt(vacProducts.find("id", relatedVacCluster.get("prl_related")));

            vm.set("vacCluster", vacCluster);

        }
    },
    /**
     * Executado quando e selecionado um Vac na combobox.
     * Apenas seta no model o produto de vac selecionado e executa o metodo
     * que vai carregar as propriedades do vac.
     */
    onSelectVacProduct: function (cmb, currentVacProduct) {
        // console.log('onSelectVacProduct(%o)', currentVacProduct)

        var me = this,
            vm = me.getViewModel(),
            vacObjects = me.getStore('vacObjects');

        vm.set('currentVacProduct', currentVacProduct);
        vm.set('have_vac', true);

        vacObjects.removeAll();

        // Carregar as propriedades do produto de vac e depois os objetos.
        me.loadVacProductContent(currentVacProduct);

    },

    /**
     * Carrega as propriedades do produto de vac, reconfigura a grid e depois
     * executa o metodo que vai fazer load dos objetos.
     */
    loadVacProductContent: function (product) {
        // console.log('loadVacProductContent(%o)', product)
        var me = this,
            vm = me.getViewModel(),
            displayContents = vm.getStore('vacProductDisplayContents'),
            vacGrid = me.lookupReference('vac-grid');

        displayContents.addFilter(
            {
                'property': 'pcn_product_id',
                value: product.get('id')
            }
        );

        displayContents.load({
            callback: function () {
                if (this.check_ucds()) {
                    // Reconfigurar a Grid de Vac com a propriedades do catalogo
                    vacGrid.reconfigureGrid(this);

                    // Carregar os objectos do produto de vac
                    me.loadVacObjects();
                }
            }
        });

    },

    calculateVacRadius: function (cluster_radius) {
        var me = this,
            vm = me.getViewModel(),
            multiplier = vm.get('vacRadius')

        // DIVIDIR O radius por 60 por que esta em arcmin
        vacRadius = (cluster_radius * multiplier) / 60;

        return vacRadius.toFixed(3);
    },

    loadVacObjects: function () {
        // console.log('loadVacObjects()')
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('object'),
            currentVacProduct = vm.get('currentVacProduct'),
            vacObjects = vm.getStore('vacObjects'),
            vacRadius;

        vacObjects.clearFilter();

        // DIVIDIR O radius por 60 por que esta em arcmin
        vacRadius = me.calculateVacRadius(object.get('_meta_radius'));


        vacObjects.addFilter([
            {
                property: 'product',
                value: currentVacProduct.get('id')
            },
            {
                property: 'lon',
                value: object.get('_meta_ra')
            },
            {
                property: 'lat',
                value: object.get('_meta_dec')
            },
            {
                property: 'radius',
                value: vacRadius
            },
        ])

        vacObjects.load({
            callback: function () {
                me.onLoadVacObjects(this)
            }
        })
    },

    onLoadVacObjects: function (store) {
        // console.log('onLoadVacObjects(%o)', store);
        var me = this,
            vm = me.getViewModel(),
            currentVacProduct = vm.get('currentVacProduct'),
            visiomatic = me.lookupReference('visiomatic');

        // Toda vez que fizer load, remover a layers
        if (vm.get('overlayVac') != null) {
            visiomatic.showHideLayer(vm.get('overlayVac'), false);
        }

        lvacs = visiomatic.overlayCatalog(currentVacProduct.get('prd_display_name'), store, {
            color: '#' + vm.get('vacOverlayColor'),
            pointSize: (vm.get('vacOverlayPointSize') / 1000),
            pointType: vm.get('vacOverlaypointType')
        });

        vm.set('overlayVac', lvacs);

        me.showHideOverlayVacs();

    },

    changeVisibleOverlayVacs: function (btn, state) {
        var me = this,
            vm = me.getViewModel();

        vm.set('visibleOverlayVacs', state);

        if (state) {
            btn.setIconCls('x-fa fa-eye');
        } else {
            btn.setIconCls('x-fa fa-eye-slash');
        }
        me.showHideOverlayVacs();
    },

    showHideOverlayVacs: function () {
        // console.log('showHideOverlayVacs()')
        var me = this,
            vm = me.getViewModel(),
            state = vm.get('visibleOverlayVacs'),
            lvacs = vm.get('overlayVac'),
            visiomatic = me.lookupReference('visiomatic');

        visiomatic.showHideLayer(lvacs, state);
    },

    onSelectVacObject: function (selModel, object) {
        this.highlightObject(object);

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

    parseRA: function (ra) {
        if (ra < 0) {
            return ra + 360;
        }
        return ra;
    },

    onClickSimbad: function () {
        // console.log('onClickSimbad()');
        // Criar uma URL para o Servico SIMBAD
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('object_data'),
            ra = parseFloat(me.parseRA(object._meta_ra)).toFixed(4),
            dec = parseFloat(object._meta_dec).toFixed(4),
            radius = 2, // Arcmin
            url;

        url = Ext.String.format(
            "http://simbad.u-strasbg.fr/simbad/sim-coo?Coord={0}+{1}&CooFrame=FK5&CooEpoch=2000&Radius={2}&Radius.unit=arcmin&submit=submit+query",
            ra, dec, radius)

        window.open(url, '_blank')

    },

    onClickNed: function () {
        // console.log('onClickNed')
        // Criar uma URL para o Servico NED
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('object_data'),
            ra = parseFloat(me.parseRA(object._meta_ra)).toFixed(2),
            dec = parseFloat(object._meta_dec).toFixed(2),
            radius = 2, // Arcmin
            url;

        url = Ext.String.format(
            "https://ned.ipac.caltech.edu/cgi-bin/objsearch?search_type=Near+Position+Search&in_csys=Equatorial&in_equinox=J2000.0&lon={0}d&lat={1}d&radius={2}",
            ra, dec, radius)

        window.open(url, '_blank')
    },

    onClickVizier: function () {
        // console.log('onClickVizier')
        // Criar uma URL para o Servico VizierCDS
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('object_data'),
            radius = 2,
            url; // Arcmin

        url = Ext.String.format(
            "http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=II/246&-c={0},{1},eq=J2000&-c.rs={2}",
            me.parseRA(object._meta_ra), object._meta_dec, radius)

        window.open(url, '_blank')
    },

    onCmdClickPoint: function (record, type, cmdTab) {
        // console.log('onCmdClickPoint(%o)', record);
        // Realca o objeto no preview do visiomatic
        // console.log(record)
        this.highlightObject(record, true);
    },

    onActiveCmdTab: function (panel) {
        // console.log('onActiveCmdTab(%o)', panel);
        var me = this,
            vm = me.getViewModel(),
            clusterMembers = vm.getStore('members'),
            vacObjects = vm.getStore('vacObjects');

        panel.setMembers(clusterMembers);
        panel.setVacs(vacObjects);
        panel.reloadPlots();
    },

    // ------------------- Spatial Distribution --------------------
    onActiveSpatialTab: function () {
        console.log('onActiveSpatialTab()')
        var me = this,
            vm = me.getViewModel(),
            densityMap = me.lookup("densityMap"),
            currentProduct = vm.get("currentProduct"),
            clusterSource = currentProduct.get("id"),
            clusterId = vm.get("object_id"),
            currentVacProduct = vm.get("vacCluster")
            vacSource = currentVacProduct.get("id"),
            object = vm.get("object"),
            lon = object.get("_meta_ra"),
            lat = object.get("_meta_dec"),
            radius = me.calculateVacRadius(object.get('_meta_radius'));

        if (vacSource) {
            densityMap.loadData(clusterSource, clusterId, vacSource, lon, lat, radius);
        }

    }
});
