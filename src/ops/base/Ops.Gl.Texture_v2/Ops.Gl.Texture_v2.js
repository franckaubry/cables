const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif"]),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"]),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),
    aniso = op.inSwitch("Anisotropic", ["0", "1", "2", "4", "8", "16"], "0"),
    flip = op.inValueBool("Flip", false),
    unpackAlpha = op.inValueBool("Pre Multiplied Alpha", false),
    active = op.inValueBool("Active", true),
    inFreeMemory = op.inBool("Save Memory", true),
    textureOut = op.outTexture("Texture"),
    width = op.outNumber("Width"),
    height = op.outNumber("Height"),
    ratio = op.outNumber("Aspect Ratio"),
    loaded = op.outNumber("Loaded", false),
    loading = op.outNumber("Loading", false);

op.setPortGroup("Size", [width, height]);

unpackAlpha.setUiAttribs({ "hidePort": true });

op.toWorkPortsNeedToBeLinked(textureOut);

const cgl = op.patch.cgl;

let loadedFilename = null;
let loadingId = null;
let tex = null;
let cgl_filter = CGL.Texture.FILTER_MIPMAP;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let cgl_aniso = 0;
let timedLoader = 0;

filename.onChange = flip.onChange = function () { reloadSoon(); };
aniso.onChange = tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;
unpackAlpha.onChange = function () { reloadSoon(); };

tfilter.set("mipmap");
wrap.set("repeat");

textureOut.set(CGL.Texture.getEmptyTexture(cgl));

active.onChange = function ()
{
    if (active.get())
    {
        if (loadedFilename != filename.get() || !tex) reloadSoon();
        else textureOut.set(tex);
    }
    else
    {
        textureOut.set(CGL.Texture.getEmptyTexture(cgl));
        width.set(CGL.Texture.getEmptyTexture(cgl).width);
        height.set(CGL.Texture.getEmptyTexture(cgl).height);
        if (tex)tex.delete();
        op.setUiAttrib({ "extendTitle": "" });
        tex = null;
    }
};

const setTempTexture = function ()
{
    const t = CGL.Texture.getTempTexture(cgl);
    textureOut.set(t);
};

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function ()
    {
        realReload(nocache);
    }, 30);
}

function realReload(nocache)
{
    if (!active.get()) return;
    // if (filename.get() === null) return;
    if (loadingId)loadingId = cgl.patch.loading.finished(loadingId);
    loadingId = cgl.patch.loading.start("textureOp", filename.get(), op);

    let url = op.patch.getFilePath(String(filename.get()));

    if (nocache)url += "?rnd=" + CABLES.uuid();

    if (String(filename.get()).indexOf("data:") == 0) url = filename.get();

    let needsRefresh = false;
    if (loadedFilename != filename.get()) needsRefresh = true;
    loadedFilename = filename.get();

    if ((filename.get() && filename.get().length > 1))
    {
        loaded.set(false);
        loading.set(true);

        const fileToLoad = filename.get();

        op.setUiAttrib({ "extendTitle": CABLES.basename(url) });
        if (needsRefresh) op.refreshParams();

        cgl.patch.loading.addAssetLoadingTask(() =>
        {
            op.setUiError("urlerror", null);

            CGL.Texture.load(cgl, url,
                function (err, newTex)
                {
                    if (filename.get() != fileToLoad)
                    {
                        cgl.patch.loading.finished(loadingId);
                        loadingId = null;
                        return;
                    }

                    if (err)
                    {
                        setTempTexture();
                        op.setUiError("urlerror", "could not load texture: \"" + filename.get() + "\"", 2);
                        cgl.patch.loading.finished(loadingId);
                        loadingId = null;
                        return;
                    }

                    textureOut.set(newTex);

                    width.set(newTex.width);
                    height.set(newTex.height);
                    ratio.set(newTex.width / newTex.height);

                    // if (!newTex.isPowerOfTwo()) op.setUiError("npot", "Texture dimensions not power of two! - Texture filtering will not work in WebGL 1.", 0);
                    // else op.setUiError("npot", null);

                    if (tex)tex.delete();
                    tex = newTex;
                    // textureOut.set(null);
                    textureOut.setRef(tex);

                    loading.set(false);
                    loaded.set(true);

                    if (inFreeMemory.get()) tex.image = null;

                    if (loadingId)
                    {
                        cgl.patch.loading.finished(loadingId);
                        loadingId = null;
                    }
                }, {
                    "anisotropic": cgl_aniso,
                    "wrap": cgl_wrap,
                    "flip": flip.get(),
                    "unpackAlpha": unpackAlpha.get(),
                    "filter": cgl_filter
                });

            // textureOut.set(null);
            // textureOut.set(tex);
        });
    }
    else
    {
        cgl.patch.loading.finished(loadingId);
        loadingId = null;
        setTempTexture();
    }
}

function onFilterChange()
{
    if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
    else if (tfilter.get() == "Anisotropic") cgl_filter = CGL.Texture.FILTER_ANISOTROPIC;

    cgl_aniso = parseFloat(aniso.get());

    reloadSoon();
}

function onWrapChange()
{
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reloadSoon();
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1)
    {
        textureOut.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
        textureOut.set(CGL.Texture.getTempTexture(cgl));
        realReload(true);
    }
};
