op.name='jsonFile';

var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var result=op.addOutPort(new Port(op,"result",OP_PORT_TYPE_OBJECT));

result.ignoreValueSerialize=true;
var patch=op.patch;

var loadingId=0;
var reload=function()
{
    loadingId=patch.loading.start('json3dFile',''+filename.get());

    CABLES.ajax(
        patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            try
            {
                var data=JSON.parse(_data);
                result.set(data);
                op.uiAttr({'error':''});
                patch.loading.finished(loadingId);
            }
            catch(e)
            {
                op.uiAttr({'error':'error loading json'});
                patch.loading.finished(loadingId);
            }
        });
    
};

filename.onValueChanged=reload;