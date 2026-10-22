"""Analyze generated alpha, cut and package new troop sprites with ImageMagick."""
import pathlib,json,subprocess,shutil
import numpy as np
from PIL import Image
from scipy import ndimage
R=pathlib.Path(__file__).resolve().parents[1];S=R/'art-source-v6';O=R/'src/games/dungeon-tap/assets/art-v6';T=R/'.art-v6-build'
O.mkdir(parents=True,exist_ok=True);T.mkdir(exist_ok=True)
def run(*a):subprocess.run(list(map(str,a)),check=True,stdout=subprocess.DEVNULL)
manifest=[]
for id,path in json.loads((S/'generation-sources.json').read_text()).items():
 src=S/(id+'.png')
 if pathlib.Path(path).exists() and pathlib.Path(path)!=src:shutil.copyfile(path,src)
 im=Image.open(src).convert('RGBA');a=np.array(im.getchannel('A'));w,h=im.size;bounds=[];masks=[]
 for row in range(2):
  for col in range(3):
   x=round(w*col/3);y=round(h*row/2);x1=round(w*(col+1)/3);y1=round(h*(row+1)/2);mask=ndimage.binary_dilation(a[y:y1,x:x1]>24,iterations=2);labels,n=ndimage.label(mask);sizes=np.bincount(labels.ravel());sizes[0]=0;ys,xs=np.where(labels==sizes.argmax())
   assert len(xs)>20,(id,row,col)
   bounds.append((x+int(xs.min()),y+int(ys.min()),int(xs.max()-xs.min()+1),int(ys.max()-ys.min()+1)));masks.append((labels==sizes.argmax())[ys.min():ys.max()+1,xs.min():xs.max()+1])
 scales=[min(162/max(bounds[i][2],bounds[i+3][2]),162/max(bounds[i][3],bounds[i+3][3])) for i in range(3)]
 frames=[]
 for i,(x,y,ww,hh) in enumerate(bounds):
  scale=scales[i%3];p=T/f'{id}-{i}.png';crop=T/f'{id}-{i}-crop.png';mask=T/f'{id}-{i}-component.pgm';alpha=T/f'{id}-{i}-alpha.png'
  # PGM is an analysis mask: preserve the source RGBA and discard detached neighboring islands.
  mask.write_bytes(f'P5\n{ww} {hh}\n255\n'.encode()+((masks[i].astype(np.uint8))*255).tobytes())
  run('convert',src,'-crop',f'{ww}x{hh}+{x}+{y}','+repage',crop)
  run('convert',crop,'-alpha','extract',mask,'-compose','Multiply','-composite',alpha)
  run('convert',crop,alpha,'-alpha','off','-compose','CopyOpacity','-composite','-compose','Over','-resize',f'{round(ww*scale)}x{round(hh*scale)}!','-background','none','-gravity','south','-extent','192x176','-gravity','north','-extent','192x192',p);frames.append(p)
 target=O/(id+'.webp');run('montage',*frames,'-background','none','-tile','3x2','-geometry','192x192+0+0','-quality','85',target)
 aa=np.array(Image.open(target).convert('RGBA').getchannel('A'))
 for row in range(2):
  for col in range(3):
   q=aa[row*192:(row+1)*192,col*192:(col+1)*192];assert max(q[0].max(),q[-1].max(),q[:,0].max(),q[:,-1].max())<20,(id,'gutter')
 manifest.append({'id':id,'file':target.name,'cols':3,'rows':2,'cell':[192,192],'sourceRects':bounds,'bytes':target.stat().st_size})
(S/'atlas-manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({'sheets':len(manifest),'cells':len(manifest)*6,'bytes':sum(x['bytes'] for x in manifest)}))
