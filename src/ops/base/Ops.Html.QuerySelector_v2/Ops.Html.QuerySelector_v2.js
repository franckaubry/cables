const
    inUpdate = op.inTriggerButton("Update"),
    queryPort = op.inString("Query"),
    inMode = op.inValueSelect("Mode", ["document", "string input"], "document"),
    inMimeType = op.inValueSelect("Type", ["text/html", "text/xml"], "text/html"),
    inSource = op.inStringEditor("Document", "xml"),
    elementPort = op.outObject("Element");

if (inMode.get() === "document")
{
    inSource.setUiAttribs({ "greyout": true });
    inMimeType.set("text/html");
    inMimeType.setUiAttribs({ "greyout": true });
}

inUpdate.onTriggered =
queryPort.onChange =
inMimeType.onChange =
inSource.onChange = update;

inMode.onChange = modeChange;

function update()
{
    const q = queryPort.get();
    const theDocument = inSource.get();
    const mode = inMode.get();
    if (mode === "string input" && theDocument)
    {
        let parser = new DOMParser();
        let htmlDoc = null;
        try
        {
            htmlDoc = parser.parseFromString(theDocument, inMimeType.get());
            const el = htmlDoc.querySelector(q);
            elementPort.set(el);
        }
        catch (e)
        {
            op.error(e);
        }
    }
    else
    {
        try
        {
            const el = document.querySelector(q);
            elementPort.set(el);
        }
        catch (e)
        {
            op.error(e);
        }
    }
}

function modeChange()
{
    if (inMode.get() === "document")
    {
        inSource.setUiAttribs({ "greyout": true });
        inMimeType.set("text/html");
        inMimeType.setUiAttribs({ "greyout": true });
    }
    else
    {
        inSource.setUiAttribs({ "greyout": false });
        inMimeType.setUiAttribs({ "greyout": false });
    }
}
