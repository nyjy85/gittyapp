var highlight = {};

highlight.set = function(color){
    document.designMode = "on";
    document.execCommand("hiliteColor", false, color);
    document.designMode = 'off';  
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

highlight.undo = function(section){
    document.designMode = 'on';
    document.execCommand('removeFormat', false, null)
    var sel = window.getSelection();
    sel.removeAllRanges();
    document.designMode = 'off';
}
