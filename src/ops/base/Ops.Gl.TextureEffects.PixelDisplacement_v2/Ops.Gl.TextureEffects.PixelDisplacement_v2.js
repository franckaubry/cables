const render=op.inTrigger("render");
const amount=op.inValueSlider("amount X");
const amountY=op.inValueSlider("amount Y");

const displaceTex=op.inTexture("displaceTex");
const trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.pixeldisplace_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','displaceTex',1);

var amountXUniform=new CGL.Uniform(shader,'f','amountX',amount);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(displaceTex.get()) cgl.setTexture(1, displaceTex.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

