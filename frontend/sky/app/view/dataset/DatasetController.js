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
                updatePanel: 'onUpdatePanel'
            },
            'sky-visiomatic': {
                // dblclick: 'onDblClickVisiomatic'
            }
        }
        // store: {
        //     '#Releases': {
        //         load: 'onLoadReleases'
        //     },
        //     '#Tags': {
        //         load: 'onLoadTags'
        //     },
        //     'datasets': {
        //         load: 'onLoadDatasets'
        //     }
        // }
    },

    onLoadPanel: function (dataset) {
        console.log('onLoadPanel(%o)', dataset);
        var me = this;

        me.loadData(dataset);
    },

    onUpdatePanel: function (release) {
        // var me = this,
        //     aladin = me.lookupReference('aladin');

        // if (aladin.aladinIsReady()) {
        //     aladin.removeLayers();
        // }

        // me.onChangeRelease();

        // me.loadReleaseById(release);
    },

    loadData: function (dataset) {
        console.log('loadData(%o)', dataset);
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

        console.log(current);
        // Setar a Imagem no Visiomatic
        me.changeImage(current);

    },

    changeImage: function (current) {
        console.log('changeImage()');

        var me = this,
            refs = me.getReferences(),
            visiomatic = refs.visiomatic,
            url = current.get('image_src_ptif');

        console.log('PTIF: %o', url);

        if (url != '') {

            // http://desportal.cosmology.illinois.edu/visiomatic?FIF=data/releases/y1_wide_survey/images/visiomatic/DES2342+0043.ptif

            // var url = Ext.String.format(
            //     'http://{0}/visiomatic?FIF=data/releases/{1}/images/visiomatic/{2}.ptif',
            //     host,
            //     release.get('rls_name'),
            //     encodeURIComponent(dataset.get('tli_tilename'))
            //     // 'DES2342%2B0043'
            // );
            //

            visiomatic.setImage(url);

        }
    }

});
