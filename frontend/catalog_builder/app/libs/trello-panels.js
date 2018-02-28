let activeCard;

class TrelloPanels {
    constructor(options = {}) {
        this._root = options.root || document.createElement('div');
        this._root.setAttribute('class', 'trello-root');
        this._root.onclick = (event) => {
            let panel, card;
            let el = event.target.closest('.trello-card');

            if (el) {
                panel = this._panels[el.getAttribute('panel-index')];
                card = panel.cards[el.getAttribute('card-index')];

                if (activeCard) {
                    activeCard.removeAttribute('trello-card-active')
                }

                activeCard = el;
                activeCard.setAttribute('trello-card-active', '')

                if (this.onCardActivate) {
                    this.onCardActivate(card, panel);
                }
            }
        }
    }

    renderTo(el) {
        if (el.setHtml){
            this._extEl = el;
        }else{
            el.appendChild(this._root);
        }

        return this;
    }

    setPanels(panels) {
        let html = '<table><tr>';

        this._panels = panels;

        panels.forEach((panel, panelIndex) => {
            // create panel
            html += `<td valign="top">
                        <div class="trello-panel">
                            <div class="trello-panel-header">${panel.label}</div>`;

            panel.cards.forEach((card, cardIndex) => {
                // create card
                html += `<div panel-index="${panelIndex}" card-index="${cardIndex}" class="trello-card">${card.label}</div>`;
            });

            html += `   </div>
                     </td>`;
        });

        html += '</tr></table>';
        
        if (this._extEl){
            this._extEl.setHtml(html);
        }else{
            this._root.innerHTML = html;
        }

        return this;
    }

}

window.__trellopanels__ = {
    click(event) {

    }
};

window.TrelloPanels = TrelloPanels;
// export default TrelloPanels;
