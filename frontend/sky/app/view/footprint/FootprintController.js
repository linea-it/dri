/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Sky.view.footprint.FootprintController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'common.link.LinkPrompt'
    ],

    alias: 'controller.footprint',

    listen: {
        component: {
            'footprint': {
                loadpanel: 'onLoadPanel',
                updatepanel: 'onUpdatePanel',
                beforedeactivate: 'onBeforeDeactivate'
            },
            'footprint-aladin': {
                ondblclick: 'onDblClickAladin',
                shift: 'onShift'
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

    winGetLink: null,

    onLoadPanel: function (release) {
        var me = this;
        me.loadReleaseById(release);
    },

    onUpdatePanel: function (release) {
        console.log()
        var me = this,
            aladin = me.lookupReference('aladin');

        if (aladin.aladinIsReady()) {
            aladin.removeLayers();
        }

        me.onChangeRelease();

        me.loadReleaseById(release);
    },

    onChangeRelease: function () {

        var me = this,
            vm = me.getViewModel(),
            releases = vm.getStore('releases'),
            surveys = vm.getStore('surveys'),
            datasets = vm.getStore('datasets'),
            tiles = vm.getStore('tiles');

        releases.clearFilter(true);

        surveys.removeAll();
        surveys.clearFilter(true);

        datasets.removeAll();
        datasets.clearFilter(true);

        tiles.removeAll();
        tiles.clearFilter(true);

    },

    loadReleaseById: function () {
        var me = this,
            vm = me.getViewModel(),
            release = vm.get('release'),
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

    /**
     * executada ao selecionar um release.
     * dispara o carregamento da store Datasets.
     * dispara o carregamento da imagens usadas no Aladin.
     */
    loadReleaseData: function (record) {
        if (record.get('id') > 0) {

            this.loadSurveys(record);
            this.loadTags(record);

        }
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
        }
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
     * Carrega a lista de imagens disponiveis para um release.
     * @param {object} [record] Model Instancia do model Release
     */
    loadSurveys: function (release) {
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
                    value: release.get('id')
                }
            ]
        );
    },

    onDblClickAladin: function (radec) {
        this.getView().fireEvent('ondblclick');
        this.toVisiomatic(radec, false, true);
    },

    onShift: function (radec) {
        this.toVisiomatic(radec, false);
    },

    onClickGoToImage: function () {
        var me = this,
            aladin = me.lookupReference('aladin');

        this.toVisiomatic(aladin.getRaDec(), true);
    },

    toVisiomatic: function (radec, centralized, pinned) {
        // console.log('toVisiomatic(%o, %o)', radec, centralized)
        var me = this,
            vm = me.getViewModel(),
            vw = me.getView(),
            store = vm.getStore('tiles'),
            aladin = me.lookupReference('aladin'),
            fov = aladin.getFov(),
            hash, dataset, ra, dec, coordinate, value, sys;

        ra = radec[0].toFixed(5);
        dec = radec[1].toFixed(5);
        fov = fov.toFixed(2).replace('.', ',');

        dataset = store.filterByRaDec(ra, dec);

        if (dataset) {
            // Centraliza na coordenada
            if (ra > 0) {
                coordinate = ra.replace('.', ',') + '+' + dec.replace('.', ',');
            } else {
                coordinate = ra.replace('.', ',') + dec.replace('.', ',');
            }

            if (centralized) {
                // Centraliza na tile
                fov = -1;
                ra = "" + dataset.get('tli_ra');
                dec = "" + dataset.get('tli_dec');
                coordinate = ra.replace('.', ',') + '+' + dec.replace('.', ',');
            }

            coordinate = encodeURIComponent(coordinate);

            if (pinned) {
                fov = 0;
            }

            hash = 'dataset/' + dataset.get('id') + '/' + coordinate + '/' + fov;

            me.redirectTo(hash, true);
        }
    },

    onAladinGoToPosition: function (position, aladin) {
        var me = this;
        me.toVisiomatic(position);
    },

    gotoPosition: function(value, fov){
        // console.log('gotoPosition')
        var me = this,
            aladin = me.lookupReference('aladin');

        aladin.goToPosition(value);
        if (fov) {
            aladin.setFov(fov);
        }

    },

    getLink: function () {
        // console.log('getLink()');
        var me = this,
            aladin = me.lookupReference('aladin'),
            fov = aladin.getFov(),
            radec = aladin.getRaDec(),
            release = me.getView().getRelease(),
            href = window.location.href,
            host = href.split('/#')[0],
            hash, ra, dec;

        ra = radec[0].toFixed(5);
        dec = radec[1].toFixed(5);
        fov = fov.toFixed(2).replace('.', ',');

        if (ra > 0) {
            coordinate = ra.replace('.', ',') + '+' + dec.replace('.', ',');
        } else {
            coordinate = ra.replace('.', ',') + dec.replace('.', ',');
        }

        coordinate = encodeURIComponent(coordinate);

        link = Ext.String.format('{0}/#sky/{1}/{2}/{3}', host, release, coordinate, fov);

        me.winGetLink = Ext.create('common.link.LinkPrompt', {
            link: link
        });

        me.winGetLink.show();
    },

    onBeforeDeactivate: function () {
        // console.log("onBeforeDeactivate()");
        var me = this;

        if (me.winGetLink !== null) {
            me.winGetLink.close();
            me.winGetLink = null;
        }
    }

});
