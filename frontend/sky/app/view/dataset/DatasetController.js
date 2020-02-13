/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
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
            current = vm.get('currentDataset'),
            release = current.get('release');

        view.setLoading(false);
        vm.set('release', release);

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

        visiomatic.setView(radec.ra, radec.dec, fov);

        //PIN (Marcador estilo google)
        // if (view.getPinned()){
        //     me.lMarker = visiomatic.markPosition(radec.ra, radec.dec, 'x-fa fa-map-marker fa-2x');
        // }
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
            fov = visiomatic.getFov(),
            radec = visiomatic.getRaDec(),
            hash, coordinate, coord;

        if (me.winGetLink != null) {
            me.winGetLink.close();
            me.winGetLink = null;
        }

        if (radec.ra < 0) {
            // Essa correcao e necessaria por que as vezes o visiomatic
            // coloca ra negativo para coordenadas perto do 360.
            radec.ra = 360 + radec.ra;
        }

        if (radec.dec > 0) {
            coord = radec.ra.toFixed(5).replace('.', ',') + '+' + radec.dec.toFixed(5).replace('.', ',');
        } else {
            coord = radec.ra.toFixed(5).replace('.', ',') + radec.dec.toFixed(5).replace('.', ',');
        }

        coordinate = encodeURIComponent(coord);

        fov = fov.toFixed(2).replace('.', ',');

        hash = 'sky/' + release + '/' + coordinate + '/' + fov;

        //Limpa a caixa de texto global search
        if (clearSearch) me.getView().txtCoordinateSearch.setValue('');

        me.redirectTo(hash);

    },

    getDatasetInOtherReleases: function (current) {
        var me = this,
            view = me.getView();
            vm = me.getViewModel(),
            store = vm.getStore('compare');

        // Desabilitar o botao compare
        view.clearCompareOptions();

        store.clearFilter(true);
        store.removeAll(true);
        store.filter([
            {
                'property': 'tli_tilename',
                'value': current.get('tli_tilename')
            }
        ]);

    },

    onResize: function () {
        // console.log('onResize');

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

    onCenterTile: function () {
        // console.log('onCenterTile()')
        var me = this,
            visiomatic = me.lookupReference('visiomatic');

        visiomatic.centerTile();
    },

    showHideComments: function (btn, state) {
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            vm = me.getViewModel(),
            lmembers = vm.get('overlayMembers');

        visiomatic.showHideComments(lmembers, state);
    },

    gotoPosition(value, searchResult) {
        let coordinate, hash
        let visiomatic = this.lookupReference('visiomatic');
        let ra = searchResult.tli_ra.toString().replace('.', ',')
        let dec = searchResult.tli_dec.toString().replace('.', ',')
        let fov = 0 //pinned

        if (searchResult){
            coordinate = encodeURIComponent((ra > 0) ? `${ra}+${dec}` : `${ra}${dec}`)
            hash = 'dataset/' + searchResult.id + '/' + coordinate + '/' + fov;
            this.redirectTo(hash, true);
        } else {
            visiomatic.coordinatesToLatLng(value, function (latlng) {
                if (visiomatic.isInsideTile(latlng.lng, latlng.lat)) {
                    visiomatic.panTo(value);
                }else {
                    Ext.MessageBox.alert('Alert', 'There is no DES tile in the current release on this position.');
                }
            });
        }
    },

    onCrop: function () {
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
});
