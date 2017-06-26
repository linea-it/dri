/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Sky.view.dataset.DatasetController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.dataset',

    listen: {
        component: {
            'dataset': {
                loadpanel: 'onLoadPanel',
                updatePanel: 'onUpdatePanel',
                updatePosition: 'changeImage',
                compare: 'onCompareImages'
            },
            'sky-visiomatic': {
                dblclick: 'onDblClickVisiomatic',
                changeimage: 'onChangeImage',
                link: 'onGetLink',
                changeposition: 'onChangePosition'
            },
            'sky-compare': {
                close: 'onCloseCompare'
            }
        },
        store: {
            '#compare': {
                load: 'onLoadDatasetInOtherReleases'
            }
        }
    },

    winGetLink: null,

    lMarker: null,

    onLoadPanel: function (dataset) {
        var me = this;

        me.loadData(dataset);
    },

    onUpdatePanel: function (dataset) {
        var me = this;

        me.loadData(dataset);
    },

    loadData: function (dataset) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.get('datasets');

        store.filter([{
            property: 'id',
            value: dataset
        }]);

        store.load({
            scope: this,
            callback: function (r) {
                if (r.length == 1) {
                    vm.set('currentDataset', r[0]);

                    this.afterLoad();
                }
            }
        });
    },

    afterLoad: function () {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            current = vm.get('currentDataset');

        view.setLoading(false);

        // Setar a Imagem no Visiomatic
        me.changeImage(current);
    },

    changeImage: function () {
        var me = this,
            vm = me.getViewModel(),
            visiomatic = me.lookupReference('visiomatic'),
            current = vm.get('currentDataset'),
            url = current.get('image_src_ptif');

        if (url !== '') {
            visiomatic.setImage(url);

        } else {
            visiomatic.removeImageLayer();

        }

        // Clear Compare Panel
        me.clearComparePanel();

        // Verificar se a imagem esta em mais de um release
        me.getDatasetInOtherReleases(current);
    },

    onChangeImage: function () {
        var me = this,
            view = me.getView(),
            radec = view.getRadec(),
            fov = view.getFov(),
            visiomatic = me.lookupReference('visiomatic');

        if (fov > 0.60) {
            fov = 0.60;
        }

        visiomatic.setView(radec.ra, radec.dec, fov);

        me.lMarker = visiomatic.markPosition(radec.ra, radec.dec, 'x-fa fa-map-marker fa-2x');

    },

    onChangePosition: function (radec, fov) {
        var me = this,
            view = me.getView(),
            compare = me.lookupReference('compare'),
            btn = view.down('#btnMagnetic');

        // Checa se o painel compare esta visivel e com a imagem ja carregada.
        if ((compare.isVisible()) && (compare.isReady())) {

            // Se o botao magnetic estiver marcado seta sincroniza a posicao entre os viewers.
            if ((btn) && (btn.checked)) {
                compare.setView(radec.ra, radec.dec, fov);

            }

        }
    },

    onDblClickVisiomatic: function () {
        console.log('onDblClickVisiomatic()');

    },

    onShift: function () {
        this.toAladin();

    },

    onGetLink: function (coordinate, fov) {
        var me = this,
            vm = me.getViewModel(),
            current = vm.get('currentDataset'),
            href = window.location.href,
            host = href.split('/#')[0],
            link;

        if (fov) {
            link = Ext.String.format('{0}/#dataset/{1}/{2}/{3}', host, current.get('id'), coordinate, fov);
        } else {
            link = Ext.String.format('{0}/#dataset/{1}/{2}', host, current.get('id'), coordinate);
        }

        me.winGetLink = Ext.create('common.link.LinkPrompt', {
            link: link
        });

        me.winGetLink.show();

    },

    toAladin: function () {
        var me = this,
            vm = me.getViewModel(),
            current = vm.get('currentDataset'),
            release = current.get('release'),
            hash;

        if (me.winGetLink != null) {
            me.winGetLink.close();
            me.winGetLink = null;
        }

        hash = 'sky/' + release;

        me.redirectTo(hash);

    },

    getDatasetInOtherReleases: function (current) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('compare');

        store.filter([
            {
                'property': 'tli_tilename',
                'value': current.get('tli_tilename')
            }
        ]);

    },

    onResize: function () {
        console.log('onResize');

    },

    onLoadDatasetInOtherReleases: function (store) {
        var me = this,
            view = me.getView();

        view.setDatasets(store);

    },

    onCompareImages: function (dataset) {
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            compare = me.lookupReference('compare'),
            width = visiomatic.getWidth() / 2;

        // Habilitar o painel de comparacao.
        compare.setVisible(true);

        // Configurar o tamanho do painel de comparacao.
        compare.divide(width);

        // Setar o Dataset
        compare.setCompareDataset(dataset);

    },

    onCompareChangeImage: function () {
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            compare = me.lookupReference('compare'),
            radec = visiomatic.getRaDec(),
            fov = visiomatic.getFov();

        compare.setView(radec.ra, radec.dec, fov);
    },

    onCloseCompare: function () {
        var me = this,
            view = me.getView(),
            visiomatic = me.lookupReference('visiomatic');

        // Atualizar as opcoes de comparacao.
        view.updateCompareOptions();

    },

    clearComparePanel: function () {
        var me = this,
            compare = me.lookupReference('compare');

        if (compare.isVisible()) {
            compare.close();
        }

    },

    showHideMarker: function (btn, state) {
        var me = this,
            visiomatic = me.lookupReference('visiomatic');

        visiomatic.showHideLayer(me.lMarker, state);

    },

    showCatalogOverlay: function () {
        var me = this,
            visiomatic = me.lookupReference('visiomatic');

        visiomatic.showCatalogOverlayWindow();


    }

});
