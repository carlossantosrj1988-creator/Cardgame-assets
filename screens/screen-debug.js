function _updateDebugScreen(){var d=document.getElementById('debug-screen');if(!d)return;var b=window._getGameBase?window._getGameBase():{w:'?',h:'?'};d.innerHTML='iW:'+window.innerWidth+' iH:'+window.innerHeight+'<br>sW:'+screen.width+' sH:'+screen.height+'<br>DPR:'+window.devicePixelRatio+'<br>base:'+b.w+'x'+b.h;}
_updateDebugScreen();setInterval(_updateDebugScreen,1000);window.addEventListener('resize',_updateDebugScreen);
</script>
</body>
</html>
