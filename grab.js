(function(){
  function unlock(){
    document.onselectstart = document.oncopy = document.oncontextmenu = document.onmousedown = document.onmouseup = null;
    document.body.style.userSelect = 'text';
    document.body.style.webkitUserSelect = 'text';
    Array.prototype.forEach.call(document.querySelectorAll('*'), function(el){
      el.style.userSelect = 'text';
      el.style.webkitUserSelect = 'text';
      el.style.pointerEvents = 'auto';
    });
  }
  unlock();

  var seen = {}, urls = [], pdfUrls = [];
  Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function(a){
    var h = a.href || '';
    if(h && h.indexOf('javascript:') !== 0 && h.indexOf('#') !== 0 && !seen[h]){
      seen[h] = 1; urls.push(h);
      if(/\.pdf($|[?#])/i.test(h)) pdfUrls.push(h);
    }
  });
  Array.prototype.forEach.call(document.querySelectorAll('embed[src],iframe[src],object[data]'), function(el){
    var h = (el.src || el.data || '');
    if(h && /\.pdf($|[?#])/i.test(h) && !seen[h]){ seen[h] = 1; pdfUrls.push(h); }
  });
  urls = urls.slice(0, 40);

  var lines = [];
  lines.push('【网页标题】' + document.title);
  lines.push('【当前网址】' + location.href);
  var timeTxt = '';
  Array.prototype.forEach.call(document.querySelectorAll('*'), function(el){
    if(timeTxt) return;
    var m = (el.innerText || '').match(/(\d{4}年\d{1,2}月\d{1,2}日|\d{4}-\d{1,2}-\d{1,2}|\d{4}\/\d{1,2}\/\d{1,2})/);
    if(m && el.children.length === 0) timeTxt = m[0];
  });
  if(timeTxt) lines.push('【疑似发布时间】' + timeTxt);
  if(pdfUrls.length){
    lines.push('');
    lines.push('【PDF 直链】');
    pdfUrls.forEach(function(u){ lines.push(u); });
  }
  lines.push('');
  lines.push('【页面里出现的网址】');
  urls.forEach(function(u){ lines.push(u); });

  var box = document.getElementById('__grabBox');
  if(box) box.parentNode.removeChild(box);
  box = document.createElement('div');
  box.id = '__grabBox';
  box.style.cssText = 'position:fixed;right:14px;top:14px;width:420px;max-height:84vh;overflow:auto;background:#fff;color:#111;border:2px solid #e0533a;box-shadow:0 6px 24px rgba(0,0,0,.35);z-index:2147483647;font:13px/1.55 -apple-system,sans-serif;padding:14px;border-radius:10px';
  box.innerHTML = ''
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
    + '<b style="color:#e0533a">已解锁复制 · 抓取结果</b>'
    + '<span id="__grabX" style="cursor:pointer;color:#888;font-size:18px;line-height:1">×</span></div>'
    + '<button id="__grabCopy" style="width:100%;padding:9px;background:#e0533a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;margin-bottom:10px">一键复制全部</button>'
    + '<pre id="__grabTxt" style="white-space:pre-wrap;word-break:break-all;margin:0"></pre>'
    + '<div id="__grabPdfs" style="margin-top:10px"></div>';
  document.body.appendChild(box);
  document.getElementById('__grabTxt').textContent = lines.join('\n');

  var pdfBox = document.getElementById('__grabPdfs');
  if(pdfBox && pdfUrls.length){
    pdfBox.innerHTML = '<b style="color:#e0533a">📄 检测到 PDF 公告</b>'
      + '<div style="color:#666;font-size:12px;margin:4px 0 6px">点「在招投通提取文字」→ 新页面里直接拖选、复制正文</div>';
    pdfUrls.forEach(function(u){
      var wrap = document.createElement('div'); wrap.style.cssText = 'margin-top:8px';
      var b = document.createElement('a');
      b.href = 'https://zhaotoutong.chzfd.com/pdf.html?url=' + encodeURIComponent(u);
      b.target = '_blank'; b.rel = 'noopener';
      b.style.cssText = 'display:inline-block;padding:7px 10px;background:#e0533a;color:#fff;border-radius:6px;text-decoration:none;font-size:13px';
      b.textContent = '📄 在招投通提取文字';
      var dl = document.createElement('a');
      dl.href = u; dl.target = '_blank'; dl.rel = 'noopener';
      dl.style.cssText = 'display:inline-block;margin-left:6px;padding:7px 10px;background:#f0f0f0;color:#333;border-radius:6px;text-decoration:none;font-size:13px';
      dl.textContent = '直接打开';
      wrap.appendChild(b); wrap.appendChild(dl);
      pdfBox.appendChild(wrap);
    });
  }

  document.getElementById('__grabX').onclick = function(){ box.parentNode.removeChild(box); };
  document.getElementById('__grabCopy').onclick = function(){
    var s = lines.join('\n');
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(s).then(function(){ alert('已复制，去微信/百度粘贴即可'); });
    } else {
      var ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); alert('已复制');
    }
  };
})();
