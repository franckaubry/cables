

var CGL=CGL || {};

CGL.Framebuffer2=function(cgl,w,h,options)
{
    this._cgl=cgl;

    this._width = 0;
    this._height = 0;

    this._depthRenderbuffer=null;
    this._frameBuffer=null;
    this._colorFrameBuffer=null;
    this._colorRenderbuffers=[];
    this._colorAttachments=[];
    

    this._options=options ||
        {
            "isFloatingPointTexture":false

        };

    
    if(!this._options.hasOwnProperty("numRenderBuffers"))this._options.numRenderBuffers=1;
    if(!this._options.hasOwnProperty("depth"))this._options.depth=true;
    if(!this._options.hasOwnProperty("clear"))this._options.clear=true;

    if(!this._options.hasOwnProperty("multisampling"))
    {
        this._options.multisampling=false;
        this._options.multisamplingSamples=0;
    }

    if(!this._options.hasOwnProperty('filter')) this._options.filter=CGL.Texture.FILTER_LINEAR;

    this._numRenderBuffers=this._options.numRenderBuffers;
    this._colorTextures=[];

    for(var i=0;i<this._numRenderBuffers;i++)
    {
        this._colorTextures[i]=new CGL.Texture(cgl,
            {
                "name":"framebuffer2 texture "+i,
                "isFloatingPointTexture":this._options.isFloatingPointTexture,
                "filter":this._options.filter,
                "wrap":this._options.wrap
            });
    }


    var fil=CGL.Texture.FILTER_NEAREST;
    if(this._options.shadowMap)fil=CGL.Texture.FILTER_LINEAR;

    this._textureDepth=new CGL.Texture(cgl,
        {
            "name":"framebuffer2 depth texture",
            "isDepthTexture":true,
            "filter":fil,
            "shadowMap":this._options.shadowMap||false
        });

    this.setSize(w||512 ,h||512);

};

CGL.Framebuffer2.prototype.getWidth=function(){ return this._width; };
CGL.Framebuffer2.prototype.getHeight=function(){ return this._height; };

CGL.Framebuffer2.prototype.getGlFrameBuffer=function()
{
    return this._frameBuffer;
}

CGL.Framebuffer2.prototype.getDepthRenderBuffer=function()
{
    return this._depthRenderbuffer;
}
CGL.Framebuffer2.prototype.getTextureColor=function()
{
    return this._colorTextures[0];
};

CGL.Framebuffer2.prototype.getTextureColorNum=function(i)
{
    return this._colorTextures[i];
};

CGL.Framebuffer2.prototype.getTextureDepth=function()
{
    return this._textureDepth;
};

CGL.Framebuffer2.prototype.setFilter=function(f)
{
    for(var i=0;i<this._numRenderBuffers;i++)
    {
        this._colorTextures[i].filter=f;
        this._colorTextures[i].setSize(this._width,this._height);
    }
};

CGL.Framebuffer2.prototype.delete=
CGL.Framebuffer2.prototype.dispose=function()
{
    for(var i=0;i<this._numRenderBuffers;i++) this._colorTextures[i].delete();
    // this._texture.delete();
    this._textureDepth.delete();
    for(var i=0;i<this._numRenderBuffers;i++) this._cgl.gl.deleteRenderbuffer(this._colorRenderbuffers[i]);
    this._cgl.gl.deleteRenderbuffer(this._depthRenderbuffer);
    this._cgl.gl.deleteFramebuffer(this._frameBuffer);
    this._cgl.gl.deleteFramebuffer(this._colorFrameBuffer);
};


CGL.Framebuffer2.prototype.setSize=function(w,h)
{
    this._width=Math.floor(w);
    this._height=Math.floor(h);

    CGL.profileFrameBuffercreate++;

    if(this._frameBuffer)
    {
        for(var i=0;i<this._numRenderBuffers;i++) this._cgl.gl.deleteRenderbuffer(this._colorRenderbuffers[i]);
        // this._cgl.gl.deleteRenderbuffer(this._colorRenderbuffer);
        this._cgl.gl.deleteRenderbuffer(this._depthRenderbuffer);
        this._cgl.gl.deleteFramebuffer(this._frameBuffer);
        this._cgl.gl.deleteFramebuffer(this._colorFrameBuffer);
    }

    this._frameBuffer=this._cgl.gl.createFramebuffer();
    this._colorFrameBuffer=this._cgl.gl.createFramebuffer();

    var depth=this._options.depth;
    
    
    for(var i=0;i<this._numRenderBuffers;i++)
    {
        this._colorTextures[i].setSize(this._width,this._height);
    }
        

    if(depth) this._textureDepth.setSize(this._width,this._height);


    if(depth) this._depthRenderbuffer = this._cgl.gl.createRenderbuffer();
    for(var i=0;i<this._numRenderBuffers;i++)
    {
        var renderBuffer = this._cgl.gl.createRenderbuffer();

        //color renderbuffer
        var ext = this._cgl.gl.getExtension('EXT_color_buffer_float');
    
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuffer);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, renderBuffer);
    
        if(this._options.isFloatingPointTexture)
        {
            if(this._options.multisampling)
                this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, this._options.multisamplingSamples, this._cgl.gl.RGBA32F, this._width, this._height);
                else this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.RGBA32F, this._width, this._height);
        }
        else if(this._options.multisampling)
        {
            this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, this._options.multisamplingSamples, this._cgl.gl.RGBA8, this._width, this._height);
        }
        else
        {
            this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.RGBA8, this._width, this._height);
        }
    
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0+i, this._cgl.gl.RENDERBUFFER, renderBuffer);
        this._colorRenderbuffers[i]=renderBuffer;
    }
    

    // depth renderbuffer

    if(depth)
    {
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthRenderbuffer);
        if(this._options.isFloatingPointTexture)
        {
            if(this._options.multisampling)
                this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, this._options.multisamplingSamples,this._cgl.gl.DEPTH_COMPONENT32F, this._width,this._height);
                    else this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.DEPTH_COMPONENT32F, this._width, this._height);
        }
        else if(this._options.multisampling)
        {
            this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, this._options.multisamplingSamples,this._cgl.gl.DEPTH_COMPONENT32F, this._width,this._height);
        }
        else
        {
            this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.DEPTH_COMPONENT32F, this._width, this._height);
        }

        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthRenderbuffer);
    }
    
    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._colorFrameBuffer);
    
    this._colorAttachments.length=0;

    for(var i=0;i<this._numRenderBuffers;i++)
    {
        this._colorAttachments.push(this._cgl.gl.COLOR_ATTACHMENT0+i);
        // this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0+i, this._cgl.gl.TEXTURE_2D, this._colorTextures[i].tex, 0);
    }

    if(depth)
    {
        this._cgl.gl.framebufferTexture2D(
            this._cgl.gl.FRAMEBUFFER,
            this._cgl.gl.DEPTH_ATTACHMENT,
            this._cgl.gl.TEXTURE_2D,
            this._textureDepth.tex,
            0 );
    }

    if (!this._cgl.gl.isFramebuffer(this._colorFrameBuffer)) throw("Invalid framebuffer");
    var status = this._cgl.gl.checkFramebufferStatus(this._cgl.gl.FRAMEBUFFER);
    switch (status)
    {
        case this._cgl.gl.FRAMEBUFFER_COMPLETE:
            break;
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            console.log('FRAMEBUFFER_INCOMPLETE_ATTACHMENT...');
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            console.log('FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT');
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            console.log('FRAMEBUFFER_INCOMPLETE_DIMENSIONS');
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
        case this._cgl.gl.FRAMEBUFFER_UNSUPPORTED:
            console.log('FRAMEBUFFER_UNSUPPORTED');
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
        default:
            console.log('incomplete framebuffer',status);
            throw new Error("Incomplete framebuffer: " + status);
            // throw("Incomplete framebuffer: " + status);
    }
    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
};




CGL.Framebuffer2.prototype.renderStart=function()
{
    this._cgl.pushModelMatrix(); // needed ??
    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuffer);
    this._cgl.pushGlFrameBuffer(this._frameBuffer);
    this._cgl.pushFrameBuffer(this);

    this._cgl.pushPMatrix();
    this._cgl.gl.viewport(0, 0, this._width,this._height );
    this._cgl.gl.drawBuffers( this._colorAttachments );

    for(var i=0;i<this._numRenderBuffers;i++)
    {
        this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0+i, this._cgl.gl.TEXTURE_2D, this._colorTextures[i].tex, 0);
    }

    if(this._options.clear)
    {
        this._cgl.gl.clearColor(0,0,0,0);
        this._cgl.gl.clear(this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT);
    }

    // console.log(this._colorAttachments,this._colorRenderbuffers);
};

CGL.Framebuffer2.prototype.renderEnd=function()
{
    this._cgl.popPMatrix();

    this._cgl.gl.bindFramebuffer(this._cgl.gl.READ_FRAMEBUFFER, this._frameBuffer);

    this._cgl.gl.bindFramebuffer(this._cgl.gl.DRAW_FRAMEBUFFER, this._colorFrameBuffer);
    this._cgl.gl.clearBufferfv(this._cgl.gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
    this._cgl.gl.blitFramebuffer(
        0, 0, this._width, this._height,
        0, 0, this._width, this._height,
        this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT, this._cgl.gl.NEAREST
    );

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.popGlFrameBuffer() );
    this._cgl.popFrameBuffer()

    this._cgl.popModelMatrix();
    this._cgl.resetViewPort();

    
    if(this._colorTextures[0].filter==CGL.Texture.FILTER_MIPMAP)
    {
        for(var i=0;i<this._numRenderBuffers;i++)
        {
            this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, this._colorTextures[i].tex);
            this._texture.updateMipMap();
            this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, null);
        }
    }

};
