op.name="PerlinNoise";

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var x=op.inValue("X",0);
var y=op.inValue("Y",0);
var z=op.inValue("Z",0);
var scale=op.inValue("Scale",22);
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),attachments.perlinnoise3d_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniZ=new CGL.Uniform(shader,'f','z',z);
var uniX=new CGL.Uniform(shader,'f','x',x);
var uniY=new CGL.Uniform(shader,'f','y',y);
var uniScale=new CGL.Uniform(shader,'f','scale',scale);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
