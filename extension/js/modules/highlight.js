var highlight = {};

highlight.set = function(color){
	highlighting = true;
    document.designMode = "on";
    document.execCommand("BackColor", false, color);
    document.designMode = 'off'; 
    highlighting = false;  
}

highlight.clear = function(start, end, color){
	var newStart = parseInt(start.match(/\d+/)[0])
	var newEnd = parseInt(end.match(/\d+/)[0])
	var arr = [];

	for (var i = newStart; i <= newEnd; i++){
		arr.push("LC"+i);
	}

	arr.forEach(function(id){
		k = $('#'+ id + ' span');
		k.each(function(i, span){ $(span).css("background-color", color) });
	});
	var selection = window.getSelection();
    selection.removeAllRanges();
}

highlight.unhighlight = function(className){

    // var highlighted = document.querySelectorAll('.highlighted');
    console.log('ths be classss', className)
    var highlighted = $('.'+ className);
    highlighted.contents().unwrap();
    // var i = highlighted.length;
    // while (i--) {
    //     var node = highlighted[i];
    //     console.log('this is NODE', node)
    //     node.parentNode.replaceChild(node.firstChild, node);
    // }
}



// highlight.restorerange = function(ele){
//     var selection = window.getSelection();
//     selection.removeAllRanges();
//     var range = document.createRange();
//     range.setStart(ele.startContainer, ele.startOffset);
//     range.setEnd(ele.endContainer, ele.endOffset);
//     selection.addRange(range);
// }

// highlight.setBackgroundColor = function(ele) {
//     highlight.restorerange(ele);
//     this.set();
// }