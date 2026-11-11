// 讀 projects.json 畫出作品卡片；之後專案有更新，只改 projects.json
(() => {
  document.documentElement.classList.add('js');
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' }) : null;
  document.querySelectorAll('.rv').forEach(el => io ? io.observe(el) : el.classList.add('in'));
  const grid = document.querySelector('[data-grid]');
  const filtersEl = document.querySelector('[data-filters]');
  const colorVar = c => `var(--${c})`;

  // 沒有公開網址的作品：用示意畫面（文字為範例，標示在畫面上）
  const UI = {
    eng: `<div class="ui" data-ui aria-hidden="true">
      <div class="bub">請翻成英文：我想先確認時程，再回覆你。</div>
      <div class="bub me">I want to confirm the schedule first and reply you.</div>
      <div class="bub ok"><b>建議：</b>I'd like to check the timeline before I get back to you.</div>
      <div class="note hide-sm">reply 後面要加 to；get back to you 在工作信裡更自然。</div></div>`,
    analyst: `<div class="ui" data-ui aria-hidden="true">
      <div class="row"><span>技術面</span><div class="bar" style="width:45%"><span style="width:72%"></span></div></div>
      <div class="row"><span>基本面</span><div class="bar" style="width:45%"><span style="width:80%"></span></div></div>
      <div class="row"><span>籌碼面</span><div class="bar" style="width:45%"><span style="width:55%"></span></div></div>
      <div class="row hide-sm"><span>國際面</span><div class="bar" style="width:45%"><span style="width:58%"></span></div></div>
      <div class="bub ok">程式算完分數，AI 再補上總經與地緣政治消息。（示意）</div></div>`,
    train: `<div class="ui" data-ui aria-hidden="true">
      <div class="row"><b>藍圖</b><span>這個 AI 要解決什麼問題</span></div>
      <div class="row"><b>資料</b><span>真實範例分成訓練／驗證／測試</span></div>
      <div class="row"><b>對練</b><span>預測、對答案、找錯誤類型</span></div>
      <div class="row hide-sm"><b>盲測</b><span>用沒看過的題目驗收</span></div></div>`,
    flow: `<div class="ui" data-ui aria-hidden="true">
      <div class="bub">今日待辦：課程網站有 2 件事等你決定。</div>
      <div class="bub">Claude 需要你同意才能繼續：執行測試（英文家教）</div>
      <div class="bub me">好，我看一下。</div>
      <div class="note hide-sm">LINE 推播示意</div></div>`,
    video: `<div class="ui" data-ui aria-hidden="true">
      <div class="pipe"><span>參考分析</span><span>產生提示詞</span><span>AI 產圖</span></div>
      <div class="pipe"><span>圖轉影片</span><span>SEO 文案</span><span class="hl">人工審核</span></div>
      <div class="note">預設只試跑，審核通過才上架。</div></div>`
  };

  const media = (p, cat) => {
    const inner = p.media.type === 'img'
      ? `<img src="${p.media.src}" alt="${p.media.alt}" width="1440" height="900" loading="lazy" decoding="async">`
      : UI[p.media.ui];
    return `<div class="media">${inner}<span class="media-top"><i style="background:${colorVar(cat.color)}"></i>${p.stack}</span></div>`;
  };
  const statusColor = s => ({ '上線中': 'good', '每天使用': 'good', '可使用': 'good', '持續優化': 'accent', '測試中': 'u1' }[s] || 'muted');
  const openLink = p => p.link
    ? `<a class="open" href="${p.link}" target="_blank" rel="noopener">開啟作品<span aria-hidden="true">↗</span><span class="sr">（${p.host}，另開新分頁）</span></a>`
    : `<span class="open off">面試時現場示範</span>`;

  function render(data, catId) {
    const cats = Object.fromEntries(data.categories.map(c => [c.id, c]));
    const list = data.projects.filter(p => catId === 'all' || p.cat === catId);
    grid.innerHTML = list.map((p, i) => {
      const cat = cats[p.cat];
      return `<article class="card reveal" style="--d:${i * 70}ms" id="p-${p.id}">
        ${media(p, cat)}
        <div class="card-body">
          <div class="card-title"><h3>${p.title}</h3><span class="status"><i style="background:${colorVar(statusColor(p.status))}"></i>${p.status}</span></div>
          <p class="summary">${p.summary}</p>
          <div class="explain">
            <div><h4 class="h-how">AI 怎麼做</h4><p>${p.how}</p></div>
            <div><h4 class="h-help">帶來的幫助</h4><p>${p.help}</p></div>
          </div>
          <div class="card-foot"><span>${cat.name}</span>${openLink(p)}</div>
        </div></article>`;
    }).join('');
  }

  function buildFilters(data) {
    const all = [{ id: 'all', name: '全部', color: 'accent' }, ...data.categories];
    filtersEl.innerHTML = all.map(c => {
      const n = c.id === 'all' ? data.projects.length : data.projects.filter(p => p.cat === c.id).length;
      return `<button type="button" data-c="${c.id}" aria-pressed="${c.id === 'all'}"><i style="background:${colorVar(c.color)}"></i>${c.name}<small>${n}</small></button>`;
    }).join('');
    filtersEl.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      filtersEl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      render(data, b.dataset.c);
    });
  }

  fetch('projects.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
      buildFilters(data);
      render(data, 'all');
      const u = document.querySelector('[data-updated]');
      if (u) u.textContent = `作品資料更新日期：${data.updated}`;
    })
    .catch(() => {
      grid.innerHTML = '<p class="sub">作品清單載入失敗，請重新整理頁面再試一次。</p>';
    });

  // 聯絡連結還沒提供時，按了只提示
  document.querySelectorAll('[data-todo]').forEach(a => a.setAttribute('aria-disabled', 'true'));
})();
