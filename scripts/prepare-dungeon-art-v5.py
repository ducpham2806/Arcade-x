"""Read-only image analysis and ImageMagick atlas packaging."""
import json,pathlib,subprocess,shutil
import numpy as np
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
SRC=ROOT/'art-source-v5';OUT=ROOT/'src/games/dungeon-tap/assets/art-v5';TMP=ROOT/'.art-v5-build'
OUT.mkdir(parents=True,exist_ok=True);TMP.mkdir(exist_ok=True)
sources=json.loads((SRC/'generation-sources.json').read_text())
BOSSES=['goblin','skeleton','spider','vampire','dragon','frost','thunder','void']
def run(*args):subprocess.run(list(map(str,args)),check=True,stdout=subprocess.DEVNULL)
def cuts(proj,n):
 length=len(proj);step=length/n;out=[0];sm=np.convolve(proj,np.ones(3)/3,mode='same')
 for i in range(1,n):
  center=step*i;lo=int(center-step*.20);hi=int(center+step*.20);xs=np.arange(lo,hi)
  score=sm[lo:hi]+abs(xs-center)/step*max(1,proj.max())*.035
  out.append(int(xs[np.argmin(score)]))
 return out+[length]
manifest=[]
for id,path in sources.items():
 src=SRC/(id+'.png')
 if pathlib.Path(path).exists():shutil.copyfile(path,src)
 if not src.exists():raise FileNotFoundError(src)
 if id in ['ice-spirit','snow-warrior','ice-witch']:continue
 im=Image.open(src).convert('RGBA');w,h=im.size;alpha=np.array(im.getchannel('A'))
 if id.startswith('worlds'):
  offset=0 if id.endswith('a') else 4
  for i in range(4):
   x=(i%2)*w//2;y=(i//2)*h//2;target=OUT/f'world-{offset+i+1}.webp'
   run('convert',src,'-crop',f'{w//2}x{h//2}+{x}+{y}','+repage','-resize','512x768!','-quality','82',target)
   manifest.append({'id':f'world-{offset+i+1}','file':target.name,'cols':1,'rows':1,'cell':[512,768],'bytes':target.stat().st_size})
  continue
 if id in BOSSES:cols,rows,size=4,2,256
 elif id.startswith('party'):cols,rows,size=4,4 if id.endswith('a') else 3,192
 elif id=='enemies-c':cols,rows,size=4,3,192
 elif id.startswith('enemies'):cols,rows,size=2,6,192
 elif id=='gear':cols,rows,size=6,4,128
 elif id=='ui':cols,rows,size=6,6,128
 elif id=='spells':cols,rows,size=5,5,128
 else:cols,rows,size=4,3,192
 yc=cuts((alpha>24).sum(axis=1),rows);frames=[];bounds=[]
 for r in range(rows):
  xc=cuts((alpha[yc[r]:yc[r+1]]>24).sum(axis=0),cols)
  for c in range(cols):
   x,y=xc[c],yc[r];cw,ch=xc[c+1]-x,yc[r+1]-y;a=alpha[y:y+ch,x:x+cw];ys,xs=np.where(a>24)
   if not len(xs):raise ValueError((id,r,c,'empty'))
   xx,yy=max(0,int(xs.min())-2),max(0,int(ys.min())-2)
   ww=min(cw,int(xs.max())+3)-xx;hh=min(ch,int(ys.max())+3)-yy
   bounds.append([x+xx,y+yy,ww,hh])
 groups=[bounds] if id in BOSSES else [bounds[i:i+(2 if id.startswith('enemies') else cols)] for i in range(0,len(bounds),2 if id.startswith('enemies') else cols)] if id.startswith(('party','enemies')) else [[b] for b in bounds]
 scales=[]
 for group in groups:
  scale=min(size*.84/max(b[2] for b in group),size*.84/max(b[3] for b in group));scales.extend([scale]*len(group))
 for i,(b,scale) in enumerate(zip(bounds,scales)):
  x,y,bw,bh=b;rw=max(1,round(bw*scale));rh=max(1,round(bh*scale));frame=TMP/f'{id}-{i:02}.png'
  gravity='south' if id in BOSSES or id.startswith(('party','enemies')) else 'center'
  run('convert',src,'-crop',f'{bw}x{bh}+{x}+{y}','+repage','-resize',f'{rw}x{rh}!','-background','none','-gravity',gravity,'-extent',f'{size}x{int(size*.92) if gravity=="south" else size}','-gravity','north','-extent',f'{size}x{size}',frame)
  frames.append(frame)
 target=OUT/(id+'.webp')
 run('montage',*frames,'-background','none','-tile',f'{cols}x{rows}','-geometry',f'{size}x{size}+0+0','-quality','84',target)
 manifest.append({'id':id,'file':target.name,'cols':cols,'rows':rows,'cell':[size,size],'sourceSize':[w,h],'sourceRects':bounds,'bytes':target.stat().st_size})
(SRC/'atlas-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'sheets':len(manifest),'frames':sum(x['cols']*x['rows'] for x in manifest),'bytes':sum(x['bytes'] for x in manifest),'maxSheetBytes':max(x['bytes'] for x in manifest)},indent=2))

# Independently authored frost pairs replace tight source atlas rows.
for number,name in enumerate(['ice-spirit','snow-warrior','ice-witch']):
 if name not in sources:continue
 source=SRC/(name+'.png')
 image=Image.open(source).convert('RGBA');aa=np.array(image.getchannel('A'));hh,ww=aa.shape
 split=cuts((aa>24).sum(axis=0),2);pair=[]
 for j in range(2):
  xx=split[j];cell=aa[:,xx:split[j+1]];ys,xs=np.where(cell>24)
  x=xx+max(0,int(xs.min())-2);y=max(0,int(ys.min())-2);w=min(split[j+1]-x,int(xs.max()-xs.min())+5);h=min(hh-y,int(ys.max()-ys.min())+5);pair.append((x,y,w,h))
 scale=min(192*.84/max(b[2] for b in pair),192*.84/max(b[3] for b in pair))
 for j,(x,y,w,h) in enumerate(pair):
  frame=TMP/f'enemies-c-{6+number*2+j:02}.png'
  run('convert',source,'-crop',f'{w}x{h}+{x}+{y}','+repage','-resize',f'{round(w*scale)}x{round(h*scale)}!','-background','none','-gravity','south','-extent','192x176','-gravity','north','-extent','192x192',frame)
 if number==2:
  target=OUT/'enemies-c.webp';run('montage',*[TMP/f'enemies-c-{i:02}.png' for i in range(12)],'-background','none','-tile','4x3','-geometry','192x192+0+0','-quality','84',target)
  record=next(x for x in manifest if x['id']=='enemies-c');record['bytes']=target.stat().st_size;record['supplementalSources']={'6,7':'ice-spirit.png','8,9':'snow-warrior.png','10,11':'ice-witch.png'}
  (SRC/'atlas-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
