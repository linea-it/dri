Ext.define('codemirror.Codemirror', {
    extend: 'Ext.form.field.TextArea',

    requires: [
        'codemirror.CodemirrorController'
    ],

    xtype: 'codemirror',
    controller: 'codemirror',
    
    codemirrorLib: null,

    config: {
    },

    initComponent: function () {
        var me = this;

        if (!window.CodeMirror) {
            return console.error('Codemirror not loaded, use app.json to import');
        }

        me.callParent(arguments);
    },

    afterRender() {
        var me = this;
        var textarea = me.inputEl.dom;
        var container = textarea.parentNode;
        var oldVal = '';

        container.classList.add('codemirror-container');

        me.cmInstance = window.CodeMirror.fromTextArea(textarea, {
            mode: "text/x-sql",
            lineNumbers: true
        });

        me.cmInstance.on('change', function(cm){
            var newValue = cm.getValue();

            me.fireEvent('change', me, newValue, oldVal);
            
            oldVal = newValue;
        });
        
        me.cmInstance.setSize(null, 100);
    },

    onResize: function () {
        var me = this;
        var container = me.inputEl.dom.parentNode;

        me.callParent(arguments);

        me.cmInstance.setSize(10, 10);
        setTimeout(function(){
            me.cmInstance.setSize(container.offsetWidth, container.offsetHeight);
        },10);

    },

    setValue(value){
        var me = this;

        me.cmInstance.setValue(value);
        
        me.callParent(arguments);
    },
    
    getValue(){
        var me = this;

        if (me.cmInstance){
            me.callParent(arguments);
            return me.cmInstance.getValue();
        }else{
            return me.callParent(arguments);
        }
    }
});
