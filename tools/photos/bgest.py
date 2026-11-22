import numpy as np
from recolor import smooth
def boxblur(x, r):
    # x: HxW or HxWxC, box blur radius r via integral image, edge-normalised
    pad=np.pad(x,((r+1,r),(r+1,r))+((0,0),)*(x.ndim-2),mode='edge')
    c=pad.cumsum(0).cumsum(1)
    k=2*r+1
    return (c[k:,k:]-c[:-k,k:]-c[k:,:-k]+c[:-k,:-k])/(k*k)
def pushpull(a, w):
    """Fill pixels where w==0 from their surroundings, coarse to fine."""
    levels=[(a*w[...,None], w)]
    while min(levels[-1][1].shape)>4:
        v,ww=levels[-1]
        h,wd=ww.shape; h2,w2=h//2*2,wd//2*2
        v=v[:h2,:w2]; ww=ww[:h2,:w2]
        v=(v[0::2,0::2]+v[1::2,0::2]+v[0::2,1::2]+v[1::2,1::2])
        ww=(ww[0::2,0::2]+ww[1::2,0::2]+ww[0::2,1::2]+ww[1::2,1::2])
        levels.append((v,ww))
    v,ww=levels[-1]
    cur=v/np.maximum(ww,1e-6)[...,None]
    for v,ww in reversed(levels[:-1]):
        up=np.repeat(np.repeat(cur,2,0),2,1)
        up=np.pad(up,((0,v.shape[0]-up.shape[0]),(0,v.shape[1]-up.shape[1]),(0,0)),mode='edge')
        up=boxblur(up,1)
        own=v/np.maximum(ww,1e-6)[...,None]
        k=np.clip(ww,0,1)[...,None]
        cur=own*k+up*(1-k)
    return cur

def local_bg(img, r=40, passes=3, thr=0.035, grow=12):
    """Estimate a clean background under the object by masked normalised blur."""
    a=img.astype(np.float32)/255
    w=np.ones(a.shape[:2],np.float32)
    B=None
    for _ in range(passes):
        num=boxblur(a*w[...,None],r); den=boxblur(w,r)[...,None]
        B=num/np.maximum(den,1e-4)
        # smooth twice more for a soft plate
        B=boxblur(boxblur(B,r//2),r//2)
        diff=np.abs(a-B).max(-1)
        obj=(diff>thr).astype(np.float32)
        obj=(boxblur(obj,grow)>0.01).astype(np.float32)   # dilate
        w=1-obj
    # final: fill holes with larger radius
    num=boxblur(a*w[...,None],r*3); den=boxblur(w,r*3)[...,None]
    Bfill=num/np.maximum(den,1e-4)
    num=boxblur(a*w[...,None],r); den=boxblur(w,r)[...,None]
    Bl=num/np.maximum(den,1e-4)
    cov=np.clip(boxblur(w,r)[...,None]*3,0,1)
    B=Bl*cov+Bfill*(1-cov)
    return boxblur(boxblur(B,8),8)

def polyfit_bg(img, deg=4, iters=4):
    """Surface polynomiale lisse ajustée au fond, en écartant l'objet."""
    h, w, _ = img.shape
    s = 8
    small = img[::s, ::s].astype(np.float32) / 255
    sh, sw = small.shape[:2]
    def design(X, Y):
        return np.stack([X**i * Y**j for i in range(deg + 1) for j in range(deg + 1 - i)], 1)
    ys, xs = np.mgrid[0:sh, 0:sw]
    A = design((xs / sw * 2 - 1).ravel(), (ys / sh * 2 - 1).ravel())
    flat = small.reshape(-1, 3)
    m = np.ones(len(flat), bool)
    for _ in range(iters):
        coef = [np.linalg.lstsq(A[m], flat[m, c], rcond=None)[0] for c in range(3)]
        fit = np.stack([A @ cf for cf in coef], 1)
        m = np.abs(flat - fit).max(1) < 0.025
    yy, xx = np.mgrid[0:h, 0:w]
    Af = design((xx / s / sw * 2 - 1).ravel(), (yy / s / sh * 2 - 1).ravel())
    return np.clip(np.stack([Af @ cf for cf in coef], 1).reshape(h, w, 3), 0, 1)
