const categories = [];
const categoriesDiv = document.getElementById('categories');
function renderCategories(){
  categoriesDiv.innerHTML='';
  categories.forEach((cat,i)=>{
    const el = document.createElement('div');
    el.innerHTML = `<input value="${cat.name}" data-i="${i}" class="catname" /> <button data-i="${i}" class="addDish">+ Dish</button> <button data-i="${i}" class="removeCat">Remove</button>`;
    categoriesDiv.appendChild(el);
  });
}

document.getElementById('addCat').onclick = ()=>{
  categories.push({name:'New Category', dishes:['New Dish']}); renderCategories();
}

document.getElementById('export').onclick = async ()=>{
  const biz = document.getElementById('biz').value;
  const meal = document.getElementById('meal').value;
  const branding = document.getElementById('brandingPreview');
  branding.style.display='block';
  branding.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%"><h1>${biz}</h1><p>${meal}</p></div>`;
  const menu = document.getElementById('menuPreview');
  menu.style.display='block';
  let html = `<h2>${meal} Menu</h2>`;
  categories.forEach(cat=>{ html += `<h3>${cat.name}</h3><ul>` + cat.dishes.map(d=>`<li>${d}</li>`).join('') + '</ul>'; });
  menu.innerHTML = html;

  const bCanvas = await html2canvas(branding, {scale:2});
  const mCanvas = await html2canvas(menu, {scale:2});
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({unit:'pt', format:'a4'});
  pdf.addImage(bCanvas.toDataURL('image/png'), 'PNG', 0,0,595.28,841.89);
  pdf.addPage();
  pdf.addImage(mCanvas.toDataURL('image/png'), 'PNG', 0,0,595.28,841.89);
  pdf.save(biz + '.pdf');
}
