op.name='ArrayGetObject';

var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));
var index=op.addInPort(new Port(op, "index",OP_PORT_TYPE_VALUE,{type:'int'}));
var value=op.addOutPort(new Port(op, "value",OP_PORT_TYPE_OBJECT));
array.ignoreValueSerialize=true;
value.ignoreValueSerialize=true;



function update()
{
    if(index.get()<0)return;

    var arr=array.get();
    if(!arr)return;
    var ind=index.get();
    if(ind>=arr.length)return;
    // value.set( null);
    if(arr[ind]) value.set( arr[ind]);
}

index.onValueChanged=update;
array.onValueChanged=update;
