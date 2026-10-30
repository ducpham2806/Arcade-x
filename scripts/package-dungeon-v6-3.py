import pathlib,zipfile,json,hashlib,shutil,sys
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT.parent/'outputs';OUT.mkdir(exist_ok=True)
html=OUT/'dungeon-titan-equipment-v6-3-playtest.html';patch=OUT/'dungeon-titan-equipment-v6-3-source-patch.zip';pack=OUT/'dungeon-titan-battlefield-v6-assets.zip'
for old,new in [('dungeon-titan-unified-v6-2-playtest.html',html),('dungeon-titan-unified-v6-2-source-patch.zip',patch)]:
 if not new.exists() and (OUT/old).exists():shutil.copy2(OUT/old,new)
html.write_bytes((ROOT/html.name).read_bytes())
files=[]
for folder in ['src/games/dungeon-tap','preview/dungeon','tests/dungeon','docs/dungeon-titan']:
 files.extend(p for p in (ROOT/folder).rglob('*') if p.is_file() and not p.name.endswith('.inspect.ndjson') and p.name!='package-manifest.json')
files.extend(ROOT/'scripts'/s for s in ['export-dungeon-review.mjs','prepare-dungeon-art-v5.py','prepare-dungeon-art-v6.py','package-dungeon-v6-3.py'])
files.extend(p for folder in ['art/dungeon-titan/source-v5','art/dungeon-titan/source-v6'] for p in (ROOT/folder).iterdir() if p.suffix in ['.json','.md'])
files.append(ROOT/html.name)
manifest={'status':'draft, no push/merge/deploy','base_commit':'c143446375eb7bbfa003e75418dad0403d3ce7f2','build':'Dungeon Titan equipment UX v6.3','files':[{'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in sorted(files)]}
mp=ROOT/'docs/dungeon-titan/package-manifest.json';mp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2));files.append(mp)
with zipfile.ZipFile(patch,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(ROOT))
assetfiles=[p for folder in ['art/dungeon-titan/source-v5','art/dungeon-titan/source-v6'] for p in (ROOT/folder).glob('*')]+[p for folder in ['art-v5','art-v6'] for p in (ROOT/'src/games/dungeon-tap/assets'/folder).glob('*.webp')]+[ROOT/'scripts/prepare-dungeon-art-v5.py',ROOT/'scripts/prepare-dungeon-art-v6.py',ROOT/'docs/dungeon-titan/UX-v6.md',ROOT/'docs/dungeon-titan/ART-v5.md',ROOT/'docs/dungeon-titan/INTEGRATION.md']
if '--source-only' not in sys.argv:
 with zipfile.ZipFile(pack,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for p in assetfiles:
   if p.is_file():z.write(p,p.relative_to(ROOT))
for p in [patch,pack]:
 with zipfile.ZipFile(p) as z:assert z.testzip() is None
print(json.dumps([{'path':str(p),'bytes':p.stat().st_size} for p in [html,patch,pack]],indent=2))
