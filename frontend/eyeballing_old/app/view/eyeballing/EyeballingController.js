/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Eyeballing.view.eyeballing.EyeballingController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.eyeballing',

    listen: {
        component: {
            'eyeballing': {
                loadpanel: 'onLoadPanel',
                updatepanel: 'onUpdatePanel'
            },
            'eyeballing-aladin': {
                changetile: 'onChangeTile',
                changefilter: 'onChangeFilter',
                ondblclick: 'activeVisiomatic'
            },
            'eyeballing-visiomatic': {
                dblclick: 'activeAladin'
            }
        },
        store: {
            '#Releases': {
                load: 'onLoadReleases'
            },
            '#Tags': {
                load: 'onLoadTags'
            },
            'datasets': {
                load: 'onLoadDatasets'
            },
            'flaggeds': {
                load: 'onLoadFlaggeds'
            },
            'defects': {
                load: 'onLoadDefects'
            }
        }
    },

    /**
     * @method onLoadPanel [description]
     */
    onLoadPanel: function (release) {
        var me = this;

        me.loadReleaseById(release);
    },

    onUpdatePanel: function (release) {
        var me = this,
            aladin = me.lookupReference('aladin');

        if (aladin.aladinIsReady()) {
            aladin.removeLayers();
        }

        me.loadReleaseById(release);
    },

    loadReleaseById: function (release) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('releases');

        if (release > 0) {
            store.filter([
                {
                    property: 'id',
                    value: parseInt(release)
                }
            ]);
        }
    },

    onLoadReleases: function (store) {
        var me = this,
            vm = me.getViewModel(),
            currentRelease;

        if (store.count() == 1) {
            currentRelease = store.first();

            vm.set('currentRelease', currentRelease);

            me.loadReleaseData(currentRelease);

        }

    },

    loadReleaseData: function (currentRelease) {
        var me = this;

        me.loadSurveys(currentRelease);
        me.loadTags(currentRelease);
        me.loadFlaggeds(currentRelease);
    },

    /**
     * Carrega a lista de imagens disponiveis para um release.
     * @param {object} [record] Model Instancia do model Release
     */
    loadSurveys: function (record) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('surveys');

        store.filter(
            [
                {
                    property: 'srv_project',
                    value: 'DES'
                },

                {
                    property: 'srv_release',
                    value: record.get('id')
                }
            ]
        );
    },

    /**
     * Retorna os tags que estao associados a um release
     * Filtra a Store TagsByRelease de acordo com o release
     * @param {object} [record] Model Instancia do model Release
     */
    loadTags: function (record) {
        var me = this,
            vm = me.getViewModel(),
            tags = vm.getStore('tags');

        if (record.get('id') > 0) {
            tags.filter([
                {
                    property: 'tag_release',
                    value: parseInt(record.get('id'))
                }
            ]);
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

    /**
     * Carrega todas as tiles marcadas como flagged para o usuario
     * logado. usando como filtro o release.
     * @param {object} [record] Model Instancia do model Release
     */
    loadFlaggeds: function (record) {
        var me = this,
            vm = me.getViewModel(),
            storeFlaggeds = vm.getStore('flaggeds');

        storeFlaggeds.filter([
            {
                property: 'release',
                value: record.get('id')
            }
        ]);

    },

    /**
     * Toda vez que a tile exibida no componente de imagem for alterada
     * deve se carregar os dados referentes a esta imagem.
     * @param {Object} tile - instancia do model Dataset mais so contem os dados de coordendas.
     * @param {Object} tag - instancia do model Tag.
     */
    onChangeTile: function (tile, tag) {
        var me = this,
            vm = me.getViewModel(),
            oldDataset = vm.get('currentDataset');

        if (tile) {
            if (tile.get('id') != oldDataset.get('id')) {

                vm.set('currentTag', tag);

                // Provisoriamente setar a tile atual para evitar requisicoes
                // repetitivas
                vm.set('currentDataset', tile);

                me.getDataset(tile.get('id'));
            }
        }
    },

    onChangeFilter: function () {
        var me = this,
            vm = me.getViewModel(),
            dataset = vm.get('currentDataset');

        me.loadValidationData(dataset);
    },

    /**
     * Filtra a store Datasets para recuperar os dados completos da tile carregada
     * no componente de imagem.
     * @param  {integet} id - chave da tile
     */
    getDataset: function (id) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('datasets');

        if (store.isLoading()) {
            // Caso a Store esteja carregando ainda aborta a execucao.
            store.getProxy().abort();
        }

        store.filter([{
            property: 'id',
            value: parseInt(id)
        }]);

    },

    /**
     * executado toda vez que a store
     * datasets for load ou filtered. se a store tiver apenas um
     * resultado este passa a ser o currentDataset.
     * @param {Object} store - Instancia da Store Dataset no viewModel.
     */
    onLoadDatasets: function (store) {
        var me = this,
            vm = me.getViewModel(),
            dataset;

        if (store.count() === 1) {
            dataset = store.first();

            vm.set('currentDataset', dataset);

            me.loadValidationData(dataset);
        }
    },

    loadValidationData: function (dataset) {
        var me = this,
            vm = me.getViewModel(),
            storeFlaggeds = vm.getStore('flaggeds'),
            flagged;

        // Descobrir se a tile esta marcada como flagged
        flagged = storeFlaggeds.findRecord('flg_dataset', dataset.get('id'));

        if (!flagged) {
            flagged = Ext.create('Eyeballing.model.Flagged',{});
        }

        vm.set('flagged', flagged);

        // Carregar os Defeitos da Tile
        me.loadDefects(dataset);
    },

    /**
     * Toda vez que selecionar uma das
     * thumbnails altera o filtro selecionado na imagem.
     * @param {string} filter - Filtro single band e lowercase.
     */
    onClickThumb: function (filter) {
        var me = this,
            aladin = me.lookupReference('aladin');

        aladin.setFilter(filter.toLowerCase());

    },

    onFlagDataset: function (btn) {
        var me = this,
            flag = btn.pressed;

        // Alterar o stylo do botao
        if (flag) {
            // btn.setText('Flagged');
            btn.setIconCls('x-fa fa-exclamation-triangle icon-color-orange');

        } else {
            // Alterar o stylo do botao
            // btn.setText('Flag');
            btn.setIconCls('x-fa fa-exclamation-triangle');
        }

        me.flagUnflagDataset(flag);
    },

    flagUnflagDataset: function (flag) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('flaggeds'),
            flagged = vm.get('flagged'),
            dataset = vm.get('currentDataset');

        // Verificar se ja esta na lista
        if (store.find('flg_dataset', dataset.get('id')) != -1) {
            // Se estiver na lista verificar se o valor da flag e diferente
            // do que tinha antes.
            if (flagged.get('flg_flagged') != flag) {

                if (flag) {
                    // se a flag for true adiciona um novo registro
                    flagged.set('flg_dataset',dataset.get('id'));
                    flagged.set('flg_flagged', flag);

                    store.add(flagged);
                } else {
                    // se nao remove o registro.
                    store.remove(flagged);
                }
            }

        } else {
            // Nao esta na lista
            if (flag) {
                // se flag for true adiciona um novo flagged.

                flagged.set('flg_dataset',dataset.get('id'));
                flagged.set('flg_flagged', flag);

                store.add(flagged);
            }
        }

        store.sync({
            success: function () {
                Ext.toast({
                    html: 'Data saved',
                    align: 't'
                });
            },
            failure: function () {
                console.log('Failure');

            },
            callback: function () {
                store.load();
            }
        });
    },

    onLoadFlaggeds: function (store) {
        var me = this,
            vm = me.getViewModel(),
            dataset = vm.get('currentDataset'),
            footprint = vm.getStore('tiles'),
            aladin = me.lookupReference('aladin'),
            sources = Ext.create('Ext.util.MixedCollection');

        // Seta o current flagged
        me.loadValidationData(dataset);

        // adiciona as flaggeds ao aladin
        store.each(function (record) {

            var tile = footprint.findRecord('id', record.get('flg_dataset'));

            if (tile) {
                sources.add(tile);
            }

        },this);

        aladin.showFlaggeds(sources);
    },

    loadDefects: function (dataset) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('defects'),
            aladin = me.lookupReference('aladin'),
            filters = vm.getStore('filters'),
            filter = aladin.getFilter(),
            f;

        // descobrir o id do filtro usando a store Filters
        f = filters.findRecord('filter', filter.toLowerCase());

        if (f) {
            store.filter([
                {
                    property: 'dfc_dataset',
                    value: dataset.get('id')
                },
                {
                    property: 'dfc_filter',
                    value: f.get('id')
                }
            ]);
        }
    },

    onLoadDefects: function (defects) {
        var me = this,
            vm = me.getViewModel(),
            view = me.lookupReference('defects'),
            aladin = me.lookupReference('aladin'),
            store = view.getStore(),
            features = vm.getStore('features'),
            sources = Ext.create('Ext.util.MixedCollection'),
            footprint = vm.getStore('tiles'),
            defect;

        // Limpar a Store usada na grid;
        store.removeAll();
        store.commitChanges();

        features.each(function (feature) {

            defect = defects.findRecord('dfc_feature', feature.get('id'));

            if (defect) {
                // Mudar o status para checked e guardar o id referente ao defeito.
                feature.set('checked', true);
                feature.set('ftr_defect', defect.get('id'));

            } else {
                feature.set('checked', false);
            }

            // Adiciona a juncao feature + defect a grid.
            store.add(feature);

        },this);


        // TODO REVER ISSO PODE NAO SER MAIS NECESSARIO
        store.suspendEvents();
        store.commitChanges();
        store.resumeEvents();

        // adiciona os Defects no componente Aladin
        defects.each(function (record) {
            if (record.get('dfc_ra') && record.get('dfc_dec')) {
                var f = features.findRecord('id', record.get('dfc_feature')),
                    tile;

                record.set('ftr_name', f.get('ftr_name'));

                // So adiciona o defeito caso ele esteja dentro de uma das tiles do release.
                tile = footprint.findRecord('id', record.get('dfc_dataset'));

                if (tile) {
                    sources.add(record);
                }
            }

        },this);

        aladin.showDefects(sources);
    },

    onUpdateDefectGrid: function (store, record) {
        var me = this,
            vm = me.getViewModel(),
            defects = vm.getStore('defects'),
            dataset = vm.get('currentDataset'),
            aladin = me.lookupReference('aladin'),
            filters = vm.getStore('filters'),
            filter = aladin.getFilter(),
            current,
            defect,
            f;

        // descobrir o id do filtro usando a store Filters
        f = filters.findRecord('filter', filter.toLowerCase());

        // Verificar se o defeito selecionado esta na lista de defeitos
        current = defects.findRecord('id', record.get('ftr_defect'));

        if (current) {
            // Verificar se e para remover
            if (!current.get('checked')) {
                // Remover
                defects.remove(current);
            }

        } else {
            // adicionar
            defect = Ext.create('Eyeballing.model.Defect',{
                dfc_dataset: dataset.get('id'),
                dfc_filter: f.get('id'),
                dfc_feature: record.get('id'),
                dfc_ra: null,
                dfc_dec: null
            });

            defects.add(defect);
        }

        defects.sync({
            success: function () {
                Ext.toast({
                    html: 'Data saved',
                    align: 't'
                });
            },
            failure: function () {
                console.log('Failure');

            },
            callback: function () {
                defects.load();
            }
        });
    },

    onClickAddDefect: function (btn) {
        var me = this,
            record = btn.getWidgetRecord(),
            vm = me.getViewModel(),
            defects = vm.getStore('defects'),
            dataset = vm.get('currentDataset'),
            aladin = me.lookupReference('aladin'),
            filters = vm.getStore('filters'),
            filter = aladin.getFilter(),
            radec = aladin.getRaDec(),
            defect,
            f;

        // descobrir o id do filtro usando a store Filters
        f = filters.findRecord('filter', filter.toLowerCase());

        // adicionar
        defect = Ext.create('Eyeballing.model.Defect',{
            dfc_dataset: dataset.get('id'),
            dfc_filter: f.get('id'),
            dfc_feature: record.get('id'),
            dfc_ra: radec[0],
            dfc_dec: radec[1]
        });

        defects.add(defect);

        defects.sync({
            success: function () {
                Ext.toast({
                    html: 'Data saved',
                    align: 't'
                });
            },
            failure: function () {
                console.log('Failure');

            },
            callback: function () {
                defects.load();
            }
        });
    },

    // onDblClickAladin: function (radec) {
    //     var me = this,
    //         vm = me.getViewModel(),
    //         store = vm.getStore('tiles'),
    //         dataset = store.filterByRaDec(radec[0], radec[1]),
    //         tags = vm.getStore('tags'),
    //         releases = vm.getStore('releases'),
    //         host = window.location.host,
    //         tilename, tag, tag_name, release, release_name, location;

    //     // TODO [CMP] URL HARDCORDED :p
    //     if (dataset) {
    //         tilename = dataset.get('tli_tilename');
    //         tag = tags.findRecord('id', dataset.get('tag'));
    //         tag_name = tag.get('tag_name');
    //         release = releases.findRecord('id', dataset.get('release'));
    //         release_name = release.get('rls_name');

    //         // http://desportal.cosmology.illinois.edu:8080/dri/apps/visio/tmp/index2.html?survey_name=y1_supplemental_d04&tile_name=DES0959%2B0126
    //         location = Ext.String.format('http://{0}/dri/apps/visiomatic/?release={1}&tilename={2}', host, release_name, encodeURIComponent(tilename));

    //         window.open(location, '_self');

    //     }
    // },

    aladinVisiomatic: function () {
        var me = this,
            card = me.lookupReference('cardPanel'),
            layout = card.getLayout(),
            active = layout.getActiveItem();

        if (active.reference === 'aladin') {
            // Setar o Visiomatic
            me.activeVisiomatic();
        } else {
            me.activeAladin();
        }
    },

    activeVisiomatic: function () {
        var me = this,
            vm = me.getViewModel(),
            dataset = vm.get('currentDataset'),
            releases = vm.getStore('releases'),
            release = releases.findRecord('id', dataset.get('release')),
            card = me.lookupReference('cardPanel'),
            layout = card.getLayout(),
            visiomatic = me.lookupReference('visiomatic'),
            host = window.location.host;

        layout.next();

        // host = 'desportal.cosmology.illinois.edu';
        var url = Ext.String.format(
            'http://{0}/visiomatic?FIF=data/releases/{1}/images/visiomatic/{2}.ptif',
            host,
            release.get('rls_name'),
            encodeURIComponent(dataset.get('tli_tilename'))
        );

        visiomatic.setImage(url);

    },

    activeAladin: function () {
        var me = this,
            vm = me.getViewModel(),
            dataset = vm.get('currentDataset'),
            card = me.lookupReference('cardPanel'),
            layout = card.getLayout(),
            aladin = me.lookupReference('aladin');

        layout.prev();
    }

});
