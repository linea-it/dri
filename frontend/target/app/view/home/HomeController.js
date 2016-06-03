/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Target.view.home.HomeController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.home',

    listen: {
        component: {
            'home': {
                loadpanel: 'onLoadPanel'
            },
            'targets-catalog-tree': {
                selectcatalog: 'onSelectCatalog'
            }
        }
    },

    onLoadPanel: function (view) {
        // console.log('onLoadPanel(%o)', view);

        var me = this,
            tree = view.getCatalogTree();

        tree.loadCatalogs('targets');
    },

    onUpdatePanel: function () {

    },

    /**
     * Ao selecionar um item na catalog tree seta o catalogo no component objects.
     * @param  {Target.model.Catalog} record [description]
     * @param  {Target.view.catalog.Catalog} panel  [description]
     */
    onSelectCatalog: function (record, panel) {

        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            catalog = record.get('catalog_id');

        hash = 'cv/' + catalog;
        me.redirectTo(hash);
    }
});
