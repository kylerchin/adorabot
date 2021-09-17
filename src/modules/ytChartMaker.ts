const { createCanvas, loadImage } = require('canvas')

export async function ytChart(id) {
    const canvas = createCanvas(1920, 1080)
    const ctx = canvas.getContext('2d')
    
    // Write "Awesome!"
    ctx.font = '30px Helvetica'
    ctx.rotate(0.1)
    ctx.fillText('Not Enough Data\nto render this chart.', 960, 540)

    return canvas.toBuffer('image/png', {})
}