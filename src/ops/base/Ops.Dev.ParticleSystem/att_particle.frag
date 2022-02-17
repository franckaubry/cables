IN vec2 texCoord;
UNI sampler2D texOldPos;
UNI sampler2D texSpawnPos;
UNI sampler2D texTiming;

UNI sampler2D texFeedbackVel;
UNI sampler2D texSpawnVel;

UNI vec3 pos;

UNI float reset;

UNI float sizeX;
UNI float sizeY;
UNI float sizeZ;

UNI float lifeTime;
UNI float time;
UNI float timeDiff;

UNI vec3 velocity;

UNI float spread;

{{MODULES_HEAD}}
{{CGL.RANDOM_LOW}}

void main()
{
    vec4 oldPos=texture(texOldPos,texCoord);
    vec4 vtiming=texture(texTiming,texCoord);
    vec4 oldVelocity=texture(texFeedbackVel,texCoord);
    vec4 newPos=oldPos;//vec4(1.0);

    if( time>vtiming.g || reset==1.0 )
    {
        newPos.rgb =pos;
        vec3 rnd=(cgl_random3(texCoord+gl_FragCoord.x/gl_FragCoord.y+time));

        rnd=texture(texSpawnPos,rnd.xy).rgb;

        // if(rnd.x==0.0 && rnd.y==0. && rnd.z==0.0)rnd=vec3(time+9999.0);

        // rnd.x*=sizeX;
        // rnd.y*=sizeY;
        // rnd.z*=sizeZ;
        oldVelocity=texture(texSpawnVel,texCoord);

        newPos.rgb+= rnd;

        vtiming.r=time;
        vtiming.g=time+cgl_random(time*texCoord)*lifeTime;
    }

    vtiming.a=1.0;

    float lifeProgress=( (time-vtiming.r) / (vtiming.g-vtiming.r));


    newPos.rgb+=timeDiff*velocity;

    // newPos.rgb+=normalize(newPos.rgb-oldPos.rgb)*0.2;

    // newPos.rgb+=(oldVelocity.rgb)*smoothstep(0.0,1.0,lifeProgress)*0.9;
    // newPos.rgb+=(oldVelocity.rgb)*(1.0-smoothstep(0.0,1.0,lifeProgress)*0.1);
    newPos.rgb+=(oldVelocity.rgb)*(1.0-lifeProgress*1.5);


    // gl_Position
    // r:x
    // g:y
    // b:z
    outColor0=vec4(newPos.rgb,1.0);

    // timing
    // r: starttime
    // g: endtime
    outColor1=vtiming;

    // timing output
    // r: life progress
    outColor2=vec4(vec3(lifeProgress ),1.);

    // velocity
    // oldVelocity.rgb*=1.995;
    outColor3=oldVelocity;


    // outColor0=vec4(1.0,0.3,0.0,1.0);
    // outColor1=vec4(0.0,1.0,0.0,1.0);
    // outColor2=vec4(0.0,0.0,1.0,1.0);
    // outColor3=vec4(1.0,1.0,0.0,1.0);


}