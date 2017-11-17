
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

    init: function(){
        var me = this;
        var refs = me.getReferences();
        var vm = me.getViewModel();
        
        this.status = {};
        vm.set('initialized', false);
        
        Api.parallel([
            // verifica se o usuário está autenticado
            Api.getUser(function(error, user){
                if (error) {
                    Api.doLogin();
                }
            }),

            // busca a lista de releases
            Api.getReleases(function(error, releases){
                var items = [];
                
                if (!error){
                    // releases.forEach(function(release){
                    //     items.push({
                    //         text: release.rls_display_name,
                    //         data: release,
                    //         handler: 'mnuItemRelease_onClick'
                    //     })
                    // });
                    
                    me.releasesList = releases;
                    //refs.cmbReleases.setData(items);

                    // me.pnlLeftToolDownMenu = Ext.create('Ext.menu.Menu', {
                    //     //plain: true, 
                    //     title: '<div style="width:100%;background:whitesmoke;text-align:center;padding:4px;font-weight:bold;">Select Release</div>',
                    //     items: items
                    // });
                    
                }
            })],

            // quanto todas as api's responderem
            function(){
                vm.set('initialized', true);
                //me.createEmptyQuery();
                refs.ctnArea.setStyle({opacity:1});
                removeSplash();
            }
        );

    },

    afterRender: function(){
        var refs = this.getReferences();

        refs.cmbReleases.setStore(Ext.create('Ext.data.Store', {
            fields: ['id', 'rls_display_name'],
            data : this.releasesList
        }));

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
                var data = ddSource.dragData
                var d = data.records[0].data;
                var textareafield = Ext.getCmp(this.el.id);
                var value = textareafield.getValue();

                //this.el = textarea .getValue()
                // data é o mesmo que ddSource.dragData
                //data.fromPosition [x,y]

                //arrasto de tabela
                if (d.tbl_name){
                    textareafield.setValue( value + ' ' + (d.tbl_schema ? d.tbl_schema+'.' : '') + d.tbl_name  );
                    //d.tbl_schema null or text
                }

                // arrasto de coluna
                if (d.pcn_column_name){
                    var p = refs[ d.is_mytable ? 'tvwMyTables' : 'tvwInputTables'].getRootNode().findChild('id', d.parentId, true);
                    var dt = p.getData();

                    textareafield.setValue( value + ' ' + (dt.tbl_schema ? dt.tbl_schema+'.' : '') + dt.tbl_name + '.' + d.pcn_column_name);
                }
            }
        });
    },

    cmbReleases_onSelect: function(sender, item){
        this.createEmptyQuery(item.data.id);
    },

    // mnuItemRelease_onClick: function(item){
    //     this.createEmptyQuery(item.config.data.id);
    // },

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
            
            Api.startJob({
                cache: false,
                params: data,
                request: function(){
                    me.setLoading(true, 'Starting job...');
                },
                response: function(error, result){
                    me.setLoading(false);
                    console.log(result);
                    // if (!error){
                    //     Ext.toast('Query data saved', null, 't');
                    //     query.changed = false;
                    //     me.updateActiveQuery(query);
                    // }
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

    // evento: ao clicar no botão delete
    btnDelete_onClick: function(){
        var me = this;
        var query = me.getActiveQuery();
        
        Ext.MessageBox.show({
            title: 'Cofirm Action',
            msg: 'Delete query "' + query.name + '"',
            buttons: Ext.Msg.YESNO,
            icon: Ext.MessageBox.WARNING,
            fn: function(button){
                if (button=='yes'){
                    doDelete()
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
                    }
                }
            });
        }
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
        var c, i;
        var me = this;
        var refs = me.getReferences();
        var length = refs.grdPreview.headerCt.items.length;
        
        // limpa a grid
        for (i=0; i<length; i++){
            c = refs.grdPreview.headerCt.getComponent(0);
            refs.grdPreview.headerCt.remove(c);
        }
        refs.grdPreview.getView().refresh();

        // executa o sql no servidor
        Api.preview({
            cache: false,
            params:{
                line_number: 0,
                sql_sentence: refs.sql_sentence.getValue()
            },
            request: function(){
                me.setLoading(true, 'Preview in progress...');
            },
            response: function(error, result){
                var f, i = 0;

                me.setLoading(false);

                if (!error){
                    // define as colunas da grid
                    for (f in result.results[0]){
                        refs.grdPreview.headerCt.insert(i++, Ext.create('Ext.grid.column.Column', {text:f, dataIndex:f}));
                    }

                    // define os dados da grid
                    refs.grdPreview.getStore().loadData(result.results)
                }
            }
        });

    },

    pnlLeftToolDown_onClick: function(e, el,o, tool) {
        if (this.pnlLeftToolDownMenu) {
            this.pnlLeftToolDownMenu.showBy(tool);
        }
    },

    // evento: ao expandir um nó das input tables
    tvwInputTables_onExpanded: function(node){
        if (node.isRoot() || node.childNodes.length>0){
            return;
        }
        
        Api.getFields({
            cache: true,
            params:{
                pcn_product_id: node.get('id')
            },
            request: function(){
                node.set('cls', 'x-grid-tree-loading');
            },
            response: function(error, fields){
                fields.forEach(function(item){
                    item.text = item.pcn_column_name;
                    item.leaf = true;
                });

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

    // evento: ao expandir o item accordion external catalog
    accExternalCatalog_onExpand: function(){
        var refs = this.getReferences();
        var el = refs.tvwExternalCatalog.getEl();
        var query = this.getActiveQuery();
        
        return console.warn('Remover return');

        Api.getTables({
            cache: true,
            params:{
                release_id: query.release,
                // pgr_group: 1 //targets
                // external_catalog: true
            },
            request: function(){
                el.mask("Loading tables...", 'x-mask-loading');               
            },
            response: function(error, tables){
                el.unmask();

                tables.forEach(function(item){
                    item.text = item.tbl_name;
                });
    
                // preenche a tree external catalogs com as tabelas
                refs.tvwExternalCatalog.setStore(Ext.create('Ext.data.TreeStore', {
                    root: {
                        children: tables
                    }
                }));
            }
        });
    },

    accMyQueries_onExpand: function(){
        this.loadMyQueries();
    },

    // evento: ao expandir o item accordion my tables
    accMyTables_onExpand: function(){
        var refs = this.getReferences();
        var el = refs.tvwMyTables.getEl();
        var query = this.getActiveQuery();
        
        Api.getMyTables({
            request: function(){
                el.mask("Loading tables...", 'x-mask-loading');               
            },
            response: function(error, tables){
                var tb, item, children = [], fields;

                el.unmask();

                for (tb in tables){
                    fields = [];
                    item = tables[tb];

                    item.forEach(function(f){
                        fields.push({
                            text: f,
                            table_name: tb,
                            pcn_column_name: f,
                            is_mytable: true,
                            leaf: true
                        })
                    });

                    children.push({
                        text: tb,
                        tbl_name: tb,
                        is_mytable: true,
                        children: fields
                    })
                }
                
                // preenche a tree external catalogs com as tabelas
                refs.tvwMyTables.setStore(Ext.create('Ext.data.TreeStore', {
                    root: {
                        children: children
                    }
                }));
            }
        });
    },

    pnlJobs_onExpand: function(){
        var refs = this.getReferences();
        var el = refs.tvwJobList.getEl();

        Api.getJobs({
            cache: false,
            request: function(){
                el.mask("Loading Jobs...", 'x-mask-loading');
            },
            response: function(error, jobs){
                var status = {
                    'st': 'fa-hourglass-3', // 'Starting',
                    'rn': 'fa-hourglass-3', // 'Running',
                    'ok': 'fa-check',       // 'Done'
                    'er': 'fa-frown-o'      // 'Error'
                };

                el.unmask();
                
                jobs.forEach(function(item){
                    item.text = item.table_name;
                    item.leaf = true;
                    item.iconCls = 'x-fa ' + status[item.job_status];
                });

                // preenche a tree external catalogs com as tabelas
                refs.tvwJobList.setStore(Ext.create('Ext.data.TreeStore', {
                    root: {
                        children: jobs
                    }
                }));
            }
        });
    },

    // evento: ao selecionar um job da lista do painel direito
    tvwJobList_onSelectionChange: function(tv, node){
        var refs = this.getReferences();
        var data = node.data;
        
        refs.ctnJobDetail.setHtml('<h3>JOB '+data.text+' Detail</h3>'+
                                  '<table>'+
                                  '<tr><td>Status: </td><td>'+data.job_status+'</td></tr>'+
                                  '<tr><td>Start: </td><td>'+data.start_date_time+'</td></tr>'+
                                  '<tr><td>End: </td><td>'+data.end_date_time+'</td></tr>'+                                
                                  '<tr><td>Table Name: </td><td>'+data.table_name+'</td></tr>'+
                                  '<tr><td>Owner: </td><td>'+data.owner+'</td></tr>'
                                );
    },

    // evento: ao ser modificado qualquer dado do formulário query
    form_onDataChange: function(field, newVal, oldVal) {
        var refs = this.getReferences();
        var vm = this.getViewModel();
        var query = this.getActiveQuery() || {};
        var data = refs.frmQuery.getForm().getValues();
        
        query.changed = true;
        
        vm.set('activeQuery.'+field.name, newVal);
        var sqlExist = Boolean(vm.get('activeQuery.sql_sentence'));

        refs.btnSave.setDisabled(!Boolean(data.description && data.name && data.sql_sentence) )
        refs.btnCheck.setDisabled( !sqlExist )
        refs.btnPreview.setDisabled( !sqlExist );
        //refs.btnStartJob.setDisabled( true ); //!sqlExist || query.changed || !query.exist);
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
                return Api.getTables({
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
                        next(tables);
                    }
                });
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
        ])

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

    getActiveQuery: function(){
        return this.getViewModel().get('activeQuery');
    },

    getActiveRelease: function(release){
        return this.getViewModel().get('activeRelease');
    },

    updateActiveQuery: function(query){
        var refs = this.getReferences();
        var vm = this.getViewModel();
        var q = this.getActiveQuery() || {};

        Object.assign(q, query);

        query.exist = query.id ? true : false;
        refs.frmQuery.getForm().setValues(query);
        vm.set('activeQuery', query);
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
                }
            }
        });
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

    loadMyQueries: function(){
        var me = this;
        var refs = this.getReferences();
        var query = this.getActiveQuery() || {};
        var el = refs.tvwMyQueries.getEl();
        
        // status carregando ou carregado, retorna
        if ('loading done'.includes(me.loadMyQueriesStatus)){
            return;
        }

        me.loadMyQueriesStatus = 'loading';

        // busca lista que queries
        Api.getQueries({
            cache: false,
            request: function(){
                el.mask("Loading queries...", 'x-mask-loading'); 
            },
            response: function(error, result){
                me.loadMyQueriesStatus = error ? 'error' : 'done';
                el.unmask();
                
                if (!error){
                    result.forEach(function(item){
                        item.text = item.name;
                        item.leaf = true;
                    });
                    
                    refs.tvwMyQueries.setStore(Ext.create('Ext.data.TreeStore', {
                        root: {
                            expanded: true,
                            children: [
                                {text: 'My Queries', expanded: true, isgroup:true, children:result},
                                {text: 'Samples', expanded: true, isgroup:true, children:[]}
                            ]
                        }
                    }));                    
                }
            }
        });
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
    }
});

function clone(obj){
    try{
        return JSON.parse(JSON.stringify(obj));
    }catch(e){
        return null;
    }
}

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