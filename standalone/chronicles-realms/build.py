from pathlib import Path
import json,base64,shutil,zipfile
root=Path(__file__).resolve().parent
p=root/'dist';assets=p/'assets'
d={'levels':json.loads((assets/'levels.json').read_text()),'atlas':json.loads((assets/'atlas_all.json').read_text()),'skins':json.loads((assets/'skins_catalog.json').read_text())}
(p/'data.js').write_text('window.REALMS_DATA='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n')
d['images']={k:'data:image/png;base64,'+base64.b64encode((assets/a['image']).read_bytes()).decode() for k,a in d['atlas']['sheets'].items()}
html=(p/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(p/'style.css').read_text()+'</style>')
html=html.replace('<script src="data.js"></script>','<script>window.REALMS_DATA='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';</script>')
for name in ['engine.js','app.js','contrast.js']:html=html.replace(f'<script src="{name}"></script>','<script>'+(p/name).read_text()+'</script>')
out=root.parent/'chronicles-shattered-realms-playtest-v2.html';out.write_text(html)
print('Offline game:',out.name,out.stat().st_size,'bytes')
