#define NUM_FORCES 127

in vec3 rndpos;
out vec3 col;

uniform vec3 MOD_emitterPos;

uniform float MOD_time;
uniform float MOD_size;
uniform float MOD_timeDiff;
uniform float MOD_lifeTime;
uniform float MOD_fadeinout;

attribute float timeOffset;

in vec3 life;
out vec3 outLife;

in vec3 inPos;
out vec3 outPos;

struct force
{
    vec3 pos;
    float attraction;
    float angle;
    float range;
    float time;
};


uniform force forces[NUM_FORCES];




float random(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
