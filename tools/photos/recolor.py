import sys, numpy as np
from PIL import Image
def smooth(e0,e1,x):
    t=np.clip((x-e0)/(e1-e0),0,1); return t*t*(3-2*t)
PRESETS={
 # target hue (deg), sat mult, value mult, value gamma
 'orange':(21,1.0,1.28,1.0),
 'brun':(27,0.62,0.62,1.0),
}
def recolor(rgb, preset):
    h_t,sm,vm,g=PRESETS[preset]
    a=rgb.astype(np.float32)/255
    r,gg,b=a[...,0],a[...,1],a[...,2]
    mx=a.max(-1); mn=a.min(-1); d=mx-mn+1e-6
    h=np.where(mx==r,((gg-b)/d)%6,np.where(mx==gg,(b-r)/d+2,(r-gg)/d+4))*60
    s=d/(mx+1e-6); v=mx
    w=smooth(0.12,0.30,s)*(1-smooth(28,48,np.abs(h-228)))*smooth(0.06,0.14,v)
    s2=np.clip(s*sm,0,1); v2=np.clip((v**g)*vm,0,1)
    # rebuild hsv->rgb with target hue
    hh=h_t/60; i=int(hh)%6; f=hh-int(hh)
    p=v2*(1-s2); q=v2*(1-s2*f); t=v2*(1-s2*(1-f))
    order={0:(v2,t,p),1:(q,v2,p),2:(p,v2,t),3:(p,q,v2),4:(t,p,v2),5:(v2,p,q)}[i]
    new=np.stack(order,-1)
    out=a*(1-w[...,None])+new*w[...,None]
    return (np.clip(out,0,1)*255+.5).astype(np.uint8)
if __name__=='__main__':
    src,preset,dst=sys.argv[1:4]
    im=Image.open(src).convert('RGB')
    Image.fromarray(recolor(np.array(im),preset)).save(dst)
