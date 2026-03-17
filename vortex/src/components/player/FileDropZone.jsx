import { useRef } from 'react'


export default function FileDropZone({ onFiles }) {
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => e.preventDefault()

  return (
    <div
     
      className="flex flex-col items-center justify-center w-full h-full cursor-pointer "
    >
      <div  onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()} className= " group border-2 border-dashed border-white/10 hover:border-violet-500/50 transition-all rounded-3xl px-20 py-16 flex flex-col items-center gap-4"
      >
       <div className="text-6xl opacity-70 group-hover:opacity-100 transition">
  <img 
    src={'/player-movie.svg'} 
    className="h-16 w-16"
    alt="icon"
  />
</div>

        <p className="text-gray-500 group-hover:text-gray-300 transition text-sm uppercase tracking-widest">
          Drop video files here
        </p>
        <p className="text-gray-700 text-xs">or click to browse</p>
        <p className="text-gray-700 text-xs">MP4 · MKV · AVI · MOV · WEBM</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files.length > 0 && onFiles(e.target.files)}
      />
    </div>
  )
}