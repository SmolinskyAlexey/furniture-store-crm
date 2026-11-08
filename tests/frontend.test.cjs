// Offline behavioral regressions; no network, database or browser session required.
// Run: node --test tests/frontend.test.cjs
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const tick = () => new Promise(resolve => setImmediate(resolve));

class Element {
    constructor() {
        this.nodes = new Map(); this.events = new Map(); this.attributes = {};
        this.style = {}; this.value = ''; this.innerHTML = ''; this.dataset = {}; this.children = [];
        const names = new Set();
        this.classList = {add:x=>names.add(x),remove:x=>names.delete(x),contains:x=>names.has(x),
            toggle:(x,on)=>on===undefined ? (names.has(x)?names.delete(x):names.add(x)) : on?names.add(x):names.delete(x)};
    }
    querySelector(selector) { return this.nodes.get(selector) || null; }
    querySelectorAll(selector) { return this.nodes.has(selector) ? [this.nodes.get(selector)] : []; }
    setAttribute(name,value) { this.attributes[name]=value; }
    appendChild(element) { this.nodes.set('.'+element.className,element); this.children.push(element); }
    focus() { this.focused=true; }
    addEventListener(type,fn,options={}) {
        if(!this.events.has(type)) this.events.set(type,new Set());
        this.events.get(type).add(fn);
        options.signal?.addEventListener('abort',()=>this.events.get(type).delete(fn),{once:true});
    }
    async fire(type,extra={}) {
        const event={type,target:this,preventDefault(){this.defaultPrevented=true;},...extra};
        await Promise.all([...this.events.get(type)||[]].map(fn=>fn(event)));
        await tick();
    }
}

function environment({missingPage=false,missingSearch=false}={}) {
    const page = new Element(), search = new Element(), pagination = new Element();
    for(const selector of ['.prev-arrow','.next-arrow','.page-indicator']) pagination.nodes.set(selector,new Element());
    for(const selector of ['.search-input','.clear-btn','.search-btn']) search.nodes.set(selector,new Element());
    for(const selector of ['.default-table tbody','.orders-table tbody','.total-count']) page.nodes.set(selector,new Element());
    page.nodes.set('.table-pagination',pagination);
    const controls=new Map();
    const document={
        body:new Element(),
        getElementById:id=>['loadingSpinner','modalBody'].includes(id)?null:missingPage?null:page,
        querySelector:selector=>{
            if(selector==='.search-bar') return missingSearch?null:search;
            if(!controls.has(selector)) controls.set(selector,new Element());
            return controls.get(selector);
        },
        querySelectorAll:()=>[],
        createElement:()=>new Element(),
    };
    const errors=[], calls=[];
    const context=vm.createContext({document,FormData,URLSearchParams,AbortController,
        MutationObserver:class {observe(){} disconnect(){}},
        console:{error:(...args)=>errors.push(args),log(){},warn(){}},
        showNotification:(...args)=>errors.push(args),
        fetch:async (url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({list:[],total_num:25})};}});
    context.window=context;
    const load=file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
    for(const file of ['core/Frontend.js','core/Api.js','core/ListPage.js','queries.js']) load('assets/js/'+file);
    return {context,load,page,search,pagination,controls,errors,calls};
}

// Explicit public contracts used by existing PHP and global event handlers.
const pages=[
    ['CategoriesWizard','Categories','getCategories','currentCategoriesPage'],
    ['ClientsWizard','Clients','getClients','currentClientsPage'],
    ['ContractorsWizard','Contractors','getContractors','currentContractorsPage'],
    ['InvoicesWizard','Invoices','getInvoices','currentInvoicesPage'],
    ['OrdersWizard','Orders','searchOrdersQuery','currentOrdersPage'],
    ['OverheadExpenses','OverheadExpenses','getOverheadExpenses','currentOverheadExpensesPage'],
    ['RefundsWizard','Refunds','searchRefundsQuery','currentRefundsPage'],
    ['ServicesWizard','Services','getServices','currentServicesPage'],
    ['ShiftsWizard','Shifts','searchShiftsQuery','currentShiftsPage'],
    ['StockTransfersWizard','StockTransfers','getStockTransfers','currentStockTransfersPage'],
    ['SupplierRequestsWizard','SupplierRequests','getSupplierRequests','currentSupplierRequestsPage'],
    ['SuppliersWizard','Suppliers','getSuppliers','currentSuppliersPage'],
    ['WriteOffsWizard','WriteOffs','getWriteOffs','currentWriteOffsPage'],
    ['CatalogWizard','Catalog','searchProductsQuery','currentProductsPage'],
];

for(const [name,entity,query,pageKey] of pages) {
    test(`${name}: search, clear, Enter and pagination share the same state`,async()=>{
        const env=environment(), {context:c,load,search,pagination,calls}=env;
        load('assets/js/'+entity+'Templates.js');
        load('assets/js/'+entity+'Wizard.js');
        const controller=new c[name](); await controller.ready;
        assert.equal(calls.length,1,'one initial query');
        assert.equal(controller[pageKey],1);
        assert.match(pagination.querySelector('.page-indicator').innerHTML,/1.*3/);
        // Re-rendering pagination must not install duplicate listeners.
        controller.updatePagination(); controller.updatePagination();
        await pagination.querySelector('.next-arrow').fire('click');
        assert.equal(calls.length,2);
        assert.equal(controller[pageKey],2);
        assert.equal(calls.at(-1).options.body.get('offset'),'10');
        await pagination.querySelector('.prev-arrow').fire('click');
        assert.equal(controller[pageKey],1);
        const input=search.querySelector('.search-input');
        input.value='needle';
        controller[pageKey]=3;
        await search.querySelector('.search-btn').fire('click');
        assert.equal(controller[pageKey],1,'search resets the page');
        assert.equal(calls.at(-1).options.body.get('search'),'needle');
        assert.equal(calls.at(-1).options.body.get('offset'),'0');
        const count=calls.length;
        controller.attachSearchListeners(); controller.attachSearchListeners();
        input.value='second'; await input.fire('keydown',{key:'Enter'});
        assert.equal(calls.length,count+1,'one query per Enter');
        assert.equal(calls.at(-1).options.body.get('search'),'second');
        await search.querySelector('.clear-btn').fire('click');
        assert.equal(input.value,'');
        assert.equal(controller[pageKey],1);
        assert.equal(calls.at(-1).options.body.get('search'),null);
        assert.equal(env.errors.length,0);
    });

    test(`${name}: absent page does not request data`,async()=>{
        const env=environment({missingPage:true});
        env.load('assets/js/'+entity+'Wizard.js');
        const controller=new env.context[name](); await controller.ready;
        assert.equal(env.calls.length,0);
    });
}

test('a late response cannot overwrite the most recent list, including zero results',async()=>{
    const env=environment();
    env.load('assets/js/ServicesTemplates.js');env.load('assets/js/ServicesWizard.js');
    const controller=new env.context.ServicesWizard();await controller.ready;
    const pending=[];
    env.context.fetch=()=>new Promise(resolve=>pending.push(resolve));
    const first=controller.preloadData(),second=controller.preloadData();
    pending[1]({ok:true,json:async()=>({list:[],total_num:0})});await second;
    pending[0]({ok:true,json:async()=>({list:[],total_num:100})});await first;
    assert.equal(controller.cache.services.total_num,0);
    assert.equal(controller.isLoading,false);
    assert.equal(env.pagination.classList.contains('hidden'),true);
});

test('failed HTTP and invalid list responses preserve the last loaded list and show an error',async()=>{
    const env=environment();
    env.load('assets/js/ServicesTemplates.js');env.load('assets/js/ServicesWizard.js');
    const controller=new env.context.ServicesWizard();await controller.ready;
    env.context.fetch=async()=>({ok:false});
    await controller.preloadData();
    assert.equal(controller.cache.services.total_num,25);
    assert.equal(controller.isLoading,false);
    assert.equal(env.errors.length,1);
    env.context.fetch=async()=>({ok:true,json:async()=>({status:'error',error:'denied'})});
    await controller.preloadData();
    assert.equal(controller.cache.services.total_num,25);
    assert.equal(env.errors.at(-1)[0],'denied');
});

test('destroy removes listeners and ignores pending responses',async()=>{
    const env=environment();env.load('assets/js/ServicesTemplates.js');env.load('assets/js/ServicesWizard.js');
    const controller=new env.context.ServicesWizard();await controller.ready;
    controller.destroy();
    await env.search.querySelector('.search-btn').fire('click');
    await env.pagination.querySelector('.next-arrow').fire('click');
    assert.equal(env.calls.length,1);
});

test('queries preserve category pagination and order/catalog filter field names',async()=>{
    const env=environment(), q=env.context.queries;
    await q.getCategories(20,5,{search:'desk'});
    assert.deepEqual(Object.fromEntries(env.calls.at(-1).options.body),{action:'get_list',offset:'20',limit:'5',search:'desk'});
    await q.searchOrdersQuery('name',{status_id:2,date:'2026-10-17',warehouse_id:3,manager_id:4,pay_method:5,pay_method_postpay:6,only_deleted:true},10,7);
    assert.deepEqual(Object.fromEntries(env.calls.at(-1).options.body),{action:'get_list',offset:'10',limit:'7',search:'name',status_id:'2',created_at:'2026-10-17',warehouse_id:'3',manager_id:'4',payment_method_id:'5',payment_method_postpay_id:'6',only_deleted:'true'});
    await q.searchProductsQuery(2,'desk',0,10,{warehouse_id:3,type_show:'for_order',inStock:true,only_deleted:true,only_negative:true});
    assert.deepEqual(Object.fromEntries(env.calls.at(-1).options.body),{action:'get_list',offset:'0',limit:'10',category_id:'2',search:'desk',warehouse_id:'3',type_show:'for_order',in_stock:'true',only_deleted:'true',only_negative:'true'});
});

test('all generated language dictionaries have their bootstrap and missing keys keep a fallback',()=>{
    for(const language of ['ru','ua','en']) {
        const env=environment();env.load('assets/js/langs/'+language+'.js');
        assert.equal(typeof env.context.LANGS.get('create_item'),'string');
        assert.equal(env.context.LANGS.get('__missing_key__'),'__missing_key__');
    }
});

test('received-product fields bind on every freshly opened modal',async()=>{
    const env=environment();env.load('assets/js/features/modals.js');
    const modal=env.context.document.querySelector('#modalContainer');
    for(const checked of [true,false,true]) {
        const checkbox=new Element(),block=new Element();checkbox.checked=checked;
        modal.nodes.set('input[name="received"]',checkbox);
        modal.nodes.set('.recived-supplier-block',block);
        env.context.initializeReceivedProductFields();
        assert.equal(block.style.display,checked?'block':'none');
        checkbox.checked=!checked;await checkbox.fire('change');
        assert.equal(block.style.display,checked?'none':'block');
    }
});

test('the production bundle loads with its classic public globals and payment-date validation',()=>{
    const template=fs.readFileSync(path.join(root,'System/Template.php'),'utf8');
    const group=template.match(/generateBundleFile\('js',\s*\[([\s\S]*?)\],\s*'libs'/)[1];
    const files=[...group.matchAll(/'([^']+)'/g)].map(m=>m[1]);
    // Use the same single classic-script scope as PHP's generated bundle.
    const fresh=environment();
    fresh.context.addEventListener=()=>{};
    fresh.context.document.addEventListener=()=>{};
    const source=files.map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n');
    // Core services were already loaded by environment(); use a fresh global scope
    // to avoid declaring the same class twice.
    const context=vm.createContext({document:fresh.context.document,FormData,URLSearchParams,AbortController,
        MutationObserver:class {observe(){} disconnect(){}},console:{log(){},warn(){},error(){}},addEventListener(){}});
    context.window=context;
    vm.runInContext(source,context);
    for(const name of ['showUniversalModal','closeUniversalModal','showProductSelectModal',
        'universalHandleObjectCreateOrUpdate','universalHandleObjectDelete','generateUniversalPDF',
        'validateOrderPaymentDates','showNotification','initAutocomplete','loadCurrentShiftOrders']) {
        assert.equal(typeof context[name],'function',name);
    }
    const form=new Element(), fields={};
    for(const name of ['prepay','prepay_2','postpay','postpay2','services_pay']) {
        const amount=new Element(),date=new Element();
        amount.value='0';date.value='';date.validity={valid:true};date.parentElement=new Element();
        form.nodes.set(`[name="${name}"]`,amount);form.nodes.set(`[name="${name}_date"]`,date);
        fields[name]={amount,date};
    }
    assert.equal(context.validateOrderPaymentDates(form),true);
    for(const {amount,date} of Object.values(fields)) {
        amount.value='100';
        assert.equal(context.validateOrderPaymentDates(form),false);
        assert.equal(date.value,'','the validator never invents a payment date');
        assert.equal(date.attributes['aria-invalid'],'true');
        date.value='2026-10-17';
        assert.equal(context.validateOrderPaymentDates(form),true);
        date.validity.valid=false;
        assert.equal(context.validateOrderPaymentDates(form),false);
        date.validity.valid=true;amount.value='0';date.value='';
    }
});
