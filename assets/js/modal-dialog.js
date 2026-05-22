/*
  Modal Dialog Component
  ----------------------
   Shows content in an accessible modal dialog

   Instantiate
   -----------
   var dialog = new ModalDialog(element).init(options)

   Options
   -------
   An object which can contain the following keys:
   triggerElement: node which will have a click event listener added to trigger opening of the modal
   focusElement: element that should gain focus when the dialog opens (defaults to the dialog itself)
   onOpen: a callback function which will be invoked when the modal is opened
   onClose: a callback function which will be invoked when the modal is closed
   onDialogNotSupported: a callback function that will be invoked if there is no native <dialog> or dialog polyfill support

*/

const dialogInstances = new WeakMap()

function ModalDialog($module) {
  this.$module = $module
  this.$dialogBox = $module.querySelector('dialog')
  this.$container = document.documentElement

  // Allowed focussable elements
  this.focussable = ['button', '[href]', 'input', 'select', 'textarea']

  this.open = this.handleOpen.bind(this)
  this.close = this.handleClose.bind(this)
  this.focus = this.handleFocus.bind(this)
  this.focusTrap = this.handleFocusTrap.bind(this)
  this.boundKeyDown = this.handleKeyDown.bind(this)

  // Modal elements
  this.$closeButtons = this.$dialogBox
    ? this.$dialogBox.querySelectorAll('[data-element="govuk-modal-dialogue-close"]')
    : []
  this.$focussable = this.$dialogBox ? this.$dialogBox.querySelectorAll(this.focussable.toString()) : []
  this.$focusableLast = this.$focussable[this.$focussable.length - 1]
  this.$inertContainer = document.querySelector(
    this.$module.dataset.inertContainer || '.govuk-modal-dialogue-inert-container',
  )
}

// Initialize component
ModalDialog.prototype.init = function init(options) {
  // Check for module
  if (!this.$module) {
    return this
  }

  this.options = options || {}

  this.$focusElement = this.options.focusElement || this.$dialogBox

  // Check for native dialog (or polyfill) support
  // if no support trigger a callback allowing us to show a fallback
  if (!this.dialogSupported()) {
    if (typeof this.options.onDialogNotSupported === 'function') {
      this.options.onDialogNotSupported.call()
    }
    return this
  }

  if (this.$dialogBox.hasAttribute('open')) {
    this.open()
  }

  this.initEvents()

  return this
}

ModalDialog.prototype.dialogSupported = function dialogSupported() {
  if (typeof HTMLDialogElement === 'function') {
    // Native dialog is supported by browser
    return true
  }
  // Native dialog is not supported by browser so use polyfill if available
  if (window.dialogPolyfill && typeof window.dialogPolyfill.registerDialog === 'function') {
    window.dialogPolyfill.registerDialog(this.$dialogBox)
    return true
  }

  // Doesn't support polyfill (IE8)
  return false
}

// Initialize component events
ModalDialog.prototype.initEvents = function initEvents() {
  if (this.options.triggerElement) {
    this.options.triggerElement.addEventListener('click', this.open)
  }

  // Close dialogue on close button click
  this.$closeButtons.forEach(element => {
    element.addEventListener('click', this.close)
  })
}

// Open modal
ModalDialog.prototype.handleOpen = function handleOpen(event) {
  if (event) {
    event.preventDefault()
  }

  // Save last-focussed element
  this.$lastActiveElement = document.activeElement

  // Disable scrolling, show wrapper
  this.$container.classList.add('govuk-!-scroll-disabled')
  this.$module.classList.add('govuk-modal-dialogue--open')

  // make the content of the page inert
  if (this.$inertContainer) {
    this.$inertContainer.inert = true
  }

  // Close on escape key, trap focus
  document.addEventListener('keydown', this.boundKeyDown, true)

  // Optional 'onOpen' callback
  if (typeof this.options.onOpen === 'function') {
    this.options.onOpen.call(this)
  }

  // Skip open if already open
  if (this.$dialogBox.hasAttribute('open')) {
    return
  }

  // Show modal using native method if available
  if (typeof this.$dialogBox.showModal === 'function') {
    this.$dialogBox.showModal()
  } else {
    this.$dialogBox.setAttribute('open', '')
  }

  // Handle focus
  this.focus()
}

// Close modal
ModalDialog.prototype.handleClose = function handleClose(event) {
  if (event) {
    event.preventDefault()
  }

  // Skip close if already closed
  if (!this.$dialogBox.hasAttribute('open')) {
    return
  }

  // Hide modal using native method if available
  if (typeof this.$dialogBox.close === 'function') {
    this.$dialogBox.close()
  } else {
    this.$dialogBox.removeAttribute('open')
  }

  // Hide wrapper, enable scrolling
  this.$module.classList.remove('govuk-modal-dialogue--open')
  this.$container.classList.remove('govuk-!-scroll-disabled')
  // make content active again
  if (this.$inertContainer) {
    this.$inertContainer.inert = false
  }

  // Restore focus to last active element
  if (this.$lastActiveElement && typeof this.$lastActiveElement.focus === 'function') {
    this.$lastActiveElement.focus()
  }

  // Optional 'onClose' callback
  if (typeof this.options.onClose === 'function') {
    this.options.onClose.call(this)
  }

  // Remove escape key and trap focus listener
  document.removeEventListener('keydown', this.boundKeyDown, true)
}

ModalDialog.prototype.isOpen = function isOpen() {
  return this.$dialogBox.hasAttribute('open')
}

// Lock scroll, focus modal
ModalDialog.prototype.handleFocus = function handleFocus() {
  this.$focusElement.focus({ preventScroll: true })
}

// Ensure focus stays within modal
ModalDialog.prototype.handleFocusTrap = function handleFocusTrap(event) {
  let $focusElement

  // Check for tabbing outside dialog
  let hasFocusEscaped = document.activeElement !== this.$dialogBox

  // Loop inner focussable elements
  if (hasFocusEscaped) {
    this.$focussable.forEach(element => {
      // Actually, focus is on an inner focussable element
      if (hasFocusEscaped && document.activeElement === element) {
        hasFocusEscaped = false
      }
    })

    // Wrap focus back to first element
    $focusElement = hasFocusEscaped ? this.$dialogBox : undefined
  }

  // Wrap focus back to first/last element
  if (!$focusElement) {
    if ((document.activeElement === this.$focusableLast && !event.shiftKey) || !this.$focussable.length) {
      $focusElement = this.$dialogBox
    } else if (document.activeElement === this.$dialogBox && event.shiftKey) {
      $focusElement = this.$focusableLast
    }
  }

  // Wrap focus
  if ($focusElement) {
    event.preventDefault()
    $focusElement.focus({ preventScroll: true })
  }
}

// Listen for key presses
ModalDialog.prototype.handleKeyDown = function handleKeyDown(event) {
  const KEY_TAB = 9
  const KEY_ESCAPE = 27

  switch (event.keyCode) {
    case KEY_TAB:
      this.focusTrap(event)
      break

    case KEY_ESCAPE:
      this.close()
      break

    default:
      break
  }
}

export function getModalDialogInstance(moduleElement) {
  return dialogInstances.get(moduleElement)
}

export function initModalDialogs() {
  const modules = document.querySelectorAll('.govuk-modal-dialogue')
  modules.forEach(module => {
    const triggerSelector = module.getAttribute('data-trigger')
    const triggerElement = triggerSelector ? document.querySelector(triggerSelector) : null

    const dialog = new ModalDialog(module)
    dialog.init({ triggerElement })
    dialogInstances.set(module, dialog)
  })
}

export default ModalDialog
