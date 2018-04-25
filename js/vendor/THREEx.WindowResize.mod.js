// This THREEx helper makes it easy to handle window resize.
// It will update renderer and camera when window is resized.
//
// # Usage
//
// **Step 1**: Start updating renderer and camera
//
// ```var windowResize = THREEx.WindowResize(aRenderer, aCamera)```
//
// **Step 2**: Stop updating renderer and camera
//
// ```windowResize.stop()```
// # Code

//

/** @namespace */
var THREEx	= THREEx 		|| {};

/**
 * Update renderer and camera when the window is resized
 *
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
*/
THREEx.WindowResize	= function(renderer, camera, widthPercent, heightPercent){
	widthPercent = widthPercent || 1;
	heightPercent = heightPercent || 1;
	var callback	= function(){
		// notify the renderer of the size change
		renderer.setSize( window.innerWidth*widthPercent, window.innerHeight*heightPercent );
		// update the camera
		camera.aspect	= window.innerWidth*widthPercent / (window.innerHeight*heightPercent);
		camera.updateProjectionMatrix();
	}
	// bind the resize event
	window.addEventListener('resize', callback, false);
	// return .stop() the function to stop watching window resize
	return {
		/**
		 * Stop watching window resize
		*/
		stop	: function(){
			window.removeEventListener('resize', callback);
		},
		
		
		change	: function(_widthPercent, _heightPercent){
			widthPercent = _widthPercent || widthPercent;
			heightPercent = _heightPercent || heightPercent;
		}
	};
}

THREEx.WindowResize.bind	= function(renderer, camera, widthPercent, heightPercent){
	return THREEx.WindowResize(renderer, camera, widthPercent, heightPercent);
}
