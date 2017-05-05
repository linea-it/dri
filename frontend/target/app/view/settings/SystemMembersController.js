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
        var me = this,
            vm = me.getViewModel(),
            products = vm.getStore('products'),
            relateds = vm.getStore('productRelateds');

        if (currentCatalog.get('pcl_is_system')) {
            // Checar se ja existe uma relacao com o produto
            relateds.addFilter({
                property: 'prl_product',
                value: currentCatalog.get('id')
            });
            relateds.load({
                callback: function () {
                    me.onLoadRelateds(this);
                }
            });
        }
    },

    onLoadRelateds: function (relateds) {
        var me = this,
            vm = me.getViewModel(),
            related;

        if (relateds.count() > 0) {
            related = relateds.first();
            vm.set('productRelated', related);

        }

        me.loadAvailableMembersCatalog();

    },

    loadAvailableMembersCatalog: function () {
        var me = this,
           vm = me.getViewModel(),
           currentCatalog = vm.get('currentCatalog'),
           products = vm.getStore('products');

        products.addFilter({
            property: 'class_name',
            value: 'cluster_members'
        });

        if (currentCatalog.get('epr_original_id') !== null) {
            products.addFilter({
                property: 'process',
                value: currentCatalog.get('epr_original_id')
            });
        }

        products.load({
            callback: function () {
                me.onLoadAvailableMembersCatalog(this);
            }
        });
    },

    onLoadAvailableMembersCatalog: function (products) {
        var me = this,
            refs = me.getReferences(),
            cmb = refs.cmbAvailableMembers,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            related = vm.get('productRelated'),
            memberCatalog;

        console.log(related);

        // Se ja existir uma relacao entre os produtos
        if ((related) && (related.get('id') > 0)) {
            memberCatalog = products.getById(related.get('prl_related'));

        } else {
            // Varrer a lista de catalgos de membros disponiveis,
            // verificar se tem algum com o mesmo processo do current catalog
            if (currentCatalog.get('epr_original_id') !== null) {
                products.each(function (r) {
                    if (r.get('epr_original_id') == currentCatalog.get('epr_original_id')) {
                        memberCatalog = r;

                        return false;
                    }

                }, me);

            } else {
                // TODO tratar como vai ser com produtos que nao tem processo
            }
        }

        if (memberCatalog.get('id') !== 0) {
            // Seleciona o registro na combo
            cmb.select(memberCatalog);

            me.onSelectMembersCatalog(cmb, memberCatalog);
        }

    },

    onSelectMembersCatalog: function (combo, memberCatalog) {
        console.log('onSelectMembersCatalog');
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            related = vm.get('productRelated'),
            relateds = vm.getStore('productRelateds');

        if ((memberCatalog !== null) && (memberCatalog.get('id') > 0)) {

            vm.set('memberCatalog', memberCatalog);

            // TODO Checar se existe um relate se nao existir criar um

            if (related.get('id') > 0) {
                // Ja existe related
                if (related.get('prl_related') != memberCatalog.get('id')) {
                    // O related e diferente do selecionado na combo
                    // TODO fazer o Update do related
                    console.log('TODO: UPDATE UM NOVO RELATED');

                    related.set('prl_related', memberCatalog.get('id'));
                    relateds.add(related);
                    relateds.sync();

                } else {
                    // related selecioando e igual ao que esta no banco
                    // nao faz nada
                    me.loadContents();
                }

            } else {
                // Criar um novo related
                console.log('TODO: CRIAR UM NOVO RELATED');
                related.set('prl_product', currentCatalog.get('id'));
                related.set('prl_related', memberCatalog.get('id'));
                related.set('prl_cross_identification', null);
                relateds.add(related);
                relateds.sync();

            }
        }
    },

    loadContents: function () {
        console.log('loadContents');
        var me = this,
            vm = me.getViewModel(),
            contents = vm.getStore('availableContents'),
            memberCatalog = vm.get('memberCatalog');

        // Carregar as propriedades do Catalogo de Membros.
        contents.addFilter([
            {
                property: 'pcn_product_id',
                value: memberCatalog.get('id')
            }
        ]);

        contents.load({
            callback: function () {
                me.preSelectCrossIdentification(this);
            }
        });

    },

    preSelectCrossIdentification: function (contents) {
        console.log('preSelectCrossIdentification');

        var me = this,
            refs = me.getReferences(),
            cmb = refs.cmbMembersProperties,
            vm = me.getViewModel(),
            related = vm.get('productRelated'),
            content;

        contents.each(function (c) {
            if (c.get('ucd') === 'meta.id.cross') {
                content = c;
                return false;
            }
        }, me);


        // TODO SELECIONAR A PROPRIEDADE QUE JA ESTIVER NO RELATED
        if (related.get('id') > 0) {
            console.log('TESTE 1');
            if (related.get('prl_cross_identification') > 0) {
                // Ja tem uma propriedade setada
                content = contents.getById(related.get('prl_cross_identification'));

            }
        }

        if (content) {
            cmb.select(content);
            me.onSelectCrossIdentification(cmb, content);
        }

    },

    onSelectCrossIdentification: function (combo, crossIdentification) {
        console.log('onSelectCrossIdentification(%o, %o)', combo, crossIdentification);

        var me = this,
            vm = me.getViewModel();

        if ((crossIdentification) && (crossIdentification.get('id') > 0)) {

            vm.set('crossIdentification', crossIdentification);


            // TODO verificar se precisa atualizar o related

        }
    }











    /**


{
    "process": {
        "process_end_date": "2016-10-31 01:24:51",
        "process_name": "WAZP",
        "fields": [],
        "process_description": null,
        "process_id": "1002",
        "products": [{
            "process_id": 1002,
            "display_name": "Galaxy Clusters 9",
            "product_id": 2143,
            "nside": null,
            "pg_table_info": {
                "table_size_in_bytes": 10084352,
                "number_of_columns": 75,
                "number_of_rows": 14094,
                "table": "wazp_new.galaxy_clusters_1002"
            },
            "ordering": null,
            "fields": ["Y1A1_COADD_STRIPE82"],
            "pypeline_name": "WAZP",
            "job_id": 135586,
            "selected_name": null,
            "file_path": "/archive/staging/DES/tmp/exports/wazp_new.galaxy_clusters_1002.csv",
            "filter": null,
            "version": 9,
            "releases": [],
            "ora_table_info": {
                "n_imported_rows": 14094,
                "table_size_in_bytes": 6291456,
                "oracle_table_name": "brportal.e_1002_2143",
                "n_imported_columns": 75
            },
            "table": "e_1002_2143",
            "schema": "brportal",
            "type": "catalog",
            "class": "galaxy_clusters",
            "columns": "seqnr,ra_init,dec_init,radius_saddle_mpc,radius_iso_mpc,radius_iso_mpc_init,radius_snr,z_init,zmin_cyl,zmax_cyl,contrast_cyl,nmax_cyl,maxpix,ngals_rmin_init,ngals_core_init,snr_init,contrast_init,local_bkg_iz_r,mean_bkg_iz_r,area_local_bkg,masked_frac_r2,masked_frac_r1,masked_frac_r05,eff_frac_r05,target_distance,detection_tile,id_in_tile,iz_init,peak_id,xpeak,ypeak,xpeak_hr,ypeak_hr,npeaks_dom,domain_id,org_domain_id,cyl_nsl,flag_neighbour,ra,dec,sigma_dz_init,sigma_dz,ngals,ngals_err,ngals_rmin,ngals_rcc,sigma_bkg,radius_half_n_mpc,radius_half_n_amin,radius_cc_mpc,radius_cc_amin,radius_max_mpc,radius_max_amin,contrast_rhalf,contrast_rmax,contrast_rcc,snr,contrast,concentration,zp,z_err,nmem,flag_radius_cut,flag_deblend,local_bkg_r,mean_bkg_r,ra_bcg,dec_bcg,dcen_bcg,mag_bcg,zp_bcg,zs,rank,id,tilename",
            "name": "Galaxy Clusters 9"
        }, {
            "process_id": 1002,
            "display_name": "Cluster Members 9",
            "product_id": 2144,
            "nside": null,
            "pg_table_info": {
                "table_size_in_bytes": 82894848,
                "number_of_columns": 20,
                "number_of_rows": 259081,
                "table": "wazp_new.cluster_members_1002"
            },
            "ordering": null,
            "fields": ["Y1A1_COADD_STRIPE82"],
            "pypeline_name": "WAZP",
            "job_id": 135586,
            "selected_name": null,
            "file_path": "/archive/staging/DES/tmp/exports/wazp_new.cluster_members_1002.csv",
            "filter": null,
            "version": 9,
            "releases": [],
            "ora_table_info": {
                "n_imported_rows": 259081,
                "table_size_in_bytes": 35651584,
                "oracle_table_name": "brportal.e_1002_2144",
                "n_imported_columns": 20
            },
            "table": "e_1002_2144",
            "schema": "brportal",
            "type": "catalog",
            "class": "cluster_members",
            "columns": "seqnr,id_cluster_tile,detection_tile,id_g,nmem_cl,pmem,pmem_err,mag,ra,dec,zp,zp_cl,snr,ngals,ngals_rmin,dcen,dcen_norm,flag_bcg,id_cluster,tilename",
            "name": "Cluster Members 9"
        }],
        "process_comment": null,
        "process_start_date": "2016-10-31 01:24:51",
        "owner_username": "ogando"
    },
    "ticket":"XQW8283",
    "register_username": "carlosadean"
}



     */

});
