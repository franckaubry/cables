const
    inExec = op.inTrigger("Update"),
    inRadius = op.inFloat("Radius", 1),
    inSizeX = op.inFloat("Size X", 1),
    inSizeY = op.inFloat("Size Y", 1),
    inSizeZ = op.inFloat("Size Z", 1),
    inMass = op.inFloat("Mass", 0),
    inName = op.inString("Name", ""),
    inReset = op.inTriggerButton("Reset"),
    inActivate = op.inTriggerButton("Activate"),


    inMoveXP=op.inBool("Move X+",false),
    inMoveXM=op.inBool("Move X-",false),
    inMoveYP=op.inBool("Move Y+",false),
    inMoveYM=op.inBool("Move Y-",false),
    inMoveZP=op.inBool("Move Z+",false),
    inMoveZM=op.inBool("Move Z-",false),

    inSpeed=op.inFloat("Speed",1),


    inTest = op.inTriggerButton("Test"),
    next = op.outTrigger("next"),
    transformed = op.outTrigger("Transformed");

inExec.onTriggered = update;

const cgl = op.patch.cgl;
let body = null;
let world = null;
let tmpTrans = null;
let transform = null;
let motionState = null;
const tmpOrigin = vec3.create();
const tmpQuat = quat.create();
const tmpScale = vec3.create();
let transMat = mat4.create();

let btOrigin = null;
let btQuat = null;
let doResetPos = false;

inName.onChange = updateBodyMeta;

op.onDelete =
inMass.onChange =
inRadius.onChange =
inSizeY.onChange =
inSizeZ.onChange =
inSizeX.onChange = () =>
{
    removeBody();
};

inActivate.onTriggered = () =>
{
    if (body)body.activate();
};

function removeBody()
{
    if (world && body) world.removeRigidBody(body);
    body = null;
}

inReset.onTriggered = () =>
{
    removeBody();
};


let btVelocity=null
inTest.onTriggered=()=>
{

    if(!btVelocity)
    {
        btVelocity=new Ammo.btVector3(1,0,0);
    }
    body.activate();
    body.setLinearVelocity(btVelocity);

};

function updateBodyMeta()
{
    if (world)
        world.setBodyMeta(body,
            {
                "name": inName.get(),
                "mass": inMass.get(),
            });

    op.setUiAttribs({ "extendTitle": inName.get() });
}

function setup()
{
    if (world && body) world.removeRigidBody(body);

    tmpTrans = new Ammo.btTransform();
    transform = new Ammo.btTransform();

    transform.setIdentity();

    copyCglTransform(transform);

    motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btSphereShape(inRadius.get());


    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(inMass.get(), localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(inMass.get(), motionState, colShape, localInertia);
    body = new Ammo.btRigidBody(rbInfo);
    world.addRigidBody(body);

    updateBodyMeta();
    // updateDeactivation();
    console.log("body added...", body);
}

function renderTransformed()
{
    let ms = body.getMotionState();
    if (ms)
    {
        ms.getWorldTransform(tmpTrans);
        let p = tmpTrans.getOrigin();
        let q = tmpTrans.getRotation();

        cgl.pushModelMatrix();

        mat4.identity(cgl.mMatrix);

        let scale = [inRadius.get(), inRadius.get(), inRadius.get()];


        mat4.fromRotationTranslationScale(transMat, [q.x(), q.y(), q.z(), q.w()], [p.x(), p.y(), p.z()], scale);
        mat4.mul(cgl.mMatrix, cgl.mMatrix, transMat);

        transformed.trigger();

        cgl.popModelMatrix();
    }
}

function copyCglTransform(transform)
{
    if (!btOrigin)
    {
        btOrigin = new Ammo.btVector3(0, 0, 0);
        btQuat = new Ammo.btQuaternion(0, 0, 0, 0);
    }
    mat4.getTranslation(tmpOrigin, cgl.mMatrix);
    mat4.getRotation(tmpQuat, cgl.mMatrix);

    let changed = false;

    btOrigin.setValue(tmpOrigin[0], tmpOrigin[1], tmpOrigin[2]);
    btQuat.setValue(tmpQuat[0], tmpQuat[1], tmpQuat[2], tmpQuat[3]);

    transform.setOrigin(btOrigin);
    transform.setRotation(btQuat);
}

function update()
{
    if (world != cgl.frameStore.ammoWorld) removeBody();

    world = cgl.frameStore.ammoWorld;
    if (!world) return;
    if (!body)setup(world);

    body.activate(); // body.setActivationState(Ammo.DISABLE_DEACTIVATION); did not work.....


    let vx=0,vy=0,vz=0.0;

    if(inMoveXM.get()) vx=-inSpeed.get();
    if(inMoveXP.get()) vx=inSpeed.get();

    if(inMoveZP.get()) vz=-inSpeed.get();
    if(inMoveZM.get()) vz=inSpeed.get();

    if(inMoveYP.get()) vy=inSpeed.get();


    if(!btVelocity)
    {
        btVelocity=new Ammo.btVector3(0,0,0);
    }
    if(vx!=0||vy!=0||vz!=0)
    {
        btVelocity.setValue(vx,vy,vz)

        body.setLinearVelocity(btVelocity);
    }



    if (inMass.get() == 0 || doResetPos)
    {
        copyCglTransform(transform);

        motionState.setWorldTransform(transform);
        body.setWorldTransform(transform);

        doResetPos = false;
    }

    renderTransformed();

    next.trigger();
}
