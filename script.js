const PRODUCTS = [
  {id:1,name:"Weeding Dress",price:45,image:"images/7WpPXIekEzcU.jpg",category:"Tops",rating:4.5,sales:120,tags:["new","trend"]},
  {id:2,name:"Frock",price:60,image:"images/6N3j0yKERswN.jpg",category:"Pants",rating:4.2,sales:250,tags:["best"]},
  {id:3,name:"Denum Jacket",price:25,image:"images/denim_jacket_main.jpg",category:"Jackets",rating:4.7,sales:180,tags:["top"]},
  {id:4,name:"Traditinal Dress",price:80,image:"images/E2z6Twy2h2XD.jpg",category:"Shoes",rating:4.6,sales:300,tags:["trend","best"]},
  {id:5,name:"Bridal Dress",price:120,image:"images/U5NlTq9m031U.jpg",category:"Jackets",rating:4.9,sales:95,tags:["new","top"]},
  {id:6,name:"Summer Dress",price:50,image:"images/N3tgCbVlgLeS.jpg",category:"Dresses",rating:4.3,sales:160,tags:["new","trend"]},
  {id:7,name:"Party Dress",price:95,image:"images/dress_thumb1.jpg",category:"Dresses",rating:4.8,sales:210,tags:["best","top"]},
  {id:8,name:"Lawn Dress",price:75,image:"images/EQYEb2fKYW4r.jpg",category:"Jackets",rating:4.4,sales:140,tags:["trend"]},
];

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const money = n => n.toFixed(2);

const slides = $$('.slide');
let currentSlide = 0;
function showSlide(i){ slides.forEach((sl,idx)=>{ sl.style.transform = `translateX(${100*(idx-i)}%)`; });}
function nextSlide(){ currentSlide = (currentSlide+1)%slides.length; showSlide(currentSlide); }
showSlide(currentSlide);
setInterval(nextSlide, 4000);

const countdownEl = $('#countdown');
let saleEnd = new Date(); saleEnd.setHours(saleEnd.getHours()+6);
function tick(){
  const diff = saleEnd - new Date();
  if(diff<=0){ countdownEl.textContent = "Expired"; return; }
  const h = Math.floor(diff/36e5)%24, m = Math.floor(diff/6e4)%60, s = Math.floor(diff/1e3)%60;
  countdownEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
setInterval(tick,1000); tick();

let cart = JSON.parse(localStorage.getItem('cart')||'[]');
let wishlist = JSON.parse(localStorage.getItem('wishlist')||'[]');
let recently = JSON.parse(localStorage.getItem('recently')||'[]');
let loggedIn = JSON.parse(localStorage.getItem('loggedIn')||'false');

function productCard(p){
  const wished = wishlist.some(w=>w.id===p.id) ? 'active':'';
  return `
  <div class="product-card" data-id="${p.id}">
    <button class="wish ${wished}" title="Wishlist">♡</button>
    <img src="${p.image}" alt="${p.name}">
    <h4>${p.name}</h4>
    <div class="muted">${p.category} · ⭐ ${p.rating}</div>
    <div class="price">$${money(p.price)}</div>
    <div class="card-actions">
      <button class="small add">Add to Cart</button>
      <button class="small view">View</button>
    </div>
  </div>`;
}
function mountRow(selector, arr){ const el = $(selector); el.innerHTML = arr.map(productCard).join(''); bindCards(el); }
function bindCards(scope){
  scope.querySelectorAll('.product-card').forEach(card=>{
    const id = Number(card.dataset.id);
    const p = PRODUCTS.find(x=>x.id===id);
    card.querySelector('.add').addEventListener('click', ()=> addToCart(p));
    card.querySelector('.view').addEventListener('click', ()=> openQuickView(p));
    card.querySelector('.wish').addEventListener('click', (e)=> toggleWishlist(p, e.currentTarget));
    card.querySelector('img').addEventListener('click', ()=> { pushRecently(p.id); openQuickView(p); });
    card.querySelector('h4').addEventListener('click', ()=> { pushRecently(p.id); openQuickView(p); });
  });
}
function pushRecently(id){
  recently = [{id, t:Date.now()}, ...recently.filter(r=>r.id!==id)].slice(0,12);
  localStorage.setItem('recently', JSON.stringify(recently));
  renderRecently();
}

const NewArrivals = PRODUCTS.filter(p=>p.tags.includes('new'));
const BestSellers = [...PRODUCTS].sort((a,b)=>b.sales-a.sales).slice(0,6);
const Trending = PRODUCTS.filter(p=>p.tags.includes('trend'));
const TopRated = [...PRODUCTS].sort((a,b)=>b.rating-a.rating).slice(0,6);
function Recommended(){
  if(!loggedIn) return [];
  const likedCats = new Set([
    ...wishlist.map(w=>w.category),
    ...recently.map(r=>PRODUCTS.find(p=>p.id===r.id)?.category).filter(Boolean)
  ]);
  if(likedCats.size===0) return PRODUCTS.slice(0,6);
  return PRODUCTS.filter(p=>likedCats.has(p.category)).slice(0,6);
}

function renderAll(){
  mountRow('#newArrivalsGrid', NewArrivals);
  mountRow('#bestGrid', BestSellers);
  mountRow('#trendGrid', Trending);
  mountRow('#ratedGrid', TopRated);
  const rec = Recommended();
  if(rec.length>0){ $('#recommended').classList.remove('hidden'); mountRow('#recGrid', rec); }
  else { $('#recommended').classList.add('hidden'); $('#recGrid').innerHTML=''; }
  renderRecently();
}
function renderRecently(){
  const ids = recently.map(r=>r.id);
  const arr = ids.map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);
  if(arr.length===0){ $('#recentGrid').innerHTML = `<div class="muted">Nothing here yet — browse products!</div>`; return; }
  mountRow('#recentGrid', arr);
}
renderAll();

$$('.scroll-left').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const target = document.querySelector(btn.dataset.target);
    target.scrollBy({left:-400,behavior:'smooth'});
  });
});
$$('.scroll-right').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const target = document.querySelector(btn.dataset.target);
    target.scrollBy({left:400,behavior:'smooth'});
  });
});

$$('.category-card').forEach(card=>{
  card.addEventListener('click', (e)=>{
    const cat = card.dataset.cat;
    const mixed = PRODUCTS.filter(p=>p.category===cat).concat(PRODUCTS.filter(p=>p.category!==cat));
    mountRow('#newArrivalsGrid', mixed.slice(0,8));
  });
});

const searchInput = $('#searchInput');
const catFilter = $('#categoryFilter');
const suggList = $('#suggestions');

function filterProducts(query, cat){
  const q = query.trim().toLowerCase();
  return PRODUCTS.filter(p=>{
    const inCat = (cat==='all') || (p.category===cat);
    const match = !q || p.name.toLowerCase().includes(q);
    return inCat && match;
  });
}
function updateSuggestions(){
  const items = filterProducts(searchInput.value, catFilter.value).slice(0,8);
  if(items.length===0 || !searchInput.value){ suggList.style.display='none'; suggList.innerHTML=''; return; }
  suggList.innerHTML = items.map(i=>`<li data-id="${i.id}">${i.name} — <span class="muted">$${money(i.price)}</span></li>`).join('');
  suggList.style.display='block';
  suggList.querySelectorAll('li').forEach(li=>{
    li.addEventListener('click', ()=>{
      const p = PRODUCTS.find(x=>x.id===Number(li.dataset.id));
      suggList.style.display='none';
      searchInput.value = p.name;
      openQuickView(p);
    });
  });
}
searchInput.addEventListener('input', updateSuggestions);
catFilter.addEventListener('change', updateSuggestions);
document.addEventListener('click', (e)=>{ if(!e.target.closest('.search-wrap')) suggList.style.display='none'; });

const loginBtn = $('#loginBtn');
function updateLoginUI(){
  loginBtn.textContent = loggedIn ? 'Logout' : 'Login';
  loginBtn.setAttribute('aria-pressed', String(loggedIn));
  renderAll();
}
loginBtn.addEventListener('click', ()=>{
  loggedIn = !loggedIn;
  localStorage.setItem('loggedIn', JSON.stringify(loggedIn));
  updateLoginUI();
});
updateLoginUI();

const cartBtnOpen = $('.cart-open');
const cartModal = $('#cartModal');
const cartItems = $('#cartItems');
const cartTotal = $('#cartTotal');
const cartCount = $('#cart-count');
cartBtnOpen.addEventListener('click', ()=> cartModal.classList.add('open'));
cartModal.querySelector('.close').addEventListener('click', ()=> cartModal.classList.remove('open'));

function saveCart(){ localStorage.setItem('cart', JSON.stringify(cart)); }
function recalc(){
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  cartTotal.textContent = money(total);
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
}
function renderCart(){
  if(cart.length===0){ cartItems.innerHTML = `<div class="muted">Your cart is empty.</div>`; recalc(); return; }
  cartItems.innerHTML = cart.map((it,idx)=>`
    <div class="line-item">
      <img src="${it.image}" alt="${it.name}">
      <div style="flex:1">
        <div><strong>${it.name}</strong></div>
        <div class="muted">$${money(it.price)}</div>
        <div class="qty">
          <button data-a="dec" data-i="${idx}">−</button>
          <span>${it.qty}</span>
          <button data-a="inc" data-i="${idx}">+</button>
          <button data-a="rm" data-i="${idx}" style="margin-left:auto">✖</button>
        </div>
      </div>
    </div>
  `).join('');
  cartItems.querySelectorAll('button').forEach(b=>{
    const i = Number(b.dataset.i);
    const a = b.dataset.a;
    b.addEventListener('click', ()=>{
      if(a==='inc') cart[i].qty++;
      if(a==='dec') cart[i].qty = Math.max(1, cart[i].qty-1);
      if(a==='rm') cart.splice(i,1);
      saveCart(); renderCart();
    });
  });
  recalc(); saveCart();
}
function addToCart(p){
  const found = cart.find(i=>i.id===p.id);
  if(found) found.qty++;
  else cart.push({...p, qty:1});
  renderCart();
}
renderCart();

const wishBtnOpen = $('.wishlist-open');
const wishlistModal = $('#wishlistModal');
const wishlistItems = $('#wishlistItems');
wishBtnOpen.addEventListener('click', ()=> wishlistModal.classList.add('open'));
wishlistModal.querySelector('.close').addEventListener('click', ()=> wishlistModal.classList.remove('open'));

function saveWishlist(){ localStorage.setItem('wishlist', JSON.stringify(wishlist)); }
function renderWishlist(){
  if(wishlist.length===0){ wishlistItems.innerHTML = `<div class="muted">No items in wishlist.</div>`; saveWishlist(); return; }
  wishlistItems.innerHTML = wishlist.map((w,idx)=>`
    <div class="line-item">
      <img src="${w.image}" alt="${w.name}">
      <div style="flex:1">
        <div><strong>${w.name}</strong></div>
        <div class="muted">$${money(w.price)} · ${w.category}</div>
        <div class="qty">
          <button data-a="add" data-i="${idx}">Add to Cart</button>
          <button data-a="rm" data-i="${idx}" style="margin-left:auto">✖</button>
        </div>
      </div>
    </div>
  `).join('');
  wishlistItems.querySelectorAll('button').forEach(b=>{
    const i = Number(b.dataset.i);
    const a = b.dataset.a;
    b.addEventListener('click', ()=>{
      if(a==='add'){ addToCart(wishlist[i]); wishlist.splice(i,1); }
      if(a==='rm'){ wishlist.splice(i,1); }
      renderWishlist();
    });
  });
  saveWishlist();
}
function toggleWishlist(p, btnEl){
  const ix = wishlist.findIndex(w=>w.id===p.id);
  if(ix>=0){ wishlist.splice(ix,1); btnEl.classList.remove('active'); }
  else { wishlist.push(p); btnEl.classList.add('active'); }
  renderWishlist();
}
renderWishlist();

const qv = $('#quickView');
const qvTitle = $('#qvTitle');
const qvImg = $('#qvImg');
const qvPrice = $('#qvPrice');
const qvCat = $('#qvCat');
const qvAdd = $('#qvAdd');
qv.querySelector('.close').addEventListener('click', ()=> qv.classList.remove('open'));
function openQuickView(p){
  qvTitle.textContent = p.name;
  qvImg.src = p.image;
  qvPrice.textContent = `Price: $${money(p.price)} · ⭐ ${p.rating}`;
  qvCat.textContent = `${p.category}`;
  qvAdd.onclick = ()=> addToCart(p);
  pushRecently(p.id);
  qv.classList.add('open');
}

$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href');
    if(id.length>1){
      e.preventDefault();
      document.querySelector(id).scrollIntoView({behavior:'smooth',block:'start'});
    }
  });
});

$('#checkoutBtn').addEventListener('click', ()=>{
  if(cart.length===0){ alert('Your cart is empty.'); return; }
  alert('Checkout flow would start here 🚀');
});
