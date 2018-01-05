
Ext.require('UserQuery.view.service.Api');
//Ext.require('UserQuery.store.QueryStore');
Ext.require('UserQuery.view.dialog.DownloadDialog');
Ext.require('UserQuery.view.dialog.NewDialog');
Ext.require('UserQuery.view.dialog.OpenDialog');
Ext.require('UserQuery.view.dialog.SaveAsDialog');
Ext.require('UserQuery.view.dialog.StartJobDialog');

var myQueryNumber = 1;

var main = Ext.define('UserQuery.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',
    activeQuery: {},
    activeRelease: {},

    afterRender: function(){
        var me = this;
        var refs = me.getReferences();
        var vm = me.getViewModel();
        this.status = {};
        
        vm.set('initialized', false);


        // Api.getReleases(function(error, releases){
        //     if (!error){
        //         refs.cmbReleases.setStore(Ext.create('Ext.data.Store', {
        //             fields: ['id', 'rls_display_name'],
        //             data : releases
        //         }));
        //     }
        // })
        
        Api.parallel([
            // verifica se o usuário está autenticado
            Api.getUser(function(error, user){
                if (error) Api.doLogin();
            }),

            // busca a lista de releases
            Api.getReleases({
                params:{
                    group: 'objects_catalog'
                },
                response: function(error, releases){
                    var release;

                    if (!error){
                        release = releases[0];

                        refs.cmbReleases.setStore(Ext.create('Ext.data.Store', {
                            fields: ['release_id', 'release_display_name'],
                            data : releases
                        }));
                        
                        refs.cmbReleases.setValue(release.release_id);
                        me.createEmptyQuery(release.release_id);
                    }
                }
            })],

            // quanto todas as api's responderem, remove o splash screen e exibe a aplicação
            function(){
                vm.set('initialized', true);
                //me.createEmptyQuery();
                refs.ctnArea.setStyle({opacity:1});
                removeSplash();

                me.loadMyQueries();
                me.loadExternalTables();

                // setTimeout(function(){
                //     me.downloadCsv('table_id');
                // }, 400);
            }
        );

        new Ext.dd.DropTarget(refs.sql_sentence.getEl(), {
            ddGroup: 'TreeDD', // mesmo ddGroup definido na treeview
            notifyEnter: function(ddSource, e, data){
                // 
            },
            // notifyOver: function(ddSource, event, data){
            //     // TODO: posicionar cursor na caixa de texto ao arrastar
            //     // if (event.target.nodeName=='TEXTAREA'){
            //     //     //
            //     //     div = document.body.appendChild(socument.createElement('div'))
            //     //     div.innerText = event.target.value
            //     //     sty = getComputedStyle(textarea)
            //     //     div.style.padding = sty.padding
            //     //     div.style.font = sty.font
            //     //     div.style.border = sty.border
            //     //     div.style.width = textarea.offsetWidth + 'px';
            //     //     div.style['word-wrap'] = 'break-word';

            //     //     var position = getElementMousePosition(event.browserEvent);
            //     //     setCaretPositionFromPoint(event.pageX, event.pageY);
            //     //     event.target.focus();
            //     //     console.log(event);
            //     // }
            // },
            notifyDrop  : function(ddSource, e) {
                var row = ddSource.dragData.records[0].data;
                var textareafield = Ext.getCmp(this.el.id);
                var value = textareafield.getValue();

                value += (' ' + (row.data_schema ? row.data_schema + '.' : '') );

                if (row.data_field){
                    value += (row.data_table + '.' + row.data_field);
                }else{
                    value += row.data_table;
                }

                textareafield.setValue( value );
            }
        });
    },

    //////////////////////////////////////////////////////
    /********************  EVENTS   ********************/
    //////////////////////////////////////////////////////

    accInputTable_onCollapse: function(){
        var refs = this.getReferences();
        refs.tvwInputTables.collapseAll();
    },

    accExternalCatalog_onCollapse: function(){
        var refs = this.getReferences();
        refs.tvwExternalCatalog.collapseAll();
    },

    accMyTables_onCollapse: function(){
        var refs = this.getReferences();
        refs.tvwMyTables.collapseAll();
    },

    accOtherTables_onCollapse: function(){
        var refs = this.getReferences();
        refs.tvwOtherTables.collapseAll();
    },

    accExternalCatalog_onExpand: function(){
        // this.loadExternalTables();
    },

    // evento: ao expandir o item accordion my tables
    accMyTables_onExpand: function(){
        //this.loadMyTables();
    },

    accOtherTables_onExpand: function(){
        // this.loadOtherTables();
    },

    accMyQueries_onExpand: function(){
        this.loadMyQueries();
    },

    accSampleQueries_onExpand: function(){
        this.loadSampleQueries();
    },

    // evento: ao clicar no botão da toolbar abrir query
    btnOpen_onClick: function(button){
        var me = this;
        var dialog = new OpenDialog({animateTarget : button.getEl()});

        dialog.open(function(query){
            if (query){
                me.setActiveQuery(query);
            }
        });
    },

    // evento: ao clicar no botão new query
    btnNew_onClick: function(button){
        var me = this;
        var dialog = new NewDialog({animateTarget : button.getEl()});

        dialog.open(function(release){
            if (release){
                me.createEmptyQuery(release.id);
            }
        });
    },

    btnClear_onClick: function(){
        this.clearQuery();
    },
    
    // evento: ao clicar no botão start job
    btnStartJob_onClick: function(button){
        var me = this;
        var refs = me.getReferences();
        var dialog = new StartJobDialog({animateTarget : button.getEl()});
        var query = me.getActiveQuery();
        var formData = refs.frmQuery.getForm().getValues();
        var release = me.getActiveRelease() || {};

        if (release.id === undefined){
            return Ext.MessageBox.show({
                msg: 'Select release',
                buttons: Ext.MessageBox.OK
            });
        }

        dialog.open(formData, function(data){
            data.associate_target_viewer = 'on'; // RN: todas devem ser registradas
            data.id = null;                      // RN: não associar a query, usar o sql atual // query.id ||
            data.release_id = release.id;
            data.release_name = release.rls_name;
            data.sql_sentence = formData.sql_sentence;
            data.query_name = formData.name || 'Unnamed';
            
            Api.startJob({
                cache: false,
                params: data,
                //errorMessage: false,
                request: function(){
                    me.setLoading(true, 'Starting job...');
                },
                response: function(error, result){
                    me.setLoading(false);
                    me.loadMyJobs(false);

                    if (!error){
                        Ext.MessageBox.show({
                            msg: 'The job will run in the background and you will be notified when it is finished',
                            buttons: Ext.MessageBox.OK
                        });
                        //Ext.toast('JOB started success', null, 't');
                    }else{
                        // Ext.MessageBox.show({
                        //     title: 'Server Side Failure',
                        //     msg: response.status + ' ' + response.statusText, // + '<br>' + response.responseText,
                        //     buttons: Ext.MessageBox.OK,
                        //     icon: Ext.MessageBox.WARNING,
                        //     fn: function(){
                        //         me.responseAnalyse(response, null, definition, requestId);
                        //     }
                        // });
                    }
                }
            });
        });
    },

    // evento: ao clicar no botão save
    btnSave_onClick: function(button){
        var refs = this.getReferences();
        var query = this.getActiveQuery();
        var data = refs.frmQuery.getForm().getValues();
        
        if (query && query.is_sample){
            this.mnuSaveAs_onClick(button);
        }else{
            this.saveQuery(query.id, data);
        }
    },

    // evento: ao clicar no botão delete
    btnDelete_onClick: function(){
       this.deleteQuery();
    },
    
    // evento: ao clicar no botão check
    btnCheck_onClick: function(){
        var me = this;
        var refs = me.getReferences();
        var query = me.getActiveQuery();
        
        Api.validate({
            cache: false,
            params:{
                id: query.id,
                sql_sentence: refs.sql_sentence.getValue()
            },
            request: function(){
                me.setLoading(true, 'Check in progress...');
            },
            response: function(error, result){
                me.setLoading(false);
                result = result || {};

                if (!error){
                    if (result.is_validated){
                        Ext.toast('Query validated successfully', null, 't');
                    }else{
                        Ext.MessageBox.show({
                            title: 'Query validated error',
                            msg: result.error_message.split('[')[0],
                            buttons: Ext.Msg.OK,
                            icon: Ext.MessageBox.WARNING
                        });
                    }
                }
            }
        });
    },

    // evento: ao clicar no botão de preview
    btnPreview_onClick: function(){
        var refs = this.getReferences();
        
        this.sqlPreview( refs.sql_sentence.getValue() );
    },

    cmbReleases_onSelect: function(sender, item){
        this.createEmptyQuery(item.data.release_id);
    },

    // ao ser modificado qualquer dado do formulário query
    form_onDataChange: function(field, newVal, oldVal) {
        var refs = this.getReferences();
        var vm = this.getViewModel();
        var release = this.getActiveRelease();
        var query = this.getActiveQuery() || {};
        var data = refs.frmQuery.getForm().getValues();
        
        query.changed = true;
        
        vm.set('activeQuery.'+field.name, newVal);
        var sqlExist = Boolean(vm.get('activeQuery.sql_sentence'));

        refs.btnSave.setDisabled( !release || !Boolean(data.name && data.sql_sentence) );
        refs.btnCheck.setDisabled( !sqlExist );
        refs.btnPreview.setDisabled( !sqlExist );
        refs.btnStartJob.setDisabled( !sqlExist  || !release );
    },

    mnuSaveAs_onClick: function(button){
        var me = this;
        var refs = this.getReferences();
        var dataForm = refs.frmQuery.getForm().getValues();
        var dialog = new SaveAsDialog({animateTarget : button.getEl()});

        dialog.open(function(data){
            if (data){
                data.sql_sentence = dataForm.sql_sentence;
                me.saveQuery(null, data);
            }
        });
    },

    pnlLeftToolDown_onClick: function(e, el,o, tool) {
        if (this.pnlLeftToolDownMenu) {
            this.pnlLeftToolDownMenu.showBy(tool);
        }
    },

    tabMyJobs_onActivate: function(){
        if (!this.jobsLoaded){
            this.jobsLoaded = true;
            this.loadMyJobs();
        }
    },

    treeView_onContextMenu: function(tree, record, item, index, e, eOpts) {
        var items = tree.panel.config.contextMenuItems || [];

        if (!record.get('ignore_context_menu')){
            e.stopEvent();
            this.showContextMenu(items, record, e.getX(), e.getY());
        }
    },

    showContextMenu: function(items, record, x, y){
        var menu;

        items.forEach(function(item){
            if ( typeof(item.config_item)=='function' ){
                item.config_item(item, record);
            }
            item.record = record;
        });

        menu = new Ext.menu.Menu({items: items});
        menu.showAt([x-10, y-10]);
    },

    tvwMyTables_onContextMenuClick: function(item){
        var me = this;
        var config = item.config;
        var table = item.record.get('data_table');

        switch(config.itemId){
            case 'rename':
                Ext.MessageBox.prompt('Rename', 'Name:', function(button, value){
                    if (value != table && value){
                        Api.renameTable({
                            cache: false,
                            params: {
                                id: item.record.get('data_id'),
                                display_name: value,
                                table_name: item.record.get('data_table')
                            },
                            request: function(){
                                me.setLoading(true, 'Operation in progress...');
                            },
                            response: function(error, query){
                                me.setLoading(false);
                
                                if (!error){
                                    Ext.toast('Success', null, 't');
                                    
                                    //remove a tabela de sua lista
                                    me.loadMyTables(true);
                                }
                            }
                        });
                    }
                });
                break;

            case 'preview':  
                this.sqlPreview( 'select * from ' + table, 'grdPreview' );
                break;

            case 'delete':
                Ext.MessageBox.show({
                    title: 'Cofirm Action',
                    msg: 'Drop table "' + item.record.get('text').split('<span')[0] + '"?',
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.MessageBox.WARNING,
                    fn: function(button){
                        if (button=='yes'){
                            me.dropTable(item.record.get('data_id'), function(){
                                me.loadMyTables(true);
                            });
                        }
                    }
                });
                break;
            
            case 'download':
                me.downloadCsv(item.record.get('data_schema'), item.record.get('data_table'), item.record.get('data_id'), item.getTargetEl());
                break;
            
            case 'target':
                window.open(location.href.split('/userquery')[0] + '/target/#cv/' + item.record.get('data_product_id'));
                break;
        }
    },
    
    tvwExternalCatalog_onContextMenuClick: function(item){
        var config = item.config;
        var table = item.record.get('data_table');

        switch(config.itemId){
            case 'preview':  
                this.sqlPreview( 'select * from ' + table, 'grdPreview' );
                break;
        }
    },

    tvwMyTables_onExpanded: function(node){
        if (node.isRoot() || node.childNodes.length>0){
            return;
        }
        
        this.loadFields({
            schema: node.get('data_schema'),
            table: node.get('data_table'),
            request: function(){
                node.set('cls', 'x-grid-tree-loading');
            },
            response: function(fields){
                node.appendChild(fields);
                node.set('cls', '');
            }
        });
    },
    
    tvwExternalCatalog_onExpanded: function(node){
        if (node.isRoot() || node.childNodes.length>0){
            return;
        }
        
        this.loadFields({
            schema: node.get('data_schema'),
            table: node.get('data_table'),
            request: function(){
                node.set('cls', 'x-grid-tree-loading');
            },
            response: function(fields){
                node.appendChild(fields);
                node.set('cls', '');
            }
        });
    },

    tvwInputTables_onContextMenuClick: function(item){
        var me = this;
        var config = item.config;
        var table = item.record.get('data_table');

        switch(config.itemId){
            case 'preview':  
                this.sqlPreview( 'select * from ' + table, 'grdPreview' );
                break;
        }
    },

    tvwOtherTables_onContextMenuClick: function(item){
        var me = this;
        var config = item.config;
        var table = item.record.get('data_table');

        switch(config.itemId){
            case 'preview':  
                this.sqlPreview( 'select * from ' + table, 'grdPreview' );
                break;
        }
    },

    // evento: ao expandir um nó das input tables
    tvwInputTables_onExpanded: function(node){
        if (node.isRoot() || node.childNodes.length>0){
            return;
        }
        
        this.loadFields({
            schema: node.get('data_schema'),
            table: node.get('data_table'),
            request: function(){
                node.set('cls', 'x-grid-tree-loading');
            },
            response: function(fields){
                node.appendChild(fields);
                node.set('cls', '');
            }
        });
    },

    tvwOtherTables_onExpanded: function(node){
        if (node.isRoot() || node.childNodes.length>0 || node.data.isgroup){
            return;
        }
        
        this.loadFields({
            schema: node.get('data_schema'),
            table: node.get('data_table'),
            request: function(){
                node.set('cls', 'x-grid-tree-loading');
            },
            response: function(fields){
                node.appendChild(fields);
                node.set('cls', '');
            }
        });
    },

    tvwMyQueries_onSelect: function(sender, node){
        var me = this;
        var refs = me.getReferences();

        if (!node.data.isgroup){
            // me.alertQueryChanged(
            //     function(){
                    refs.tvwSampleQueries.getSelectionModel().deselectAll();
                    me.setActiveQuery( clone(node.data) );
                // }, 
                // function(){
                //     refs.tvwMyQueries.getSelectionModel().deselectAll();    
                // });
        }
    },

    tvwSampleQueries_onSelect: function(sender, node){
        var me = this;
        var refs = me.getReferences();

        if (!node.data.isgroup){
            // me.alertQueryChanged(function(){
                refs.tvwMyQueries.getSelectionModel().deselectAll();
                me.setActiveQuery( clone(node.data) );            
            // });
        }
    },

    tvwMyQueries_onContextMenuClick: function(item){
        var me = this;
        var config = item.config;
        var refs = this.getReferences();
        var query = this.getActiveQuery();

        switch(config.itemId){
            case 'rename':
                Ext.MessageBox.prompt('Rename', 'Name:', function(button, value){
                    if (value != config.record.get('data_table') && value){
                        var data = refs.frmQuery.getForm().getValues();
                        data.name = value;
                        me.saveQuery(query.id, data);
                    }
                });
                break;

            case 'delete':
                me.deleteQuery();
                break;
        }
    },

    //////////////////////////////////////////////////////
    /********************  METHODS   ********************/
    //////////////////////////////////////////////////////
    alertQueryChanged: function(confirm, cancel){
        var query = this.getActiveQuery() || {};
        
        if (query.changed === true){
            Ext.MessageBox.show({
                title: 'Current query changed',
                msg: 'The current query was not saved, do you want to continue?',
                buttons: Ext.Msg.YESNO,
                icon: Ext.MessageBox.WARNING,
                fn: function(button){
                    if (button=='yes'){
                        confirm();
                    }else{
                        cancel();
                    }
                }
            });
        }else{
            confirm();
        }
    },

    clearQuery: function(){
        var me = this;
        var refs = me.getReferences();
        var c, i, length = refs.grdPreview.headerCt.items.length;

        for (i=0; i<length; i++){
            c = refs.grdPreview.headerCt.getComponent(0);
            refs.grdPreview.headerCt.remove(c);
        }

        refs.cmbReleases.reset();
        refs.frmQuery.getForm().reset();
        refs.grdPreview.getView().refresh();

        this.getViewModel().set('activeQuery', null);
        
        refs.tvwInputTables.setRootNode(null);
        refs.tvwMyTables.setRootNode(null);
        refs.tvwOtherTables.setRootNode(null);

        refs.tvwMyQueries.getSelectionModel().deselectAll();
        refs.tvwSampleQueries.getSelectionModel().deselectAll();
    },

    createEmptyQuery: function(release_id){
        var refs = this.getReferences();
                
        refs.tvwMyQueries.getSelectionModel().deselectAll();

        this.setActiveQuery({
            name:  "Unnamed Query " + (myQueryNumber++),
            release: release_id || 1,
            changed: false
        });
    },

    deleteQuery: function(){
        var me = this;
        var query = me.getActiveQuery();
        
        Ext.MessageBox.show({
            title: 'Confirm Action',
            msg: 'Delete query "' + query.name + '"',
            buttons: Ext.Msg.YESNO,
            icon: Ext.MessageBox.WARNING,
            fn: function(button){
                if (button=='yes'){
                    doDelete();
                }
            }
        });

        function doDelete(){
            Api.remove({
                cache: false,
                params: {
                    id: query.id
                },
                request: function(){
                    me.setLoading(true, 'Removing...');
                },
                response: function(error, query){
                    me.setLoading(false);
    
                    if (!error){
                        Ext.toast('Query deleted', null, 't');
                        me.createEmptyQuery();

                        //remove a query da lista my queries
                        me.loadMyQueries(true);
                    }
                }
            });
        }
    },

    downloadCsv: function(schema, table_name, table_id, targetElement){
        var me = this;
        var refs = me.getReferences();
        var dialog = new DownloadDialog({animateTarget: targetElement});
        
        // API
        // userquery_download/{table_id}
        // {
        //      columns:[
        //          {name:name, display:display}    
        //      ]
        //}
        dialog.open({schema:schema, table_name:table_name}, function(columns) {
            if (columns.length>0){
                Api.downloadTable({
                    params: {
                        table_id: table_id,
                        columns: columns
                    },
                    request: function(){
                        me.setLoading(true, 'Operation in progress...');
                    },
                    response: function(error, query){
                        me.setLoading(false);

                        if (!error){
                            Ext.MessageBox.show({
                                msg: 'The job will run in the background and you will be notified when it is finished',
                                buttons: Ext.MessageBox.OK
                            });
                        }
                    }
                });
            }
        });
    },

    dropTable: function(table_id, next){
        var me = this;
        
        Api.dropTable({
            cache: false,
            params: {
                id: table_id
            },
            request: function(){
                me.setLoading(true, 'Operation in progress...');
            },
            response: function(error, query){
                me.setLoading(false);

                if (!error){
                    Ext.toast('Table dropped', null, 't');
                    
                    //remove a tabela de sua lista
                    me.loadMyTables(true);
                }
            }
        });
    },

    getActiveQuery: function(){
        return this.getViewModel().get('activeQuery');
    },

    getActiveRelease: function(release){
        return this.getViewModel().get('activeRelease');
    },

    loadInputTables: function(){
        var me = this;
        var refs = me.getReferences();
        var release = this.getActiveRelease() || {};
        
        if ( release.id===undefined){
            return;
        }

        return Api.getTables({
            cache: true,
            params:{
                release: release.id,
                group: 'objects_catalog', // 'targets'
            },
            request: function(){
                me.setLoading(true, 'Load release tables...');                
            },
            response: function(error, tables){
                me.setLoading(false);

                if (!error){
                    tables.forEach(function(item){
                        item.text = textWithMenu(item.prd_display_name, me);
                        item.data_schema = item.tbl_schema;
                        item.data_table = item.tbl_name;
                        item.qtip = 'rows: ' + Ext.util.Format.number(item.ctl_num_objects, '0,000');
                    });

                    refs.tvwInputTables.setStore(Ext.create('Ext.data.TreeStore', {
                        root: { // expanded: true,
                            children: tables
                        }
                    }));
                }
            }
        });
    
    },

    loadExternalTables: function(){
        var me = this;
        var refs = me.getReferences();
        var el = refs.tvwMyTables.getEl();
        
        return Api.getTables({
            cache: true,
            params:{
                group: 'external_catalogs',
            },
            request: function(){
                el.mask("Loading tables...", 'x-mask-loading');               
            },
            response: function(error, tables){
                el.unmask();
                
                if (error){
                    return;
                }

                if (!error){
                    tables.forEach(function(item){
                        item.text = textWithMenu(item.prd_display_name, me);
                        item.data_schema = item.tbl_schema;
                        item.data_table = item.tbl_name;
                        item.qtip = 'rows: ' + Ext.util.Format.number(item.ctl_num_objects, '0,000');
                    });
                }

                // preenche a tree external catalogs com as tabelas
                refs.tvwExternalCatalog.setStore(Ext.create('Ext.data.TreeStore', {
                    root: {
                        children: tables
                    }
                }));
            }
        });

    },

    loadMyTables: function(){
        var me = this;
        var refs = this.getReferences();
        var el = refs.tvwMyTables.getEl();
        var query = this.getActiveQuery();
        var release = this.getActiveRelease() || {};
        var t;
        
        if ( release.id===undefined){
            return;
        }

        Api.getMyTables({
            cache: false,
            params:{
                release: release.id
            },
            request: function(){
                el.mask("Loading tables...", 'x-mask-loading');
            },
            response: function(error, tables){
                var tb, item, table, cols;
                var arr = [];

                el.unmask();

                if (error){
                    return;
                }

                for (t in tables){
                    table = tables[t];
                    
                    arr.push({
                        text: textWithMenu(table.display_name, me),
                        data_id: table.id,
                        data_schema: table.schema,
                        data_table: table.table_name,
                        data_product_id: table.product_id,
                        qtip: 'rows: ' + Ext.util.Format.number(table.tbl_num_objects, '0,000')
                    });
                }                
                
                // preenche com as tabelas
                refs.tvwMyTables.setStore(Ext.create('Ext.data.TreeStore', {
                    root: {
                        children: arr
                    }
                }));
            }
        });
    },

    loadOtherTables: function(){
        var targets, catalogs;
        var me = this;
        var refs = this.getReferences();
        var query = this.getActiveQuery() || {};
        var release = this.getActiveRelease() || {};
        var el = refs.tvwOtherTables.getEl();
        var err = 0;
        
        // status carregando ou carregado, ou sem release selecionada, retorna
        if (release.id===undefined){
            return;
        }

        // busca lista de targets
        el.mask("Loading tables...", 'x-mask-loading'); 
        Api.parallel([

            // lista de targets
            Api.getTables({
                cache: false,
                params:{
                    release: release.id,
                    group: 'targets'
                },
                response: function(error, result){
                    err += error ? 1 : 0;
                    
                    if (!error){
                        result.forEach(function(item){
                            item.text = textWithMenu(item.prd_display_name, me);
                            item.data_schema = item.tbl_schema;
                            item.data_table = item.tbl_name;
                            item.qtip = 'rows: ' + Ext.util.Format.number(item.ctl_num_objects, '0,000');
                            //item.leaf = true;
                        });    
                    }

                    targets = result || [];
                }
            }),

            // lista de added catalogs
            Api.getTables({
                cache: false,
                params:{
                    release: release.id,
                    group: 'value_added_catalogs'
                },
                response: function(error, result){
                    err += error ? 1 : 0;

                    if (!error){
                        result.forEach(function(item){
                            item.text = item.prd_display_name;
                            item.data_schema = item.tbl_schema;
                            item.data_table = item.tbl_name;
                            item.qtip = 'rows: ' + Ext.util.Format.number(item.ctl_num_objects, '0,000');
                        });    
                    }

                    catalogs = result || [];
                }
            })],

            //api's acima finalizadas
            function(){
                var arr = [];

                el.unmask();
                
                if (targets && targets.length>0){
                    arr.push({text: 'Targets', expanded: false, isgroup:true, ignore_context_menu:true, children:targets});
                }

                if (catalogs && catalogs.length>0){
                    arr.push({text: 'Value_Added_Catalogs', expanded: false, isgroup:true, ignore_context_menu:true, children:catalogs});
                }

                refs.tvwOtherTables.setStore(Ext.create('Ext.data.TreeStore', {
                    root: {
                        expanded: false,
                        children: arr
                    }
                }));                    
            
            }
        );
    },

    loadFields: function(options){

        Api.getFields({
            cache: true,
            params:{
                schema: options.schema,
                table_name: options.table
            },
            request: function(){
                if (options.request) options.request();
            },
            response: function(error, results){
                var fields = [];
                if (!error){
                    results.columns.forEach(function(item){
                        fields.push({
                            text: item.column_name,
                            data_schema: options.schema,
                            data_table: options.table,
                            data_field: item.column_name,
                            qtip: 'data type: ' + item.data_type,
                            leaf: true
                        });
                    });
                }

                if (options.response) options.response(fields);
            }
        });
    },

    loadMyQueries: function(force){
        var me = this;
        var refs = this.getReferences();
        var el = refs.tvwMyQueries.getEl();
        
        // status carregando ou carregado, retorna
        if ( force!==true && 'loading done'.includes(me.loadMyQueriesStatus)) {
            return;
        }

        me.loadMyQueriesStatus = 'loading';

        // busca lista que queries e samples
        el.mask("Loading queries...", 'x-mask-loading'); 
        
        // lista queries
        Api.getQueries({
            cache: false,
            response: function(error, result){
                el.unmask();
                
                if (!error){
                    me.loadMyQueriesStatus = 'done';

                    result.forEach(function(item){
                        item.text = textWithMenu(item.name, me);
                        item.leaf = true;
                    });    
                                    
                    refs.tvwMyQueries.setStore(Ext.create('Ext.data.TreeStore', {
                        root: {
                            expanded: true,
                            children: result || []
                        }
                    }));
                }else{
                    me.loadMyQueriesStatus = 'error';
                }
            }
        });

    },

    loadSampleQueries: function(force){
        var me = this;
        var refs = this.getReferences();
        var el = refs.tvwSampleQueries.getEl();
        
        // status carregando ou carregado, retorna
        if ( force!==true && 'loading done'.includes(me.loadSampleQueriesStatus)){
            return;
        }

        me.loadSampleQueriesStatus = 'loading';

        // busca samples queries
        el.mask("Loading samples...", 'x-mask-loading'); 

        // lista samples
        Api.getSamples({
            cache: false,
            response: function(error, result){
                el.unmask();
                
                if (!error){
                    me.loadSampleQueriesStatus = 'done';

                    result.forEach(function(item){
                        item.text = item.name;
                        item.leaf = true;
                        item.is_sample = true;
                    });
                        
                    refs.tvwSampleQueries.setStore(Ext.create('Ext.data.TreeStore', {
                        root: {
                            expanded: true,
                            children: result || []
                        }
                    }));

                }else{
                    me.loadSampleQueriesStatus = 'error';
                }

            }
        });
    },

    loadMyJobs: function(showMask, selectTab){
        var me = this;
        var refs = me.getReferences();
        var el = refs.grdJobs.getEl();

        showMask = showMask===undefined ? true : showMask;
        clearTimeout(me.tm);

        Api.getJobs({
            cache: false,
            request: function(){
                if (showMask && el) el.mask("Loading Jobs...", 'x-mask-loading');
            },
            response: function(error, jobs){
                var colsMap = [
                    {field:'id',              display:'Job ID',     renderer: toolTipRenderer},
                    {field:'status_name',     display:'Status',     renderer: toolTipRenderer},
                    {field:'start_date_time', display:'Start',      renderer: toolTipRenderer},
                    {field:'end_date_time',   display: 'End',       renderer: toolTipRenderer},
                    {field:'total_run_time',  display: 'Run Time',  renderer: toolTipRenderer},
                    {field:'timeout',         display:'Timeout',    renderer: toolTipRenderer},
                    {field:'display_name',    display:'Table Name', renderer: toolTipRenderer}
                    // {field:'query_name',      display:'Query Name', renderer: toolTipRenderer, flex:1}
                    // {field:'sql_sentence', display:'Query', flex:1},
                ];
                var status = {
                    'st': ['row-grey', 'Starting'],
                    'rn': ['row-yellow', 'Running'],
                    'ok': ['row-green', 'Done'],
                    'er': ['row-red', 'Error']
                };

                jobs.forEach(function(job){
                    var d1 = new Date(job.end_date_time);
                    var d2 = new Date(job.start_date_time);
                    var duration = d1.getTime() - d2.getTime();
                    var seconds = parseInt((duration/1000)%60);
                    var minutes = parseInt((duration/(1000*60))%60);
                    var hours = parseInt((duration/(1000*60*60))%24);
                    var arr = status[job.job_status] || [];

                    job.row_cls = arr[0];
                    job.status_name = arr[1];
                    job.total_run_time = job.end_date_time ? (hours>9 ? hours : '0'+hours) + ':' + (minutes>9 ? minutes : '0'+minutes) + ':' + (seconds>9 ? seconds : '0'+seconds) : '';
                    job.end_date_time  = job.end_date_time || '';
                    job.start_date_time = job.start_date_time.substr(0,10) + ' ' + job.start_date_time.substr(11,11);
                    job.end_date_time = job.end_date_time.substr(0,10) + ' ' + job.end_date_time.substr(11,11);
                    job.query_name = job.query_name || 'Unnamed';
                });

                if (el) el.unmask();

                // TODO: notificar usuário sobre alteração no status do job
                // if (me.pendingJobs){
                //     me.pendingJobs.forEach(function(job){
                //         var j = jobs.find(function(jj){ return jj.id==job.id});
                //         if (j && j.job_status != job.job_status){
                //             Ext.toast('Job status changed', null, 't');
                //         }
                //     });
                // }                
                me.pendingJobsLength = me.pendingJobsLength || 0;
                me.pendingJobs = jobs.filter(function(j){return j.job_status=='rn' || j.job_status=='st';});
                me.showDataPreview('grdJobs', jobs, colsMap, selectTab);
                
                // se tem job pendente, atualizaa lista a cada 30 segundos
                if (me.pendingJobs.length>0){
                    if (me.pendingJobs.length<me.pendingJobsLength){
                        me.loadMyTables();
                    }

                    me.tm = setTimeout(function(){
                        me.loadMyJobs(false, false);
                    }, 30000);
                }else{
                    me.loadMyTables();
                }

                me.pendingJobsLength = me.pendingJobs.length;
            }
        });

        function toolTipRenderer(value, meta, record) {
            meta.tdAttr = 'data-qtip="' + record.get('sql_sentence') + '"';
            return value;
        }
    },

    saveQuery: function(id, data){
        var me = this;
        var refs = me.getReferences();
        var release = me.getActiveRelease();
        
        data.id = id;
        data.release = release.id;

        // TODO: no banco de dados não deve ser obrigatório esse campo
        data.table_name = data.name.toLowerCase().replace(/\ /g, '');

        Api.save({
            cache: false,
            params: data,
            error: function(error){
                if (error.message == "This query name is already defined by this user"){
                    
                    Ext.MessageBox.show({
                        title: 'Query not saved',
                        msg: 'This query name is already defined by this user',
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });

                    return false;
                }                
            },
            request: function(){
                me.setLoading(true, 'Saving...');
            },
            response: function(error, queryResponse){
                me.setLoading(false);
                
                // nova query, muda o status para ser recarregada a lista de queries
                if (!id){
                    me.loadMyQueriesStatus = null;
                }

                if (!error){
                    Ext.toast('Query data saved', null, 't');
                    queryResponse.changed = false;
                    
                    refs.tvwSampleQueries.getSelectionModel().deselectAll();
                    if (!id) refs.tvwMyQueries.getSelectionModel().deselectAll();

                    me.updateActiveQuery(queryResponse);
                    me.loadMyQueries(true);
                }
            }
        });
    },

    sqlPreview: function(sql, gridName){
        var me = this;
        
        // executa o sql no servidor
        Api.preview({
            cache: false,
            params:{
                line_number: 10,
                sql_sentence: sql
            },
            request: function(){
                me.setLoading(true, 'Preview in progress...');
            },
            response: function(error, result){
                me.setLoading(false);

                if (!error){
                    me.showDataPreview(gridName || 'grdPreview', result.results);
                }
            }
        });
    },

    showDataPreview: function(gridName, results, cols, selectTab){
        var c, i, d, f;
        var datatype = {};
        var me = this;
        var index = {'grdPreview':0, 'grdJobs':1};
        var refs = me.getReferences();
        var grid = refs[gridName];
        var length = grid.headerCt.items.length;

        Ext.suspendLayouts();

        // limpa a grid
        for (i=0; i<length; i++){
            c = grid.headerCt.getComponent(0);
            grid.headerCt.remove(c);
        }
        grid.getView().refresh();

        // define as colunas da grid
        if (cols){
            for (c in cols){
                for (f in results[0])
                    if (f != cols[c].field) continue;
                    
                grid.headerCt.insert(i++, Ext.create('Ext.grid.column.Column', {
                    text: cols[c].display, 
                    dataIndex: cols[c].field,
                    flex: cols[c].flex || 0,
                    renderer: cols[c].renderer || undefined
                }));
            }
        }else{
            for (f in results[0]){
                grid.headerCt.insert(i++, Ext.create('Ext.grid.column.Column', {
                    text:f, 
                    dataIndex:f
                }));
            }
        }

        // muda para a aba da grid
        if ( index[gridName] != undefined && selectTab!==false){
            refs.tabBottom.setActiveItem( index[gridName] );
        }

        // define os dados da grid
        grid.getStore().loadData(results);

        Ext.resumeLayouts(true);
    },

    setLoading: function(state, text){
        if (!this.loadingMask){
            this.loadingMask = new Ext.LoadMask({
                msg    : 'Please wait...',
                target : this.getView()
            });
        }

        //this.loadingMask.useMsg = text ? true : false;
        this.loadingMask.msg = text || 'Loading...';
        this.loadingMask[state ? 'show' : "hide"]();
    },

    setActiveRelease: function(release){
        var refs = this.getReferences();
        var vm = this.getViewModel();
        
        refs.cmbReleases.setValue(release.id);

        release.display = release.rls_display_name;
        vm.set('activeRelease', release);
    },

    setActiveQuery: function(query){
        var me = this;
        var refs = me.getReferences();
        //var activeRelease;
        
        Api.sequence([
            // busca dados da release
            function(next){
                return Api.getRelease({
                    cache: true,
                    params:{ 
                        id: query.release.split ? query.release.split('/releases/')[1].replace('/', '') : query.release  //TODO: tá retornando uma url, deve ser número, por isso essa gambiarra
                    },
                    request: function(){
                        me.setLoading(true, 'Loading release data...');                
                    },
                    response: function(error, release){
                        //activeRelease = release;
                        me.setLoading(false);
                        next(release);
                    }
                });
            },

            // busca lista de tabelas da release
            function(next, release){
                refs.ctnArea.setStyle({opacity:1});

                me.setActiveRelease(release);
                me.updateActiveQuery(query);

                //preenche as treeview que estiver aberta
                me.loadInputTables();
                me.loadMyTables();
                me.loadOtherTables();
            }
            //,

            // preenche a treeview com a lista de tabelas da release, limpa o form
            // function(next, tables){
            //     refs.ctnArea.setStyle({opacity:1});
                
            //     me.clearQuery();
            //     me.setActiveRelease(activeRelease);
            //     me.updateActiveQuery(query);
                
            //     // preenche a tree com as tabelas da release
            //     tables.forEach(function(item){
            //         item.text = item.prd_display_name;
            //     });
            //     refs.tvwInputTables.setStore(Ext.create('Ext.data.TreeStore', {
            //         root: { // expanded: true,
            //             children: tables
            //         }
            //     }));
            // }
        ]);

        // obtém lista de tabelas da release
        /*
        function doGetTables(release){
            Api.getTables({
                cache: true,
                params:{
                    release: release.id,
                    group: 'targets'
                },
                request: function(){
                    me.setLoading(true, 'Load release tables...');                
                },
                response: function(error, tables){
                    me.setLoading(false);
                    complete(tables);
                }
            });
        }

        function complete(tables){
            refs.ctnArea.setStyle({opacity:1});
            
            me.clearQuery();
            me.updateActiveQuery(query);
            
            // preenche a tree com as tabelas da release
            tables.forEach(function(item){
                item.text = item.tbl_name;
            });
            refs.tvwInputTables.setStore(Ext.create('Ext.data.TreeStore', {
                root: { // expanded: true,
                    children: tables
                }
            }));
        }

        // obtém dados da release da query
        (function doGetRelease(){
            console.warn('resolver o problema do release tá retornando uma url ao invés de número, ver TODO abaixo');
            Api.getRelease({
                cache: true,
                params:{ 
                    id: query.release.split ? query.release.split('/releases/')[1].replace('/', '') : query.release  //TODO: tá retornando uma url, deve ser número, por isso essa gambiarra
                },
                request: function(){
                    me.setLoading(true, 'Loading release data...');                
                },
                response: function(error, release){
                    me.setLoading(false);
                    me.setActiveRelease(release);
                    doGetTables(release);
                }
            });
        }())
        */
    },

    updateActiveQuery: function(query){
        var refs = this.getReferences();
        var vm = this.getViewModel();
        var q = this.getActiveQuery() || {};

        Object.assign(q, query);

        query.exist = query.id ? true : false;
        refs.frmQuery.getForm().setValues(query);
        vm.set('activeQuery', query);
    }
});

function clone(obj){
    try{
        return JSON.parse(JSON.stringify(obj));
    }catch(e){
        return null;
    }
}

function textWithMenu(text, context){
    return text +'<span class="x-tree-icon x-fa fa-caret-square-o-down item-menu-button" onclick="textWithMenuClick(this, \''+(context.view.id)+'\')"></span>';
}

function textWithMenuClick(el, id){
    var tree, ctrl, items, record;
    var r = el.getBoundingClientRect();
    
    while (el){
        tree = Ext.getCmp(el.id);
        
        if (tree){
            
            break;
        }

        el = el.parentNode;
    }

    setTimeout(function(){
        ctrl = Ext.getCmp(id);
        items = tree.panel.config.contextMenuItems || [];
        record = tree.getSelection()[0];
        
        if (!record.get('ignore_context_menu')){
            //this.showContextMenu(items, record, e.getX(), e.getY());
            ctrl.controller.showContextMenu(items, record, r.left+10, r.top+30);
        }
        //cmp.fireEvent('custom_itemcontextmenu', cmp);
    },100);

}

// mnuItemRelease_onClick: function(item){
//     this.createEmptyQuery(item.config.data.id);
// },

// tvwJobList_onSelectionChange: function(tv, node){
//     var refs = this.getReferences();
//     var data = node.data;
    
//     refs.ctnJobDetail.setHtml('<h3>JOB '+data.text+' Detail</h3>'+
//                               '<table>'+
//                                 '<tr><td style="font-weight:bold;">ID: </td><td>'+data.id+'</td></tr>'+
//                                 '<tr><td style="font-weight:bold;">Status: </td><td>'+data.job_status+'</td></tr>'+
//                                 '<tr><td style="font-weight:bold;">Start: </td><td>'+data.start_date_time+'</td></tr>'+
//                                 '<tr><td style="font-weight:bold;">End: </td><td>'+data.end_date_time+'</td></tr>'+                                
//                                 '<tr><td style="font-weight:bold;white-space:nowrap;">Table Name: </td><td>'+data.table_name+'</td></tr>'+
//                                 '<tr><td style="font-weight:bold;">Owner: </td><td>'+data.owner+'</td></tr>'+
//                                 '<tr><td style="font-weight:bold;">Timeout: </td><td>'+data.timeout+'</td></tr>'+
//                                 '<tr><td style="font-weight:bold;">SQL: </td><td>'+data.sql_sentence+'</td></tr>'+
//                               '</table>'
//                             );
// },

// onItemSelected: function (sender, record) {
//     Ext.Msg.confirm('Confirm', 'Are you sure?', 'onConfirm', this);
// },

// function getElementMousePosition(event) {
//     event = event || window.event;

//     var target = event.target || event.srcElement,
//         style = target.currentStyle || window.getComputedStyle(target, null),
//         borderLeftWidth = parseInt(style['borderLeftWidth'], 10),
//         borderTopWidth = parseInt(style['borderTopWidth'], 10),
//         rect = target.getBoundingClientRect(),
//         offsetX = event.clientX - borderLeftWidth - rect.left,
//         offsetY = event.clientY - borderTopWidth - rect.top;

//     return [offsetX, offsetY];
// };

// function setCaretPositionFromPoint(x, y){
//     // Try the standards-based way first
//     if (document.caretPositionFromPoint) {
//         var pos = document.caretPositionFromPoint(x, y);
//         range = document.createRange();
//         range.setStart(pos.offsetNode, pos.offset);
//         range.collapse();
//     //    range.insertNode(img);
//     }
//     // Next, the WebKit way
//     else if (document.caretRangeFromPoint) {
//         range = document.caretRangeFromPoint(x, y);
//     //    range.insertNode(img);
//     }
//     // Finally, the IE way
//     else if (document.body.createTextRange) {
//         range = document.body.createTextRange();
//         range.moveToPoint(x, y);
//     //    var spanId = "temp_" + ("" + Math.random()).slice(2);
//     //    range.pasteHTML('<span id="' + spanId + '">&nbsp;</span>');
//     //    var span = document.getElementById(spanId);
//     //    span.parentNode.replaceChild(img, span);
//     }
// }

// function setCaretPosition(el, caretPos) {
//     el.value = el.value;
//     // ^ this is used to not only get "focus", but
//     // to make sure we don't have it everything -selected-
//     // (it causes an issue in chrome, and having it doesn't hurt any other browser)

//     if (el !== null) {

//         if (el.createTextRange) {
//             var range = el.createTextRange();
//             range.move('character', caretPos);
//             range.select();
//             return true;
//         }

//         else {
//             // (el.selectionStart === 0 added for Firefox bug)
//             if (el.selectionStart || el.selectionStart === 0) {
//                 el.focus();
//                 el.setSelectionRange(caretPos, caretPos);
//                 return true;
//             }

//             else  { // fail city, fortunately this never happens (as far as I've tested) :)
//                 el.focus();
//                 return false;
//             }
//         }
//     }
// }
// function getColsOrder(sql, cols){
//     var a1 = [];
//     var a2 = (/\bselect\b\s+([\S\s]+?)from/i.exec(sql) || [""])[1].split(/\s*,\s*/g);

//     a2.forEach(function(c){
//         var s = c.trim().split(' ');
//         a1.push(s[s.length-1]);
//     });


//     return a1;
// }
// getColsOrder("select top 10 a,b xx, c as yy from abc where a in ('a')", ['a','c', 'b']);



