Ext.define('Target.view.settings.SystemMembersController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.system_members',

    listen: {
        component: {
            'targets-system-members': {
                changecatalog: 'onChangeCatalog'
            }
        }
    },

    onChangeCatalog: function (currentCatalog) {
        console.log('onChangeCatalog');
        var me = this,
            vm = me.getViewModel(),
            products = vm.getStore('products');

        if (currentCatalog.get('pcl_is_system')) {

            console.log('currentCatalog', currentCatalog);

            products.addFilter({
                property: 'class_name',
                value: 'cluster_members'
            });

            products.load({
                callback: function () {
                    console.log('Carregou os Cluster members disponiveis');
                }
            });

        }

    }

    /**

    Cluster Members 3: brportal.e_1571_2831
    Galaxy Clusters 3: brportal.e_1571_2830


    {
        "ticket":"XQW8283",
        "process": {
            "owner_username": "Glauber",
            "process_name": "galaxy_cluster_members_teste",
            "process_id": 1571,
            "process_start_date": null,
            "process_end_date": null,
            "process_description": null,
            "process_comment": null,
            "releases": ["y3a1_coadd"],
            "products": [{
                "type": "catalog",
                "class": "galaxy_cluster",
                "name": "galaxy_cluster_test_members",
                "display_name": "Galaxy Cluster Test Members",
                "version": null,
                "database": null,
                "schema": "brportal",
                "table": "e_1571_2830",
                "releases": ["y3a1_coadd"],
                "fields": [],
                "description": null
            },{
                "type": "catalog",
                "class": "cluster_members",
                "name": "cluster_members_test_members",
                "display_name": "Cluster Members Test",
                "version": null,
                "database": null,
                "schema": "brportal",
                "table": "e_1571_2831",
                "releases": ["y3a1_coadd"],
                "fields": [],
                "description": null
            }]
        },
        "register_username": "glaubervila"
    }

    Funcionando
    {
        "ticket":"ORH4223",
        "process": {
            "owner_username": "DES",
            "process_name": "y3a1_coadd_object_summary",
            "process_id": null,
            "process_start_date": null,
            "process_end_date": null,
            "process_description": null,
            "process_comment": null,
            "releases": ["y3a1_coadd"],
            "products": [{
                "type": "catalog",
                "class": "coadd_objects",
                "name": "Y3A1_COADD_OBJECT_SUMMARY",
                "display_name": "Y3A1 COADD Object Summary",
                "version": null,
                "database": "dessci",
                "schema": "DES_ADMIN",
                "table": "Y3A1_COADD_OBJECT_SUMMARY",
                "releases": ["y3a1_coadd"],
                "fields": [],
                "description": null
            }]
        }
    }



     */

});
