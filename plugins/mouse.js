var create_plugin = (function() {
	var m_plugin_host = null;
	var m_is_init = false;

	function init() {
		var down = false;
		var swipeable = false;
		var sx = 0, sy = 0;
		var fov = 120;
		var mousedownFunc = function(ev) {
			if (ev.type == "touchstart") {
				ev.clientX = ev.pageX;
				ev.clientY = ev.pageY;
			}
			down = true;
			sx = ev.clientX;
			sy = ev.clientY;
			swipeable = (sx < 50);
			menu.setSwipeable(swipeable);
		};
		var mousemoveFunc = function(ev) {
			if (ev.type == "touchmove") {
				ev.clientX = ev.pageX;
				ev.clientY = ev.pageY;
				ev.button = 0;
			}
			if (!down || swipeable || ev.button != 0) {
				return;
			}
			var dx = -(ev.clientX - sx);
			var dy = -(ev.clientY - sy);
			sx -= dx;
			sy -= dy;

			if (m_plugin_host) {
				fov = m_plugin_host.get_fov();
			}

			var roll_diff = dx * fov / 300;
			var pitch_diff = -dy * fov / 300;

			var quat = m_plugin_host.get_view_quaternion()
				|| new THREE.Quaternion();
			var view_offset_quat = m_plugin_host.get_view_offset();
			var view_quat = view_offset_quat.multiply(quat);
			var view_offset_diff_quat = new THREE.Quaternion()
				.setFromEuler(new THREE.Euler(THREE.Math.degToRad(pitch_diff), THREE.Math
					.degToRad(0), THREE.Math.degToRad(roll_diff), "YXZ"));
			view_offset_quat = view_quat.multiply(view_offset_diff_quat)
				.multiply(quat.conjugate());
			// console.log(viewOffset);

			m_plugin_host.set_view_offset(view_offset_quat);

			autoscroll = false;
		}
		var mouseupFunc = function() {
			down = false;
		};
		document.addEventListener("touchstart", mousedownFunc);
		document.addEventListener("touchmove", mousemoveFunc);
		document.addEventListener("touchend", mouseupFunc);
		document.addEventListener("mousedown", mousedownFunc);
		document.addEventListener("mousemove", mousemoveFunc);
		document.addEventListener("mouseup", mouseupFunc);

		var _fov = 70;
		function gestureStartHandler(e) {
			_fov = fov;
		}

		function gestureChangeHandler(e) {
			fov = _fov / e.scale;
			if (fov > 150) {
				fov = 150;
			} else if (fov < 30) {
				fov = 30;
			}
			if (m_plugin_host) {
				m_plugin_host.set_fov(fov);
			}
		}

		function gestureEndHandler(e) {
		}

		if ("ongesturestart" in window) {
			document
				.addEventListener("gesturestart", gestureStartHandler, false);
			document
				.addEventListener("gesturechange", gestureChangeHandler, false);
			document.addEventListener("gestureend", gestureEndHandler, false);
		}
	}
	return function(plugin_host) {
		m_plugin_host = plugin_host;
		if (!m_is_init) {
			m_is_init = true;
			init();
		}
		var plugin = {};
		return plugin;
	}
})();