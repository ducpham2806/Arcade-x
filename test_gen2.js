function generateShikaku(size, maxBlockArea) {
  let rects = [{ r: 0, c: 0, w: size, h: size }];
  let splitted = true;
  while (splitted) {
    splitted = false;
    const nextRects = [];
    for (const r of rects) {
      if (r.w * r.h > maxBlockArea || (r.w * r.h > 2 && Math.random() < (r.w * r.h) / (maxBlockArea * 1.5))) {
        let splitHoriz = Math.random() > 0.5;
        if (r.w === 1) splitHoriz = true;
        if (r.h === 1) splitHoriz = false;

        if (splitHoriz && r.h > 1) {
          const splitPoint = Math.floor(Math.random() * (r.h - 1)) + 1;
          nextRects.push({ r: r.r, c: r.c, w: r.w, h: splitPoint });
          nextRects.push({ r: r.r + splitPoint, c: r.c, w: r.w, h: r.h - splitPoint });
          splitted = true;
        } else if (!splitHoriz && r.w > 1) {
          const splitPoint = Math.floor(Math.random() * (r.w - 1)) + 1;
          nextRects.push({ r: r.r, c: r.c, w: splitPoint, h: r.h });
          nextRects.push({ r: r.r, c: r.c + splitPoint, w: r.w - splitPoint, h: r.h });
          splitted = true;
        } else {
          nextRects.push(r);
        }
      } else {
        nextRects.push(r);
      }
    }
    rects = nextRects;
  }
  return rects;
}

for(let i = 0; i<10; i++) {
  const rects = generateShikaku(10, 24);
  console.log(rects.map(r => r.w * r.h).sort((a,b)=>b-a).slice(0, 5));
}
