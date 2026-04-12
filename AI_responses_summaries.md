2026-03-24 08:57:04 - Replaced custom file browser with native file input picker, added /api/upload server endpoint for ffmpeg export, handled NotSupportedError on video play gracefully, saved user memory
2026-03-24 09:16:03 - Added interactive crop rectangle overlay: red border, drag-to-move, resize handle, defaults to video size, ffmpeg export with max-dimension canvas and black background centering
2026-03-24 09:30:01 - Added o_video_composition model with FK on o_video_section, composition name/select UI with save/load, configurable export dir via keyvalpair, video files clickable in file browser opening videocutter in new tab
2026-03-24 09:32:00 - Fixed videocutter fullscreen layout: #app height:100vh+overflow:hidden, .o_videocutter flex:1+min-height:0 instead of height:100vh
2026-03-24 09:41:29 - Moved section list from bottom to togglable right overlay panel to prevent timeline shifting
2026-03-24 09:57:03 - Auto-select active section when playhead time falls inside a section range (timeupdate + timeline click)
2026-03-24 10:04:20 - Added 25MB GIF size limit: auto-retries with lower FPS (15→12→10→8→6→4) until under limit, shows size+fps in result
2026-03-24 10:08:21 - Fixed sidebar panel: moved inside o_videocutter__main so toolbar stays clear, accent-colored toggle button
2026-04-01 23:15:13 - Fix GIF export crash for videos with non-square SAR: normalize SAR before crop in ffmpeg filter chain (scale=iw*sar:ih,setsar=1)
2026-04-01 23:24:10 - Increased max GIF speed slider from 4x to 8x
2026-04-04 23:28:09 - Added drag-and-drop for timeline sections: move whole section by dragging body, resize start/end by dragging edge handles, with clamping and min-duration constraints
2026-04-12 - Added color adjustment controls (gamma, contrast, shadows, saturation) to settings panel with FFmpeg eq filter in export pipeline
2026-04-12 - Removed stats_mode=diff from palettegen, added Default dither option, added GIF/MP4 format selector, WhatsApp preset exports as MP4 (H.264, yuv420p, faststart)
