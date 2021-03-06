function reSelect(hl, color){
  //////////
    var selection = window.getSelection();
    selection.removeAllRanges();
  ///////
    var startId = getNode(hl.startId)
    var endId = getNode(hl.endId);

    setStart(startId, hl.startNode);
    setEnd(endId, hl.endNode);

    setNewRange(hl, color)
};

function setNewRange(hl, color){
    var selection = window.getSelection();
    selection.removeAllRanges();
    var newRange = document.createRange();

    newRange.setStart(newStartNode, hl.startOffset);
    newRange.setEnd(newEndNode, hl.endOffset);
    selection.addRange(newRange);
    
    highlight.set(color);
    // gets rid of nasty blue line
    selection.removeAllRanges();
}

function getNode(id){
    return document.getElementById(id)
}

var newEndNode;
function setEnd(node, text) {
   if (node.textContent === text && node.childNodes.length === 0) {
       newEndNode = node;
   } else if (node.childNodes) {
       for (var i = 0; i < node.childNodes.length;i++) {
           setEnd(node.childNodes[i], text);
       }
   } else {
       console.log("getDocument: no document found for node");
   }
}
var newStartNode;
function setStart(node, text) {
   if (node.textContent === text && node.childNodes.length === 0) {
       newStartNode = node;
   } else if (node.childNodes) {
       for (var i = 0; i < node.childNodes.length;i++) {
           setStart(node.childNodes[i], text);
       }
   } else {
       console.log("getDocument: no document found for node");
   }
}
