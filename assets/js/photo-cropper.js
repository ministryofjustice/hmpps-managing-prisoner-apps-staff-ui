function initPhotoCropper() {
  let cropping = false
  let croppingInit = false
  let constrainImage = false

  const OUTPUT_LONG_EDGE = 1400

  const MAX_WIDTH = 320
  const MAX_HEIGHT = 320

  const uploadedPhoto = document.getElementById('photo-preview')
  const fileName =
    uploadedPhoto && uploadedPhoto.attributes['data-file-name']
      ? uploadedPhoto.attributes['data-file-name'].value
      : undefined
  const fileType =
    uploadedPhoto && uploadedPhoto.attributes['data-file-type']
      ? uploadedPhoto.attributes['data-file-type'].value
      : undefined

  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[arr.length - 1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n > 0) {
      n -= 1
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
  }

  function setFormPhoto(file) {
    const input = document.getElementById('js-cropped-image-input')
    if (!input) return

    const container = new DataTransfer()
    container.items.add(file)
    input.files = container.files
  }

  function withImageManipulation(callback) {
    const cropperImage = document.querySelector('cropper-image')
    if (!cropperImage) return

    cropperImage.rotatable = true
    cropperImage.scalable = true
    cropperImage.translatable = true
    cropperImage.skewable = true

    callback(cropperImage)

    cropperImage.rotatable = false
    cropperImage.scalable = false
    cropperImage.translatable = false
    cropperImage.skewable = false
  }

  function constrainedToImage(selection) {
    const cropperCanvas = document.querySelector('cropper-canvas')
    const image = document.querySelector('cropper-image')
    const cropperImageRect = image.getBoundingClientRect()
    const cropperCanvasRect = cropperCanvas.getBoundingClientRect()
    const maxSelection = {
      x: cropperImageRect.left - cropperCanvasRect.left,
      y: cropperImageRect.top - cropperCanvasRect.top,
      width: Math.min(cropperImageRect.width, cropperCanvasRect.width),
      height: Math.min(cropperImageRect.height, cropperCanvasRect.height),
    }

    return (
      selection.x >= maxSelection.x &&
      selection.y >= maxSelection.y &&
      selection.x + selection.width <= maxSelection.x + maxSelection.width &&
      selection.y + selection.height <= maxSelection.y + maxSelection.height
    )
  }

  function setFormPhotoToCroppedResult() {
    const selector = document.querySelector('cropper-selection')
    const { width: selectionWidth, height: selectionHeight } = selector.getBoundingClientRect()
    const normalisedWidth = Math.max(selectionWidth, 1)
    const normalisedHeight = Math.max(selectionHeight, 1)
    const scaleFactor = OUTPUT_LONG_EDGE / Math.max(normalisedWidth, normalisedHeight)
    const outputWidth = Math.max(Math.round(normalisedWidth * scaleFactor), 1)
    const outputHeight = Math.max(Math.round(normalisedHeight * scaleFactor), 1)

    // Preserve selected crop orientation while exporting a higher-resolution image.
    selector.$toCanvas({ width: outputWidth, height: outputHeight }).then(canvas => {
      canvas.toBlob(blob => {
        const file = new File([blob], fileName, {
          type: fileType,
          lastModified: new Date().getTime(),
        })
        const callback = dataUrl => {
          document.getElementById('photo-preview').src = dataUrl
        }
        const a = new FileReader()
        a.onload = e => callback(e.target.result)
        a.readAsDataURL(blob)
        setFormPhoto(file)
      })
    })
  }

  function setCropperListener() {
    const canvas = document.querySelector('cropper-canvas')
    canvas.addEventListener('actionend', () => {
      setFormPhotoToCroppedResult()
    })
  }

  function setSelectionListener() {
    const selector = document.querySelector('cropper-selection')
    selector.addEventListener('change', e => {
      if (constrainImage && !constrainedToImage(e.detail)) e.preventDefault()
    })
  }

  function toggleCrop() {
    if (cropping) {
      document.getElementById('photo-preview-container').style.display = 'block'
      document.getElementById('photo-cropper-container').style.display = 'none'
      cropping = false
    } else {
      document.getElementById('photo-preview-container').style.display = 'none'
      document.getElementById('photo-cropper-container').style.display = 'block'
      cropping = true
      if (!croppingInit) {
        resetSelectionLocation()
        setSelectionListener()
        croppingInit = true
      }
    }
  }

  function resetSelectionLocation() {
    // Toggle constraining off so we can move
    constrainImage = false
    const selection = document.querySelector('cropper-selection')
    const cropperImage = document.querySelector('cropper-image')
    const cropperImageRect = cropperImage.getBoundingClientRect()

    const cropperCanvas = document.querySelector('cropper-canvas')
    const cropperCanvasRect = cropperCanvas.getBoundingClientRect()

    const maxWidth = Math.min(cropperImageRect.width, cropperCanvasRect.width)
    const maxHeight = Math.min(cropperImageRect.height, cropperCanvasRect.height)
    const selectionX = cropperImageRect.left - cropperCanvasRect.left
    const selectionY = cropperImageRect.top - cropperCanvasRect.top
    const selectionWidth = Math.min(maxWidth, MAX_WIDTH) * 0.95
    const selectionHeight = Math.min(maxHeight, MAX_HEIGHT) * 0.95

    selection.$change(selectionX, selectionY, selectionWidth, selectionHeight).$center()

    // Reenable constraining
    constrainImage = true
  }

  function rotateImage(degrees) {
    withImageManipulation(cropperImage => cropperImage.$rotate(`${degrees}deg`).$center('contain'))
    resetSelectionLocation()
    setFormPhotoToCroppedResult()
  }

  const rotateClockwise = e => {
    e.preventDefault()
    rotateImage(90)
  }

  function setButtonListeners() {
    document.querySelectorAll('.hmpps-button__toggle-crop').forEach(button =>
      button.addEventListener('click', e => {
        e.preventDefault()
        toggleCrop()
      }),
    )
    document
      .querySelectorAll('.hmpps-button__rotate-clockwise')
      .forEach(button => button.addEventListener('click', rotateClockwise))
  }

  function pageInit() {
    if (!uploadedPhoto) return // Guard clause

    const dataUrl = uploadedPhoto.attributes.src.value
    const file = dataURLtoFile(dataUrl, fileName)
    setFormPhoto(file)
    setCropperListener()
    setButtonListeners()
  }

  // Only run if we're on the confirm photo page
  if (uploadedPhoto && document.getElementById('photo-cropper-container')) {
    window.addEventListener('load', () => {
      pageInit()
      toggleCrop()
      withImageManipulation(cropperImage => cropperImage.$center('contain'))
      resetSelectionLocation()
      setFormPhotoToCroppedResult()
    })
  }
}

export default initPhotoCropper
