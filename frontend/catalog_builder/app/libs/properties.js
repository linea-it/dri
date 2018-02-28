let TABLE_INDEX = 0;


class Properties {
    constructor(options = {}) {
        this._root = options.root || document.createElement('div');
        this._root.setAttribute('id', `properties-${(TABLE_INDEX++)}`);
    }

    renderTo(el) {
        if (el.setHtml){
            this._extEl = el;
        }else{
            el.appendChild(this._root);
        }

        return this;
    }

    /**
     * 
     * @param {Array} properties 
     */
    inspect(properties = [], title = null) {
        let html = '<table cellspacing="0" class="properties-table">';
        let tableId = this._root.getAttribute('id');
        let oneCol = properties.length == 1 && properties[0].label === null ? true : false;

        //this._root.innerHTML = '';
        this._root._properties = properties;

        if (title){
            html += `<tr><td ${oneCol ? '' : 'colspan="2"'} class="properties-title">${title}</td></tr>`;
        }

        properties.forEach((property, index) => {
            html += `<tr property-index="${index}">`;
            html += (oneCol ? '' : `<td class="property-label">${property.label || property.name || ''}</td>`);
            html += `<td class="property-value" property-name="${property.name}">${this.createCellProperty(property, index, tableId)}</td>`;
            html += `</td>`;
        });

        html += '</table>';

        if (this._extEl){
            this._extEl.setHtml(html);
        }else{
            this._root.innerHTML = html;
        }

        return this;
    }

    createCellProperty(property, rowIndex, tableId) {
        let list;
        let html = '';


        property.type = property.type || 'string'
        property.validate = property.validate || {}


        switch (property.type) {
            case 'number':
                html = `<input oninput="__properties__.validate('${tableId}', this.value, ${rowIndex}, this, '${property.type}')" type="number" value="${property.default || ''}" maxlength="${property.validate.max || ''}"/>`;
                break;


            case 'string':
                html = `<input oninput="__properties__.validate('${tableId}', this.value, ${rowIndex}, this, '${property.type}')" type="text" value="${property.default || ''}" maxlength="${property.validate.max || ''}"/>`;
                break;

            case 'range':
                // html = `<input oninput="__properties__.validate('${tableId}', this.value, ${rowIndex}, this, '${property.type}')" type="number" value="${property.default || ''}" maxlength="${property.validate.max || ''}"/>`;
                break;


            case 'select':
                list = '';
                (property.values || []).forEach(item => {
                    let v, l;


                    if (typeof (item) == 'string') {
                        v = l = item;
                    } else {
                        v = item.value;
                        l = item.label;
                    }


                    list += `<option ${v == property.default ? 'selected' : ''} value="${v}">${l}</option>`;
                });
                html = `<select>${list}</select>`;
                break;


            case 'boolean':
                html = `<input type="checkbox" ${property.default ? 'checked' : ''}/>`;
                break;


            case 'multiselect':
                list = '';
                (property.values || []).forEach(item => {
                    let v, l
                    let s = false;


                    if (typeof (item) == 'string') {
                        v = l = item;
                    } else {
                        v = item.value;
                        l = item.label;
                        s = item.selected;
                    }


                    list += `<div><input type="checkbox" ${s ? 'checked' : ''} value="${v}"> ${l}</div>`;
                });
                html = `<div>${list}</select>`;
                break;
        }


        return html;
    }
}


const VALIDATES = {
    required(value) {
        return true;
    },
    allowBlank(value) {
        return !(value == '' || value == undefined || value == null)
    },
    min(value, min, type) {
        return (type == 'string' ? value.length >= min : value >= min);
    },
    max(value, max, type) {
        return (type == 'string' ? value.length <= max : value <= max);
    }
}

window.__properties__ = {
    validate(tableId, value, rowIndex) {
        let n;
        let table = document.getElementById(tableId);
        let property = table ? table._properties[rowIndex] : null;
        let validate = property ? property.validate : null;


        table.rows[rowIndex].removeAttribute('invalidate');


        if (validate) {
            for (n in validate) {
                let fn = VALIDATES[n];


                if (fn) {
                    if (!fn(value, validate[n], property.type)) {
                        return table.rows[rowIndex].setAttribute('invalidate', '');
                    }
                }
            }
        }
    }
};

window.Properties = Properties;
//export default Properties