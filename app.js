import { restaurantConfig } from './config.js';
import { menuItems } from './menu.js';

let cart = JSON.parse(localStorage.getItem('ajwa-cart') || '[]');
let activeCategory = 'All';

const $ = (s) => document.querySelector(s);
const money = (n) => `Rs. ${Number(n).toLocaleString('en-PK')}`;

function variantsFor(item) {
  if (item.variants) return Object.entries(item.variants);
  return [['Standard', item.price]];
}

// The restaurant menu currently contains names/prices but no individual food photos.
// Use a stable, food-focused photo for every card until real restaurant photos are supplied.
function foodImageUrl(item) {
  const categoryHints = {
    'Appetizer': 'appetizer', 'Soup': 'soup', 'Dry & Fry': 'pakistani food',
    'Chinese Gravy': 'chinese food', 'Chowmein': 'chow mein', 'Chop Suey': 'chop suey',
    'Chinese Rice': 'fried rice', 'Beef Steak': 'beef steak', 'Chicken Steak': 'chicken steak',
    'Pasta': 'pasta', 'Pizza': 'pizza', 'Fast Food': 'burger', 'Salad Bar': 'salad',
    'Shinwari': 'mutton karahi', "Chef’s Special": 'pakistani curry', 'Ajwa Bar B. Q.': 'barbecue',
    'Bar B.Q. Platter': 'barbecue platter', 'Fish Bar B. Que': 'fish barbecue',
    'Tikka Bar B. Que': 'chicken tikka', 'Kabab Bar B. Que': 'kebab', "Pakistani Handi's": 'handi curry',
    'Pakistani Karahi': 'karahi', 'Tandoor': 'naan', 'Dessert': 'dessert', 'Hot Beverage': 'coffee tea',
    'Cold Beverage': 'cold drink', 'Shakes': 'milkshake', 'Special': 'mocktail'
  };
  const hint = categoryHints[item.category] || 'restaurant food';
  const name = item.name
    .replace(/\([^)]*\)/g, '')
    .replace(/\d+/g, '')
    .replace(/[^a-zA-Z ]/g, ' ')
    .trim();
  const tags = encodeURIComponent(`${name} ${hint}`.trim().replace(/\s+/g, ','));
  return `https://loremflickr.com/640/480/${tags}?lock=${item.id}`;
}

function getCategories() {
  return ['All', ...new Set(menuItems.map(i => i.category))];
}

function renderCategories() {
  $('#categories').innerHTML = getCategories().map(c =>
    `<button class="${c===activeCategory?'active':''}" data-cat="${c}">${c}</button>`
  ).join('');
  document.querySelectorAll('#categories button').forEach(b => b.onclick = () => {
    activeCategory = b.dataset.cat; renderCategories(); renderMenu();
  });
}

function renderMenu() {
  const q = $('#search').value.trim().toLowerCase();
  const list = menuItems.filter(i => (activeCategory==='All'||i.category===activeCategory) && i.name.toLowerCase().includes(q));
  $('#menuGrid').innerHTML = list.map(item => {
    const vs = variantsFor(item);
    const select = vs.length > 1 ? `<select class="variant-select" data-id="${item.id}">${vs.map(([n,p])=>`<option value="${n}">${n} — ${money(p)}</option>`).join('')}</select>` : '';
    const p = vs[0][1];
    return `<article class="food-card">
      <div class="food-image-wrap">
        <img class="food-image" src="${foodImageUrl(item)}" alt="${item.name}" loading="lazy" referrerpolicy="no-referrer">
      </div>
      <div class="cat">${item.category}</div><h3>${item.name}</h3>
      <div class="price-row"><div class="price">${vs.length>1?'From ':''}${money(p)}</div>${select}<button class="add" data-add="${item.id}">Add</button></div>
    </article>`;
  }).join('') || '<div class="empty">No menu items found.</div>';
  document.querySelectorAll('[data-add]').forEach(btn => btn.onclick = () => {
    const item = menuItems.find(i => i.id === Number(btn.dataset.add));
    const card = btn.closest('.food-card');
    const select = card.querySelector('.variant-select');
    const variant = select ? select.value : variantsFor(item)[0][0];
    addToCart(item, variant);
  });
}

function addToCart(item, variant) {
  const key = `${item.id}-${variant}`;
  const existing = cart.find(x => x.key === key);
  const price = variantsFor(item).find(v => v[0] === variant)[1];
  if (existing) existing.qty++;
  else cart.push({key,id:item.id,name:item.name,category:item.category,variant,price,qty:1});
  saveCart(); openCart();
}

function saveCart() {
  localStorage.setItem('ajwa-cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  $('#cartCount').textContent = cart.reduce((s,i)=>s+i.qty,0);
  const box = $('#cartItems');
  if (!cart.length) { box.innerHTML='<div class="empty">Your cart is empty.<br><br>Add something delicious from our menu.</div>'; $('#cartTotal').textContent=money(0); return; }
  box.innerHTML = cart.map((i,idx)=>`<div class="cart-line">
    <div><h4>${i.name}</h4><div class="muted">${i.variant} • ${money(i.price)}</div>
      <div class="qty"><button data-dec="${idx}">−</button><strong>${i.qty}</strong><button data-inc="${idx}">+</button><button class="remove" data-rem="${idx}">Remove</button></div>
    </div><strong>${money(i.price*i.qty)}</strong>
  </div>`).join('');
  $('#cartTotal').textContent = money(cart.reduce((s,i)=>s+i.price*i.qty,0));
  document.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{cart[+b.dataset.inc].qty++;saveCart()});
  document.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{const i=cart[+b.dataset.dec];i.qty--;if(i.qty<=0)cart.splice(+b.dataset.dec,1);saveCart()});
  document.querySelectorAll('[data-rem]').forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.rem,1);saveCart()});
}

function openCart() { $('#cartDrawer').classList.add('open'); $('#backdrop').classList.add('open'); $('#cartDrawer').setAttribute('aria-hidden','false'); }
function closeCart() { $('#cartDrawer').classList.remove('open'); $('#backdrop').classList.remove('open'); $('#cartDrawer').setAttribute('aria-hidden','true'); }

function waUrl(message) { return `https://wa.me/${restaurantConfig.whatsappNumber}?text=${encodeURIComponent(message)}`; }
function genericWhatsApp(text='') { window.open(waUrl(text || 'Assalam-o-Alaikum Ajwa Garden, I would like to ask about your restaurant and marriage hall.'), '_blank'); }

function orderMessage() {
  const name = $('#customerName').value.trim(), phone = $('#customerPhone').value.trim();
  const type = $('#orderType').value, address = $('#address').value.trim(), notes = $('#notes').value.trim();
  const lines = cart.map((i,n)=>`${n+1}. ${i.name} (${i.variant})\n   Qty: ${i.qty} × ${money(i.price)} = ${money(i.qty*i.qty?i.price*i.qty:i.price)}`).join('\n');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  return `Assalam-o-Alaikum Ajwa Garden,\n\nI would like to place an order.\n\nCustomer Name: ${name}\nPhone: ${phone}\nOrder Type: ${type}${type==='Delivery'?'\nAddress: '+address:''}\n\nORDER DETAILS:\n\n${lines}\n\nSubtotal: ${money(total)}\n${notes?'\nNotes: '+notes+'\n':''}\nPlease confirm availability and final charges.\nThank you.`;
}

$('#search').addEventListener('input', renderMenu);
$('#cartOpen').onclick=openCart; $('#cartClose').onclick=closeCart; $('#backdrop').onclick=closeCart;
$('#heroOrder').onclick=()=>{ if(cart.length) openCart(); else document.querySelector('#menu').scrollIntoView(); };
$('#checkoutOpen').onclick=()=>{ if(!cart.length) return; closeCart(); $('#checkout').showModal(); };
$('#sendWhatsapp').onclick=(e)=>{ e.preventDefault(); if(!$('#checkoutForm').reportValidity())return; window.open(waUrl(orderMessage()),'_blank'); $('#checkout').close(); };
$('#orderType').onchange=()=>$('#addressWrap').style.display=$('#orderType').value==='Delivery'?'block':'none';
$('#hallWhatsapp').onclick=()=>genericWhatsApp('Assalam-o-Alaikum Ajwa Garden, I would like to ask about marriage hall booking.');
$('#whatsappLink').href=waUrl();
$('#phones').innerHTML=restaurantConfig.phoneNumbers.map(n=>`<a href="tel:${n.replace(/[^0-9+]/g,'')}">${n}</a>`).join('');
$('#hallCall').href=`tel:${restaurantConfig.phoneNumbers[0].replace(/[^0-9+]/g,'')}`;
document.querySelector('.menu-toggle').onclick=()=>document.querySelector('.navbar nav').classList.toggle('open');

renderCategories(); renderMenu(); renderCart();
