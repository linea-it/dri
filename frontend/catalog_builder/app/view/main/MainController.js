var myQueryNumber = 1;

var main = Ext.define('CatalogBuilder.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',
    activeQuery: {},
    activeRelease: {},

    init(){
        let vm = this.getViewModel();

        vm.set('properties_title', 'Properties Inspector');
        
        this.operations = {};
        this.activeProperties = {};
        this.definedProperties = {};
    },

    treeView_onSelectionChange(event, selected){
        let vm = this.getViewModel();
        let properties = [];
        let values = {};
        let name;

        if (selected && selected[0] && selected[0].data){
            name = selected[0].data.text;
            
            vm.set('initialized', true);
            vm.set('properties_title', `${selected[0].data.text} - Properties`);

            properties = selected[0].data.properties || [];
            
            this.activeProperties = {};

            // adiciona 
            if (!this.operations[selected[0].id]){
                this.operations[selected[0].id] = {
                    name: name,
                    label: name,
                    properties: properties
                };
            }

            properties.forEach(property=>{
                // define o valor inicial da propriedade
                if (!property._initialValueIsDefined){
                    property._initialValueIsDefined = true;
                    property._initialValue = property.value;
                }

                // guarda o id do model da treeview
                property.modelId = selected[0].id;
                
                this.operations[property.modelId].model = selected[0];
                this.activeProperties[property.name] = property;
            });
        }

        this.inspectProperties(properties);
    },

    form_onDataChange(field, newVal, oldVal){
        let refs = this.getReferences();
        let grid = refs.grdOperations;
        let fieldName = field.name;
        let errors = field.getErrors();
        let data = [];

        let operationIsDefault = true;
        let property = this.activeProperties[fieldName];
        let operation = this.operations[property.modelId];
        let properties = operation.properties;

        // console.log(operation);
        // console.log(properties);
        // console.log(property);

        property.value = (errors == 0 ? newVal : property._initialValue);

        // verifica se os dados default da operação foram alterados
        properties.forEach(prop=>{
            if (prop._initialValue != prop.value){
                operationIsDefault = false;
            }
        });

        // destaca a operação caso tenha sido alterada      
        operation.model.set('text', operationIsDefault ? operation.label : `<b>${operation.label}</b>`);

        // destaca o grupo caso tenha alguma operação alterada


        // if (valueObj.initialValue != newVal && errors == 0){
        //     this.definedProperties[this.activeProperties.operation] = {
        //         group: 'AAA',
        //         operation: this.activeProperties.operation
        //     };
        // } else {
        //     delete(this.definedProperties[this.activeProperties.operation]);
        // }

        // // marca na treeview e nos títulos de grupo os que foram selecionados


        // // preenche a grid com as operações modificadas
        // Object.keys(this.definedProperties).forEach(k=>{
        //     let r = this.definedProperties[k];
        //     data.push({
        //         group: r.group,
        //         operation: r.operation
        //     });
        // });
        // grid.getStore().loadData(data);
    },

    getProperties(){
        let refs = this.getReferences();
        let data = refs.frmProperties.getForm().getValues();

        return data;
    },

    inspectProperties(properties){
        let refs = this.getReferences();

        refs.frmProperties.removeAll();

        properties.forEach(item=>{
            let store; 

            Object.assign(item, {
                // width: '100%',
                labelWrap: false,
                fieldLabel: item.fieldLabel || item.name
            });

            switch (item.xtype) {
                case 'combobox':
                    item.data.forEach((value, index) => {
                        item.data[index] = typeof(value) == 'string' ? {value:value, label:value} : value;
                    });

                    store = Ext.create('Ext.data.Store', {
                        fields: ['value', 'label'],
                        data : item.data
                    });
                    
                    Object.assign(item, {
                        fieldLabel: item.fieldLabel,
                        store: store,
                        queryMode: 'local',
                        displayField: 'label', //campo que vai mostar
                        valueField: 'value'
                    });
                    break;
            
                default:
                    break;
            }

            refs.frmProperties.add(item);
        });

    }
});
