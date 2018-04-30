// inputs
var parentPort = op.inObject('link');
var labelPort = op.inValueString('Text', 'Group');
var defaultMinimizedPort = op.inValueBool('Default Minimized');

// outputs
var nextPort = op.outObject('next');
var childrenPort = op.outObject('childs');

// vars
var el = document.createElement('div');
el.classList.add('sidebar__group');
onDefaultMinimizedPortChanged();
var header = document.createElement('div');
header.classList.add('sidebar__group-header');
el.appendChild(header);
header.addEventListener('click', onClick);
var headerTitle = document.createElement('div');
headerTitle.classList.add('sidebar__group-header-title');
headerTitle.textContent = labelPort.get();
header.appendChild(headerTitle);
var icon = document.createElement('span');
icon.classList.add('sidebar__group-header-icon');
icon.classList.add('icon-chevron-up');
headerTitle.appendChild(icon);
var groupItems = document.createElement('div');
groupItems.classList.add('sidebar__group-items');
el.appendChild(groupItems);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultMinimizedPort.onChange = onDefaultMinimizedPortChanged;
op.onDelete = onDelete;

// functions

function onDefaultMinimizedPortChanged() {
    if(defaultMinimizedPort.get()) {
        el.classList.add('sidebar__group--closed');    
    } else {
        el.classList.remove('sidebar__group--closed');    
    }
}

function onClick(ev) {
    console.log('group header clicked');
    ev.stopPropagation();
    el.classList.toggle('sidebar__group--closed');  
}

function onLabelTextChanged() {
    var labelText = labelPort.get();
    headerTitle.textContent = labelText;
    if(CABLES.UI) {
        op.setTitle('Group: ' + labelText);    
    }
}

function onParentChanged() {
    var parent = parentPort.get();
    if(parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        childrenPort.set(null);
        childrenPort.set({
            parentElement: groupItems,
            parentOp: op,
        });
        nextPort.set(parent);
    } else { // detach
        if(el.parentElement) {
            el.parentElement.removeChild(el);    
        }
    }
}

function showElement(el) {
    if(el) {
        el.style.display = 'block';
    }
}

function hideElement(el) {
    if(el) {
        el.style.display = 'none';
    }
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if(el && el.parentNode && parentNode.removeChild) {
        el.parentNode.removeChild(el);    
    }
}
