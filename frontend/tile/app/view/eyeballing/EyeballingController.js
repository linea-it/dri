/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Tile.view.eyeballing.EyeballingController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.eyeballing',

    listen: {
        component: {
            'eyeballing': {
                loadpanel: 'onLoadPanel',
                updatepanel: 'onUpdatePanel',
                changerelease: 'onChangeRelease'
            },
            'eyeballing-aladin': {
                changetile: 'onChangeTile'
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
            }
        }
    },

    /**
     * @method onLoadPanel [description]
     */
    onLoadPanel: function () {
        console.log('onLoadPanel()');
        var me = this,
            view = me.getView(),
            release = view.getRelease();

        me.loadReleaseById(release);

    },

    onUpdatePanel: function () {
        console.log('onUpdatePanel()');

    },

    /**
     * @method onChangeRelease [description]
     */
    onChangeRelease: function (release) {
        console.log('onChangeRelease(%o)', release);
        // var me = this,
        //     vm = me.getViewModel(),
        //     store = vm.getStore('releases');

        // store.filter([
        //     {
        //         property: 'id',
        //         value: parseInt(release)
        //     }
        // ]);
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
        console.log('onLoadReleases(%o)', store);
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
     * Toda vez que a tile exibida no componente de imagem for alterada
     * deve se carregar os dados referentes a esta imagem.
     * @param {Object} tile - instancia do model Dataset mais so contem os dados de coordendas.
     * @param {Object} tag - instancia do model Tag.
     */
    onChangeTile: function (tile, tag) {
        var me = this,
            vm = me.getViewModel(),
            oldDataset = vm.get('currentDataset');

        if (tile.get('id') != oldDataset.get('id')) {

            vm.set('currentTag', tag);

            me.getDataset(tile.get('id'));
        }
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
            vm = me.getViewModel();

        if (store.count() === 1) {
            vm.set('currentDataset', store.first());
        }
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
        console.log('onFlagDataset(%o)', btn);

        if (btn.pressed) {
            btn.setText('Flagged');
            btn.setIconCls('x-fa fa-exclamation-triangle icon-color-orange');
        } else {
            btn.setText('Flag');
            btn.setIconCls('x-fa fa-exclamation-triangle');
        }

    }

});
