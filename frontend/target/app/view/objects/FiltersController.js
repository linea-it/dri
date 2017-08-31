Ext.define('Target.view.objects.FiltersController', {
    extend: 'Ext.app.ViewController',

    requires: [

    ],

    alias: 'controller.filters',

    listen: {
        component: {
            'target-filters-window': {
                changecatalog: 'onChangeCatalog'
            }
        },
        store: {
            '#productContents': {
                load: 'onLoadContents'
            },
            '#filterConditions': {
                load: 'onLoadFilterConditions'
            }
        }
    },

    onChangeCatalog: function (currentCatalog) {
        var me = this,
            vm = me.getViewModel(),
            filters = vm.getStore('filters'),
            storeFilterSets = vm.getStore('filterSets'),
            contents = vm.getStore('contents');

        // clear filters conditions
        filters.loadData([]);

        me.clearInputs();

        //define o filtro para a lista de filtros, a combobox listará apenas os filtros do produto atual
        storeFilterSets.filter('product', currentCatalog.get('id'));

        contents.addFilter({
            property: 'pcn_product_id',
            value: currentCatalog.get('id')
        });

    },

    onLoadContents: function (contents) {
        // Ao carregar a store contents adicionar os atributos Rating e Reject
        var rating, reject;

        rating = Ext.create('Target.model.CatalogContent', {
            id: null,
            column_name: '_meta_rating',
            display_name: 'Rating'
        });
        contents.add(rating);

        /*reject_true = Ext.create('Target.model.CatalogContent', {
            id: null,
            column_name: '_meta_reject',
            display_name: 'Rejected'
        });
        contents.add(reject);*/
    },

    onLoadFilterConditions: function () {
        var me = this,
            vm = me.getViewModel(),
            refs = me.getReferences(),
            storefilters = vm.getStore('filters'),
            aFilters = [],
            filterRejectExists = false,
            filterRejectOption;

        storefilters.each(function(item){
            if (item.data.fcd_property_name=="_meta_reject"){
                filterRejectExists = true;
                filterRejectOption = item.data.fcd_value;
            }
            aFilters.push(item.data);
        });

        me.arrayFilterConditions = aFilters;

        //marqca o checkbox de rejeitado se for o caso
        refs.chkRejected.setExpanded(filterRejectExists);
        if (filterRejectExists){
            //marca o radio segundo a opção definida no filtro
            refs.chkRejected.query('radio').forEach(function(radio){
                if (radio.getReference()==('r'+filterRejectOption)){
                    radio.setValue(true);
                }
            });
        }
        
        me.viewRenderUIStatus();
    },

    onAddFilter: function () {
        var me = this,
            vm = me.getViewModel(),
            content = vm.get('content'),
            operator = vm.get('operator'),
            value = vm.get('value'),
            filterSet = vm.get('filterSet'),
            filters = vm.getStore('filters'),
            filter;

        if (!content) return;

        // Criar um Model com os dados do filtro
        filter = Ext.create('Target.model.FilterCondition', {
            fcd_property: content.get('id'),
            fcd_property_name: content.get('column_name'),
            fcd_operation: operator.get('name'),
            fcd_value: value,
            property_display_name: content.get('display_name'),
            operator_display_name: operator.get('display_name')
        });

        if ((filterSet) && (filterSet.get('id') > 0)) {
            filter.set('filterset', filterSet.get('id'));

        }

        filters.add(filter);

        me.clearInputs();

        me.viewRenderUIStatus();

    },

    onRemoveFilterClick: function (view, recIndex, cellIndex, item, e, record) {
        var me = this;

        Ext.MessageBox.confirm('',
            'The Filter will be removed. Do you want continue?',
            function (btn) {
                if (btn === 'yes') {
                    record.drop();
                    me.viewRenderUIStatus();
                }
            }, this);
    },

    viewRenderUIStatus: function () {
        //atualiza os botões da janela
        this.getView().renderUIStatus();
    },

    onSelectProperty: function (combo, property) {
        var me = this,
            vm = me.getViewModel(),
            filterSet = vm.get('filterSet'),
            filters = vm.getStore('filters'),
            filter;

        if (property.get('column_name') === '_meta_reject') {

            // Criar um Model com os dados do filtro
            filter = Ext.create('Target.model.FilterCondition', {
                fcd_property: property.get('id'),
                fcd_property_name: property.get('column_name'),
                fcd_operation: '=',
                fcd_value: true,
                property_display_name: property.get('display_name'),
                operator_display_name: 'is equal to'
            });

            if ((filterSet) && (filterSet.get('id') > 0)) {
                filter.set('filterset', filterSet.get('id'));

            }

            filters.add(filter);

            me.clearInputs();

            me.viewRenderUIStatus();
        }

    },

    onSelectOperator: function (combo, operator) {
        // TODO baseado no tipo de operador escolher um tipo de campo para entrada difente
    },

    onCancelFilter: function () {
        this.getView().close();
    },

    onSaveFilterSet: function(){
        this.saveFilterSet();
    },

    //insert/update o filterset atual
    saveFilterSet: function(fn){
        var me = this, fset,
            refs = me.getReferences(),
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            storeFilters = vm.getStore('filters'),
            storeFilterSets = vm.getStore('filterSets'),
            filterSet = vm.get('filterSet'),
            view = me.getView(),
            nameExists = false,
            isUpdate = (filterSet && filterSet.get('id')>0),
            filterName = refs.cmbName.getValue();

        fn = fn || function(){};

        if (filterName!==''){
            //checa se é o filtro tem nome igual a outro já existente
            storeFilterSets.each(function(item){
                if (item.data.fst_name==filterName && (!isUpdate || item.data.id!=filterSet.get('id')) ){
                    nameExists = true;
                }
            });
            if (nameExists){
                return Ext.MessageBox.alert('', 'This filter name already exists', function() {
                    fn();
                });
            }

            view.setLoading(true);

            //atualizar filterset
            if (isUpdate) {
                doSave(filterSet, true);
            }

            //novo filterset
            else{
                doSave(Ext.create('Target.model.FilterSet', {
                    product: currentCatalog.get('id'),
                    fst_name: filterName
                }));
            }
        }else{
            fn();
        }

        function doSave(fset, update){
            fset.set('fst_name', filterName);
            fset.save({
                callback: function (savedRating, operation, success) {
                    view.setLoading(false);
                    if (success) {
                        var obj = Ext.decode(operation.getResponse().responseText);

                        fset.set(obj);

                        if (!update){
                            vm.set('filterSet', fset);

                            // Cria os Filter condition para o filter set criado
                            storeFilters.each(function (filter) {
                                filter.set('filterset', fset.get('id'));
                            }, me);

                            storeFilterSets.add(obj);
                        }

                        //aplica o save somente se existir registro para atualizar ou remover, caso contrário não irá chamar callback
                        if (storeFilters.updating>0 || storeFilters.removed.length>0 || storeFilters.getNewRecords().length>0){
                            view.setLoading(true);
                            storeFilters.save({
                                callback: function () {
                                    view.setLoading(false);
                                    fn();
                                }
                            });
                        }else{
                            fn();
                        }

                    }else{
                        fn();
                    }
                }
            });
        }
    },

    updateFilterSet: function(fn){
        var filters = this.getViewModel().getStore('filters');

        filters.sync({
            callback: fn
        });
    },

    onDeleteFilterSet: function () {
        var me = this,
            refs = me.getReferences(),
            vm = me.getViewModel(),
            filters = vm.getStore('filters'),
            filterSet = vm.get('filterSet'),
            view = me.getView();

        Ext.MessageBox.confirm('', 'The Filter will be deleted. Do you want continue?', function (btn) {
            if (btn === 'yes') {
                doRemove();
            }
        }, this);

        function doRemove(){
            if ((filterSet) && (filterSet.get('id') > 0)) {
                filterSet.erase({
                    callback: function (record, operation, success) {
                        if (success) {
                            //limpa a combobox e a lista de condições do filtro
                            refs.cmbName.clearValue();
                            filters.loadData([]);

                            //limpa a checkbox
                            refs.chkRejected.setExpanded(false);

                            //atualiza a view
                            me.viewRenderUIStatus();

                            view.fireEvent('disapplyfilters', me);
                        }
                    }
                });
            }
        }
    },

    onApplyFilter: function () {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            refs = me.getReferences(),
            currentCatalog = vm.get('currentCatalog'),
            filterSet      = vm.get('filterSet'),
            filterSets     = vm.getStore('filterSets'),
            storeFilters   = vm.getStore('filters'),
            filterName     = refs.cmbName.getValue(),
            fset;

        //filtro sem nenhuma condição, retorna
        if (storeFilters.count() == 0) return;

        //filtro com nome definido
        if (filterName){ //filterSet && filterSet.get('fst_name')!='') {
            //ouve alteração no filtro, salva antes de aplicar
            if (me.filterConditionsIsChanged()) {

                //faz update das condicões e aplica o filtro
                me.saveFilterSet(function(){
                    //dá um tempo pro extjs se organizar, caso contrário gera erro
                    setTimeout(function(){me.applyFilters();},10);
                });
            }

            //não ouve alteração no filtro existente, apenas aplica
            else {
                me.applyFilters();
            }
        }

        //filtro local (não salvo)
        else {
            me.applyFilters();
        }
    },

    onCreateFilterset: function (fset, filters) {
        var me = this,
            view = me.getView();

        view.setLoading(true);

        //Cria os Filter condition para o filter set criado
        filters.each(function (filter) {
            filter.set('filterset', fset.get('id'));
        }, me);

        filters.sync({
            callback: function () {
                me.applyFilters();
                view.setLoading(false);
            }
        });

    },

    applyFilters: function () {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            storeFilters = me.getViewModel().getStore('filters'),
            modelFilterSet = vm.get('filterSet'),
            filter = {};

        if (storeFilters.count() > 0) {
            if (modelFilterSet){
                filter.id = modelFilterSet.get('id');
                filter.fst_name = modelFilterSet.get('fst_name');
                filter.modelFilterSet = modelFilterSet.get('product')>0 ? modelFilterSet : null;
            }else{
                filter.fst_name = 'Unsaved filter';
                filter.modelFilterSet = null;
            }

            filter.conditions = [];
            filter.storeFilters = storeFilters;

            storeFilters.getData().each(function(item){
                if (typeof(item.data.id)=='string') delete(item.data.id);
                filter.conditions.push(item.data);
            });

            view.fireEvent('applyfilters', filter);//filterset, storeFilters, me);
        }
        /* else {
            view.fireEvent('disapplyfilters', me);
        }*/

        view.close();
    },

    //retorna true se ocorreu alteração na lista de condições de um filtro já salvo
    filterConditionsIsChanged: function(){
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            refs = me.getReferences(),
            storeFilters = vm.getStore('filters'),
            filterSet = vm.get('filterSet'),
            filterName = refs.cmbName.getValue(),
            changed = false;

        if (!filterSet && filterName){
            return true;
        }

        if (filterSet && (filterName !== filterSet.get('fst_name'))){
            return true;
        }

        if (!me.arrayFilterConditions){
            return false;
        }

        if (storeFilters.count()!=me.arrayFilterConditions.length){
            return true;
        }

        storeFilters.each(function(item, index){
            var data = item.data;

            if (data.id != me.arrayFilterConditions[index].id){
                changed = true;
            }
        });

        return changed;
    },

    clearInputs: function () {
        var me = this,
            refs = me.getReferences(),
            property = refs.cmbProperty,
            operator = refs.cmbOperator,
            value = refs.txtValue;

        property.reset();
        operator.reset();
        value.reset();

    },

    /**
     * Ao selecionar um filterset na combobox, carrega os itens desse filtro
     * @param  {Target.model.FilterSet} filterset [description]
     */
    onFilterWindow_SelectFilterSet: function (combo, filterset) {
        var me = this,
            filterId     = filterset.get('id'),
            storeFilters = this.getViewModel().getStore('filters');

        this.arrayFilterConditions = null;

        // carrega os itens do filtro selecionado
        if (filterId > 0) {
            storeFilters.filter('filterset', filterId);
            storeFilters.load();
        }
    },

    onFilterWindow_ChangeFilterSetValue: function(combo, value){
        this.viewRenderUIStatus();
    },

    onFilterWindow_ClearFilterSet:  function () {
        var me = this,
            refs = me.getReferences(),
            vm = me.getViewModel(),
            filters = vm.getStore('filters'),
            filterSet = vm.get('filterSet'),
            view = me.getView();

            //limpa a combobox, a lista de condições do filtro e o checkbox reject
            refs.cmbName.clearValue();
            filters.loadData([]);

            me.viewRenderUIStatus();
    },

    onRemoveFilter: function(){
        var me = this,
            vm = me.getViewModel(),
            filterSet = vm.get('filterSet'),
            view = me.getView();

        //limpa a janela de filtro, se o filtro atual da combo for o mesmo atualmente aplicado
        if (filterSet && view.activeAppliedFilter && filterSet.id == view.activeAppliedFilter.id){
            me.onFilterWindow_ClearFilterSet();
        }

        view.activeAppliedFilter = null;
        view.fireEvent('disapplyfilters', this);

        me.viewRenderUIStatus();
    },

    onFilterWindow_CheckboxRejectedChange: function(fieldset){
        var me           = this,
            vm           = me.getViewModel(),
            storeFilters = vm.getStore('filters'),
            index;

        if (fieldset.collapsed){
            //remove a condição reject
            index = storeFilters.find('fcd_property_name', '_meta_reject');
            if (index>-1) storeFilters.removeAt(index);

            fieldset.query('radio').forEach(function(radio){
                radio.setValue(false);
            });
        }
    },

    onFilterWindow_RadioRejectedChange: function(radio){
         var me = this,
            view         = me.getView(),
            vm           = me.getViewModel(),
            filterSet    = vm.get('filterSet'),
            storeFilters = vm.getStore('filters'),
            rejectFilter, index;

        //adiciona a condição caso esteja marcado (checked)
        if (radio.getValue()){
            //remove a condição reject
            index = storeFilters.find('fcd_property_name', '_meta_reject');
            if (index>-1) storeFilters.removeAt(index);

            rejectFilter = Ext.create('Target.model.FilterCondition', {
                    fcd_property: NaN,
                    fcd_property_name: '_meta_reject',
                    fcd_operation: '=',
                    fcd_value: radio.getReference()=='rtrue' ? 'true' : 'false'
            });

            if ((filterSet) && (filterSet.get('id') > 0)) {
                rejectFilter.set('filterset', filterSet.get('id'));
            }
            storeFilters.add(rejectFilter);

            setTimeout(function(){
                me.viewRenderUIStatus();
            },10)
        }

    },

    onFilterWindow_ButtonCopyClick: function(){
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            refs = me.getReferences(),
            storeFilters = me.getViewModel().getStore('filters'),
            modelFilterSet = vm.get('filterSet'),
            conditions=[];

        if (storeFilters.count() > 0 && modelFilterSet) {
            //cria uma cópia dos dados das condições do filtro atual
            storeFilters.getData().each(function(item){
                delete(item.data.id);
                if (item.data.property_name=='_meta_rating' || item.data.property_name=='_meta_reject'){
                    item.data.fcd_property = NaN; //tem que enviar null, se colocar null envia zero
                }
                conditions.push(item.data);
            });

            //limpa o filtro atual
            me.onFilterWindow_ClearFilterSet();

            //define o nome da cópia
            refs.cmbName.setValue('Copy of '+modelFilterSet.get('fst_name'));

            //define as condições do filtro copiado
            storeFilters.setData(conditions);

            //setData não dispara onload, por isso chamo aqui
            me.onLoadFilterConditions();
        }
    }

});
