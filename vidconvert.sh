#!/bin/zsh

slug=$1
scales=('384:256' '480:320' '768:512' '960:640')
sizes=('384x256' '480x320' '768x512' '960x640')
src="src/videos"
dist="dist/videos"

opts=-i ${src}/${slug}.mov
for ((i=0; i < 4; i++)); do
    opts=${opts} -vf scale=${scales[i]} -vcodec libx264 ${dist}/${slug}_${sizes[i]}.mp4
done

ffmpeg $opts