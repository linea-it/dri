
Ext.require('UserQuery.view.service.Api');
//Ext.require('UserQuery.store.QueryStore');
Ext.require('UserQuery.view.dialog.NewDialog');
Ext.require('UserQuery.view.dialog.OpenDialog');
Ext.require('UserQuery.view.dialog.StartJobDialog');
Ext.require('UserQuery.view.dialog.SaveAsDialog');

var myQueryNumber = 1;

Ext.define('UserQuery.view.main.MainController', {
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

        Api.parallel([
            // verifica se o usuário está autenticado
            Api.getUser(function(error, user){
                if (error) Api.doLogin();
            }),

            // busca a lista de releases
            Api.getReleases(function(error, releases){
                if (!error){
                    refs.cmbReleases.setStore(Ext.create('Ext.data.Store', {
                        fields: ['id', 'rls_display_name'],
                        data : releases
                    }));
                }
            })],

            // quanto todas as api's responderem, remove o splash screen e exibe a aplicação
            function(){
                vm.set('initialized', true);
                //me.createEmptyQuery();
                refs.ctnArea.setStyle({opacity:1});
                removeSplash();
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

    accExternalCatalog_onExpand: function(){
        // this.loadExternalTables();
    },

    accMyQueries_onExpand: function(){
        this.loadMyQueries();
    },

    accOtherTables_onExpand: function(){
        this.loadOtherTables();
    },

    accSampleQueries_onExpand: function(){
        this.loadSampleQueries();
    },

    // evento: ao expandir o item accordion my tables
    accMyTables_onExpand: function(){
        this.loadMyTables();
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
        var refs = this.getReferences();

        this.clearQuery();
        this.getViewModel().set('activeQuery', null);
        
        refs.tvwMyQueries.getSelectionModel().deselectAll();
        refs.tvwInputTables.setRootNode(null);
    },
    
    // evento: ao clicar no botão start job
    btnStartJob_onClick: function(button){
        var me = this;
        var refs = me.getReferences();
        var dialog = new StartJobDialog({animateTarget : button.getEl()});
        var query = me.getActiveQuery();
        var formData = refs.frmQuery.getForm().getValues();

        dialog.open(formData, function(data){
            data.id = query.id;

            //data.associate_target_viewer = data.associate_target_viewer==='on';
            
            Api.startJob({
                cache: false,
                params: data,
                //errorMessage: false,
                request: function(){
                    me.setLoading(true, 'Starting job...');
                },
                response: function(error, result){
                    me.setLoading(false);

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
    btnSave_onClick: function(){
        var refs = this.getReferences();
        var query = this.getActiveQuery();
        var data = refs.frmQuery.getForm().getValues();
        
        this.saveQuery(query.id, data);
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
                        Ext.toast('Query validate success', null, 't');
                    }else{
                        Ext.MessageBox.show({
                            title: 'Query validate error',
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
        this.createEmptyQuery(item.data.id);
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
        //r
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        efs.btnStartJob.setDisabled( true ); //!sqlExist || query.changed || !query.exist);
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

    treeView_onContextMenu: function(tree, record, item, index, e, eOpts ) {
        var position, menu;
        var items = tree.panel.config.contextMenuItems || [];

        if (record.get('ignore_context_menu')){
            return;
        }

        items.forEach(function(item){
            if ( typeof(item.config)=='function' ){
                item.config(item, record);
            }
            item.record = record;
        });

        menu = new Ext.menu.Menu({items: items});
        position = [e.getX()-10, e.getY()-10];

        e.stopEvent();

        menu.showAt(position);
    },

    tvwMyTables_onContextMenuClick: function(item){
        var me = this;
        var config = item.config;
        var table = item.record.get('data_table');

        switch(config.itemId){
            case 'rename':
                Ext.MessageBox.prompt('Rename', 'Name:', function(button, value){
                    if (value != table && value){
                        alert('TODO: update table name (API)');
                    }
                });
                break;

            case 'preview':  
                this.sqlPreview( 'select * from ' + table, 'grdTable' );
                break;

            case 'delete':
                Ext.MessageBox.show({
                    title: 'Cofirm Action',
                    msg: 'Drop table "' + item.record.get('text') + '"?',
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.MessageBox.WARNING,
                    fn: function(button){
                        if (button=='yes'){
                            me.dropTable(item.record.get('data_id'), function(){
                                //remove o item da treeview
                                //config.record.parentNode.removeChild(config.record)
                            });
                        }
                    }
                });
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
                this.sqlPreview( 'select * from ' + table, 'grdTable' );
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
                this.sqlPreview( 'select * from ' + table, 'grdTable' );
                break;
        }
    },

    tvwOtherTables_onContextMenuClick: function(item){
        var me = this;
        var config = item.config;
        var table = item.record.get('data_table');

        switch(config.itemId){
            case 'preview':  
                this.sqlPreview( 'select * from ' + table, 'grdTable' );
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

    tvwMyQueries_onSelect: function(sender, node){
        if (!node.data.isgroup){
            this.setActiveQuery( clone(node.data) );
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
            title: 'Cofirm Action',
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

    dropTable: function(table_id){
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
                    me.loadMyQueries(true);
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

    loadInputTables: function(release_id, next){
        var me = this;

        return Api.getTables({
            cache: true,
            params:{
                release: release_id,
                group: 'objects_catalog', // 'targets'
            },
            request: function(){
                me.setLoading(true, 'Load release tables...');                
            },
            response: function(error, tables){
                me.setLoading(false);

                if (!error){
                    tables.forEach(function(item){
                        item.text = item.prd_display_name;
                        item.data_schema = item.tbl_schema;
                        item.data_table = item.tbl_name;
                    });
                }

                next(tables || []);
            }
        });
    
    },

    loadExternalTables: function(release_id){
        var refs = this.getReferences();
        var el = refs.tvwMyTables.getEl();

        return Api.getTables({
            cache: true,
            params:{
                release: release_id,
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
                        item.text = item.prd_display_name;
                        item.data_schema = item.tbl_schema;
                        item.data_table = item.tbl_name;
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
        var refs = this.getReferences();
        var el = refs.tvwMyTables.getEl();
        var query = this.getActiveQuery();
        var t;
        
        Api.getMyTables({
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
                        text: table.display_name,
                        data_id: table.id,
                        data_schema: table.schema,
                        data_table: table.table_name,
                        data_product_id: table.product_id
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
                        item.text = item.name;
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

    loadMyJobs: function(){
        var me = this;
        var refs = me.getReferences();
        var el = refs.grdJobs.getEl();

        clearTimeout(me.tm);

        Api.getJobs({
            cache: false,
            request: function(){
                el.mask("Loading Jobs...", 'x-mask-loading');
            },
            response: function(error, jobs){
                var colsMap = [
                    // {field:'job_status', display:'Status'},
                    {field:'start_date_time', display:'Start'},
                    {field:'end_date_time', display: 'End'},
                    {field:'total_run_time', display: 'Run Time'},
                    {field:'timeout', display:'Timeout'},
                    {field:'display_name', display:'Table Name'},
                    {field:'sql_sentence', display:'Query'},
                ];
                var status = {
                    'st': 'row-grey', // 'fa-hourglass-3', // 'Starting',
                    'rn': 'row-yellow', // 'fa-hourglass-3', // 'Running',
                    'ok': 'row-green', // 'fa-check',       // 'Done'
                    'er': 'row-red' // 'fa-frown-o'      // 'Error'
                };

                jobs.forEach(function(job){
                    var d1 = new Date(job.end_date_time);
                    var d2 = new Date(job.start_date_time);
                    var duration = d1.getTime() - d2.getTime();
                    var seconds = parseInt((duration/1000)%60);
                    var minutes = parseInt((duration/(1000*60))%60);
                    var hours = parseInt((duration/(1000*60*60))%24);

                    job.row_cls = status[job.job_status];
                    job.total_run_time = job.end_date_time ? (hours>9 ? hours : '0'+hours) + ':' + (minutes>9 ? minutes : '0'+minutes) + ':' + (seconds>9 ? seconds : '0'+seconds) : '';
                    job.end_date_time  = job.end_date_time || '';
                    job.start_date_time = job.start_date_time.substr(0,10) + ' ' + job.start_date_time.substr(11,11);
                    job.end_date_time = job.end_date_time.substr(0,10) + ' ' + job.end_date_time.substr(11,11);
                });

                el.unmask();

                // TODO: notificar usuário sobre alteração no status do job
                // if (me.pendingJobs){
                //     me.pendingJobs.forEach(function(job){
                //         var j = jobs.find(function(jj){ return jj.id==job.id});
                //         if (j && j.job_status != job.job_status){
                //             Ext.toast('Job status changed', null, 't');
                //         }
                //     });
                // }                
                me.pendingJobs = jobs.filter(function(j){return j.job_status=='rn';});
                me.showDataPreview('grdJobs', jobs, colsMap);

                // se tem job pendente, atualizaa lista a cada 30 segundos
                if (me.pendingJobs.length>0){
                    me.tm = setTimeout(function(){
                        me.loadMyJobs();
                    }, 30000);
                }
            }
        });
    },

    loadOtherTables: function(force){
        var targets, catalogs;
        var me = this;
        var refs = this.getReferences();
        var query = this.getActiveQuery() || {};
        var release = this.getActiveRelease() || {};
        var el = refs.tvwOtherTables.getEl();
        var err = 0;
        
        // status carregando ou carregado, retorna
        if ( force!==true && 'loading done'.includes(me.loadOtherStatus)){
            return;
        }

        me.loadOtherStatus = 'loading';

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
                            item.text = item.prd_display_name;
                            item.data_schema = item.tbl_schema;
                            item.data_table = item.tbl_name;
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
                        });    
                    }

                    catalogs = result || [];
                }
            })],

            //api's acima finalizadas
            function(){
                el.unmask();

                me.loadOtherStatus = err>0 ? 'error' : 'done';
                    
                refs.tvwOtherTables.setStore(Ext.create('Ext.data.TreeStore', {
                    root: {
                        expanded: false,
                        children: [
                            {text: 'Targets', expanded: false, isgroup:true, ignore_context_menu:true, children:targets},
                            {text: 'Value_Added_Catalogs', expanded: false, isgroup:true, ignore_context_menu:true, children:catalogs}
                        ]
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

    saveQuery: function(id, data){
        var me = this;
        var release = me.getActiveRelease();
        
        data.id = id;
        data.release = release.id;

        // TODO: no banco de dados não deve ser obrigatório esse campo
        data.table_name = data.name.toLowerCase().replace(/\ /g, '');

        Api.save({
            cache: false,
            params: data,
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

    showDataPreview: function(gridName, results, cols){
        var c, i, d, f;
        var datatype = {};
        var me = this;
        var index = {'grdTable':0, 'grdPreview':1};
        var refs = me.getReferences();
        var grid = refs[gridName];
        var length = grid.headerCt.items.length;

        // limpa a grid
        for (i=0; i<length; i++){
            c = grid.headerCt.getComponent(0);
            grid.headerCt.remove(c);
        }
        grid.getView().refresh();

        // formata os campos data/hora
        // if (results.length>0){
        //     for (i in results[0]){
        //         d = new Date(results[0][i])
        //         if ( !isNaN(d.getFullYear()) && d.getFullYear()>2000 && typeof(results[0][i])=='string'){
        //             datatype[i] = 'date';
        //         }
        //     }

        //     results.forEach(function(row){
        //         for (i in row){
        //             if (datatype[i] == 'date'){
        //                 d = new Date(row[i])
        //                 row[i] = row[i].substr(0,10) + ' ' +
        //                          d.getHours() + ':' +
        //                          d.getMinutes() + ':' +
        //                          d.getSeconds() + ':' +
        //                          d.getMilliseconds()   // HH:MM:SS:DD
        //             }
        //         }   
        //     })
        // }

        // define as colunas da grid
        if (cols){
            for (c in cols){
                for (f in results[0])
                    if (f != cols[c].field) continue;
                    
                grid.headerCt.insert(i++, Ext.create('Ext.grid.column.Column', {
                    text: cols[c].display, 
                    dataIndex: cols[c].field
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
        if ( index[gridName] != undefined ){
            refs.tabBottom.setActiveItem( index[gridName] );
        }

        // define os dados da grid
        grid.getStore().loadData(results);
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
        var activeRelease;
        
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
                        activeRelease = release;
                        me.setLoading(false);
                        next(release);
                    }
                });
            },

            // busca lista de tabelas da release
            function(next, release){
                me.loadExternalTables(release.id);
                return me.loadInputTables(release.id, next);
            },

            // preenche a treeview com a lista de tabelas da release, limpa o form
            function(next, tables){
                refs.ctnArea.setStyle({opacity:1});
                
                me.clearQuery();
                me.setActiveRelease(activeRelease);
                me.updateActiveQuery(query);
                
                // preenche a tree com as tabelas da release
                tables.forEach(function(item){
                    item.text = item.prd_display_name;
                });
                refs.tvwInputTables.setStore(Ext.create('Ext.data.TreeStore', {
                    root: { // expanded: true,
                        children: tables
                    }
                }));
            }
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