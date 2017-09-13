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

    //ao clicar em um item do menu de contexto de objeto do visiomatic
    onObjectMenuItemClickVisiomatic: function (event, feature) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            object = vm.get('currentRecord'),
            catalog = vm.get('currentCatalog'),
            object_id, catalog_id;

        if (feature && feature.properties) {
            catalog_id = feature.properties._meta_catalog_id;
            object_id  = feature.id;
        }else {
            catalog_id = catalog.get('id');
            object_id  = object.get('_meta_id');
        }

        if (object_id > 0) {

            var comment = Ext.create('Ext.window.Window', {
                title: 'Comments',
                iconCls: 'x-fa fa-comments',
                layout: 'fit',
                closeAction: 'destroy',
                constrainHeader:true,
                width: 500,
                height: 300,
                autoShow:true,
                onEsc: Ext.emptyFn,
                items: [
                    {
                        xtype: 'comments-object',
                        reference: '',
                        listeners: {
                            scope: this,
                            changecomments: 'onChangeComments'
                        }
                    }
                ]
            });

            //passar latlng e feature para ser caregado comentários de um objeto específico ou de uma posição específica
            comment.down('comments-object').getController().loadComments(catalog_id, object_id, event.latlng, feature);
        }
    },

    //ao clicar em um item do menu de contexto de objeto do visiomatic
    onImageMenuItemClickVisiomatic: function (event, dataset) {
        var latlng = event.latlng;
        var comment = Ext.create('Ext.window.Window', {
            title: 'Position Comments',
            iconCls: 'x-fa fa-comments',
            layout: 'fit',
            closeAction: 'destroy',
            constrainHeader:true,
            width: 500,
            height: 300,
            autoShow:true,
            onEsc: Ext.emptyFn,
            items: [
                {
                    xtype: 'comments-position',
                    listeners: {
                        scope: this,
                        changecomments: 'onChangeComments'
                    }
                }
            ]
        });

        comment.down('comments-position').getController().loadComments(/*dec*/latlng.lat, /*ra*/latlng.lng, dataset);
    },

    onChangeComments: function (event) {
        var me = this,
           view = me.getView(),
           visiomatic = me.lookupReference('visiomatic'),
           vm = me.getViewModel(),
           lmembers = vm.get('overlayMembers');

        if (event && event.comment) {
            //TODO: atualizar o número de comentários em lmembers.feature.properties.
            //visiomatic.updateComment(lmembers, event.comment, event.total);
        }

        //view.fireEvent('changeinobject');
    },

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

        //PIN (Marcador estilo google)
        if (me.showPin){
            me.lMarker = visiomatic.markPosition(radec.ra, radec.dec, 'x-fa fa-map-marker fa-2x');
        }
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
        this.toAladin(true);
    },

    onShift: function () {
        this.toAladin(true);
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

    toAladin: function (clearSearch) {
        var me = this,
            vm = me.getViewModel(),
            current = vm.get('currentDataset'),
            release = current.get('release'),
            visiomatic = me.lookupReference('visiomatic'),
            hash, coordinate, radec, fov;

        if (me.winGetLink != null) {
            me.winGetLink.close();
            me.winGetLink = null;
        }

        fov        = visiomatic.getFov();
        radec      = visiomatic.getRaDec();
        coordinate = radec.ra.toString().replace('.', ',') + '|' + radec.dec.toString().replace('.', ',');
        hash       = 'sky/' + release + '/' + coordinate + '/' + fov;

        me.redirectTo(hash);

        //Limpa a caixa de texto global search
        if (clearSearch) me.getView().txtCoordinateSearch.setValue('');

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

    showHideComments: function (btn, state) {
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            vm = me.getViewModel(),
            lmembers = vm.get('overlayMembers');

        visiomatic.showHideComments(lmembers, state);
    },

    gotoPosition: function (value) {
        var visiomatic = this.lookupReference('visiomatic');

        visiomatic.coordinatesToLatLng(value, function (latlng) {
            if (visiomatic.isInsideTile(latlng.lng, latlng.lat)) {
                visiomatic.panTo(value);
            }else {
                Ext.MessageBox.alert('Alert', 'There is no DES tile in the current release on this position.');
            }
        });

    },

    showHideCrop: function (btn, state) {
        var me = this,
            visiomatic = me.lookupReference('visiomatic');

        Ext.GlobalEvents.fireEvent('eventregister','SkyViewer - crop');
        visiomatic.initCrop();
    },

    onSave: function () {
        var me = this,
            visiomatic = me.lookupReference('visiomatic');

        Ext.GlobalEvents.fireEvent('eventregister','SkyViewer - save_fits');
        visiomatic.showDownloadWindow();

    },

    onActivate: function (event) {
        var me = this, coordinate, zoom, aladin,
            visiomatic = me.lookupReference('visiomatic');

        me.showPin = (event.showPin || event.action == 'dblclick');

        //obtém as coordenadas e o zoom da url
        coordinate = ((location.hash.split('/')[2] || '').replace(/%2C/g, '.').split('%2B')) || null;
        zoom = ((location.hash.split('/')[3] || '').replace(/,/g, '.')) || null;

        /*if (visiomatic.isReady()){
            visiomatic.panTo(coordinate[0] + ',' + coordinate[1]);
            visiomatic.getMap().setZoom(zoom);
        }*/
    }
});
