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

  function deepScan(){
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll('iframe[src],embed[src],object[data],frame[src]'), function(el){
      var h = el.src || el.data || ''; if(h) out.push(h);
    });
    var keys = ['pdfUrl','pdfURL','fileUrl','fileURL','bulletinFileUrl','downloadUrl','downloadURL','attachmentUrl','filePath','pdfPath','src'];
    keys.forEach(function(k){
      try { if(window[k] && typeof window[k]==='string' && /^https?:/.test(window[k])) out.push(window[k]); }catch(e){}
    });
    Array.prototype.forEach.call(document.querySelectorAll('*'), function(el){
      ['data-src','data-url','data-pdf','data-file','data-path','data-original','ng-src','pdf-src','file-src'].forEach(function(k){
        var v = el.getAttribute(k); if(v && /^https?:/.test(v)) out.push(v);
      });
    });
    var html = document.documentElement.innerHTML;
    var m = html.match(/https?:\/\/[^\s\"<>]+/g);
    if(m) m.forEach(function(u){ if(/\.(pdf|doc|docx|xls|xlsx)($|[?#])/i.test(u) && out.indexOf(u)<0) out.push(u); });
    var host = location.hostname;
    if(/ctbpsp\.com|cebpubservice\.com/i.test(host)){
      var mu = location.href.match(/[?&]uuid=([^&#]+)/);
      if(mu){
        var uid = decodeURIComponent(mu[1]);
        out.push('https://bulletin.cebpubservice.com/bulletin/' + uid);
      }
    }
    return out;
  }

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
    + '<button id="__grabDeep" style="width:100%;padding:9px;background:#fff;color:#e0533a;border:2px solid #e0533a;border-radius:6px;cursor:pointer;font-size:14px;margin-bottom:10px">🔍 深度扫描 PDF 来源</button>'
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

  function extractViewerText(viewerUrl, onDone, onErr){
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;border:none;';
    iframe.src = viewerUrl;
    document.body.appendChild(iframe);
    var tries = 0;
    var timer = setInterval(function(){
      try {
        var win = iframe.contentWindow;
        var app = win.PDFViewerApplication;
        if(app && app.pdfDocument && app.pagesLoaded){
          clearInterval(timer);
          var pdf = app.pdfDocument;
          var pages = [];
          for(var i=1; i<=pdf.numPages; i++) pages.push(i);
          Promise.all(pages.map(function(pi){
            return pdf.getPage(pi).then(function(page){
              return page.getTextContent().then(function(tc){
                var strs = [];
                tc.items.forEach(function(it){ strs.push(it.str); if(it.hasEOL) strs.push('\n'); });
                return {n: page.pageNumber, t: strs.join('')};
              });
            });
          })).then(function(results){
            results.sort(function(a,b){ return a.n - b.n; });
            var full = [];
            results.forEach(function(r){ full.push('【第' + r.n + '页】\n' + r.t); });
            onDone(full.join('\n\n'));
            try { document.body.removeChild(iframe); } catch(e){}
          }).catch(function(e){ onErr(e.message || '提取失败'); });
          return;
        }
      } catch(e){}
      tries++;
      if(tries > 90){
        clearInterval(timer);
        onErr('PDF 加载超时，可能是链接需要登录态');
        try { document.body.removeChild(iframe); } catch(e){}
      }
    }, 1000);
  }

  document.getElementById('__grabX').onclick = function(){ box.parentNode.removeChild(box); };
  document.getElementById('__grabDeep').onclick = function(){
    var candidates = deepScan();
    var deepBox = document.getElementById('__grabDeepBox');
    if(!deepBox){
      deepBox = document.createElement('div'); deepBox.id = '__grabDeepBox'; deepBox.style.marginTop = '12px';
      pdfBox.parentNode.insertBefore(deepBox, pdfBox.nextSibling);
    }
    if(!candidates.length){
      deepBox.innerHTML = '<b style="color:#888">🔍 深度扫描结果</b><div style="color:#999;font-size:12px;margin-top:6px">没扫到可疑 PDF 链接。<br>如果页面有下载按钮，点下载后复制新标签页的 PDF 地址，手动贴到：<br><a href="https://zhaotoutong.chzfd.com/pdf.html" target="_blank" rel="noopener">https://zhaotoutong.chzfd.com/pdf.html</a></div>';
      return;
    }
    var html = '<b style="color:#e0533a">🔍 深度扫描结果</b><div style="color:#666;font-size:12px;margin:4px 0 6px">以下是从 iframe / data-* / 脚本里扫到的可疑链接：</div>';
    candidates.forEach(function(u){
      var isSameViewer = false;
      try { isSameViewer = (u.indexOf('/pdfjs-dist/web/viewer.html') !== -1 || u.indexOf('/web/viewer.html') !== -1) && u.indexOf('?file=') !== -1 && u.indexOf(location.origin) === 0; } catch(e){}
      if(isSameViewer){
        html += '<div style="margin-top:8px"><button data-vu="' + u.replace(/"/g,'&quot;') + '" class="__grabViewBtn" style="padding:7px 10px;background:#e0533a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">📄 在当前页提取 PDF 文字</button><a href="' + u.replace(/"/g,'&quot;') + '" target="_blank" rel="noopener" style="display:inline-block;margin-left:6px;padding:7px 10px;background:#f0f0f0;color:#333;border-radius:6px;text-decoration:none;font-size:13px">打开查看器</a><div style="color:#999;font-size:11px;word-break:break-all;margin-top:2px">' + u + '</div></div>';
      } else {
        html += '<div style="margin-top:8px"><a href="https://zhaotoutong.chzfd.com/pdf.html?url=' + encodeURIComponent(u) + '" target="_blank" rel="noopener" style="display:inline-block;padding:7px 10px;background:#e0533a;color:#fff;border-radius:6px;text-decoration:none;font-size:13px">📄 提取文字</a><a href="' + u.replace(/"/g,'&quot;') + '" target="_blank" rel="noopener" style="display:inline-block;margin-left:6px;padding:7px 10px;background:#f0f0f0;color:#333;border-radius:6px;text-decoration:none;font-size:13px">直接打开</a><div style="color:#999;font-size:11px;word-break:break-all;margin-top:2px">' + u + '</div></div>';
      }
    });
    html += '<div id="__grabViewRes" style="margin-top:10px"></div>';
    deepBox.innerHTML = html;
    Array.prototype.forEach.call(deepBox.querySelectorAll('.__grabViewBtn'), function(btn){
      btn.onclick = function(){
        var vu = btn.getAttribute('data-vu');
        var resBox = document.getElementById('__grabViewRes');
        resBox.innerHTML = '<div style="color:#e0533a;font-size:13px">正在后台加载 PDF 并提取文字，请稍候…</div>';
        extractViewerText(vu, function(text){
          resBox.innerHTML = '<div style="margin-bottom:6px"><b style="color:#e0533a">提取成功</b> <button id="__grabCpTxt" style="padding:4px 10px;background:#e0533a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">复制全部</button></div><textarea id="__grabResTa" style="width:100%;height:220px;border:1px solid #ddd;border-radius:6px;padding:8px;font-size:13px;white-space:pre-wrap;word-break:break-all">' + text.replace(/</g,'&lt;').replace(/&/g,'&amp;') + '</textarea>';
          document.getElementById('__grabCpTxt').onclick = function(){
            var ta = document.getElementById('__grabResTa');
            if(navigator.clipboard && navigator.clipboard.writeText){
              navigator.clipboard.writeText(ta.value).then(function(){ alert('已复制'); });
            } else {
              ta.select(); document.execCommand('copy'); alert('已复制');
            }
          };
        }, function(err){
          resBox.innerHTML = '<div style="color:#c0392b;font-size:13px">提取失败：' + err + '<br>可点「打开查看器」手动用文本选择工具复制。</div>';
        });
      };
    });
  };
  document.getElementById('__grabCopy').onclick = function(){
    var s = lines.join('\n');
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(s).then(function(){ alert('已复制，去微信/百度粘贴即可'); });
    } else {
      var ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); alert('已复制');
    }
  };
})();
