// http://paulbourke.net/geometry/circlesphere/

// http://paulbourke.net/geometry/circlesphere/csource3.c
//! !!! http://paulbourke.net/geometry/circlesphere/csource2.c

const render = op.inTrigger("render");
const next = op.outTrigger("next");

const inIterations = op.inValue("Iterations", 4);
const geomOut = op.outObject("Geometry");

const flat = op.inValueBool("Flat", false);
const inDraw = op.inValueBool("Draw", true);

let verts = [];
let geom = null;
let mesh = null;
const cgl = op.patch.cgl;

inIterations.onChange = generate;

generate();

flat.onChange = generate;

render.onTriggered = function ()
{
    // cgl.gl.cullFace(cgl.gl.BACK);
    // cgl.gl.enable(cgl.gl.CULL_FACE);

    if (inDraw.get() && mesh) mesh.render(cgl.getShader());
    next.trigger();

    // cgl.gl.disable(cgl.gl.CULL_FACE);
};

function normalize(v)
{
    const len = Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]));
    v[0] /= len;
    v[1] /= len;
    v[2] /= len;
    return v;
}

function index(verts, geom)
{
    const num = verts.length / 3;
    const arr = [];
    const ind = [], tc = [];

    for (let i = 0; i < num; i++)
    {
        let found = false;

        for (let j = 0; j < arr.length; j += 3)
        {
            if (
                arr[j + 0] == verts[i * 3 + 0] &&
                arr[j + 1] == verts[i * 3 + 1] &&
                arr[j + 2] == verts[i * 3 + 2])
            {
                ind.push(j / 3);
                found = true;
                continue;
            }
        }

        if (!found)
        {
            arr.push(verts[i * 3 + 0]);
            arr.push(verts[i * 3 + 1]);
            arr.push(verts[i * 3 + 2]);
            ind.push(arr.length / 3 - 1);

            tc.push(verts[i * 3 + 0]);
            tc.push(verts[i * 3 + 1]);
        }
    }

    geom.verticesIndices = ind;
    geom.vertices = arr;
    geom.texCoords = tc;
}

function generate()
{
    let iterations = Math.max(1, Math.floor(inIterations.get()));
    iterations = Math.min(6, iterations);
    const f = [];
    let i, it;
    const p = [[0, 0, 1], [0, 0, -1], [-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0]];

    let nt = 0, ntold;

    /* Create the level 0 object */
    const a = 1 / Math.sqrt(2.0);
    for (i = 0; i < 6; i++)
    {
        p[i][0] *= a;
        p[i][1] *= a;
    }

    for (i = 0; i < 8; i++)
    {
        f[i] = [[], [], []];
    }
    f[0][0] = p[0]; f[0][1] = p[3]; f[0][2] = p[4];
    f[1][0] = p[0]; f[1][1] = p[4]; f[1][2] = p[5];
    f[2][0] = p[0]; f[2][1] = p[5]; f[2][2] = p[2];
    f[3][0] = p[0]; f[3][1] = p[2]; f[3][2] = p[3];
    f[4][0] = p[1]; f[4][1] = p[4]; f[4][2] = p[3];
    f[5][0] = p[1]; f[5][1] = p[5]; f[5][2] = p[4];
    f[6][0] = p[1]; f[6][1] = p[2]; f[6][2] = p[5];
    f[7][0] = p[1]; f[7][1] = p[3]; f[7][2] = p[2];
    nt = 8;

    if (iterations > 1)
    {
        /* Bisect each edge and move to the surface of a unit sphere */
        for (it = 0; it < iterations; it++)
        {
            ntold = nt;
            for (i = 0; i < ntold; i++)
            {
                const pa = [], pb = [], pc = [];
                pa[0] = (f[i][0][0] + f[i][1][0]) / 2;
                pa[1] = (f[i][0][1] + f[i][1][1]) / 2;
                pa[2] = (f[i][0][2] + f[i][1][2]) / 2;
                pb[0] = (f[i][1][0] + f[i][2][0]) / 2;
                pb[1] = (f[i][1][1] + f[i][2][1]) / 2;
                pb[2] = (f[i][1][2] + f[i][2][2]) / 2;
                pc[0] = (f[i][2][0] + f[i][0][0]) / 2;
                pc[1] = (f[i][2][1] + f[i][0][1]) / 2;
                pc[2] = (f[i][2][2] + f[i][0][2]) / 2;

                normalize(pa);
                normalize(pb);
                normalize(pc);

                f.push([]);
                f[nt][0] = f[i][0]; f[nt][1] = pa; f[nt][2] = pc; nt++;
                f.push([]);
                f[nt][0] = pa; f[nt][1] = f[i][1]; f[nt][2] = pb; nt++;
                f.push([]);
                f[nt][0] = pb; f[nt][1] = f[i][2]; f[nt][2] = pc; nt++;

                f[i][0] = pa;
                f[i][1] = pb;
                f[i][2] = pc;
            }
        }
    }

    if (!geom)geom = new cgl.Geometry(op.name);
    geom.clear();

    verts = [].concat.apply([], f);
    verts = [].concat.apply([], verts);

    if (!flat.get()) index(verts, geom);
    else
    {
        geom.unIndex();
        const indices = [];
        for (i = 0; i < verts.length / 3; i++)indices.push(i);
        geom.vertices = verts;
        geom.verticesIndices = indices;
    }

    geom.calculateNormals({ "forceZUp": false });

    mesh = new CGL.Mesh(cgl, geom);
    geomOut.set(null);
    geomOut.set(geom);
}
