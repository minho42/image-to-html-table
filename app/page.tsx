"use client"

import { useState } from "react"

export default function Home() {
  const [html, setHtml] = useState("")
  const [showCopyNotice, setShowCopyNotice] = useState(false)

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(html)
      setShowCopyNotice(true)
    } catch (error) {
      console.log(error)
      setShowCopyNotice(false)
    }
  }
  async function handleChange(e) {
    const output = document.querySelector("#output")

    setHtml("")
    output.innerHTML = ""

    const file = e.target.files[0]
    if (!file) {
      console.log("no file")

      return
    }

    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = new Image()
      img.src = dataUrl as string
      await img.decode()

      if (img.width > 450 || img.height > 450) {
        output.innerHTML = "Image too big. Try smaller image."
        return
      }
      output.innerHTML = "Generating..."

      const canvas = document.querySelector("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      const data = imageData.data

      let html = "<div><style>td { padding: 0; border:none; width:1px; height:1px }</style><table>"

      for (let y = 0; y < img.height; y++) {
        html += "<tr>"
        for (let x = 0; x < img.width; x++) {
          let i = (y * img.width + x) * 4
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]
          let a = data[i + 3]

          let colorHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
            .toString(16)
            .padStart(2, "0")}`
          html += `<td style="background-color:${colorHex};"></td>`
        }
        html += "</tr>"
      }
      html += "</table></div>"
      setHtml(html)

      output.innerHTML = "Done"
    } catch (error) {
      setHtml("")
      console.log(error)
      output.innerHTML = "Generating failed"
    }
  }

  return (
    <main className="flex flex-col items-center justify-center gap-3 p-3">
      <h1 className="text-xl font-semibold">Convert image to HTML table</h1>
      <a
        className="underline"
        title="https://github.com/minho42/image-to-html-table"
        target="_blank"
        rel="noopener noreferrer nofollow"
        href="https://github.com/minho42/image-to-html-table"
      >
        Github
      </a>
      <input onChange={handleChange} type="file" name="image" id="image" />
      <canvas className="hidden"></canvas>
      <div id="output"></div>
      <button
        onClick={handleCopy}
        hidden={html?.length === 0}
        className="relative cursor-pointer border-2 border-black px-3 py-2 font-semibold "
      >
        Copy HTML table
        <div
          hidden={!showCopyNotice}
          className="absolute -right-4 -top-4 rounded-xl bg-neutral-800 px-2 py-1 font-mono text-xs font-normal text-white"
        >
          Copied
        </div>
      </button>
    </main>
  )
}
