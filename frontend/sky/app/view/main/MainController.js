/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Sky.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    requires: [
        'Sky.view.home.Home',
        'Sky.view.footprint.Footprint',
        'Sky.view.dataset.Dataset'
    ],

    routes : {
        'home': {
            action: 'onHome'
        },
        'sky/:release': {
            action: 'onSky'
        },
        'sky/:release/:coordinate/:fov': {
            action: 'onSky'
        },
        'sky/:release/:coordinate': {
            action: 'onSky'
        },
        'dataset/:dataset/:coordinate/:fov': {
            action: 'onDataset'
        },
    },

    doSearch: function(value){
        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel,
            mainLayout = mainCard.getLayout(),
            sky = mainCard.child('component[routeId=\'sky\']'),
            ctrl;

        // A Pesquisa sempre redireciona para o Footprint, por que a coordenada
        // pode nao ser na mesma tile. entao e necessario a busca no ceu inteiro
        me.setActivePanel(sky);

        ctrl = sky.getController();
        ctrl.gotoPosition(value, 0.6);

    },

    /**
     * Evento disparado por dri-header-sky ao trocar o sistema de métrica da pesquisa
     */
    changeCoordinateSystem: function(item){
        var me = this, v, t1, t2,
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel,
            mainLayout = mainCard.getLayout(),
            ctrl = mainLayout.getActiveItem().getController(),
            value = item.textfield.value;

        //converte para o sistema de métrica escolhido
        if (value){
            t1 = visiomatic.Visiomatic.strToSystem(value);
            t2 = item.name;

            if (t1){
                //se teve mudança
                if (t1.name != t2){

                    if (t2=='HMS'){
                        v = visiomatic.Visiomatic.latLngToHMSDMS(t1.value);
                        item.textfield.setValue(v);
                    }

                    else if (t2=='latlng'){
                        if (visiomatic.processing) return;

                        visiomatic.processing = true;
                        visiomatic.Visiomatic.hmsToLatLng(value, function(latlng){
                            visiomatic.processing = false;
                            item.textfield.setValue(latlng.lng + ', ' + latlng.lat);
                        });
                    }
                }
                //ctrl.setSystemCoordinate(item.textfield.value);
            }
        }
    },

    setActivePanel: function (panel) {
        // console.log("setActivePanel(%o)", panel)
        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel,
            mainLayout = mainCard.getLayout(),
            routeId = panel.routeId,
            existingItem = mainCard.child('component[routeId=' + routeId + ']'),
            view = null;

        // Saber se ja existe uma interface  criada.
        if (!existingItem) {
            view = mainCard.add(panel);
            view.loadPanel(arguments);
            mainLayout.setActiveItem(view);
        }else{
            view = existingItem;
            view.updatePanel(arguments);
            mainLayout.setActiveItem(view);
        }
    },

    //exibindo a home
    onHome: function () {
        var newView = Ext.create('Sky.view.home.Home', {
            hideMode: 'offsets',
            routeId: 'home',
            layout: 'fit'
        });

        var headerRefs = this.getView().down('dri-header-sky').getReferences();
        headerRefs.searchGlobal.hide();

        this.setActivePanel(newView);
    },

    //exibindo o Aladin
    onSky: function (release, coordinate, fov) {
        var me = this,
            newView = Ext.create('Sky.view.footprint.Footprint', {
                hideMode: 'offsets',
                routeId: 'sky',
                layout: 'fit',
                release: release,
                coordinate: coordinate,
                foc: fov,
                listeners: {
                    ondblclick: function(){
                        me.aladinDblClick = true;
                    }
                }
            }),
            headerBar = me.getView().down('dri-header-sky'),
            headerRefs = headerBar.getReferences();

        headerRefs.searchGlobal.show();

        newView.txtCoordinateSearch = headerRefs.txtCoordinateSearch;
        me.setActivePanel(newView, release, coordinate, fov);

        //define o título da barra superior
        headerBar.getViewModel().set('name', 'Sky Viewer');
    },

    //exibindo o VisiOmatic
    onDataset: function (dataset, coordinate, fov) {
        // console.log("onDataset(%o, %o, %o)", dataset, coordinate, fov);
        var newView = Ext.create('Sky.view.dataset.Dataset', {
                hideMode: 'offsets',
                routeId: 'tile',
                layout: 'fit',
                dataset: dataset,
                coordinate: coordinate,
                fov: fov
            }),
            headerBar = this.getView().down('dri-header-sky'),
            headerRefs = headerBar.getReferences();

        headerRefs.searchGlobal.show();

        if (this.activePanel) newView.showPin = this.activePanel.showPin
        newView.txtCoordinateSearch = headerRefs.txtCoordinateSearch;
        this.setActivePanel(newView, dataset, coordinate, fov);

        //define o título da barra superior
        headerBar.getViewModel().set('name', 'Image Viewer');
    },
});
