/* Player's Choice live searchable inventory */
(() => {
  const cfg=window.INVENTORY_CONFIG||{};
  const placeholder='PASTE_PUBLISHED_GOOGLE_SHEETS_CSV_URL_HERE';
  const liveConfigured=cfg.GOOGLE_SHEET_CSV_URL&&cfg.GOOGLE_SHEET_CSV_URL!==placeholder;
  const SOURCE=liveConfigured?cfg.GOOGLE_SHEET_CSV_URL:(cfg.LOCAL_FALLBACK_FILE||'inventory.csv');
  const refreshMs=Math.max(1,Number(cfg.AUTO_REFRESH_MINUTES)||5)*60*1000;
  const $=s=>document.querySelector(s);
  const grid=$('#inventoryGrid'),count=$('#resultCount'),empty=$('#inventoryEmpty');
  const search=$('#inventorySearch'),filters=$('#categoryFilters');
  const stock=$('#inStockOnly'),sort=$('#inventorySort');
  if(!grid||!count||!search||!filters||!stock||!sort)return;
  let products=[],active='All',timer;
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const icon=c=>({'Video Games':'🎮','Comics':'📚','Consoles':'🕹️','Figures':'🦸','Movies':'📀','Trading Cards':'🃏','Accessories':'🎯'}[c]||'★');

  function parseCSV(text){
    text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i],n=text[i+1];
      if(c==='"'&&quoted&&n==='"'){field+='"';i++;}
      else if(c==='"')quoted=!quoted;
      else if(c===','&&!quoted){row.push(field);field='';}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(field);field='';if(row.some(v=>v!==''))rows.push(row);row=[];}
      else field+=c;
    }
    if(field||row.length){row.push(field);rows.push(row);}
    if(rows.length<2)return [];
    const h=rows.shift().map(x=>x.trim());
    return rows.map(r=>Object.fromEntries(h.map((x,i)=>[x,(r[i]??'').trim()])))
      .filter(p=>p.SKU&&p.Title)
      .map(p=>({...p,Price:Number(p.Price)||0,Quantity:Number(p.Quantity)||0,Year:Number(p.Year)||0}));
  }

  function makeFilters(){
    const cats=['All',...new Set(products.map(p=>p.Category).filter(Boolean))];
    if(!cats.includes(active))active='All';
    filters.innerHTML=cats.map(c=>`<button type="button" class="filter-btn${c===active?' active':''}" data-cat="${esc(c)}">${c==='All'?'★':icon(c)} ${esc(c)}</button>`).join('');
  }

  function card(p){
    const q=p.Quantity;
    const badge=q<=0?'<span class="stock-badge out">OUT OF STOCK</span>':q===1?'<span class="stock-badge last">LAST ONE</span>':`<span class="stock-badge in">IN STOCK · ${q}</span>`;
    const pic=p.Image?`<img src="${esc(p.Image)}" alt="${esc(p.Title)}" loading="lazy">`:`<span>${icon(p.Category)}</span>`;
    const mail=`mailto:Playerschoicenmb@gmail.com?subject=${encodeURIComponent('Inventory question: '+p.SKU)}&body=${encodeURIComponent('Hi, is this item still available?\n\n'+p.Title+'\nSKU: '+p.SKU)}`;
    return `<article class="inventory-card${q<=0?' sold':''}"><div class="inventory-art category-${esc((p.Category||'other').toLowerCase().replace(/\s+/g,'-'))}">${pic}<span class="inventory-category">${esc(p.Category)}</span></div><div class="inventory-card-body"><div class="inventory-card-top">${badge}<span class="inventory-year">${p.Year||''}</span></div><h2>${esc(p.Title)}</h2><p class="inventory-platform">${esc(p.Platform_Series)}</p><div class="inventory-meta"><span>${esc(p.Item_Status)}</span><span>${esc(p.Condition)}</span></div><p class="inventory-description">${esc(p.Description)}</p><div class="inventory-card-bottom"><strong>$${p.Price.toFixed(2)}</strong><a href="${mail}" class="inventory-ask">ASK ABOUT IT</a></div><div class="inventory-sku">SKU: ${esc(p.SKU)}</div></div></article>`;
  }

  function render(){
    const terms=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let list=products.filter(p=>{
      if(active!=='All'&&p.Category!==active)return false;
      if(stock.checked&&p.Quantity<=0)return false;
      const hay=[p.SKU,p.Title,p.Category,p.Platform_Series,p.Item_Status,p.Condition,p.Brand_Publisher,p.Year,p.Description].join(' ').toLowerCase();
      return terms.every(t=>hay.includes(t));
    });
    const m=sort.value;
    list.sort((a,b)=>m==='price-low'?a.Price-b.Price:m==='price-high'?b.Price-a.Price:m==='newest'?b.Year-a.Year:m==='quantity'?b.Quantity-a.Quantity:a.Title.localeCompare(b.Title));
    count.textContent=`${list.length} ITEM${list.length===1?'':'S'} FOUND`;
    grid.innerHTML=list.map(card).join('');
    if(empty)empty.hidden=list.length!==0;grid.hidden=list.length===0;
  }

  async function load(silent=false){
    if(!silent)count.textContent='REFRESHING INVENTORY...';
    try{
      const sep=SOURCE.includes('?')?'&':'?';
      const res=await fetch(SOURCE+sep+'_cache='+Date.now(),{cache:'no-store'});
      if(!res.ok)throw new Error('HTTP '+res.status);
      const next=parseCSV(await res.text());if(!next.length)throw new Error('No valid inventory rows');
      products=next;makeFilters();render();
      const stamp=$('#inventoryUpdated');
      if(stamp)stamp.textContent=(liveConfigured?'LIVE GOOGLE SHEET · ':'LOCAL DEMO FILE · ')+'SYNCED '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
    }catch(err){
      if(products.length){render();const stamp=$('#inventoryUpdated');if(stamp)stamp.textContent='SYNC RETRY PENDING';}
      else{count.textContent='INVENTORY COULD NOT LOAD';grid.innerHTML=`<div class="inventory-error"><h2>CONNECTION LOST</h2><p>${esc(err.message)}</p></div>`;}
    }
  }

  filters.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;active=b.dataset.cat;makeFilters();render();});
  search.addEventListener('input',render);stock.addEventListener('change',render);sort.addEventListener('change',render);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)load(true);});
  load();timer=setInterval(()=>load(true),refreshMs);
})();
